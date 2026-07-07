import type { OptionType } from "./blackScholes";

export interface BinomialInputs {
  S: number;
  K: number;
  T: number;
  r: number;
  sigma: number;
  q?: number;
  type: OptionType;
  american?: boolean;
  steps?: number;
}

// CRR binomial tree. Supports European and American. Returns price only.
export function binomialPrice(inp: BinomialInputs): number {
  const { S, K, T, r, sigma, type } = inp;
  const q = inp.q ?? 0;
  const american = inp.american ?? true;
  const N = inp.steps ?? 200;

  if (T <= 0 || sigma <= 0) {
    return type === "call" ? Math.max(S - K, 0) : Math.max(K - S, 0);
  }

  const dt = T / N;
  const u = Math.exp(sigma * Math.sqrt(dt));
  const d = 1 / u;
  const disc = Math.exp(-r * dt);
  const p = (Math.exp((r - q) * dt) - d) / (u - d);

  const values = new Array(N + 1);
  for (let i = 0; i <= N; i++) {
    const ST = S * Math.pow(u, N - i) * Math.pow(d, i);
    values[i] = type === "call" ? Math.max(ST - K, 0) : Math.max(K - ST, 0);
  }

  for (let step = N - 1; step >= 0; step--) {
    for (let i = 0; i <= step; i++) {
      const cont = disc * (p * values[i] + (1 - p) * values[i + 1]);
      if (american) {
        const ST = S * Math.pow(u, step - i) * Math.pow(d, i);
        const exercise = type === "call" ? ST - K : K - ST;
        values[i] = Math.max(cont, exercise);
      } else {
        values[i] = cont;
      }
    }
  }
  return values[0];
}
