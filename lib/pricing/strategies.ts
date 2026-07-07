import { blackScholes, type Greeks, type OptionType } from "./blackScholes";

export type LegKind = "call" | "put" | "stock";

export interface Leg {
  id: string;
  kind: LegKind;
  side: "long" | "short";
  strike: number;       // ignored for stock
  premium: number;      // cost per share paid/received (positive number)
  quantity: number;     // number of contracts (or shares/100 for stock)
}

export interface MarketCtx {
  S: number;
  T: number;           // years
  r: number;
  sigma: number;
  q?: number;
}

// Payoff at expiration, per-share, signed (+ long, - short)
export function legPayoffAtExpiry(leg: Leg, ST: number): number {
  const sign = leg.side === "long" ? 1 : -1;
  let intrinsic: number;
  if (leg.kind === "stock") {
    intrinsic = ST - leg.premium; // treat premium as cost basis for stock
    return sign * intrinsic * leg.quantity * 100;
  }
  intrinsic = leg.kind === "call" ? Math.max(ST - leg.strike, 0) : Math.max(leg.strike - ST, 0);
  return sign * (intrinsic - leg.premium) * leg.quantity * 100;
}

// Total strategy payoff at expiration (all contracts, $)
export function strategyPayoff(legs: Leg[], ST: number): number {
  return legs.reduce((acc, l) => acc + legPayoffAtExpiry(l, ST), 0);
}

// Strategy value today (mark-to-market), given a hypothetical spot S_now and remaining time
export function strategyValueNow(legs: Leg[], ctx: MarketCtx): number {
  let total = 0;
  for (const l of legs) {
    const sign = l.side === "long" ? 1 : -1;
    if (l.kind === "stock") {
      total += sign * (ctx.S - l.premium) * l.quantity * 100;
    } else {
      const bs = blackScholes({ S: ctx.S, K: l.strike, T: ctx.T, r: ctx.r, sigma: ctx.sigma, q: ctx.q, type: l.kind });
      total += sign * (bs.price - l.premium) * l.quantity * 100;
    }
  }
  return total;
}

export function aggregateGreeks(legs: Leg[], ctx: MarketCtx): Greeks {
  const agg: Greeks = { price: 0, delta: 0, gamma: 0, theta: 0, vega: 0, rho: 0 };
  for (const l of legs) {
    const sign = l.side === "long" ? 1 : -1;
    const mult = sign * l.quantity * 100;
    if (l.kind === "stock") {
      agg.delta += sign * l.quantity * 100;
      agg.price += sign * (ctx.S - l.premium) * l.quantity * 100;
      continue;
    }
    const bs = blackScholes({ S: ctx.S, K: l.strike, T: ctx.T, r: ctx.r, sigma: ctx.sigma, q: ctx.q, type: l.kind });
    agg.price += mult * bs.price;
    agg.delta += mult * bs.delta;
    agg.gamma += mult * bs.gamma;
    agg.theta += mult * bs.theta;
    agg.vega += mult * bs.vega;
    agg.rho += mult * bs.rho;
  }
  return agg;
}

// Net debit (positive = you pay, negative = you receive credit)
export function netDebit(legs: Leg[]): number {
  let total = 0;
  for (const l of legs) {
    const sign = l.side === "long" ? 1 : -1;
    total += sign * l.premium * l.quantity * 100;
  }
  return total;
}

// Sample payoff over a price range, returning points for charting
export interface PayoffPoint { S: number; expiry: number; today: number; }
export function samplePayoff(legs: Leg[], ctx: MarketCtx, minS: number, maxS: number, steps = 120): PayoffPoint[] {
  const out: PayoffPoint[] = [];
  const dS = (maxS - minS) / steps;
  for (let i = 0; i <= steps; i++) {
    const S = minS + i * dS;
    const expiry = strategyPayoff(legs, S);
    const today = strategyValueNow(legs, { ...ctx, S });
    out.push({ S, expiry, today });
  }
  return out;
}

