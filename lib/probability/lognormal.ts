import { normCDF, normPDF } from "../pricing/blackScholes";

// Risk-neutral distribution of S_T assuming GBM:
// ln(S_T) ~ N(mu, s^2) with mu = ln(S) + (r - q - 0.5*sigma^2)*T, s = sigma*sqrt(T)

export interface LNParams { S: number; T: number; r: number; sigma: number; q?: number; }

export function lnParams(p: LNParams): { mu: number; s: number } {
  const q = p.q ?? 0;
  const mu = Math.log(p.S) + (p.r - q - 0.5 * p.sigma * p.sigma) * p.T;
  const s = p.sigma * Math.sqrt(p.T);
  return { mu, s };
}

export function lognormalPDF(ST: number, p: LNParams): number {
  if (ST <= 0) return 0;
  const { mu, s } = lnParams(p);
  const z = (Math.log(ST) - mu) / s;
  return normPDF(z) / (ST * s);
}

export function lognormalCDF(ST: number, p: LNParams): number {
  if (ST <= 0) return 0;
  const { mu, s } = lnParams(p);
  return normCDF((Math.log(ST) - mu) / s);
}

// Probability S_T > K (risk-neutral)
export function probAbove(K: number, p: LNParams): number {
  return 1 - lognormalCDF(K, p);
}

export function probBelow(K: number, p: LNParams): number {
  return lognormalCDF(K, p);
}
