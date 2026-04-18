"use client";
import { useMemo, useState } from "react";
import type { Trade } from "@/lib/trades/types";
import type { MarketCtx } from "@/lib/pricing/strategies";
import { calculateTradePnL } from "@/lib/trades/pnl";

interface TradeListProps {
  trades: Trade[];
  defaultCtx: MarketCtx;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onClose: (id: string) => void;
}

type Filter = "all" | "open" | "closed" | "expired";

export function TradeList({ trades, defaultCtx, onSelect, onDelete, onClose }: TradeListProps) {
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = useMemo(() => {
    if (filter === "all") return trades;
    return trades.filter((t) => t.status === filter);
  }, [trades, filter]);

  return (
    <div>
      <div className="flex gap-2 mb-4">
        {(["all", "open", "closed", "expired"] as const).map((f) => (
          <button
            key={f}
            className={`px-3 py-1 rounded text-xs transition ${filter === f ? "bg-abtg-gold text-abtg-bg font-bold" : "bg-abtg-border text-abtg-muted hover:text-abtg-text"}`}
            onClick={() => setFilter(f)}
          >
            {f === "all" ? "Tutti" : f === "open" ? "Aperti" : f === "closed" ? "Chiusi" : "Scaduti"}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center text-abtg-muted py-12">
          Nessun trade {filter !== "all" ? `con stato "${filter}"` : "salvato"}. Vai alla Dashboard per crearne uno.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-abtg-muted text-xs border-b border-abtg-border">
                <th className="py-2 text-left">Nome</th>
                <th className="py-2 text-left">Ticker</th>
                <th className="py-2 text-left">Data</th>
                <th className="py-2 text-center">Status</th>
                <th className="py-2 text-right">Legs</th>
                <th className="py-2 text-right">Net Debit</th>
                <th className="py-2 text-right">P&L ($)</th>
                <th className="py-2 text-right">P&L (%)</th>
                <th className="py-2 text-right">Azioni</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((trade) => {
                const daysToExpiry = Math.max(0, (new Date(trade.expirationDate).getTime() - Date.now()) / 86_400_000);
                const ctx: MarketCtx = {
                  S: trade.marketCtxAtEntry.S,
                  T: daysToExpiry / 365,
                  r: trade.marketCtxAtEntry.r,
                  sigma: trade.marketCtxAtEntry.sigma,
                };
                const pnl = calculateTradePnL(trade, ctx);
                const pnlColor = pnl.totalPnL >= 0 ? "text-abtg-profit" : "text-abtg-loss";

                return (
                  <tr key={trade.id} className="border-b border-abtg-border/50 hover:bg-abtg-border/20 cursor-pointer" onClick={() => onSelect(trade.id)}>
                    <td className="py-3 font-medium text-abtg-text">{trade.name}</td>
                    <td className="py-3 text-abtg-gold font-mono">{trade.ticker}</td>
                    <td className="py-3 text-abtg-muted">{trade.entryDate}</td>
                    <td className="py-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        trade.status === "open" ? "bg-blue-500/20 text-blue-400" :
                        trade.status === "closed" ? "bg-abtg-muted/20 text-abtg-muted" :
                        "bg-yellow-500/20 text-yellow-400"
                      }`}>
                        {trade.status}
                      </span>
                    </td>
                    <td className="py-3 text-right font-mono">{trade.legs.length}</td>
                    <td className="py-3 text-right font-mono">${Math.abs(pnl.totalEntryDebit).toFixed(2)}</td>
                    <td className={`py-3 text-right font-mono font-bold ${pnlColor}`}>
                      {pnl.totalPnL >= 0 ? "+" : ""}${pnl.totalPnL.toFixed(2)}
                    </td>
                    <td className={`py-3 text-right font-mono ${pnlColor}`}>
                      {pnl.totalPnLPct >= 0 ? "+" : ""}{pnl.totalPnLPct.toFixed(1)}%
                    </td>
                    <td className="py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex gap-1 justify-end">
                        {trade.status === "open" && (
                          <button className="px-2 py-1 rounded text-xs bg-abtg-gold/20 text-abtg-gold hover:bg-abtg-gold/30" onClick={() => onClose(trade.id)}>
                            Chiudi
                          </button>
                        )}
                        <button className="px-2 py-1 rounded text-xs bg-abtg-loss/20 text-abtg-loss hover:bg-abtg-loss/30" onClick={() => onDelete(trade.id)}>
                          Elimina
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