// Detect break-even crossings on expiry payoff
export function breakEvenPoints(legs: Leg[], minS: number, maxS: number, steps = 2000): number[] {
  const bes: number[] = [];
  const dS = (maxS - minS) / steps;
  let prevS = minS;
  let prevV = strategyPayoff(legs, prevS);
  for (let i = 1; i <= steps; i++) {
    const S = minS + i * dS;
    const v = strategyPayoff(legs, S);
    if ((prevV < 0 && v >= 0) || (prevV > 0 && v <= 0) || v === 0) {
      // linear interp
      if (v === prevV) bes.push(S);
      else bes.push(prevS - prevV * (S - prevS) / (v - prevV));
    }
    prevS = S;
    prevV = v;
  }
  return dedupe(bes, 0.05);
}

function dedupe(arr: number[], tol: number): number[] {
  const out: number[] = [];
  for (const x of arr) {
    if (!out.some((y) => Math.abs(y - x) < tol)) out.push(x);
  }
  return out;
}

// Adaptive chart viewport: auto-fits X/Y to strategy (strikes, spot, IV, DTE, payoff magnitude).
// Returns clamped minS/maxS and a Y-domain that excludes runaway tails for naked shorts.
export function computePayoffRange(
  legs: Leg[],
  ctx: MarketCtx,
  opts?: { kSigma?: number; yPad?: number; steps?: number }
): { minS: number; maxS: number; yMin: number; yMax: number } {
  const kSigma = opts?.kSigma ?? 2.5;
  const yPad = opts?.yPad ?? 0.15;
  const steps = opts?.steps ?? 120;

  const strikes = legs.filter((l) => l.kind !== "stock").map((l) => l.strike);
  const anchors = strikes.length ? [...strikes, ctx.S] : [ctx.S];
  const kMin = Math.min(...anchors);
  const kMax = Math.max(...anchors);
  const mid = (kMin + kMax) / 2;
  const spread = kMax - kMin;

  const sigmaMove = ctx.sigma * Math.sqrt(Math.max(ctx.T, 1 / 365)) * ctx.S * kSigma;
  const halfWidth = Math.max(sigmaMove, spread * 1.5, ctx.S * 0.15);

  const minS = Math.max(0.01, mid - halfWidth);
  const maxS = mid + halfWidth;

  // Y-sampling window. The ±1σ clip exists only to protect against unbounded
  // LOSS tails (naked short calls, short straddles) dominating the Y-axis and
  // squashing the informative center. When the strategy is long-biased or
  // bounded, we sample Y across the full visible X range so tail profits
  // (long call hockey stick, straddle/strangle V-tails, covered-call linear
  // downside) are fully visible instead of clipped.
  const slope = slopeAtInfinity(legs);
  const hasStock = legs.some((l) => l.kind === "stock");
  const fullRange = hasStock || slope >= -1e-9;
  // Clip window for unbounded-loss strategies (naked short call, short straddle):
  // ±2σ around spot keeps the center peak readable without squashing tail losses
  // too aggressively — a 30% IV, 30-day move of ~17 points either side of spot.
  const sigmaMoveClip = ctx.sigma * Math.sqrt(Math.max(ctx.T, 1 / 365)) * ctx.S * 2;
  const yLo = fullRange ? minS : Math.max(minS, ctx.S - sigmaMoveClip);
  const yHi = fullRange ? maxS : Math.min(maxS, ctx.S + sigmaMoveClip);
  const dS = (maxS - minS) / steps;
  let lo = Infinity, hi = -Infinity;
  for (let i = 0; i <= steps; i++) {
    const S = minS + i * dS;
    if (S < yLo || S > yHi) continue;
    const e = strategyPayoff(legs, S);
    if (e < lo) lo = e;
    if (e > hi) hi = e;
    const t = strategyValueNow(legs, { ...ctx, S });
    if (t < lo) lo = t;
    if (t > hi) hi = t;
  }
  // Always include strike-region payoff peaks/troughs
  for (const k of strikes) {
    const e = strategyPayoff(legs, k);
    if (e < lo) lo = e;
    if (e > hi) hi = e;
  }
  if (!isFinite(lo) || !isFinite(hi)) { lo = -1; hi = 1; }
  if (lo === hi) { lo -= 1; hi += 1; }

  const padAmt = (hi - lo) * yPad;
  return { minS, maxS, yMin: lo - padAmt, yMax: hi + padAmt };
}

