"use client";
import { forwardRef } from "react";
import { PayoffChart } from "@/components/charts/PayoffChart";
import type { PayoffPoint } from "@/lib/pricing/strategies";
import type { Greeks } from "@/lib/pricing/blackScholes";

export interface ReportData {
  title: string;
  ticker?: string;
  presetLabel: string;
  bias: string;
  description: string;
  params: { S: number; sigma: number; days: number; r: number; qty: number };
  metrics: {
    netDebit: number;
    maxProfit: number;
    maxLoss: number;
    unboundedUp: boolean;
    unboundedDown: boolean;
    breakEvens: number[];
    pop: number;
    ev: number;
    riskReward: string;
    legsCount: number;
  };
  greeks: Greeks;
  payoffData: PayoffPoint[];
  strikes: number[];
  yDomain: [number, number];
  generatedAt: string;
}

export const StrategyReport = forwardRef<HTMLDivElement, { data: ReportData }>(
  function StrategyReport({ data }, ref) {
    const m = data.metrics;
    return (
      <div
        ref={ref}
        style={{
          width: 1200,
          background: "#FFFFFF",
          fontFamily: "Roboto, system-ui, sans-serif",
          color: "#1A202C",
          padding: 32,
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "3px solid #EF7B10", paddingBottom: 16, marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 12, color: "#64748B", letterSpacing: 2, textTransform: "uppercase", fontWeight: 700 }}>ABTG Option Tools · Report Strategia</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: "#EF7B10", marginTop: 4, lineHeight: 1.1 }}>{data.title}</div>
            {data.ticker && <div style={{ fontSize: 14, color: "#64748B", marginTop: 4, fontFamily: "monospace", fontWeight: 600 }}>{data.ticker}</div>}
          </div>
          <div style={{ textAlign: "right", fontSize: 11, color: "#64748B" }}>
            <div style={{ fontWeight: 600, fontSize: 13, color: "#1A202C" }}>{data.presetLabel}</div>
            <div style={{ marginTop: 4, padding: "2px 10px", display: "inline-block", borderRadius: 999, background: "#EF7B1015", color: "#EF7B10", fontWeight: 700, fontSize: 11, textTransform: "uppercase" }}>{data.bias}</div>
            <div style={{ marginTop: 8, color: "#94A3B8" }}>{data.generatedAt}</div>
          </div>
        </div>

        {/* Description */}
        <div style={{ background: "#F5F7FA", padding: 12, borderRadius: 8, fontSize: 12, lineHeight: 1.6, color: "#1A202C", marginBottom: 20, borderLeft: "4px solid #EF7B10" }}>
          {data.description}
        </div>

        {/* Params row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10, marginBottom: 20 }}>
          <ReportTile label="Spot" value={`$${data.params.S.toFixed(2)}`} />
          <ReportTile label="IV" value={`${(data.params.sigma * 100).toFixed(1)}%`} />
          <ReportTile label="DTE" value={`${data.params.days} giorni`} />
          <ReportTile label="Risk-Free" value={`${(data.params.r * 100).toFixed(2)}%`} />
          <ReportTile label="Contratti" value={`${data.params.qty}`} />
        </div>

        {/* Metriche chiave */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 20 }}>
          <ReportTile
            label="Debito / Credito"
            value={`${m.netDebit >= 0 ? "-" : "+"}$${Math.abs(m.netDebit).toFixed(2)}`}
            tone={m.netDebit >= 0 ? "loss" : "profit"}
          />
          <ReportTile
            label="Profitto Max"
            value={m.unboundedUp ? "∞" : `$${m.maxProfit.toFixed(2)}`}
            tone="profit"
          />
          <ReportTile
            label="Perdita Max"
            value={m.unboundedDown ? "-∞" : `-$${Math.abs(m.maxLoss).toFixed(2)}`}
            tone="loss"
          />
          <ReportTile
            label="Break-Even"
            value={m.breakEvens.length === 0 ? "—" : m.breakEvens.map((b) => `$${b.toFixed(2)}`).join(" / ")}
            tone="gold"
          />
          <ReportTile label="POP" value={`${(m.pop * 100).toFixed(1)}%`} tone="gold" />
          <ReportTile label="Valore Atteso" value={`${m.ev >= 0 ? "+" : ""}$${m.ev.toFixed(2)}`} tone={m.ev >= 0 ? "profit" : "loss"} />
          <ReportTile label="Risk / Reward" value={m.riskReward} />
          <ReportTile label="Legs" value={`${m.legsCount}`} />
        </div>

        {/* Payoff chart */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: "#EF7B10", fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, marginBottom: 8 }}>Diagramma Payoff</div>
          <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 8, padding: 8 }}>
            <PayoffChart
              data={data.payoffData}
              breakEvens={m.breakEvens}
              strikes={data.strikes}
              spot={data.params.S}
              yDomain={data.yDomain}
              showToday={true}
            />
          </div>
        </div>

        {/* Greche */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: "#EF7B10", fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, marginBottom: 8 }}>Greche Aggregate</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10 }}>
            <ReportTile label="Delta" value={data.greeks.delta.toFixed(2)} />
            <ReportTile label="Gamma" value={data.greeks.gamma.toFixed(4)} />
            <ReportTile label="Theta" value={`${data.greeks.theta.toFixed(2)}/d`} />
            <ReportTile label="Vega" value={data.greeks.vega.toFixed(2)} />
            <ReportTile label="Rho" value={data.greeks.rho.toFixed(2)} />
          </div>
        </div>

        {/* Footer */}
        <div style={{ borderTop: "1px solid #E2E8F0", paddingTop: 12, fontSize: 10, color: "#94A3B8", lineHeight: 1.5 }}>
          <strong style={{ color: "#1A202C" }}>Disclaimer:</strong> Report generato a scopo didattico. Calcoli basati su modello Black-Scholes e distribuzione lognormale risk-neutral. Non costituisce consulenza finanziaria.
          · © ABTG Option Tools
        </div>
      </div>
    );
  }
);

function ReportTile({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "profit" | "loss" | "gold" }) {
  const color =
    tone === "profit" ? "#16A34A" :
    tone === "loss" ? "#DC2626" :
    tone === "gold" ? "#EF7B10" : "#1A202C";
  return (
    <div style={{ background: "#F5F7FA", border: "1px solid #E2E8F0", borderRadius: 8, padding: 10 }}>
      <div style={{ fontSize: 9, color: "#64748B", textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 700 }}>{label}</div>
      <div style={{ fontSize: 15, fontWeight: 700, color, marginTop: 4, fontVariantNumeric: "tabular-nums" }}>{value}</div>
    </div>
  );
}
