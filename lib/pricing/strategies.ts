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

// Max profit/loss on expiration across range. Infinity possible for naked short/long calls.
export function maxProfitLoss(legs: Leg[], minS: number, maxS: number, steps = 500): { maxProfit: number; maxLoss: number; unboundedUp: boolean; unboundedDown: boolean; } {
  let maxProfit = -Infinity, maxLoss = Infinity;
  const dS = (maxS - minS) / steps;
  for (let i = 0; i <= steps; i++) {
    const S = minS + i * dS;
    const v = strategyPayoff(legs, S);
    if (v > maxProfit) maxProfit = v;
    if (v < maxLoss) maxLoss = v;
  }
  // Detect unbounded: slope at extremes
  const slopeUp = (strategyPayoff(legs, maxS) - strategyPayoff(legs, maxS * 0.95)) / (maxS * 0.05);
  const slopeDown = (strategyPayoff(legs, minS * 1.05) - strategyPayoff(legs, Math.max(minS, 0.01))) / (minS * 0.05 || 1);
  const unboundedUp = slopeUp > 1;
  const unboundedDown = slopeDown > 1; // negative slope down means loss grows
  return { maxProfit, maxLoss, unboundedUp, unboundedDown };
}