// Report-mode payoff viewport: wider X (cover strikes + 3σ), full Y (no ±1σ clipping).
// Use for printed/exported PDF-like outputs where the FULL strategy profile must be visible
// (essential for covered call flat plateau and multi-leg spreads with wings far from spot).
export function computeReportPayoffRange(
  legs: Leg[],
  ctx: MarketCtx,
  opts?: { kSigma?: number; yPad?: number; steps?: number }
): { minS: number; maxS: number; yMin: number; yMax: number } {
  const kSigma = opts?.kSigma ?? 3.5;
  const yPad = opts?.yPad ?? 0.15;
  const steps = opts?.steps ?? 160;

  const strikes = legs.filter((l) => l.kind !== "stock").map((l) => l.strike);
  // For covered call / stock legs, use the premium as cost-basis anchor
  const stockBasis = legs.filter((l) => l.kind === "stock").map((l) => l.premium);
  const anchors = [...strikes, ...stockBasis, ctx.S];
  const kMin = Math.min(...anchors);
  const kMax = Math.max(...anchors);
  const mid = (kMin + kMax) / 2;
  const spread = kMax - kMin;

  const sigmaMove = ctx.sigma * Math.sqrt(Math.max(ctx.T, 1 / 365)) * ctx.S * kSigma;
  // Wider halfWidth: cover strikes with margin for spreads + ~3σ move + 25% buffer
  const halfWidth = Math.max(sigmaMove, spread * 2.0 + ctx.S * 0.05, ctx.S * 0.25);

  const minS = Math.max(0.01, mid - halfWidth);
  const maxS = mid + halfWidth;

  // Sample Y over FULL visible X range (no ±1σ clip) — the whole profile must be visible.
  const dS = (maxS - minS) / steps;
  let lo = Infinity, hi = -Infinity;
  for (let i = 0; i <= steps; i++) {
    const S = minS + i * dS;
    const e = strategyPayoff(legs, S);
    if (e < lo) lo = e;
    if (e > hi) hi = e;
  }
  if (!isFinite(lo) || !isFinite(hi)) { lo = -1; hi = 1; }
  if (lo === hi) { lo -= 1; hi += 1; }

  const padAmt = (hi - lo) * yPad;
  return { minS, maxS, yMin: lo - padAmt, yMax: hi + padAmt };
}

// Analytical slope of total payoff as S→+∞ (per-dollar move).
// - stock long contributes +qty*100, stock short -qty*100
// - long call contributes +qty*100, short call -qty*100 (puts vanish)
// Underlying price is floored at 0, so the only direction that can be unbounded
// is as S→∞. At S=0 every leg has a finite payoff, therefore max loss is
// always finite unless the slope at infinity is negative (short-call-heavy).
function slopeAtInfinity(legs: Leg[]): number {
  let s = 0;
  for (const l of legs) {
    const sign = l.side === "long" ? 1 : -1;
    if (l.kind === "stock" || l.kind === "call") s += sign * l.quantity * 100;
  }
  return s;
}

// Max profit/loss on expiration. Unbounded detection is analytical, not heuristic.
// Payoff is piecewise-linear: every extremum lies on a strike, at S=0, or at ±∞.
// We evaluate exactly at all strikes (peak/trough candidates) in addition to the
// grid sample — fixes the butterfly-peak rounding where sampling missed K2 exactly.
export function maxProfitLoss(legs: Leg[], minS: number, maxS: number, steps = 500): { maxProfit: number; maxLoss: number; unboundedUp: boolean; unboundedDown: boolean; } {
  const slope = slopeAtInfinity(legs);
  const unboundedUp = slope > 1e-9;
  const unboundedDown = slope < -1e-9;

  let maxProfit = -Infinity, maxLoss = Infinity;
  const evalAt = (S: number) => {
    const v = strategyPayoff(legs, S);
    if (v > maxProfit) maxProfit = v;
    if (v < maxLoss) maxLoss = v;
  };

  // Grid sample (for visualization-consistent behavior)
  const dS = (maxS - minS) / steps;
  for (let i = 0; i <= steps; i++) evalAt(minS + i * dS);

  // Exact strike points — where piecewise-linear payoff changes slope
  for (const l of legs) if (l.kind !== "stock") evalAt(l.strike);

  // S=0 boundary (worst case for long stock / short puts)
  evalAt(0);

  // Far-high for bounded-up strategies so the upside plateau shows up
  if (!unboundedUp) evalAt(maxS * 10);

  return { maxProfit, maxLoss, unboundedUp, unboundedDown };
}
