"use client";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, ReferenceLine, CartesianGrid, Area, ComposedChart } from "recharts";
import type { PayoffPoint } from "@/lib/pricing/strategies";

function fmtMoney(v: number): string {
  const a = Math.abs(v);
  if (a < 1000) return `$${v.toFixed(0)}`;
  if (a < 1_000_000) return `$${(v / 1000).toFixed(1)}k`;
  return `$${(v / 1_000_000).toFixed(2)}M`;
}

export function PayoffChart({
  data, breakEvens = [], strikes = [], spot, showToday = true, yDomain,
}: {
  data: PayoffPoint[];
  breakEvens?: number[];
  strikes?: number[];
  spot?: number;
  showToday?: boolean;
  yDomain?: [number, number];
}) {
  const chartData = data.map((d) => ({
    S: d.S,
    expiry: d.expiry,
    today: d.today,
    profit: d.expiry >= 0 ? d.expiry : 0,
    loss: d.expiry < 0 ? d.expiry : 0,
  }));

  return (
    <div className="h-[360px] w-full">
      <ResponsiveContainer>
        <ComposedChart data={chartData} margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
          <XAxis dataKey="S" tickFormatter={(v) => `$${Number(v).toFixed(0)}`} stroke="#64748B" fontSize={11} />
          <YAxis tickFormatter={fmtMoney} stroke="#64748B" fontSize={11} domain={yDomain ?? ["auto", "auto"]} allowDataOverflow={!!yDomain} />
          <Tooltip
            contentStyle={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 8, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
            labelStyle={{ color: "#1A202C", fontWeight: 600 }}
            labelFormatter={(v) => `Prezzo: $${Number(v).toFixed(2)}`}
            formatter={(v: number, name: string) => [`$${v.toFixed(2)}`, name === "expiry" ? "Scadenza" : name === "today" ? "Oggi" : name]}
          />
          <ReferenceLine y={0} stroke="#94A3B8" />
          {spot !== undefined && <ReferenceLine x={spot} stroke="#C9A84C" strokeDasharray="4 4" label={{ value: "Spot", fill: "#A88735", fontSize: 10, position: "top" }} />}
          {strikes.map((k, i) => (
            <ReferenceLine key={`k${i}`} x={k} stroke="#94A3B8" strokeDasharray="2 4" label={{ value: `K`, fill: "#64748B", fontSize: 10, position: "top" }} />
          ))}
          {breakEvens.map((be, i) => (
            <ReferenceLine key={`be${i}`} x={be} stroke="#16A34A" strokeDasharray="3 3" label={{ value: `B/E ${be.toFixed(2)}`, fill: "#16A34A", fontSize: 10, position: "insideTopRight" }} />
          ))}
          <Area type="monotone" dataKey="profit" stroke="none" fill="#16A34A" fillOpacity={0.15} />
          <Area type="monotone" dataKey="loss" stroke="none" fill="#DC2626" fillOpacity={0.15} />
          <Line type="monotone" dataKey="expiry" stroke="#1B2B5E" strokeWidth={2.5} dot={false} isAnimationActive={false} name="expiry" />
          {showToday && <Line type="monotone" dataKey="today" stroke="#C9A84C" strokeWidth={1.5} strokeDasharray="5 3" dot={false} isAnimationActive={false} name="today" />}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
