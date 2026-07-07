"use client";
import { useCallback, useEffect, useState } from "react";
import type { Trade, TradeLeg } from "@/lib/trades/types";
import {
  loadTrades,
  saveTrades,
  exportTradesJSON,
  importTradesJSON,
  exportTradesCSV,
  generateId,
} from "@/lib/trades/storage";

export function useTrades() {
  const [trades, setTrades] = useState<Trade[]>([]);

  useEffect(() => {
    setTrades(loadTrades());
  }, []);

  const persist = useCallback((next: Trade[]) => {
    setTrades(next);
    saveTrades(next);
  }, []);

  const addTrade = useCallback(
    (t: Omit<Trade, "id">) => {
      const trade: Trade = { ...t, id: generateId() };
      persist([...trades, trade]);
      return trade.id;
    },
    [trades, persist],
  );

  const updateTrade = useCallback(
    (id: string, patch: Partial<Trade>) => {
      persist(trades.map((t) => (t.id === id ? { ...t, ...patch } : t)));
    },
    [trades, persist],
  );

  const deleteTrade = useCallback(
    (id: string) => {
      persist(trades.filter((t) => t.id !== id));
    },
    [trades, persist],
  );

  const closeTrade = useCallback(
    (id: string, closePrices: Record<string, number>) => {
      persist(
        trades.map((t) => {
          if (t.id !== id) return t;
          const legs: TradeLeg[] = t.legs.map((l) => ({
            ...l,
            status: "closed" as const,
            closePrice: closePrices[l.id] ?? l.currentPremium,
          }));
          return { ...t, legs, status: "closed" as const, closedDate: new Date().toISOString().slice(0, 10) };
        }),
      );
    },
    [trades, persist],
  );

  const handleImportJSON = useCallback(
    (json: string) => {
      const imported = importTradesJSON(json);
      persist([...trades, ...imported]);
    },
    [trades, persist],
  );

  const handleExportJSON = useCallback(() => {
    return exportTradesJSON(trades);
  }, [trades]);

  const handleExportCSV = useCallback(() => {
    return exportTradesCSV(trades);
  }, [trades]);

  return {
    trades,
    addTrade,
    updateTrade,
    deleteTrade,
    closeTrade,
    importJSON: handleImportJSON,
    exportJSON: handleExportJSON,
    exportCSV: handleExportCSV,
  };
}
