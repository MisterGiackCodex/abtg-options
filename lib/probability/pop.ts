import { strategyPayoff, type Leg } from "../pricing/strategies";
import { lognormalPDF, type LNParams } from "./lognormal";

// Simpson's rule integration
function simpson(f: (x: number) => number, a: number, b: number, n: number): number {
  if (n % 2 === 1) n += 1;
  const h = (b - a) / n;
  let sum = f(a) + f(b);
  for (let i = 1; i < n; i++) {
    const x = a + i * h;
    sum += (i % 2 === 0 ? 2 : 4) * f(x);
  }
  return (sum * h) / 3;
}

// Probability of profit: P(payoff(S_T) >= 0)
// Computed by integrating the PDF over regions where payoff >= 0
export function probabilityOfProfit(legs: Leg[], ln: LNParams): number {
  const S = ln.S;
  const lo = Math.max(0.01, S * 0.01);
  const hi = S * 5;
  const N = 4000;
  const h = (hi - lo) / N;

  let prob = 0;
  for (let i = 0; i < N; i++) {
    const a = lo + i * h;
    const b = a + h;
    // midpoint check — if payoff >=0 at midpoint, add PDF integral over interval
    const mid = (a + b) / 2;
    if (strategyPayoff(legs, mid) >= 0) {
      prob += simpson((x) => lognormalPDF(x, ln), a, b, 4);
    }
  }
  // Tail above hi: if payoff is positive at hi and direction is up, account for tail
  // For simplicity we cap at hi = 5*S which covers ~100% of lognormal mass for typical vols.
  return Math.min(Math.max(prob, 0), 1);
}

// Expected value of payoff under risk-neutral distribution
export function expectedValue(legs: Leg[], ln: LNParams): number {
  const S = ln.S;
  const lo = Math.max(0.01, S * 0.01);
  const hi = S * 5;
  return simpson((x) => strategyPayoff(legs, x) * lognormalPDF(x, ln), lo, hi, 800);
}

/**
 * Probability that the strategy closes within `tolPct` of its maximum profit at expiry.
 * For flat plateaus (iron condors, credit verticals) this collapses to P(ST in plateau).
 * For spiky payoffs (butterflies) a tolerance window of ~15% of max spans a small S range
 * around the peak strike, matching how trading platforms report "Prob Max Profit".
 */
export function probabilityOfMaxProfit(legs: Leg[], ln: LNParams, tolPct = 0.15): number {
  const S = ln.S;
  const lo = Math.max(0.01, S * 0.01);
  const hi = S * 5;
  const N = 4000;
  const h = (hi - lo) / N;

  let maxP = -Infinity;
  for (let i = 0; i <= N; i++) {
    const x = lo + i * h;
    const v = strategyPayoff(legs, x);
    if (v > maxP) maxP = v;
  }
  if (!isFinite(maxP) || maxP <= 0) return 0;
  const threshold = maxP * (1 - tolPct);

  let prob = 0;
  for (let i = 0; i < N; i++) {
    const a = lo + i * h;
    const b = a + h;
    const mid = (a + b) / 2;
    if (strategyPayoff(legs, mid) >= threshold) {
      prob += simpson((x) => lognormalPDF(x, ln), a, b, 4);
    }
  }
  return Math.min(Math.max(prob, 0), 1);
}

/**
 * Probability that the strategy closes within `tolPct` of its maximum loss at expiry.
 * Mirror of probabilityOfMaxProfit.
 */
export function probabilityOfMaxLoss(legs: Leg[], ln: LNParams, tolPct = 0.15): number {
  const S = ln.S;
  const lo = Math.max(0.01, S * 0.01);
  const hi = S * 5;
  const N = 4000;
  const h = (hi - lo) / N;

  let minP = Infinity;
  for (let i = 0; i <= N; i++) {
    const x = lo + i * h;
    const v = strategyPayoff(legs, x);
    if (v < minP) minP = v;
  }
  if (!isFinite(minP) || minP >= 0) return 0;
  const threshold = minP * (1 - tolPct); // minP is negative, so this is closer to 0

  let prob = 0;
  for (let i = 0; i < N; i++) {
    const a = lo + i * h;
    const b = a + h;
    const mid = (a + b) / 2;
    if (strategyPayoff(legs, mid) <= threshold) {
      prob += simpson((x) => lognormalPDF(x, ln), a, b, 4);
    }
  }
  return Math.min(Math.max(prob, 0), 1);
}
