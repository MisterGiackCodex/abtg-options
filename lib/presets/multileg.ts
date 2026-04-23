import { blackScholes } from "../pricing/blackScholes";
import type { Leg } from "../pricing/strategies";

export interface PresetCtx { S: number; T: number; r: number; sigma: number; q?: number; }

// Auto-compute premium via BS as a starting point; user can override in UI.
function premium(kind: "call" | "put", K: number, ctx: PresetCtx): number {
  return blackScholes({ S: ctx.S, K, T: ctx.T, r: ctx.r, sigma: ctx.sigma, q: ctx.q, type: kind }).price;
}

let idCounter = 0;
const nid = () => `leg_${++idCounter}`;

// ============ SINGLE LEG ============
export function buyCall(K: number, ctx: PresetCtx, qty = 1): Leg[] {
  return [{ id: nid(), kind: "call", side: "long", strike: K, premium: premium("call", K, ctx), quantity: qty }];
}
export function sellCall(K: number, ctx: PresetCtx, qty = 1): Leg[] {
  return [{ id: nid(), kind: "call", side: "short", strike: K, premium: premium("call", K, ctx), quantity: qty }];
}
export function buyPut(K: number, ctx: PresetCtx, qty = 1): Leg[] {
  return [{ id: nid(), kind: "put", side: "long", strike: K, premium: premium("put", K, ctx), quantity: qty }];
}
export function sellPut(K: number, ctx: PresetCtx, qty = 1): Leg[] {
  return [{ id: nid(), kind: "put", side: "short", strike: K, premium: premium("put", K, ctx), quantity: qty }];
}
export function coveredCall(K: number, ctx: PresetCtx, qty = 1): Leg[] {
  return [
    { id: nid(), kind: "stock", side: "long", strike: 0, premium: ctx.S, quantity: qty },
    { id: nid(), kind: "call", side: "short", strike: K, premium: premium("call", K, ctx), quantity: qty },
  ];
}

// ============ VERTICAL SPREADS (2 legs, same option type, different strikes) ============
// Bull Call Spread — debit, K1 < K2 (long lower call, short higher call)
export function bullCallSpread(K1: number, K2: number, ctx: PresetCtx, qty = 1): Leg[] {
  return [
    { id: nid(), kind: "call", side: "long", strike: K1, premium: premium("call", K1, ctx), quantity: qty },
    { id: nid(), kind: "call", side: "short", strike: K2, premium: premium("call", K2, ctx), quantity: qty },
  ];
}
// Bear Put Spread — debit, K1 > K2 (long higher put, short lower put)
export function bearPutSpread(K1: number, K2: number, ctx: PresetCtx, qty = 1): Leg[] {
  return [
    { id: nid(), kind: "put", side: "long", strike: K1, premium: premium("put", K1, ctx), quantity: qty },
    { id: nid(), kind: "put", side: "short", strike: K2, premium: premium("put", K2, ctx), quantity: qty },
  ];
}
// Bull Put Spread — credit, K1 > K2 (short higher put, long lower put)
export function bullPutSpread(K1: number, K2: number, ctx: PresetCtx, qty = 1): Leg[] {
  return [
    { id: nid(), kind: "put", side: "short", strike: K1, premium: premium("put", K1, ctx), quantity: qty },
    { id: nid(), kind: "put", side: "long", strike: K2, premium: premium("put", K2, ctx), quantity: qty },
  ];
}
// Bear Call Spread — credit, K1 < K2 (short lower call, long higher call)
export function bearCallSpread(K1: number, K2: number, ctx: PresetCtx, qty = 1): Leg[] {
  return [
    { id: nid(), kind: "call", side: "short", strike: K1, premium: premium("call", K1, ctx), quantity: qty },
    { id: nid(), kind: "call", side: "long", strike: K2, premium: premium("call", K2, ctx), quantity: qty },
  ];
}

// ============ VOLATILITY / NEUTRAL ============
export function longStraddle(K: number, ctx: PresetCtx, qty = 1): Leg[] {
  return [
    { id: nid(), kind: "call", side: "long", strike: K, premium: premium("call", K, ctx), quantity: qty },
    { id: nid(), kind: "put", side: "long", strike: K, premium: premium("put", K, ctx), quantity: qty },
  ];
}
export function shortStraddle(K: number, ctx: PresetCtx, qty = 1): Leg[] {
  return [
    { id: nid(), kind: "call", side: "short", strike: K, premium: premium("call", K, ctx), quantity: qty },
    { id: nid(), kind: "put", side: "short", strike: K, premium: premium("put", K, ctx), quantity: qty },
  ];
}
// Long Strangle — both OTM. Kp < S < Kc
export function longStrangle(Kp: number, Kc: number, ctx: PresetCtx, qty = 1): Leg[] {
  return [
    { id: nid(), kind: "put", side: "long", strike: Kp, premium: premium("put", Kp, ctx), quantity: qty },
    { id: nid(), kind: "call", side: "long", strike: Kc, premium: premium("call", Kc, ctx), quantity: qty },
  ];
}
// Iron Condor: Kp2 < Kp1 < S < Kc1 < Kc2. Long wings protect short body.
export function ironCondor(Kp2: number, Kp1: number, Kc1: number, Kc2: number, ctx: PresetCtx, qty = 1): Leg[] {
  return [
    { id: nid(), kind: "put", side: "long", strike: Kp2, premium: premium("put", Kp2, ctx), quantity: qty },
    { id: nid(), kind: "put", side: "short", strike: Kp1, premium: premium("put", Kp1, ctx), quantity: qty },
    { id: nid(), kind: "call", side: "short", strike: Kc1, premium: premium("call", Kc1, ctx), quantity: qty },
    { id: nid(), kind: "call", side: "long", strike: Kc2, premium: premium("call", Kc2, ctx), quantity: qty },
  ];
}
// Butterfly (call-constructed; put-constructed is synthetically equivalent).
// K1 < K2 < K3, K2 = body. Typically K2 = ATM and equidistant wings.
export function butterfly(K1: number, K2: number, K3: number, ctx: PresetCtx, qty = 1): Leg[] {
  return [
    { id: nid(), kind: "call", side: "long", strike: K1, premium: premium("call", K1, ctx), quantity: qty },
    { id: nid(), kind: "call", side: "short", strike: K2, premium: premium("call", K2, ctx), quantity: qty * 2 },
    { id: nid(), kind: "call", side: "long", strike: K3, premium: premium("call", K3, ctx), quantity: qty },
  ];
}

