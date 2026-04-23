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

  const xMin = points.length ? points[0].S : 0;
  const xMax = points.length ? points[points.length - 1].S : 1;

  return (
    <div className="h-[240px] sm:h-[300px] lg:h-[340px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={points} margin={{ top: 24, right: 24, bottom: 8, left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
          <XAxis
            dataKey="S"
            type="number"
            domain={[xMin, xMax]}
            tickFormatter={(v) => `$${Number(v).toFixed(0)}`}
            stroke="#64748B"
            fontSize={11}
            tickCount={7}
            allowDecimals={false}
          />
          <YAxis tickFormatter={() => ""} stroke="#64748B" fontSize={11} width={20} />
          <Tooltip
            contentStyle={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 8, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
            labelStyle={{ color: "#1A202C", fontWeight: 600 }}
            labelFormatter={(v) => `Prezzo: $${Number(v).toFixed(2)}`}
            formatter={(v: number, name: string) => {
              if (name === "pdf") return [(v * 100).toFixed(3), "Densita"];
              if (name === "payoff") return [`$${v.toFixed(2)}`, "P/L"];
              return [v, name];
            }}
          />
          <ReferenceLine
            x={ln.S}
            stroke="#EF7B10"
            strokeDasharray="4 4"
            label={{ value: `Spot $${ln.S.toFixed(0)}`, fill: "#EF7B10", fontSize: 10, position: "top" }}
          />
          <Area type="monotone" dataKey="profitZone" stroke="none" fill="#16A34A" fillOpacity={0.30} />
          <Area type="monotone" dataKey="pdf" stroke="#EF7B10" fill="#EF7B10" fillOpacity={0.08} strokeWidth={1.5} isAnimationActive={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
