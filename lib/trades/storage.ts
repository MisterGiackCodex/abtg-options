import type { Trade, TradeStore } from "./types";

const STORAGE_KEY = "abtg-trades-v1";
const CURRENT_VERSION = 1;

function getStore(): TradeStore {
  if (typeof window === "undefined") return { trades: [], version: CURRENT_VERSION };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { trades: [], version: CURRENT_VERSION };
    const parsed = JSON.parse(raw) as TradeStore;
    return parsed;
  } catch {
    return { trades: [], version: CURRENT_VERSION };
  }
}

function saveStore(store: TradeStore): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function loadTrades(): Trade[] {
  return getStore().trades;
}

export function saveTrades(trades: Trade[]): void {
  saveStore({ trades, version: CURRENT_VERSION });
}

export function exportTradesJSON(trades: Trade[]): string {
  return JSON.stringify({ trades, version: CURRENT_VERSION, exportedAt: new Date().toISOString() }, null, 2);
}

export function importTradesJSON(json: string): Trade[] {
  const data = JSON.parse(json);
  if (!data.trades || !Array.isArray(data.trades)) {
    throw new Error("Formato JSON non valido: manca il campo 'trades'");
  }
  for (const t of data.trades) {
    if (!t.id || !t.name || !t.legs || !Array.isArray(t.legs)) {
      throw new Error(`Trade non valido: mancano campi obbligatori (id, name, legs)`);
    }
  }
  return data.trades as Trade[];
}

export function exportTradesCSV(trades: Trade[]): string {
  const header = [
    "Trade ID", "Nome", "Ticker", "Status", "Data Ingresso", "Data Scadenza",
    "Spot Ingresso", "IV Ingresso", "Rate Ingresso", "Note",
    "Leg ID", "Tipo", "Direzione", "Strike", "Premio Ingresso",
    "Premio Corrente", "Quantita", "Leg Status", "Prezzo Chiusura",
  ].join(",");

  const rows: string[] = [header];

  for (const trade of trades) {
    for (const leg of trade.legs) {
      rows.push([
        trade.id,
        `"${trade.name.replace(/"/g, '""')}"`,
        trade.ticker,
        trade.status,
        trade.entryDate,
        trade.expirationDate,
        trade.marketCtxAtEntry.S,
        trade.marketCtxAtEntry.sigma,
        trade.marketCtxAtEntry.r,
        `"${(trade.notes || "").replace(/"/g, '""')}"`,
        leg.id,
        leg.kind,
        leg.side,
        leg.strike,
        leg.entryPremium,
        leg.currentPremium,
        leg.quantity,
        leg.status,
        leg.closePrice ?? "",
      ].join(","));
    }
  }

  return rows.join("\n");
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
