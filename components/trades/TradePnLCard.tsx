"use client";
import type { TradePnL } from "@/lib/trades/pnl";

interface TradePnLCardProps {
  pnl: TradePnL;
}

function PnLValue({ label, value, pct }: { label: string; value: number; pct?: number }) {
  const color = value >= 0 ? "text-abtg-profit" : "text-abtg-loss";
  return (
    <div className="text-center">
      <div className="text-xs text-abtg-muted mb-1 uppercase tracking-wider font-semibold">{label}</div>
      <div className={`text-xl font-mono font-bold ${color}`}>
        {value >= 0 ? "+" : ""}${value.toFixed(2)}
      </div>
      {pct !== undefined && (
        <div className={`text-xs font-mono font-medium ${color}`}>
          {pct >= 0 ? "+" : ""}{pct.toFixed(1)}%
        </div>
      )}
    </div>
  );
}

export function TradePnLCard({ pnl }: TradePnLCardProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 bg-white border border-abtg-border rounded-xl shadow-card">
      <PnLValue label="P&L Non Realizzato" value={pnl.totalUnrealized} />
      <PnLValue label="P&L Realizzato" value={pnl.totalRealized} />
      <PnLValue label="P&L Totale" value={pnl.totalPnL} pct={pnl.totalPnLPct} />
      <div className="text-center">
        <div className="text-xs text-abtg-muted mb-1 uppercase tracking-wider font-semibold">Giorni Detenuti</div>
        <div className="text-xl font-mono font-bold text-abtg-navy">{pnl.daysHeld}</div>
        <div className="text-xs text-abtg-muted font-medium">
          Costo ingresso: ${Math.abs(pnl.totalEntryDebit).toFixed(2)}
        </div>
      </div>
    </div>
  );
}
