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
            <th className="py-2 text-left">Tipo</th>
            <th className="py-2 text-left">Dir.</th>
            <th className="py-2 text-right">Strike</th>
            <th className="py-2 text-right">Premio Ingresso</th>
            <th className="py-2 text-right">Premio Corrente</th>
            <th className="py-2 text-right">P&L ($)</th>
            <th className="py-2 text-right">P&L (%)</th>
            <th className="py-2 text-right">Qty</th>
            <th className="py-2 text-center">Status</th>
          </tr>
        </thead>
        <tbody>
          {legs.map((leg, i) => {
            const lp = legPnLs[i];
            const pnl = leg.status === "open" ? lp.unrealizedPnL : lp.realizedPnL;
            const pnlPct = leg.status === "open" ? lp.unrealizedPnLPct : lp.realizedPnLPct;
            const color = pnl >= 0 ? "text-abtg-profit" : "text-abtg-loss";

            return (
              <tr key={leg.id} className="border-b border-abtg-border/50">
                <td className="py-2 capitalize">{leg.kind}</td>
                <td className="py-2">
                  <span className={`px-1.5 py-0.5 rounded text-xs ${leg.side === "long" ? "bg-abtg-profit/20 text-abtg-profit" : "bg-abtg-loss/20 text-abtg-loss"}`}>
                    {leg.side}
                  </span>
                </td>
                <td className="py-2 text-right font-mono">{leg.kind === "stock" ? "—" : `$${leg.strike.toFixed(2)}`}</td>
                <td className="py-2 text-right font-mono">${leg.entryPremium.toFixed(2)}</td>
                <td className="py-2 text-right font-mono">
                  ${(leg.status === "closed" ? (leg.closePrice ?? leg.currentPremium) : leg.currentPremium).toFixed(2)}
                </td>
                <td className={`py-2 text-right font-mono font-bold ${color}`}>
                  {pnl >= 0 ? "+" : ""}${pnl.toFixed(2)}
                </td>
                <td className={`py-2 text-right font-mono ${color}`}>
                  {pnlPct >= 0 ? "+" : ""}{pnlPct.toFixed(1)}%
                </td>
                <td className="py-2 text-right font-mono">{leg.quantity}</td>
                <td className="py-2 text-center">
                  <span className={`px-1.5 py-0.5 rounded text-xs ${
                    leg.status === "open" ? "bg-blue-500/20 text-blue-400" :
                    leg.status === "closed" ? "bg-abtg-muted/20 text-abtg-muted" :
                    "bg-yellow-500/20 text-yellow-400"
                  }`}>
                    {leg.status}
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
