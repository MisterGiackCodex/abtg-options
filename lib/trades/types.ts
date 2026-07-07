import type { LegKind } from "../pricing/strategies";

export interface TradeLeg {
  id: string;
  kind: LegKind;
  side: "long" | "short";
  strike: number;
  entryPremium: number;
  currentPremium: number;
  quantity: number;
  status: "open" | "closed" | "expired";
  closePrice?: number;
}

export interface Trade {
  id: string;
  name: string;
  ticker: string;
  entryDate: string;
  expirationDate: string;
  legs: TradeLeg[];
  marketCtxAtEntry: { S: number; sigma: number; r: number };
  notes: string;
  status: "open" | "closed" | "expired";
  closedDate?: string;
}

export interface TradeStore {
  trades: Trade[];
  version: number;
}
