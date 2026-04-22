import type { Greeks } from "@/lib/pricing/blackScholes";

export function Metric({
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
    tone === "loss" ? "text-abtg-loss" :
    tone === "gold" ? "text-abtg-gold" : "text-abtg-navy";
  return (
    <div className="bg-abtg-bg rounded-xl p-4 border border-abtg-border">
      <div className="abtg-label">{label}</div>
      <div className={`text-xl font-bold ${toneClass}`}>{value}</div>
      {hint && <div className="text-xs text-abtg-muted mt-1">{hint}</div>}
    </div>
  );
}

export function GreeksGrid({ g, multiplier = false }: { g: Greeks; multiplier?: boolean }) {
  const fmt = (n: number, d = 4) => (Number.isFinite(n) ? n.toFixed(d) : "—");
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      <Metric label="Delta (Δ)" value={fmt(g.delta, multiplier ? 2 : 4)} hint="Sensibilità al prezzo" />
      <Metric label="Gamma (Γ)" value={fmt(g.gamma, multiplier ? 4 : 4)} hint="Delta del delta" />
      <Metric label="Theta (Θ)" value={fmt(g.theta, 2)} hint="Decay al giorno" />
      <Metric label="Vega (ν)" value={fmt(g.vega, 2)} hint="Per 1% IV" />
      <Metric label="Rho (ρ)" value={fmt(g.rho, 2)} hint="Per 1% tassi" />
    </div>
  );
}
