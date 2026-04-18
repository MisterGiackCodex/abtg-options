"use client";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, ReferenceLine, CartesianGrid, Area, ComposedChart } from "recharts";
import type { PayoffPoint } from "@/lib/pricing/strategies";

export function PayoffChart({
  data, breakEvens = [], strikes = [], spot, showToday = true,
}: {
  data: PayoffPoint[];
  breakEvens?: number[];
  strikes?: number[];
  spot?: number;
  showToday?: boolean;
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
          <CartesianGrid strokeDasharray="3 3" stroke="#232836" />
          <XAxis dataKey="S" tickFormatter={(v) => `$${Number(v).toFixed(0)}`} stroke="#8a8fa3" fontSize={11} />
          <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`} stroke="#8a8fa3" fontSize={11} />
          <Tooltip
            contentStyle={{ background: "#141821", border: "1px solid #232836", borderRadius: 6 }}
            labelFormatter={(v) => `Prezzo: $${Number(v).toFixed(2)}`}
            formatter={(v: number, name: string) => [`$${v.toFixed(2)}`, name === "expiry" ? "Scadenza" : name === "today" ? "Oggi" : name]}
          />
          <ReferenceLine y={0} stroke="#8a8fa3" />
          {spot !== undefined && <ReferenceLine x={spot} stroke="#d4af37" strokeDasharray="4 4" label={{ value: "Spot", fill: "#d4af37", fontSize: 10, position: "top" }} />}
          {strikes.map((k, i) => (
            <ReferenceLine key={`k${i}`} x={k} stroke="#6b7280" strokeDasharray="2 4" label={{ value: `K`, fill: "#8a8fa3", fontSize: 10, position: "top" }} />
          ))}
          {breakEvens.map((be, i) => (
            <ReferenceLine key={`be${i}`} x={be} stroke="#22c55e" strokeDasharray="3 3" label={{ value: `B/E ${be.toFixed(2)}`, fill: "#22c55e", fontSize: 10, position: "insideTopRight" }} />
          ))}
          <Area type="monotone" dataKey="profit" stroke="none" fill="#22c55e" fillOpacity={0.18} />
          <Area type="monotone" dataKey="loss" stroke="none" fill="#ef4444" fillOpacity={0.18} />
          <Line type="monotone" dataKey="expiry" stroke="#d4af37" strokeWidth={2} dot={false} isAnimationActive={false} name="expiry" />
          {showToday && <Line type="monotone" dataKey="today" stroke="#60a5fa" strokeWidth={1.5} strokeDasharray="5 3" dot={false} isAnimationActive={false} name="today" />}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
