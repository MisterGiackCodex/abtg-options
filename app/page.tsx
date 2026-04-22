"use client";
import { useCallback, useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { NumberField } from "@/components/ui/NumberField";
import { PayoffChart } from "@/components/charts/PayoffChart";
import { POPDistribution } from "@/components/charts/POPDistribution";
import { GreeksGrid } from "@/components/metrics/MetricsPanel";
import { ScenarioTable } from "@/components/metrics/ScenarioTable";
import { LegList } from "@/components/strategy/LegList";
import { TickerBar } from "@/components/ticker/TickerBar";
import { SaveTradeModal } from "@/components/trades/SaveTradeModal";
import { useMarketFeed } from "@/hooks/useMarketFeed";
import { useTrades } from "@/hooks/useTrades";
import {
  aggregateGreeks,
  breakEvenPoints,
  computePayoffRange,
  maxProfitLoss,
  netDebit,
  samplePayoff,
  type Leg,
} from "@/lib/pricing/strategies";
import { expectedValue, probabilityOfProfit } from "@/lib/probability/pop";
import type { LNParams } from "@/lib/probability/lognormal";
import {
  buyCall, sellCall, buyPut, sellPut, coveredCall,
  bullCallSpread, bearPutSpread, bullPutSpread, bearCallSpread,
  longStraddle, shortStraddle, longStrangle, ironCondor, callButterfly,
  PRESETS, type PresetId,
} from "@/lib/presets/multileg";

type Tab = "single" | "multi" | "compare";

export default function DashboardPage() {
  const [tab, setTab] = useState<Tab>("single");
  const [S, setS] = useState(100);
  const [sigma, setSigma] = useState(0.3);
  const [days, setDays] = useState(30);
  const [r, setR] = useState(0.045);

  // Ticker live
  const [tickerSymbol, setTickerSymbol] = useState<string | null>(null);
  const { quote, status: feedStatus, error: feedError } = useMarketFeed(tickerSymbol);
  const handleConnect = useCallback((sym: string) => setTickerSymbol(sym), []);
  const handleDisconnect = useCallback(() => setTickerSymbol(null), []);

  // Auto-populate spot from ticker
  if (quote && quote.price > 0 && tickerSymbol) {
    if (Math.abs(quote.price - S) > 0.005) {
      setTimeout(() => setS(quote.price), 0);
    }
  }

  // Save trade modal
  const [showSaveModal, setShowSaveModal] = useState(false);
  const { addTrade } = useTrades();

  const T = days / 365;
  const ctx = { S, T, r, sigma };

  // Preset state
  const [preset, setPreset] = useState<PresetId>("buyCall");
  const [k1, setK1] = useState(100);
  const [k2, setK2] = useState(110);
  const [k3, setK3] = useState(120);
  const [k4, setK4] = useState(90);
  const [qty, setQty] = useState(1);
  const [customLegs, setCustomLegs] = useState<Leg[]>([]);

  // Build legs from preset
  const presetLegs: Leg[] = useMemo(() => {
    switch (preset) {
      case "buyCall": return buyCall(k1, ctx, qty);
      case "sellCall": return sellCall(k1, ctx, qty);
      case "buyPut": return buyPut(k1, ctx, qty);
      case "sellPut": return sellPut(k1, ctx, qty);
      case "coveredCall": return coveredCall(k1, ctx, qty);
      case "bullCallSpread": return bullCallSpread(k1, k2, ctx, qty);
      case "bearPutSpread": return bearPutSpread(k1, k2, ctx, qty);
      case "bullPutSpread": return bullPutSpread(k1, k2, ctx, qty);
      case "bearCallSpread": return bearCallSpread(k1, k2, ctx, qty);
      case "longStraddle": return longStraddle(k1, ctx, qty);
      case "shortStraddle": return shortStraddle(k1, ctx, qty);
      case "longStrangle": return longStrangle(k4, k1, ctx, qty);
      case "ironCondor": return ironCondor(k4 - 10, k4, k2, k2 + 10, ctx, qty);
      case "callButterfly": return callButterfly(k1, k2, k3, ctx, qty);
    }
  }, [preset, k1, k2, k3, k4, qty, S, sigma, T, r]);

  const tabPresets = tab === "single"
    ? PRESETS.filter((p) => p.category === "single")
    : tab === "multi"
    ? PRESETS.filter((p) => p.category === "multi")
    : PRESETS;

  const legs: Leg[] = tab === "compare" ? presetLegs : (customLegs.length > 0 ? customLegs : presetLegs);

  const { minS, maxS, yMin, yMax } = useMemo(
    () => computePayoffRange(legs, ctx),
    [legs, S, sigma, T, r]
  );
  const payoffData = useMemo(() => samplePayoff(legs, ctx, minS, maxS, 120), [legs, S, sigma, T, r, minS, maxS]);
  const bes = useMemo(() => breakEvenPoints(legs, minS, maxS, 2000), [legs, minS, maxS]);
  const greeks = useMemo(() => aggregateGreeks(legs, ctx), [legs, S, sigma, T, r]);
  const mp = useMemo(() => maxProfitLoss(legs, minS * 0.5, maxS * 1.5, 500), [legs, minS, maxS]);
  const nd = netDebit(legs);

  const ln: LNParams = { S, T, r, sigma };
  const pop = useMemo(() => (T > 0 ? probabilityOfProfit(legs, ln) : 0), [legs, S, sigma, T, r]);
  const ev = useMemo(() => (T > 0 ? expectedValue(legs, ln) : 0), [legs, S, sigma, T, r]);

  const strikes = Array.from(new Set(legs.filter((l) => l.kind !== "stock").map((l) => l.strike)));
  const activePreset = PRESETS.find((p) => p.id === preset);

  const applyPreset = (id: PresetId) => {
    setPreset(id);
    setCustomLegs([]);
  };

  return (
    <div className="space-y-4">
      {/* Ticker Bar — full width, stays on top */}
      <TickerBar
        quote={quote}
        status={feedStatus}
        error={feedError}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
      />

      {/* Tab bar — improved active state */}
      <div className="flex gap-0.5 border-b border-abtg-border">
        {(
          [
            { id: "single" as Tab, label: "Singola", resetPreset: "buyCall" as PresetId },
            { id: "multi" as Tab, label: "Multi-Leg", resetPreset: "bullCallSpread" as PresetId },
            { id: "compare" as Tab, label: "Confronto", resetPreset: null },
          ] as const
        ).map(({ id, label, resetPreset }) => (
          <button
            key={id}
            role="tab"
            aria-selected={tab === id}
            onClick={() => {
              if (resetPreset) {
                setTab(id);
                applyPreset(resetPreset);
              } else {
                setTab(id);
              }
            }}
            className={[
              "px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer",
              "border-b-2 -mb-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-abtg-navy/40",
              tab === id
                ? "border-abtg-navy text-abtg-navy font-semibold"
                : "border-transparent text-abtg-muted hover:text-abtg-navy hover:border-abtg-navy/40",
            ].join(" ")}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Main 12-col grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* ── LEFT SIDEBAR: 4 cols, sticky ── */}
        <aside className="lg:col-span-4 space-y-4 lg:sticky lg:top-20">

          {/* Market params — compact 2-col grid */}
          <Card title="Parametri di Mercato" padding="p-4">
            <div className="grid grid-cols-2 gap-2.5">
              <NumberField label="Spot" value={S} onChange={setS} step={0.5} />
              <NumberField label="Volatilità Impl." value={sigma * 100} onChange={(v) => setSigma(v / 100)} step={1} suffix="%" />
              <NumberField label="Giorni a Scad." value={days} onChange={setDays} step={1} min={0} />
              <NumberField label="Risk-Free Rate" value={r * 100} onChange={(v) => setR(v / 100)} step={0.25} suffix="%" />
              <div className="col-span-2">
                <NumberField label="Contratti" value={qty} onChange={(v) => setQty(Math.max(1, Math.round(v)))} step={1} min={1} />
              </div>
            </div>
          </Card>

          {/* Strategy preset — compact */}
          <Card title="Strategia" padding="p-4">
            <select
              className="abtg-input mb-3 text-sm"
              value={preset}
              onChange={(e) => applyPreset(e.target.value as PresetId)}
            >
              {tabPresets.map((p) => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </select>

            {activePreset && (
              <div className="flex items-start gap-2 mb-3">
                <span className={[
                  "inline-block shrink-0 px-2 py-0.5 rounded-full text-xs border font-semibold",
                  activePreset.bias === "bullish"
                    ? "bg-abtg-profit/10 text-abtg-profit border-abtg-profit/20"
                    : activePreset.bias === "bearish"
                    ? "bg-abtg-loss/10 text-abtg-loss border-abtg-loss/20"
                    : "bg-abtg-gold/10 text-abtg-gold border-abtg-gold/20",
                ].join(" ")}>
                  {activePreset.bias === "bullish" ? "Rialzista" : activePreset.bias === "bearish" ? "Ribassista" : "Neutrale"}
                </span>
                <p className="text-xs text-abtg-muted leading-relaxed">{activePreset.description}</p>
              </div>
            )}

            {activePreset && activePreset.strikes.length > 0 && (
              <div className="grid grid-cols-2 gap-2.5">
                {activePreset.strikes.map((name) => {
                  const map: Record<string, [number, (v: number) => void]> = {
                    K: [k1, setK1], K1: [k1, setK1], Kp1: [k1, setK1],
                    K2: [k2, setK2], Kc1: [k2, setK2],
                    K3: [k3, setK3],
                    Kp: [k4, setK4], Kp2: [k4, setK4], Kc2: [k2, setK2],
                  };
                  const [val, setter] = map[name] ?? [k1, setK1];
                  return <NumberField key={name} label={`Strike ${name}`} value={val} onChange={setter} step={0.5} />;
                })}
              </div>
            )}
          </Card>

          {/* Legs editor — collapsible, under Strategy */}
          <details className="group abtg-card overflow-hidden">
            <summary className="flex items-center justify-between px-4 py-3 cursor-pointer select-none list-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-abtg-navy/40 rounded-xl">
              <span className="text-xs uppercase tracking-widest text-abtg-navy font-bold">
                Leg Personalizzabili
                <span className="ml-2 text-abtg-muted font-normal normal-case tracking-normal text-[11px]">
                  ({legs.length} leg{legs.length !== 1 ? "s" : ""}{customLegs.length > 0 ? " — personalizzate" : " — preset"})
                </span>
              </span>
              <svg
                className="w-4 h-4 text-abtg-muted transition-transform group-open:rotate-180"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <div className="px-4 pb-4 pt-1 border-t border-abtg-border mt-0">
              <LegList legs={legs} onChange={setCustomLegs} />
              {customLegs.length > 0 && (
                <button
                  className="abtg-btn mt-3 text-xs w-full"
                  onClick={() => setCustomLegs([])}
                >
                  Ripristina Preset
                </button>
              )}
            </div>
          </details>

        </aside>

        {/* ── CENTER / RIGHT: 8 cols ── */}
        <main className="lg:col-span-8 space-y-5" id="main-content">

          {/* Key metrics — 4 per row, 2 rows */}
          <Card padding="p-4">
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-abtg-border">
              <h3 className="text-xs uppercase tracking-widest text-abtg-navy font-bold">Metriche Chiave</h3>
              <button
                className="abtg-btn-navy px-5 py-1.5 rounded-lg text-xs font-semibold"
                onClick={() => setShowSaveModal(true)}
              >
                Salva Trade
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <MetricCompact
                label="Debito / Credito"
                value={`${nd >= 0 ? "-" : "+"}$${Math.abs(nd).toFixed(2)}`}
                tone={nd >= 0 ? "loss" : "profit"}
                hint={nd >= 0 ? "Paghi premio" : "Incassi premio"}
              />
              <MetricCompact
                label="Profitto Max"
                value={mp.unboundedUp ? "∞" : `$${mp.maxProfit.toFixed(2)}`}
                tone="profit"
                hint={mp.unboundedUp ? "Illimitato" : undefined}
              />
              <MetricCompact
                label="Perdita Max"
                value={mp.unboundedDown ? "-∞" : `-$${Math.abs(mp.maxLoss).toFixed(2)}`}
                tone="loss"
                hint={mp.unboundedDown ? "Illimitata" : undefined}
              />
              <MetricCompact
                label="Break-Even"
                value={bes.length === 0 ? "—" : bes.map((b) => `$${b.toFixed(2)}`).join(" / ")}
                tone="gold"
              />
              <MetricCompact
                label="POP"
                value={`${(pop * 100).toFixed(1)}%`}
                tone="gold"
                hint="Risk-neutral"
              />
              <MetricCompact
                label="Valore Atteso"
                value={`${ev >= 0 ? "+" : ""}$${ev.toFixed(2)}`}
                tone={ev >= 0 ? "profit" : "loss"}
                hint="EV a scadenza"
              />
              <MetricCompact
                label="Risk / Reward"
                value={
                  mp.unboundedUp || mp.unboundedDown || mp.maxLoss === 0
                    ? "—"
                    : `${Math.abs(mp.maxProfit / mp.maxLoss).toFixed(2)}x`
                }
              />
              <MetricCompact
                label="Legs"
                value={`${legs.length}`}
                hint={`${legs.filter(l => l.side === "long").length}L / ${legs.filter(l => l.side === "short").length}S`}
              />
            </div>
          </Card>

          {/* Payoff chart — prominent */}
          <Card title="Diagramma Payoff" padding="p-4">
            <PayoffChart data={payoffData} breakEvens={bes} strikes={strikes} spot={S} yDomain={[yMin, yMax]} />
            <div className="flex gap-6 text-xs text-abtg-muted mt-3 justify-center">
              <span>
                <span className="inline-block w-3 h-0.5 bg-abtg-gold mr-1.5 align-middle" />
                A scadenza
              </span>
              <span>
                <span
                  className="inline-block w-3 h-0.5 bg-abtg-navyLight mr-1.5 align-middle"
                  style={{ borderStyle: "dashed" }}
                />
                Oggi (mark-to-market)
              </span>
            </div>
          </Card>

        </main>
      </div>

      {/* ── Full-width analytics: Greche + POP + Scenari (2 rows, responsive) ── */}
      <section className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card title="Greche Aggregate" padding="p-4">
            <GreeksGrid g={greeks} multiplier />
          </Card>
          <Card title="Distribuzione e POP" padding="p-4">
            <POPDistribution legs={legs} ln={ln} minS={minS} maxS={maxS} />
            <p className="text-xs text-abtg-muted mt-2 text-center leading-relaxed">
              Zone verdi = prezzi in profitto a scadenza.
            </p>
          </Card>
        </div>
        <Card title="Analisi degli Scenari" padding="p-4">
          <ScenarioTable legs={legs} spot={S} />
        </Card>
      </section>

      {showSaveModal && (
        <SaveTradeModal
          legs={legs}
          ctx={ctx}
          onSave={(trade) => addTrade(trade)}
          onClose={() => setShowSaveModal(false)}
        />
      )}
    </div>
  );
}

/* ── MetricCompact: denser tile vs the full Metric ── */
function MetricCompact({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "profit" | "loss" | "gold";
}) {
  const toneClass =
    tone === "profit" ? "text-abtg-profit" :
    tone === "loss"   ? "text-abtg-loss"   :
    tone === "gold"   ? "text-abtg-gold"   : "text-abtg-navy";

  return (
    <div className="bg-abtg-bg rounded-lg p-3 border border-abtg-border flex flex-col gap-0.5 min-w-0">
      <span className="text-[10px] uppercase tracking-widest text-abtg-muted font-semibold truncate">{label}</span>
      <span className={`text-lg font-bold leading-tight truncate ${toneClass}`}>{value}</span>
      {hint && <span className="text-[10px] text-abtg-muted leading-tight">{hint}</span>}
    </div>
  );
}