// ============ METADATA ============
export type PresetId =
  | "buyCall" | "sellCall" | "buyPut" | "sellPut" | "coveredCall"
  | "bullCallSpread" | "bearPutSpread" | "bullPutSpread" | "bearCallSpread"
  | "longStraddle" | "shortStraddle" | "longStrangle" | "ironCondor" | "butterfly";

export type PresetGroup = "single" | "vertical" | "volatility" | "advanced";

export interface PresetMeta {
  id: PresetId;
  label: string;
  category: "single" | "multi";
  group: PresetGroup;
  bias: "bullish" | "bearish" | "neutral";
  description: string;
  strikes: string[];
  /** Default strike values for a spot of 100 (user edits after selection). */
  defaultK: { k1?: number; k2?: number; k3?: number; k4?: number };
}

export const PRESETS: PresetMeta[] = [
  // Single leg
  { id: "buyCall",  label: "Buy Call",  category: "single", group: "single", bias: "bullish", description: "Long call: profitto illimitato al rialzo, rischio limitato al premio.", strikes: ["K"], defaultK: { k1: 100 } },
  { id: "sellCall", label: "Sell Call", category: "single", group: "single", bias: "bearish", description: "Short call: incassa premio, rischio illimitato al rialzo.", strikes: ["K"], defaultK: { k1: 100 } },
  { id: "buyPut",   label: "Buy Put",   category: "single", group: "single", bias: "bearish", description: "Long put: copertura o speculazione ribassista, rischio limitato al premio.", strikes: ["K"], defaultK: { k1: 100 } },
  { id: "sellPut",  label: "Sell Put",  category: "single", group: "single", bias: "bullish", description: "Short put: incassa premio, accetta di comprare al ribasso.", strikes: ["K"], defaultK: { k1: 100 } },
  { id: "coveredCall", label: "Covered Call", category: "single", group: "single", bias: "neutral", description: "Azioni + short call: genera reddito, cappa l'upside.", strikes: ["K"], defaultK: { k1: 100 } },

  // Vertical spreads (2 legs, same option type)
  { id: "bullCallSpread", label: "Bull Call Spread (debit)",  category: "multi", group: "vertical", bias: "bullish", description: "Long call K1 + short call K2 (K1<K2): profitto e rischio limitati, pagamento netto.", strikes: ["K1", "K2"], defaultK: { k1: 100, k2: 110 } },
  { id: "bearPutSpread",  label: "Bear Put Spread (debit)",   category: "multi", group: "vertical", bias: "bearish", description: "Long put K1 + short put K2 (K1>K2): profitto e rischio limitati, pagamento netto.", strikes: ["K1", "K2"], defaultK: { k1: 110, k2: 100 } },
  { id: "bullPutSpread",  label: "Bull Put Spread (credit)",  category: "multi", group: "vertical", bias: "bullish", description: "Short put K1 + long put K2 (K1>K2): incassa premio, profitto se sopra K1.", strikes: ["K1", "K2"], defaultK: { k1: 110, k2: 100 } },
  { id: "bearCallSpread", label: "Bear Call Spread (credit)", category: "multi", group: "vertical", bias: "bearish", description: "Short call K1 + long call K2 (K1<K2): incassa premio, profitto se sotto K1.", strikes: ["K1", "K2"], defaultK: { k1: 100, k2: 110 } },

  // Volatility / neutral
  { id: "longStraddle",  label: "Long Straddle",  category: "multi", group: "volatility", bias: "neutral", description: "Long call + long put stesso strike: profitto su forti movimenti, indifferente alla direzione.", strikes: ["K"], defaultK: { k1: 100 } },
  { id: "shortStraddle", label: "Short Straddle", category: "multi", group: "volatility", bias: "neutral", description: "Short call + short put stesso strike: incassa premio se il prezzo resta fermo.", strikes: ["K"], defaultK: { k1: 100 } },
  { id: "longStrangle",  label: "Long Strangle",  category: "multi", group: "volatility", bias: "neutral", description: "Long put OTM + long call OTM: più economico dello straddle, richiede movimento più ampio.", strikes: ["Kp", "Kc"], defaultK: { k1: 90, k2: 110 } },

  // Advanced
  { id: "ironCondor", label: "Iron Condor", category: "multi", group: "advanced", bias: "neutral", description: "Bull put spread + bear call spread: profitto se il prezzo resta nel range centrale.", strikes: ["Kp2", "Kp1", "Kc1", "Kc2"], defaultK: { k1: 80, k2: 90, k3: 110, k4: 120 } },
  { id: "butterfly",  label: "Butterfly",   category: "multi", group: "advanced", bias: "neutral", description: "Long K1 + 2x short K2 + long K3 (K1<K2<K3 equidistanti): profitto massimo se il prezzo chiude su K2.", strikes: ["K1", "K2", "K3"], defaultK: { k1: 90, k2: 100, k3: 110 } },
];
