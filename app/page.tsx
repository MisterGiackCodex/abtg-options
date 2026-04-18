"use client";
import { useCallback, useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { NumberField } from "@/components/ui/NumberField";
import { PayoffChart } from "@/components/charts/PayoffChart";
import { POPDistribution } from "@/components/charts/POPDistribution";
import { GreeksGrid, Metric } from "@/components/metrics/MetricsPanel";
import { ScenarioTable } from "@/components/metrics/ScenarioTable";
import { LegList } from "@/components/strategy/LegList";
import { TickerBar } from "@/components/ticker/TickerBar";
import { SaveTradeModal } from "@/components/trades/SaveTradeModal";
import { useMarketFeed } from "@/hooks/useMarketFeed";
import { useTrades } from "@/hooks/useTrades";
import {
  aggregateGreeks,
  breakEvenPoints,
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

export default function Page() {
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
      // defer state update
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

  const minS = Math.max(1, S * 0.5);
  const maxS = S * 1.5;
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

  // Reset custom legs when changing preset so they regenerate
  const applyPreset = (id: PresetId) => {
    setPreset(id);
    setCustomLegs([]);
  };

  return (
    <div className="space-y-6">
      {/* Ticker Bar */}
      <TickerBar
        quote={quote}
        status={feedStatus}
        error={feedError}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
      />

      <div className="flex gap-2 border-b border-abtg-border">
        <div className={`abtg-tab ${tab === "single" ? "abtg-tab-active" : ""}`} onClick={() => { setTab("single"); applyPreset("buyCall"); }}>Single-Leg</div>
        <div className={`abtg-tab ${tab === "multi" ? "abtg-tab-active" : ""}`} onClick={() => { setTab("multi"); applyPreset("bullCallSpread"); }}>Multi-Leg</div>
        <div className={`abtg-tab ${tab === "compare" ? "abtg-tab-active" : ""}`} onClick={() => setTab("compare")}>Confronto</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          <Card title="Parametri di mercato">
            <div className="grid grid-cols-2 gap-3">
              <NumberField label="Spot" value={S} onChange={setS} step={0.5} />
              <NumberField label="Volatilita impl." value={sigma * 100} onChange={(v) => setSigma(v / 100)} step={1} suffix="%" />
              <NumberField label="Giorni a scadenza" value={days} onChange={setDays} step={1} min={0} />
              <NumberField label="Risk-free rate" value={r * 100} onChange={(v) => setR(v / 100)} step={0.25} suffix="%" />
              <NumberField label="Contratti" value={qty} onChange={(v) => setQty(Math.max(1, Math.round(v)))} step={1} min={1} />
            </div>
          </Card>

          <Card title="Strategia">
            <select className="abtg-input mb-3" value={preset} onChange={(e) => applyPreset(e.target.value as PresetId)}>
              {tabPresets.map((p) => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </select>
            {activePreset && (
              <div className="text-sm text-abtg-muted mb-3">
                <span className={`inline-block px-2 py-0.5 rounded text-xs mr-2 ${activePreset.bias === "bullish" ? "bg-abtg-profit/20 text-abtg-profit" : activePreset.bias === "bearish" ? "bg-abtg-loss/20 text-abtg-loss" : "bg-abtg-gold/20 text-abtg-gold"}`}>
                  {activePreset.bias}
                </span>
                {activePreset.description}
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              {activePreset?.strikes.map((name) => {
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
          </Card>

          <Card title="Legs (personalizzabili)">
            <LegList legs={legs} onChange={setCustomLegs} />
            {customLegs.length > 0 && (
              <button className="abtg-btn mt-2 text-xs" onClick={() => setCustomLegs([])}>Ripristina preset</button>
            )}
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card title="Metriche chiave">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <Metric label="Net debit/credit" value={`${nd >= 0 ? "-" : "+"}$${Math.abs(nd).toFixed(2)}`} tone={nd >= 0 ? "loss" : "profit"} hint={nd >= 0 ? "Paghi" : "Incassi"} />
              <Metric label="Max profit" value={mp.unboundedUp ? "∞" : `$${mp.maxProfit.toFixed(2)}`} tone="profit" />
              <Metric label="Max perdita" value={mp.unboundedDown ? "-∞" : `$${mp.maxLoss.toFixed(2)}`} tone="loss" />
              <Metric label="Break-even" value={bes.length === 0 ? "—" : bes.map((b) => `$${b.toFixed(2)}`).join(" / ")} tone="gold" />
              <Metric label="POP" value={`${(pop * 100).toFixed(1)}%`} tone="gold" hint="Probabilita profitto (risk-neutral)" />
              <Metric label="Expected Value" value={`$${ev.toFixed(2)}`} tone={ev >= 0 ? "profit" : "loss"} hint="EV atteso a scadenza" />
              <Metric label="Risk/Reward" value={mp.unboundedUp || mp.unboundedDown || mp.maxLoss === 0 ? "—" : (Math.abs(mp.maxProfit / mp.maxLoss)).toFixed(2)} />
              <Metric label="Legs" value={`${legs.length}`} />
            </div>
          </Card>

          <Card title="Payoff Diagram (scadenza vs oggi)">
            <PayoffChart data={payoffData} breakEvens={bes} strikes={strikes} spot={S} />
            <div className="flex gap-4 text-xs text-abtg-muted mt-2 justify-center">
              <span><span className="inline-block w-3 h-0.5 bg-abtg-gold mr-1 align-middle" />Scadenza</span>
              <span><span className="inline-block w-3 h-0.5 bg-blue-400 mr-1 align-middle" style={{ borderStyle: "dashed" }} />Oggi (mark-to-market)</span>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card title="Greche aggregate">
              <GreeksGrid g={greeks} multiplier />
            </Card>
            <Card title="Distribuzione prezzo + zona profitto">
              <POPDistribution legs={legs} ln={ln} minS={minS} maxS={maxS} />
              <div className="text-xs text-abtg-muted mt-2 text-center">Area verde = zone dove la strategia e in profitto a scadenza.</div>
            </Card>
          </div>

          <Card title="Scenario Analysis">
            <ScenarioTable legs={legs} spot={S} />
          </Card>
        </div>
      </div>

      {/* Save as Trade */}
      <div className="flex justify-center">
        <button className="abtg-btn text-sm" onClick={() => setShowSaveModal(true)}>
          Salva come Trade
        </button>
      </div>

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
