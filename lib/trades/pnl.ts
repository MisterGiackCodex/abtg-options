import { blackScholes } from "../pricing/blackScholes";
import type { MarketCtx } from "../pricing/strategies";
import type { Trade, TradeLeg } from "./types";

export interface LegPnL {
  legId: string;
  entryValue: number;
  currentValue: number;
  unrealizedPnL: number;
  unrealizedPnLPct: number;
  realizedPnL: number;
  realizedPnLPct: number;
}

export interface TradePnL {
  tradeId: string;
  legs: LegPnL[];
  totalUnrealized: number;
  totalRealized: number;
  totalPnL: number;
  totalPnLPct: number;
  totalEntryDebit: number;
  daysHeld: number;
}

export function calculateLegPnL(leg: TradeLeg, ctx: MarketCtx): LegPnL {
  const sign = leg.side === "long" ? 1 : -1;
  const mult = leg.quantity * 100;

  const entryValue = sign * leg.entryPremium * mult;

  let currentValue: number;
  if (leg.kind === "stock") {
    currentValue = sign * ctx.S * mult;
  } else if (leg.status === "closed" && leg.closePrice !== undefined) {
    currentValue = sign * leg.closePrice * mult;
  } else if (leg.status === "expired") {
    const intrinsic =
      leg.kind === "call"
        ? Math.max(ctx.S - leg.strike, 0)
        : Math.max(leg.strike - ctx.S, 0);
    currentValue = sign * intrinsic * mult;
  } else {
    const bs = blackScholes({
      S: ctx.S,
      K: leg.strike,
      T: ctx.T,
      r: ctx.r,
      sigma: ctx.sigma,
      q: ctx.q,
      type: leg.kind as "call" | "put",
    });
    currentValue = sign * bs.price * mult;
  }

  const unrealizedPnL = leg.status === "open" ? currentValue - entryValue : 0;
  const unrealizedPnLPct =
    leg.status === "open" && Math.abs(entryValue) > 0.001
      ? (unrealizedPnL / Math.abs(entryValue)) * 100
      : 0;

  const realizedPnL = leg.status !== "open" ? currentValue - entryValue : 0;
  const realizedPnLPct =
    leg.status !== "open" && Math.abs(entryValue) > 0.001
      ? (realizedPnL / Math.abs(entryValue)) * 100
      : 0;

  return {
    legId: leg.id,
    entryValue,
    currentValue,
    unrealizedPnL,
    unrealizedPnLPct,
    realizedPnL,
    realizedPnLPct,
  };
}

export function calculateTradePnL(trade: Trade, ctx: MarketCtx): TradePnL {
  const legPnLs = trade.legs.map((leg) => calculateLegPnL(leg, ctx));

  const totalUnrealized = legPnLs.reduce((s, l) => s + l.unrealizedPnL, 0);
  const totalRealized = legPnLs.reduce((s, l) => s + l.realizedPnL, 0);
  const totalPnL = totalUnrealized + totalRealized;

  const totalEntryDebit = legPnLs.reduce((s, l) => s + l.entryValue, 0);
  const totalPnLPct =
    Math.abs(totalEntryDebit) > 0.001
      ? (totalPnL / Math.abs(totalEntryDebit)) * 100
      : 0;

  const entryMs = new Date(trade.entryDate).getTime();
  const nowMs = Date.now();
  const daysHeld = Math.max(0, Math.round((nowMs - entryMs) / 86_400_000));

  return {
    tradeId: trade.id,
    legs: legPnLs,
    totalUnrealized,
    totalRealized,
    totalPnL,
    totalPnLPct,
    totalEntryDebit,
    daysHeld,
  };
}
