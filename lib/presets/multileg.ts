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

// ============ MULTI LEG ============
export function bullCallSpread(K1: number, K2: number, ctx: PresetCtx, qty = 1): Leg[] {
  return [
    { id: nid(), kind: "call", side: "long", strike: K1, premium: premium("call", K1, ctx), quantity: qty },
    { id: nid(), kind: "call", side: "short", strike: K2, premium: premium("call", K2, ctx), quantity: qty },
  ];
}
export function bearPutSpread(K1: number, K2: number, ctx: PresetCtx, qty = 1): Leg[] {
  // K1 > K2
  return [
    { id: nid(), kind: "put", side: "long", strike: K1, premium: premium("put", K1, ctx), quantity: qty },
    { id: nid(), kind: "put", side: "short", strike: K2, premium: premium("put", K2, ctx), quantity: qty },
  ];
}
export function bullPutSpread(K1: number, K2: number, ctx: PresetCtx, qty = 1): Leg[] {
  // credit: sell higher put, buy lower put
  return [
    { id: nid(), kind: "put", side: "short", strike: K1, premium: premium("put", K1, ctx), quantity: qty },
    { id: nid(), kind: "put", side: "long", strike: K2, premium: premium("put", K2, ctx), quantity: qty },
  ];
}
export function bearCallSpread(K1: number, K2: number, ctx: PresetCtx, qty = 1): Leg[] {
  // credit: sell lower call, buy higher call
  return [
    { id: nid(), kind: "call", side: "short", strike: K1, premium: premium("call", K1, ctx), quantity: qty },
    { id: nid(), kind: "call", side: "long", strike: K2, premium: premium("call", K2, ctx), quantity: qty },
  ];
}
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
export function longStrangle(Kp: number, Kc: number, ctx: PresetCtx, qty = 1): Leg[] {
  return [
    { id: nid(), kind: "put", side: "long", strike: Kp, premium: premium("put", Kp, ctx), quantity: qty },
    { id: nid(), kind: "call", side: "long", strike: Kc, premium: premium("call", Kc, ctx), quantity: qty },
  ];
}
export function ironCondor(Kp2: number, Kp1: number, Kc1: number, Kc2: number, ctx: PresetCtx, qty = 1): Leg[] {
  // Kp2 < Kp1 < S < Kc1 < Kc2
  return [
    { id: nid(), kind: "put", side: "long", strike: Kp2, premium: premium("put", Kp2, ctx), quantity: qty },
    { id: nid(), kind: "put", side: "short", strike: Kp1, premium: premium("put", Kp1, ctx), quantity: qty },
    { id: nid(), kind: "call", side: "short", strike: Kc1, premium: premium("call", Kc1, ctx), quantity: qty },
    { id: nid(), kind: "call", side: "long", strike: Kc2, premium: premium("call", Kc2, ctx), quantity: qty },
  ];
}
export function callButterfly(K1: number, K2: number, K3: number, ctx: PresetCtx, qty = 1): Leg[] {
  // K1 < K2 < K3, typically K2 = (K1+K3)/2
  return [
    { id: nid(), kind: "call", side: "long", strike: K1, premium: premium("call", K1, ctx), quantity: qty },
    { id: nid(), kind: "call", side: "short", strike: K2, premium: premium("call", K2, ctx), quantity: qty * 2 },
    { id: nid(), kind: "call", side: "long", strike: K3, premium: premium("call", K3, ctx), quantity: qty },
  ];
}

// Dispatch by preset id
export type PresetId =
  | "buyCall" | "sellCall" | "buyPut" | "sellPut" | "coveredCall"
  | "bullCallSpread" | "bearPutSpread" | "bullPutSpread" | "bearCallSpread"
  | "longStraddle" | "shortStraddle" | "longStrangle" | "ironCondor" | "callButterfly";

export interface PresetMeta {
  id: PresetId;
  label: string;
  category: "single" | "multi";
  bias: "bullish" | "bearish" | "neutral";
  description: string;
  strikes: string[]; // names of strikes required
}

export const PRESETS: PresetMeta[] = [
  { id: "buyCall", label: "Buy Call", category: "single", bias: "bullish", description: "Long call: profitto illimitato al rialzo, rischio limitato al premio.", strikes: ["K"] },
  { id: "sellCall", label: "Sell Call", category: "single", bias: "bearish", description: "Short call: incassa premio, rischio illimitato al rialzo.", strikes: ["K"] },
  { id: "buyPut", label: "Buy Put", category: "single", bias: "bearish", description: "Long put: copertura o speculazione ribassista, rischio limitato al premio.", strikes: ["K"] },
  { id: "sellPut", label: "Sell Put", category: "single", bias: "bullish", description: "Short put: incassa premio, accetta di comprare al ribasso.", strikes: ["K"] },
  { id: "coveredCall", label: "Covered Call", category: "single", bias: "neutral", description: "Azioni + short call: genera reddito, cappa l'upside.", strikes: ["K"] },
  { id: "bullCallSpread", label: "Bull Call Spread", category: "multi", bias: "bullish", description: "Long call K1 + short call K2: profitto e rischio limitati.", strikes: ["K1", "K2"] },
  { id: "bearPutSpread", label: "Bear Put Spread", category: "multi", bias: "bearish", description: "Long put K1 + short put K2 (K1>K2): profitto e rischio limitati.", strikes: ["K1", "K2"] },
  { id: "bullPutSpread", label: "Bull Put Spread (credit)", category: "multi", bias: "bullish", description: "Credito: incasso netto, profitto se sopra K1.", strikes: ["K1", "K2"] },
  { id: "bearCallSpread", label: "Bear Call Spread (credit)", category: "multi", bias: "bearish", description: "Credito: incasso netto, profitto se sotto K1.", strikes: ["K1", "K2"] },
  { id: "longStraddle", label: "Long Straddle", category: "multi", bias: "neutral", description: "Long call + long put stesso strike: profitto su forti movimenti.", strikes: ["K"] },
  { id: "shortStraddle", label: "Short Straddle", category: "multi", bias: "neutral", description: "Short call + short put: incassa premio se il prezzo resta fermo.", strikes: ["K"] },
  { id: "longStrangle", label: "Long Strangle", category: "multi", bias: "neutral", description: "Long put + long call OTM: economico, serve grande movimento.", strikes: ["Kp", "Kc"] },
  { id: "ironCondor", label: "Iron Condor", category: "multi", bias: "neutral", description: "4 gambe: incassa premio se il prezzo resta nel range centrale.", strikes: ["Kp2", "Kp1", "Kc1", "Kc2"] },
  { id: "callButterfly", label: "Call Butterfly", category: "multi", bias: "neutral", description: "Profitto massimo se prezzo scade a K2.", strikes: ["K1", "K2", "K3"] },
];
