"use client";
import type { TradeLeg } from "@/lib/trades/types";
import type { LegPnL } from "@/lib/trades/pnl";

interface LegPnLTableProps {
  legs: TradeLeg[];
  legPnLs: LegPnL[];
}

export function LegPnLTable({ legs, legPnLs }: LegPnLTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-abtg-muted text-xs border-b border-abtg-border">
            <th className="py-3 text-left font-semibold">Tipo</th>
            <th className="py-3 text-left font-semibold">Dir.</th>
            <th className="py-3 text-right font-semibold">Strike</th>
            <th className="py-3 text-right font-semibold">Premio Ingresso</th>
            <th className="py-3 text-right font-semibold">Premio Corrente</th>
            <th className="py-3 text-right font-semibold">P&amp;L ($)</th>
            <th className="py-3 text-right font-semibold">P&amp;L (%)</th>
            <th className="py-3 text-right font-semibold">Qty</th>
            <th className="py-3 text-center font-semibold">Status</th>
          </tr>
        </thead>
        <tbody>
          {legs.map((leg, i) => {
            const lp = legPnLs[i];
            const pnl = leg.status === "open" ? lp.unrealizedPnL : lp.realizedPnL;
            const pnlPct = leg.status === "open" ? lp.unrealizedPnLPct : lp.realizedPnLPct;
            const color = pnl >= 0 ? "text-abtg-profit" : "text-abtg-loss";

            return (
              <tr key={leg.id} className="border-b border-abtg-border/50 hover:bg-abtg-bg/60 transition-colors">
                <td className="py-3 capitalize font-medium">{leg.kind}</td>
                <td className="py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                    leg.side === "long"
                      ? "bg-abtg-profit/10 text-abtg-profit border-abtg-profit/20"
                      : "bg-abtg-loss/10 text-abtg-loss border-abtg-loss/20"
                  }`}>
                    {leg.side}
                  </span>
                </td>
                <td className="py-3 text-right font-mono">{leg.kind === "stock" ? "—" : `$${leg.strike.toFixed(2)}`}</td>
                <td className="py-3 text-right font-mono">${leg.entryPremium.toFixed(2)}</td>
                <td className="py-3 text-right font-mono">
                  ${(leg.status === "closed" ? (leg.closePrice ?? leg.currentPremium) : leg.currentPremium).toFixed(2)}
                </td>
                <td className={`py-3 text-right font-mono font-bold ${color}`}>
                  {pnl >= 0 ? "+" : ""}${pnl.toFixed(2)}
                </td>
                <td className={`py-3 text-right font-mono font-medium ${color}`}>
                  {pnlPct >= 0 ? "+" : ""}{pnlPct.toFixed(1)}%
                </td>
                <td className="py-3 text-right font-mono">{leg.quantity}</td>
                <td className="py-3 text-center">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                    leg.status === "open"
                      ? "bg-abtg-navy/10 text-abtg-navy border-abtg-navy/20"
                      : leg.status === "closed"
                      ? "bg-abtg-muted/10 text-abtg-muted border-abtg-muted/20"
                      : "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
                  }`}>
                    {leg.status === "open" ? "Aperto" : leg.status === "closed" ? "Chiuso" : "Scaduto"}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
