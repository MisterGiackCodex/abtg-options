"use client";
import { memo } from "react";
import { ResponsiveContainer, XAxis, YAxis, Tooltip, ReferenceLine, CartesianGrid, Area, ComposedChart, Line } from "recharts";
import type { PayoffPoint } from "@/lib/pricing/strategies";

function fmtMoney(v: number): string {
  const a = Math.abs(v);
  if (a < 1000) return `$${v.toFixed(0)}`;
  if (a < 1_000_000) return `$${(v / 1000).toFixed(1)}k`;
  return `$${(v / 1_000_000).toFixed(2)}M`;
}

// Split payoff line into positive/negative segments so each can render in its own color.
// Inserts zero crossings so segments meet at Y=0 without gaps.
function splitByZero(data: PayoffPoint[]): Array<{ S: number; pos: number | null; neg: number | null; today: number }> {
  const out: Array<{ S: number; pos: number | null; neg: number | null; today: number }> = [];
  for (let i = 0; i < data.length; i++) {
    const d = data[i];
    const prev = i > 0 ? data[i - 1] : null;
    if (prev && ((prev.expiry > 0 && d.expiry < 0) || (prev.expiry < 0 && d.expiry > 0))) {
      const t = prev.expiry / (prev.expiry - d.expiry);
      const S0 = prev.S + t * (d.S - prev.S);
      out.push({ S: S0, pos: 0, neg: 0, today: prev.today });
    }
    out.push({
      S: d.S,
      pos: d.expiry >= 0 ? d.expiry : null,
      neg: d.expiry <= 0 ? d.expiry : null,
      today: d.today,
    });
  }
  return out;
}

function PayoffChartImpl({
  data, breakEvens = [], strikes = [], spot, showToday = false, yDomain,
}: {
  data: PayoffPoint[];
  breakEvens?: number[];
  strikes?: number[];
  spot?: number;
  showToday?: boolean;
  yDomain?: [number, number];
}) {
  const chartData = splitByZero(data);
  const xMin = chartData.length ? chartData[0].S : 0;
  const xMax = chartData.length ? chartData[chartData.length - 1].S : 1;

  return (
    <div className="h-[280px] sm:h-[340px] lg:h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 28, right: 24, bottom: 8, left: 8 }}>
          <CartesianGrid strokeDasharray="0" stroke="#F1F5F9" vertical={false} />
          <XAxis
            dataKey="S"
            type="number"
            domain={[xMin, xMax]}
            tickFormatter={(v) => Number(v).toFixed(0)}
            stroke="#64748B"
            fontSize={11}
            tickCount={7}
            allowDecimals={false}
          />
          <YAxis
            tickFormatter={fmtMoney}
            stroke="#64748B"
            fontSize={11}
            domain={yDomain ?? ["auto", "auto"]}
            allowDataOverflow={false}
            width={60}
            tickCount={6}
          />
          <Tooltip
            contentStyle={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 8, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
            labelStyle={{ color: "#1A202C", fontWeight: 600 }}
            labelFormatter={(v) => `Prezzo: $${Number(v).toFixed(2)}`}
            formatter={(v: unknown, name: string) => {
              if (v === null || v === undefined) return ["—", ""];
              const label = name === "pos" ? "Profitto" : name === "neg" ? "Perdita" : name === "today" ? "Oggi" : name;
              return [`$${Number(v).toFixed(2)}`, label];
            }}
          />
          <ReferenceLine y={0} stroke="#64748B" strokeWidth={1} />
          {strikes.map((k, i) => (
            <ReferenceLine key={`k${i}`} x={k} stroke="#1F2937" strokeDasharray="4 4" strokeWidth={1} ifOverflow="hidden" />
          ))}
          {breakEvens.map((be, i) => (
            <ReferenceLine key={`be${i}`} x={be} stroke="#16A34A" strokeDasharray="4 4" strokeWidth={1} ifOverflow="hidden" />
          ))}
          {spot !== undefined && (
            <ReferenceLine
              x={spot}
              stroke="#16A34A"
              strokeWidth={2}
              label={{ value: `Last Price: ${spot.toFixed(2)}`, fill: "#16A34A", fontSize: 11, fontWeight: 600, position: "top" }}
            />
          )}
          <Area type="linear" dataKey="pos" stroke="none" fill="#16A34A" fillOpacity={0.22} isAnimationActive={false} connectNulls={false} />
          <Area type="linear" dataKey="neg" stroke="none" fill="#DC2626" fillOpacity={0.22} isAnimationActive={false} connectNulls={false} />
          <Line type="linear" dataKey="pos" stroke="#16A34A" strokeWidth={2} dot={false} isAnimationActive={false} connectNulls={false} name="pos" />
          <Line type="linear" dataKey="neg" stroke="#DC2626" strokeWidth={2} dot={false} isAnimationActive={false} connectNulls={false} name="neg" />
          {showToday && <Line type="monotone" dataKey="today" stroke="#64748B" strokeWidth={1.5} strokeDasharray="5 3" dot={false} isAnimationActive={false} name="today" />}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

export const PayoffChart = memo(PayoffChartImpl);
