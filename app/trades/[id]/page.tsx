"use client";
import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { PayoffChart } from "@/components/charts/PayoffChart";
import { GreeksGrid } from "@/components/metrics/MetricsPanel";
import { TradePnLCard } from "@/components/trades/TradePnLCard";
import { LegPnLTable } from "@/components/trades/LegPnLTable";
import { useTrades } from "@/hooks/useTrades";
import { calculateTradePnL } from "@/lib/trades/pnl";
import {
  aggregateGreeks,
  breakEvenPoints,
  computePayoffRange,
  samplePayoff,
  type Leg,
  type MarketCtx,
} from "@/lib/pricing/strategies";

export default function TradeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { trades, updateTrade, closeTrade } = useTrades();

  const trade = trades.find((t) => t.id === id);

  if (!trade) {
    return (
      <div className="text-center py-20">
        <p className="text-abtg-muted text-lg mb-4">Trade non trovato.</p>
        <a href="/trades" className="abtg-btn text-xs inline-block">Torna ai Trade</a>
      </div>
    );
  }

  const daysToExpiry = Math.max(0, (new Date(trade.expirationDate).getTime() - Date.now()) / 86_400_000);
  const ctx: MarketCtx = {
    S: trade.marketCtxAtEntry.S,
    T: daysToExpiry / 365,
    r: trade.marketCtxAtEntry.r,
    sigma: trade.marketCtxAtEntry.sigma,
  };

  const pnl = useMemo(() => calculateTradePnL(trade, ctx), [trade, ctx.S, ctx.T, ctx.r, ctx.sigma]);

  const legs: Leg[] = trade.legs.map((tl) => ({
    id: tl.id,
    kind: tl.kind,
    side: tl.side,
    strike: tl.strike,
    premium: tl.entryPremium,
    quantity: tl.quantity,
  }));

  const S = ctx.S;
  const { minS, maxS, yMin, yMax } = useMemo(
    () => computePayoffRange(legs, ctx),
    [legs, ctx.S, ctx.T, ctx.r, ctx.sigma]
  );

  const payoffData = useMemo(() => samplePayoff(legs, ctx, minS, maxS, 120), [legs, ctx.S, ctx.T, ctx.r, ctx.sigma, minS, maxS]);
  const bes = useMemo(() => breakEvenPoints(legs, minS, maxS, 2000), [legs, minS, maxS]);
  const greeks = useMemo(() => aggregateGreeks(legs, ctx), [legs, ctx.S, ctx.T, ctx.r, ctx.sigma]);
  const strikes = Array.from(new Set(legs.filter((l) => l.kind !== "stock").map((l) => l.strike)));

  const handleClose = () => {
    if (!confirm("Confermi la chiusura del trade ai prezzi correnti di mercato?")) return;
    const closePrices: Record<string, number> = {};
    for (const leg of trade.legs) closePrices[leg.id] = leg.currentPremium;
    closeTrade(trade.id, closePrices);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <button
            onClick={() => router.push("/trades")}
            className="text-xs text-abtg-muted hover:text-abtg-navy mb-2 block transition font-medium"
          >
            &larr; Torna ai Trade
          </button>
          <h1 className="text-2xl font-bold text-abtg-navy">{trade.name}</h1>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <span className="text-sm text-abtg-navy font-mono font-semibold">{trade.ticker}</span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
              trade.status === "open"
                ? "bg-abtg-navy/10 text-abtg-navy border-abtg-navy/20"
                : trade.status === "closed"
                ? "bg-abtg-muted/10 text-abtg-muted border-abtg-muted/20"
                : "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
            }`}>
              {trade.status === "open" ? "Aperto" : trade.status === "closed" ? "Chiuso" : "Scaduto"}
            </span>
            <span className="text-xs text-abtg-muted">Ingresso: {trade.entryDate}</span>
            <span className="text-xs text-abtg-muted">Scadenza: {trade.expirationDate}</span>
          </div>
        </div>
        <div className="flex gap-2">
          {trade.status === "open" && (
            <button
              className="abtg-btn-navy text-xs px-4 py-2 rounded-lg"
              onClick={handleClose}
            >
              Chiudi Trade
            </button>
          )}
          <button className="abtg-btn text-xs" onClick={() => window.print()}>
            Stampa Report
          </button>
        </div>
      </div>

      {/* P&L Summary */}
      <TradePnLCard pnl={pnl} />

      {/* Per-Leg P&L */}
      <Card title="P&L per Leg">
        <LegPnLTable legs={trade.legs} legPnLs={pnl.legs} />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payoff Chart */}
        <Card title="Diagramma Payoff">
          <PayoffChart data={payoffData} breakEvens={bes} strikes={strikes} spot={S} yDomain={[yMin, yMax]} />
        </Card>

        {/* Greeks */}
        <Card title="Greche Aggregate">
          <GreeksGrid g={greeks} multiplier />
        </Card>
      </div>

      {/* Notes */}
      <Card title="Note">
        <textarea
          className="abtg-input w-full h-24 resize-none text-sm"
          value={trade.notes}
          onChange={(e) => updateTrade(trade.id, { notes: e.target.value })}
          placeholder="Aggiungi note sul trade..."
        />
      </Card>

      {/* Market Context at Entry */}
      <Card title="Contesto di Mercato all'Ingresso">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-abtg-muted font-medium">Spot:</span>{" "}
            <span className="font-mono font-semibold">${trade.marketCtxAtEntry.S.toFixed(2)}</span>
          </div>
          <div>
            <span className="text-abtg-muted font-medium">IV:</span>{" "}
            <span className="font-mono font-semibold">{(trade.marketCtxAtEntry.sigma * 100).toFixed(1)}%</span>
          </div>
          <div>
            <span className="text-abtg-muted font-medium">Risk-free:</span>{" "}
            <span className="font-mono font-semibold">{(trade.marketCtxAtEntry.r * 100).toFixed(2)}%</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
