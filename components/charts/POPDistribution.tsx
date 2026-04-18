"use client";
import { ResponsiveContainer, ComposedChart, Line, Area, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from "recharts";
import type { Leg } from "@/lib/pricing/strategies";
import { strategyPayoff } from "@/lib/pricing/strategies";
import { lognormalPDF, type LNParams } from "@/lib/probability/lognormal";

export function POPDistribution({ legs, ln, minS, maxS }: { legs: Leg[]; ln: LNParams; minS: number; maxS: number }) {
  const steps = 160;
  const dS = (maxS - minS) / steps;
  const points: { S: number; pdf: number; profitZone: number | null; payoff: number }[] = [];
  let pdfMax = 0;
  for (let i = 0; i <= steps; i++) {
    const S = minS + i * dS;
    const pdf = lognormalPDF(S, ln);
    if (pdf > pdfMax) pdfMax = pdf;
    const pay = strategyPayoff(legs, S);
    points.push({ S, pdf, profitZone: pay >= 0 ? pdf : null, payoff: pay });
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer>
        <ComposedChart data={points} margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#232836" />
          <XAxis dataKey="S" tickFormatter={(v) => `$${Number(v).toFixed(0)}`} stroke="#8a8fa3" fontSize={11} />
          <YAxis tickFormatter={() => ""} stroke="#8a8fa3" fontSize={11} width={20} />
          <Tooltip
            contentStyle={{ background: "#141821", border: "1px solid #232836", borderRadius: 6 }}
            labelFormatter={(v) => `Prezzo: $${Number(v).toFixed(2)}`}
            formatter={(v: number, name: string) => {
              if (name === "pdf") return [(v * 100).toFixed(3), "Densita"];
              if (name === "payoff") return [`$${v.toFixed(2)}`, "P/L"];
              return [v, name];
            }}
          />
          <ReferenceLine x={ln.S} stroke="#d4af37" strokeDasharray="4 4" />
          <Area type="monotone" dataKey="profitZone" stroke="none" fill="#22c55e" fillOpacity={0.35} />
          <Area type="monotone" dataKey="pdf" stroke="#60a5fa" fill="#60a5fa" fillOpacity={0.1} strokeWidth={1.5} isAnimationActive={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
