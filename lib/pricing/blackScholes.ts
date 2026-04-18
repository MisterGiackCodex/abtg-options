export type OptionType = "call" | "put";

export interface BSInputs {
  S: number;      // spot
  K: number;      // strike
  T: number;      // time to expiry in years
  r: number;      // risk-free rate (decimal)
  sigma: number;  // implied vol (decimal)
  q?: number;     // dividend yield (decimal, default 0)
  type: OptionType;
}

export interface Greeks {
  price: number;
  delta: number;
  gamma: number;
  theta: number;   // per day
  vega: number;    // per 1% move
  rho: number;     // per 1% rate move
}

// Abramowitz & Stegun approximation (accurate to ~7.5e-8)
export function normCDF(x: number): number {
  const a1 =  0.254829592;
  const a2 = -0.284496736;
  const a3 =  1.421413741;
  const a4 = -1.453152027;
  const a5 =  1.061405429;
  const p  =  0.3275911;
  const sign = x < 0 ? -1 : 1;
  const ax = Math.abs(x) / Math.SQRT2;
  const t = 1.0 / (1.0 + p * ax);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-ax * ax);
  return 0.5 * (1.0 + sign * y);
}

export function normPDF(x: number): number {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}

export function blackScholes(inp: BSInputs): Greeks {
  const { S, K, T, r, sigma, type } = inp;
  const q = inp.q ?? 0;

  // Edge case: expired
  if (T <= 0 || sigma <= 0) {
    const intrinsic = type === "call" ? Math.max(S - K, 0) : Math.max(K - S, 0);
    return { price: intrinsic, delta: 0, gamma: 0, theta: 0, vega: 0, rho: 0 };
  }

  const sqrtT = Math.sqrt(T);
  const d1 = (Math.log(S / K) + (r - q + 0.5 * sigma * sigma) * T) / (sigma * sqrtT);
  const d2 = d1 - sigma * sqrtT;

  const Nd1 = normCDF(d1);
  const Nd2 = normCDF(d2);
  const nd1 = normPDF(d1);
  const discR = Math.exp(-r * T);
  const discQ = Math.exp(-q * T);

  let price: number, delta: number, rho: number, thetaYear: number;

  if (type === "call") {
    price = S * discQ * Nd1 - K * discR * Nd2;
    delta = discQ * Nd1;
    rho = K * T * discR * Nd2;
    thetaYear = -(S * discQ * nd1 * sigma) / (2 * sqrtT) - r * K * discR * Nd2 + q * S * discQ * Nd1;
  } else {
    price = K * discR * normCDF(-d2) - S * discQ * normCDF(-d1);
    delta = -discQ * normCDF(-d1);
    rho = -K * T * discR * normCDF(-d2);
    thetaYear = -(S * discQ * nd1 * sigma) / (2 * sqrtT) + r * K * discR * normCDF(-d2) - q * S * discQ * normCDF(-d1);
  }

  const gamma = (discQ * nd1) / (S * sigma * sqrtT);
  const vega = S * discQ * nd1 * sqrtT; // per 1.00 change in sigma -> scale to 1% below

  return {
    price,
    delta,
    gamma,
    theta: thetaYear / 365,   // per day
    vega: vega / 100,          // per 1% IV move
    rho: rho / 100,            // per 1% rate move
  };
}
