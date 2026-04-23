"use client";
import { ResponsiveContainer, XAxis, YAxis, Tooltip, ReferenceLine, CartesianGrid, Area, ComposedChart, Line } from "recharts";
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

  const xMin = chartData.length ? chartData[0].S : 0;
  const xMax = chartData.length ? chartData[chartData.length - 1].S : 1;

  return (
    <div className="h-[280px] sm:h-[340px] lg:h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 28, right: 24, bottom: 8, left: 8 }}>
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
          <YAxis
            tickFormatter={fmtMoney}
            stroke="#64748B"
            fontSize={11}
            domain={yDomain ?? ["auto", "auto"]}
            allowDataOverflow={!!yDomain}
            width={60}
            tickCount={6}
          />
          <Tooltip
            contentStyle={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 8, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
            labelStyle={{ color: "#1A202C", fontWeight: 600 }}
            labelFormatter={(v) => `Prezzo: $${Number(v).toFixed(2)}`}
            formatter={(v: number, name: string) => [`$${v.toFixed(2)}`, name === "expiry" ? "Scadenza" : name === "today" ? "Oggi" : name]}
          />
          <ReferenceLine y={0} stroke="#94A3B8" />
          {(() => {
            // Sort strikes asc, stagger labels vertically when they are close together
            const xRange = xMax - xMin || 1;
            const sortedStrikes = [...strikes].sort((a, b) => a - b);
            const positions: ("top" | "insideTop" | "insideBottomLeft")[] = [];
            sortedStrikes.forEach((k, i) => {
              const prev = sortedStrikes[i - 1];
              const tooClose = prev !== undefined && (k - prev) / xRange < 0.08;
              // Cycle top → insideTop → insideBottomLeft only when clustered
              positions[i] = tooClose
                ? (positions[i - 1] === "top" ? "insideTop" : positions[i - 1] === "insideTop" ? "insideBottomLeft" : "top")
                : "top";
            });
            const spotOnStrike = spot !== undefined && sortedStrikes.some((k) => Math.abs(k - spot) < xRange * 0.015);
            return (
              <>
                {spot !== undefined && (
                  <ReferenceLine
                    x={spot}
                    stroke="#EF7B10"
                    strokeDasharray="4 4"
                    label={spotOnStrike ? undefined : { value: `Spot $${spot.toFixed(0)}`, fill: "#EF7B10", fontSize: 10, position: "top" }}
                  />
                )}
                {sortedStrikes.map((k, i) => {
                  const mergedWithSpot = spot !== undefined && Math.abs(k - spot) < xRange * 0.015;
                  const labelName = strikes.length > 1 ? `K${i + 1}` : "K";
                  return (
                    <ReferenceLine
                      key={`k${i}`}
                      x={k}
                      stroke="#94A3B8"
                      strokeDasharray="2 4"
                      label={{
                        value: mergedWithSpot ? `Spot/${labelName} $${k.toFixed(0)}` : `${labelName} $${k.toFixed(0)}`,
                        fill: mergedWithSpot ? "#EF7B10" : "#64748B",
                        fontSize: 9,
                        position: positions[i],
                      }}
                    />
                  );
                })}
              </>
            );
          })()}
          {breakEvens.map((be, i) => (
            <ReferenceLine
              key={`be${i}`}
              x={be}
              stroke="#16A34A"
              strokeDasharray="3 3"
              label={{
                value: `B/E $${be.toFixed(2)}`,
                fill: "#16A34A",
                fontSize: 9,
                position: i % 2 === 0 ? "insideBottomRight" : "insideBottomLeft",
              }}
            />
          ))}
          <Area type="monotone" dataKey="profit" stroke="none" fill="#16A34A" fillOpacity={0.15} />
          <Area type="monotone" dataKey="loss" stroke="none" fill="#DC2626" fillOpacity={0.15} />
          <Line type="monotone" dataKey="expiry" stroke="#EF7B10" strokeWidth={2.5} dot={false} isAnimationActive={false} name="expiry" />
          {showToday && <Line type="monotone" dataKey="today" stroke="#64748B" strokeWidth={1.5} strokeDasharray="5 3" dot={false} isAnimationActive={false} name="today" />}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
