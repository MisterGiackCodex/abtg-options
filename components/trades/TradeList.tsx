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
      <div className="flex gap-2 mb-5">
        {(["all", "open", "closed", "expired"] as const).map((f) => (
          <button
            key={f}
            className={`px-3 py-1.5 rounded-lg text-xs transition font-medium border ${
              filter === f
                ? "bg-abtg-navy text-white border-abtg-navy"
                : "bg-abtg-bg border-abtg-border text-abtg-muted hover:text-abtg-navy hover:border-abtg-navy"
            }`}
            onClick={() => setFilter(f)}
          >
            {f === "all" ? "Tutti" : f === "open" ? "Aperti" : f === "closed" ? "Chiusi" : "Scaduti"}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center text-abtg-muted py-16">
          <p className="text-lg font-medium mb-2">Nessun trade trovato</p>
          <p className="text-sm">
            {filter !== "all"
              ? `Nessun trade con stato "${filter}".`
              : "Vai alla Dashboard per creare la tua prima operazione."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-abtg-muted text-xs border-b border-abtg-border">
                <th className="py-3 text-left font-semibold">Nome</th>
                <th className="py-3 text-left font-semibold">Ticker</th>
                <th className="py-3 text-left font-semibold">Data</th>
                <th className="py-3 text-center font-semibold">Status</th>
                <th className="py-3 text-right font-semibold">Leg</th>
                <th className="py-3 text-right font-semibold">Net Debit</th>
                <th className="py-3 text-right font-semibold">P&amp;L ($)</th>
                <th className="py-3 text-right font-semibold">P&amp;L (%)</th>
                <th className="py-3 text-right font-semibold">Azioni</th>
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
                  <tr
                    key={trade.id}
                    className="border-b border-abtg-border hover:bg-abtg-bg/60 cursor-pointer transition-colors"
                    onClick={() => onSelect(trade.id)}
                  >
                    <td className="py-3.5 font-semibold text-abtg-text">{trade.name}</td>
                    <td className="py-3.5 text-abtg-navy font-mono font-semibold">{trade.ticker}</td>
                    <td className="py-3.5 text-abtg-muted">{trade.entryDate}</td>
                    <td className="py-3.5 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        trade.status === "open"
                          ? "bg-abtg-navy/10 text-abtg-navy border-abtg-navy/20"
                          : trade.status === "closed"
                          ? "bg-abtg-muted/10 text-abtg-muted border-abtg-muted/20"
                          : "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
                      }`}>
                        {trade.status === "open" ? "Aperto" : trade.status === "closed" ? "Chiuso" : "Scaduto"}
                      </span>
                    </td>
                    <td className="py-3.5 text-right font-mono">{trade.legs.length}</td>
                    <td className="py-3.5 text-right font-mono">${Math.abs(pnl.totalEntryDebit).toFixed(2)}</td>
                    <td className={`py-3.5 text-right font-mono font-bold ${pnlColor}`}>
                      {pnl.totalPnL >= 0 ? "+" : ""}${pnl.totalPnL.toFixed(2)}
                    </td>
                    <td className={`py-3.5 text-right font-mono font-medium ${pnlColor}`}>
                      {pnl.totalPnLPct >= 0 ? "+" : ""}{pnl.totalPnLPct.toFixed(1)}%
                    </td>
                    <td className="py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex gap-1.5 justify-end">
                        {trade.status === "open" && (
                          <button
                            className="px-2.5 py-1 rounded-md text-xs bg-abtg-navy/10 text-abtg-navy hover:bg-abtg-navy/20 border border-abtg-navy/20 font-medium transition"
                            onClick={() => onClose(trade.id)}
                          >
                            Chiudi
                          </button>
                        )}
                        <button
                          className="px-2.5 py-1 rounded-md text-xs bg-abtg-loss/10 text-abtg-loss hover:bg-abtg-loss/20 border border-abtg-loss/20 font-medium transition"
                          onClick={() => onDelete(trade.id)}
                        >
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
