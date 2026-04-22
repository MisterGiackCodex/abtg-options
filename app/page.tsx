"use client";
import { useCallback, useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { NumberField } from "@/components/ui/NumberField";
import { PayoffChart } from "@/components/charts/PayoffChart";
import { CompareChart, type CompareSeries } from "@/components/charts/CompareChart";
import { POPDistribution } from "@/components/charts/POPDistribution";
import { TimeDecayChart } from "@/components/charts/TimeDecayChart";
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
  strategyPayoff,
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

/** Per-tab isolated state for Singola / Multi-Leg */
interface TabState {
  preset: PresetId;
  k1: number;
  k2: number;
  k3: number;
  k4: number;
  qty: number;
  customLegs: Leg[];
}

const SINGLE_DEFAULT: TabState = {
  preset: "buyCall", k1: 100, k2: 110, k3: 120, k4: 90, qty: 1, customLegs: [],
};
const MULTI_DEFAULT: TabState = {
  preset: "bullCallSpread", k1: 100, k2: 110, k3: 120, k4: 90, qty: 1, customLegs: [],
};

/** Per-slot state for the Compare tab */
interface SlotState {
  id: string; // stable key
  label: string;
  preset: PresetId;
  k1: number;
  k2: number;
  k3: number;
  k4: number;
  qty: number;
}

const SLOT_COLORS = ["#EF7B10", "#16A34A", "#3B82F6"] as const;

function makeSlot(id: string, label: string, preset: PresetId, spot: number): SlotState {
  const k = Math.round(spot);
  return { id, label, preset, k1: k, k2: k + 10, k3: k + 20, k4: k - 10, qty: 1 };
}

/** Build legs from a preset id + slot strike params */
function buildLegsFromSlot(slot: SlotState, ctx: { S: number; T: number; r: number; sigma: number }): Leg[] {
  switch (slot.preset) {
    case "buyCall":        return buyCall(slot.k1, ctx, slot.qty);
    case "sellCall":       return sellCall(slot.k1, ctx, slot.qty);
    case "buyPut":         return buyPut(slot.k1, ctx, slot.qty);
    case "sellPut":        return sellPut(slot.k1, ctx, slot.qty);
    case "coveredCall":    return coveredCall(slot.k1, ctx, slot.qty);
    case "bullCallSpread": return bullCallSpread(slot.k1, slot.k2, ctx, slot.qty);
    case "bearPutSpread":  return bearPutSpread(slot.k1, slot.k2, ctx, slot.qty);
    case "bullPutSpread":  return bullPutSpread(slot.k1, slot.k2, ctx, slot.qty);
    case "bearCallSpread": return bearCallSpread(slot.k1, slot.k2, ctx, slot.qty);
    case "longStraddle":   return longStraddle(slot.k1, ctx, slot.qty);
    case "shortStraddle":  return shortStraddle(slot.k1, ctx, slot.qty);
    case "longStrangle":   return longStrangle(slot.k4, slot.k1, ctx, slot.qty);
    case "ironCondor":     return ironCondor(slot.k4 - 10, slot.k4, slot.k2, slot.k2 + 10, ctx, slot.qty);
    case "callButterfly":  return callButterfly(slot.k1, slot.k2, slot.k3, ctx, slot.qty);
  }
}

/** Build legs from a TabState (same logic, reuses same switch) */
function buildLegsFromTabState(state: TabState, ctx: { S: number; T: number; r: number; sigma: number }): Leg[] {
  if (state.customLegs.length > 0) return state.customLegs;
  const slot: SlotState = {
    id: "", label: "", preset: state.preset,
    k1: state.k1, k2: state.k2, k3: state.k3, k4: state.k4, qty: state.qty,
  };
  return buildLegsFromSlot(slot, ctx);
}

export default function DashboardPage() {
  const [tab, setTab] = useState<Tab>("single");

  // ── Shared market params ──────────────────────────────────────────────────
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
  const ctx = useMemo(() => ({ S, T, r, sigma }), [S, T, r, sigma]);

  // ── Per-tab isolated state ────────────────────────────────────────────────
  const [singleState, setSingleState] = useState<TabState>(SINGLE_DEFAULT);
  const [multiState, setMultiState] = useState<TabState>(MULTI_DEFAULT);

  const activeTabState = tab === "single" ? singleState : multiState;
  const setActiveTabState = tab === "single" ? setSingleState : setMultiState;

  // Convenience setters that operate on the active tab's state
  const setPreset = (id: PresetId) =>
    setActiveTabState((prev) => ({ ...prev, preset: id, customLegs: [] }));
  const setK1 = (v: number) => setActiveTabState((prev) => ({ ...prev, k1: v }));
  const setK2 = (v: number) => setActiveTabState((prev) => ({ ...prev, k2: v }));
  const setK3 = (v: number) => setActiveTabState((prev) => ({ ...prev, k3: v }));
  const setK4 = (v: number) => setActiveTabState((prev) => ({ ...prev, k4: v }));
  const setQty = (v: number) => setActiveTabState((prev) => ({ ...prev, qty: Math.max(1, Math.round(v)) }));
  const setCustomLegs = (legs: Leg[]) => setActiveTabState((prev) => ({ ...prev, customLegs: legs }));

  // ── Compare tab state ─────────────────────────────────────────────────────
  const [slots, setSlots] = useState<SlotState[]>(() => [
    makeSlot("a", "A", "buyCall", S),
    makeSlot("b", "B", "sellCall", S),
  ]);

  const updateSlot = (id: string, patch: Partial<SlotState>) =>
    setSlots((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  const addSlot = () => {
    if (slots.length >= 3) return;
    const labels = ["A", "B", "C"];
    const label = labels[slots.length];
    const presets: PresetId[] = ["buyCall", "sellCall", "longStraddle"];
    setSlots((prev) => [...prev, makeSlot(label.toLowerCase(), label, presets[prev.length] ?? "buyCall", S)]);
  };

  const removeSlot = (id: string) =>
    setSlots((prev) => (prev.length > 2 ? prev.filter((s) => s.id !== id) : prev));

  // ── Derived values for Singola / Multi-Leg tabs ───────────────────────────
  const { preset, k1, k2, k3, k4, qty, customLegs } = activeTabState;

  const legs: Leg[] = useMemo(
    () => buildLegsFromTabState(activeTabState, ctx),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeTabState, S, sigma, T, r]
  );

  const tabPresets = tab === "single"
    ? PRESETS.filter((p) => p.category === "single")
    : PRESETS.filter((p) => p.category === "multi");

  const { minS, maxS, yMin, yMax } = useMemo(
    () => computePayoffRange(legs, ctx),
    [legs, S, sigma, T, r]
  );
  const payoffData = useMemo(
    () => samplePayoff(legs, ctx, minS, maxS, 120),
    [legs, S, sigma, T, r, minS, maxS]
  );
  const bes = useMemo(() => breakEvenPoints(legs, minS, maxS, 2000), [legs, minS, maxS]);
  const greeks = useMemo(() => aggregateGreeks(legs, ctx), [legs, S, sigma, T, r]);
  const mp = useMemo(() => maxProfitLoss(legs, minS * 0.5, maxS * 1.5, 500), [legs, minS, maxS]);
  const nd = netDebit(legs);

  const ln: LNParams = { S, T, r, sigma };
  const pop = useMemo(() => (T > 0 ? probabilityOfProfit(legs, ln) : 0), [legs, S, sigma, T, r]);
  const ev = useMemo(() => (T > 0 ? expectedValue(legs, ln) : 0), [legs, S, sigma, T, r]);

  const strikes = Array.from(new Set(legs.filter((l) => l.kind !== "stock").map((l) => l.strike)));
  const activePreset = PRESETS.find((p) => p.id === preset);

  // ── Compare tab derived values ────────────────────────────────────────────
  const compareLegsAll = useMemo(
    () => slots.map((slot) => buildLegsFromSlot(slot, ctx)),
    [slots, S, sigma, T, r]
  );

  const compareRanges = useMemo(
    () => compareLegsAll.map((legs) => computePayoffRange(legs, ctx)),
    [compareLegsAll, S, sigma, T, r]
  );

  const compareGlobalMinS = useMemo(
    () => Math.min(...compareRanges.map((r) => r.minS)),
    [compareRanges]
  );
  const compareGlobalMaxS = useMemo(
    () => Math.max(...compareRanges.map((r) => r.maxS)),
    [compareRanges]
  );

  const compareSeries: CompareSeries[] = useMemo(
    () =>
      slots.map((slot, i) => ({
        label: `${slot.label} — ${PRESETS.find((p) => p.id === slot.preset)?.label ?? slot.preset}`,
        color: SLOT_COLORS[i] ?? "#64748B",
        points: samplePayoff(compareLegsAll[i], ctx, compareGlobalMinS, compareGlobalMaxS, 120).map(
          (pt) => ({ S: pt.S, expiry: pt.expiry })
        ),
      })),
    [slots, compareLegsAll, S, sigma, T, r, compareGlobalMinS, compareGlobalMaxS]
  );

  const compareYDomain = useMemo((): [number, number] => {
    let lo = Infinity, hi = -Infinity;
    for (const s of compareSeries) {
      for (const pt of s.points) {
        if (pt.expiry < lo) lo = pt.expiry;
        if (pt.expiry > hi) hi = pt.expiry;
      }
    }
    if (!isFinite(lo) || !isFinite(hi)) return [-100, 100];
    const pad = (hi - lo) * 0.12 + 1;
    return [lo - pad, hi + pad];
  }, [compareSeries]);

  const compareMetrics = useMemo(
    () =>
      slots.map((slot, i) => {
        const legs = compareLegsAll[i];
        const { minS: cMinS, maxS: cMaxS } = compareRanges[i];
        const slotLn: LNParams = { S, T, r, sigma };
        const cMp = maxProfitLoss(legs, cMinS * 0.5, cMaxS * 1.5, 500);
        const cBes = breakEvenPoints(legs, cMinS, cMaxS, 2000);
        const cNd = netDebit(legs);
        const cPop = T > 0 ? probabilityOfProfit(legs, slotLn) : 0;
        const cEv = T > 0 ? expectedValue(legs, slotLn) : 0;
        const rr =
          cMp.unboundedUp || cMp.unboundedDown || cMp.maxLoss === 0
            ? null
            : Math.abs(cMp.maxProfit / cMp.maxLoss);
        return { slot, cNd, cMp, cBes, cPop, cEv, rr };
      }),
    [slots, compareLegsAll, compareRanges, S, T, r, sigma]
  );

  // ── Slot strikes panel ──────────────────────────────────────────────────
  function SlotStrikeInputs({ slot }: { readonly slot: SlotState }) {
    const meta = PRESETS.find((p) => p.id === slot.preset);
    if (!meta || meta.strikes.length === 0) return null;
    const map: Record<string, [number, (v: number) => void]> = {
      K: [slot.k1, (v) => updateSlot(slot.id, { k1: v })],
      K1: [slot.k1, (v) => updateSlot(slot.id, { k1: v })],
      Kp1: [slot.k1, (v) => updateSlot(slot.id, { k1: v })],
      K2: [slot.k2, (v) => updateSlot(slot.id, { k2: v })],
      Kc1: [slot.k2, (v) => updateSlot(slot.id, { k2: v })],
      K3: [slot.k3, (v) => updateSlot(slot.id, { k3: v })],
      Kp: [slot.k4, (v) => updateSlot(slot.id, { k4: v })],
      Kp2: [slot.k4, (v) => updateSlot(slot.id, { k4: v })],
      Kc2: [slot.k2, (v) => updateSlot(slot.id, { k2: v })],
    };
    return (
      <div className="grid grid-cols-2 gap-2 mt-2">
        {meta.strikes.map((name) => {
          const entry = map[name];
          if (!entry) return null;
          const [val, setter] = entry;
          return (
            <NumberField key={name} label={`Strike ${name}`} value={val} onChange={setter} step={0.5} />
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Ticker Bar */}
      <TickerBar
        quote={quote}
        status={feedStatus}
        error={feedError}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
      />

      {/* Tab bar */}
      <div className="flex gap-0.5 border-b border-abtg-border">
        {(
          [
            { id: "single" as Tab, label: "Singola" },
            { id: "multi" as Tab, label: "Multi-Leg" },
            { id: "compare" as Tab, label: "Confronto" },
          ] as const
        ).map(({ id, label }) => (
          <button
            key={id}
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
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

      {/* ══════════════════════ COMPARE TAB ══════════════════════ */}
      {tab === "compare" && (
        <main className="space-y-5" id="main-content">

          {/* Shared market params — same row as single/multi */}
          <Card title="Parametri di Mercato" padding="p-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <NumberField label="Spot" value={S} onChange={setS} step={0.5} />
              <NumberField label="Volatilità Impl." value={sigma * 100} onChange={(v) => setSigma(v / 100)} step={1} suffix="%" />
              <NumberField label="Giorni a Scad." value={days} onChange={setDays} step={1} min={0} />
              <NumberField label="Risk-Free Rate" value={r * 100} onChange={(v) => setR(v / 100)} step={0.25} suffix="%" />
            </div>
          </Card>

          {/* Slot cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 items-start">
            {slots.map((slot, i) => (
              <Card key={slot.id} padding="p-4">
                <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-abtg-border">
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block w-3 h-3 rounded-full shrink-0"
                      style={{ background: SLOT_COLORS[i] ?? "#64748B" }}
                      aria-hidden="true"
                    />
                    <h3 className="text-xs uppercase tracking-widest text-abtg-navy font-bold">
                      Strategia {slot.label}
                    </h3>
                  </div>
                  {slots.length > 2 && (
                    <button
                      onClick={() => removeSlot(slot.id)}
                      aria-label={`Rimuovi strategia ${slot.label}`}
                      className="text-abtg-muted hover:text-abtg-loss transition-colors text-xs px-2 py-0.5 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-abtg-navy/40"
                    >
                      Rimuovi
                    </button>
                  )}
                </div>

                <select
                  className="abtg-input text-sm w-full"
                  value={slot.preset}
                  aria-label={`Preset per la strategia ${slot.label}`}
                  onChange={(e) =>
                    updateSlot(slot.id, { preset: e.target.value as PresetId })
                  }
                >
                  {PRESETS.map((p) => (
                    <option key={p.id} value={p.id}>{p.label}</option>
                  ))}
                </select>

                <SlotStrikeInputs slot={slot} />

                <div className="mt-2">
                  <NumberField
                    label="Contratti"
                    value={slot.qty}
                    onChange={(v) => updateSlot(slot.id, { qty: Math.max(1, Math.round(v)) })}
                    step={1}
                    min={1}
                  />
                </div>
              </Card>
            ))}

            {/* Add slot button */}
            {slots.length < 3 && (
              <button
                onClick={addSlot}
                aria-label="Aggiungi una terza strategia al confronto"
                className={[
                  "abtg-card p-4 flex flex-col items-center justify-center gap-2 min-h-[140px]",
                  "border-2 border-dashed border-abtg-border text-abtg-muted",
                  "hover:border-abtg-navy hover:text-abtg-navy transition-colors cursor-pointer",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-abtg-navy/40",
                ].join(" ")}
              >
                <span className="text-2xl font-light leading-none" aria-hidden="true">+</span>
                <span className="text-sm font-medium">Aggiungi strategia</span>
              </button>
            )}
          </div>

          {/* Compare overlay chart */}
          <Card title="Confronto Payoff a Scadenza" padding="p-4">
            <CompareChart series={compareSeries} spot={S} yDomain={compareYDomain} />
            <p className="text-xs text-abtg-muted mt-3 leading-relaxed border-t border-abtg-border pt-3">
              Confronto visuale fra strategie — utile per scegliere fra alternative prima di aprire la posizione.
            </p>
          </Card>

          {/* Comparison metrics table */}
          <Card title="Metriche di Confronto" padding="p-4">
            <div className="overflow-x-auto -mx-1">
              <table className="w-full text-sm min-w-[600px]" aria-label="Tabella metriche di confronto strategie">
                <thead>
                  <tr className="border-b border-abtg-border">
                    <th className="text-left text-[10px] uppercase tracking-widest text-abtg-muted font-semibold py-2 pr-4 pl-1 w-48">
                      Strategia
                    </th>
                    <th className="text-right text-[10px] uppercase tracking-widest text-abtg-muted font-semibold py-2 px-3">
                      Debito / Credito
                    </th>
                    <th className="text-right text-[10px] uppercase tracking-widest text-abtg-muted font-semibold py-2 px-3">
                      Profitto Max
                    </th>
                    <th className="text-right text-[10px] uppercase tracking-widest text-abtg-muted font-semibold py-2 px-3">
                      Perdita Max
                    </th>
                    <th className="text-right text-[10px] uppercase tracking-widest text-abtg-muted font-semibold py-2 px-3">
                      Break-Even
                    </th>
                    <th className="text-right text-[10px] uppercase tracking-widest text-abtg-muted font-semibold py-2 px-3">
                      POP
                    </th>
                    <th className="text-right text-[10px] uppercase tracking-widest text-abtg-muted font-semibold py-2 px-3">
                      EV
                    </th>
                    <th className="text-right text-[10px] uppercase tracking-widest text-abtg-muted font-semibold py-2 px-3 pr-1">
                      R/R
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {compareMetrics.map(({ slot, cNd, cMp, cBes, cPop, cEv, rr }, i) => (
                    <tr key={slot.id} className="border-b border-abtg-border last:border-0 hover:bg-abtg-bg/50 transition-colors">
                      <td className="py-3 pr-4 pl-1">
                        <div className="flex items-center gap-2">
                          <span
                            className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ background: SLOT_COLORS[i] ?? "#64748B" }}
                            aria-hidden="true"
                          />
                          <span className="font-semibold text-abtg-text text-xs">
                            {slot.label} — {PRESETS.find((p) => p.id === slot.preset)?.label ?? slot.preset}
                          </span>
                        </div>
                      </td>
                      <td className={`text-right py-3 px-3 font-mono text-xs font-semibold tabular-nums ${cNd >= 0 ? "text-abtg-loss" : "text-abtg-profit"}`}>
                        {cNd >= 0 ? `-$${Math.abs(cNd).toFixed(2)}` : `+$${Math.abs(cNd).toFixed(2)}`}
                      </td>
                      <td className="text-right py-3 px-3 font-mono text-xs text-abtg-profit tabular-nums">
                        {cMp.unboundedUp ? "∞" : `$${cMp.maxProfit.toFixed(2)}`}
                      </td>
                      <td className="text-right py-3 px-3 font-mono text-xs text-abtg-loss tabular-nums">
                        {cMp.unboundedDown ? "-∞" : `-$${Math.abs(cMp.maxLoss).toFixed(2)}`}
                      </td>
                      <td className="text-right py-3 px-3 font-mono text-xs text-abtg-gold tabular-nums">
                        {cBes.length === 0 ? "—" : cBes.map((b) => `$${b.toFixed(2)}`).join(" / ")}
                      </td>
                      <td className="text-right py-3 px-3 font-mono text-xs text-abtg-navy tabular-nums">
                        {(cPop * 100).toFixed(1)}%
                      </td>
                      <td className={`text-right py-3 px-3 font-mono text-xs tabular-nums ${cEv >= 0 ? "text-abtg-profit" : "text-abtg-loss"}`}>
                        {cEv >= 0 ? `+$${cEv.toFixed(2)}` : `-$${Math.abs(cEv).toFixed(2)}`}
                      </td>
                      <td className="text-right py-3 px-3 pr-1 font-mono text-xs text-abtg-navy tabular-nums">
                        {rr === null ? "—" : `${rr.toFixed(2)}x`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-abtg-muted mt-3 leading-relaxed border-t border-abtg-border pt-3">
              <strong className="text-abtg-text font-semibold">Come usare la tabella:</strong> confronta debito/credito all&apos;apertura, profitto e perdita massima, i prezzi di pareggio (break-even), la probabilità di profitto (POP) e il valore atteso (EV) per ogni strategia. Il Risk/Reward indica quante volte vale il profitto massimo rispetto alla perdita massima.
            </p>
          </Card>

        </main>
      )}

      {/* ══════════════════════ SINGLE / MULTI TAB ══════════════════════ */}
      {tab !== "compare" && (
        <>
          {/* Config row */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 items-start">

            {/* Market params */}
            <Card title="Parametri di Mercato" padding="p-4">
              <div className="grid grid-cols-2 gap-2.5">
                <NumberField label="Spot" value={S} onChange={setS} step={0.5} />
                <NumberField label="Volatilità Impl." value={sigma * 100} onChange={(v) => setSigma(v / 100)} step={1} suffix="%" />
                <NumberField label="Giorni a Scad." value={days} onChange={setDays} step={1} min={0} />
                <NumberField label="Risk-Free Rate" value={r * 100} onChange={(v) => setR(v / 100)} step={0.25} suffix="%" />
                <div className="col-span-2">
                  <NumberField label="Contratti" value={qty} onChange={setQty} step={1} min={1} />
                </div>
              </div>
            </Card>

            {/* Strategy preset */}
            <Card title="Strategia" padding="p-4">
              <select
                className="abtg-input mb-3 text-sm"
                value={preset}
                onChange={(e) => setPreset(e.target.value as PresetId)}
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
                    const entry = map[name];
                    if (!entry) return null;
                    const [val, setter] = entry;
                    return <NumberField key={name} label={`Strike ${name}`} value={val} onChange={setter} step={0.5} />;
                  })}
                </div>
              )}
            </Card>

            {/* Legs editor */}
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

          </div>

          {/* Main analytics stack */}
          <main className="space-y-5" id="main-content">

            {/* Key metrics */}
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
              <p className="text-xs text-abtg-muted mt-3 leading-relaxed border-t border-abtg-border pt-3">
                <strong className="text-abtg-text font-semibold">Debito/Credito</strong> = quanto paghi (debito) o incassi (credito) all&apos;apertura.
                <strong className="text-abtg-text font-semibold"> POP</strong> = probabilità di profitto a scadenza (distribuzione lognormale risk-neutral).
                <strong className="text-abtg-text font-semibold"> EV</strong> = valore atteso del P&L pesato sulla probabilità di ogni scenario.
                <strong className="text-abtg-text font-semibold"> Risk/Reward</strong> = rapporto fra profitto massimo e perdita massima.
              </p>
            </Card>

            {/* Payoff chart */}
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
              <p className="text-xs text-abtg-muted mt-3 leading-relaxed border-t border-abtg-border pt-3">
                <strong className="text-abtg-text font-semibold">Come leggerlo:</strong> la linea arancione mostra il profitto/perdita della strategia al prezzo di scadenza. La linea tratteggiata è il valore attuale (mark-to-market) considerando la volatilità residua. Sopra lo zero sei in profitto, sotto sei in perdita.
              </p>
            </Card>

            {/* Greche + POP */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card title="Greche Aggregate" padding="p-4">
                <GreeksGrid g={greeks} multiplier />
                <p className="text-xs text-abtg-muted mt-3 leading-relaxed border-t border-abtg-border pt-3">
                  <strong className="text-abtg-text font-semibold">Delta</strong> = variazione attesa del P&L per ogni $1 di movimento del sottostante.
                  <strong className="text-abtg-text font-semibold"> Gamma</strong> = quanto cambia il Delta.
                  <strong className="text-abtg-text font-semibold"> Theta</strong> = perdita giornaliera dovuta al passare del tempo.
                  <strong className="text-abtg-text font-semibold"> Vega</strong> = variazione per ogni punto % di volatilità.
                  <strong className="text-abtg-text font-semibold"> Rho</strong> = sensibilità ai tassi.
                </p>
              </Card>
              <Card title="Distribuzione Prezzo e POP" padding="p-4">
                <POPDistribution legs={legs} ln={ln} minS={minS} maxS={maxS} />
                <p className="text-xs text-abtg-muted mt-3 leading-relaxed border-t border-abtg-border pt-3 text-left">
                  <strong className="text-abtg-text font-semibold">Cosa vedi:</strong> la curva blu mostra dove il mercato pensa arriverà il prezzo (distribuzione lognormale risk-neutral). Le zone verdi sono i prezzi in cui la tua strategia chiude in profitto a scadenza. Più verde cade sotto la curva, più alta è la POP.
                </p>
              </Card>
            </div>

            {/* Time Decay */}
            <Card title="Erosione Temporale (Time Decay)" padding="p-4">
              <TimeDecayChart legs={legs} ctx={ctx} />
              <p className="text-xs text-abtg-muted mt-3 leading-relaxed border-t border-abtg-border pt-3">
                <strong className="text-abtg-text font-semibold">Come leggerlo:</strong> l&apos;asse X scorre dai giorni attuali fino a scadenza (zero a destra). La linea arancione è il valore della strategia al prezzo spot; le linee tratteggiate mostrano ±5% dallo spot.
                <br />
                <strong className="text-abtg-text font-semibold">Cosa significa:</strong> per chi compra opzioni il tempo è un costo — la curva scende verso scadenza (&quot;theta decay&quot;). Per chi vende opzioni il tempo è un ricavo — la curva sale. La pendenza accelera nelle ultime settimane: è qui che il Theta diventa più aggressivo.
              </p>
            </Card>

            {/* Scenari */}
            <Card title="Analisi degli Scenari" padding="p-4">
              <ScenarioTable legs={legs} spot={S} />
              <p className="text-xs text-abtg-muted mt-3 leading-relaxed border-t border-abtg-border pt-3">
                <strong className="text-abtg-text font-semibold">A cosa serve:</strong> tabella di simulazione che mostra il P&L della strategia a combinazioni incrociate di prezzo futuro del sottostante e giorni rimanenti. Utile per capire se la strategia tiene in scenari di &quot;what-if&quot; prima di aprire la posizione.
              </p>
            </Card>

          </main>
        </>
      )}

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

/* ── MetricCompact ── */
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
