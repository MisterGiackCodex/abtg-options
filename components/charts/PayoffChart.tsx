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

// Split payoff line at each zero-crossing so profit/loss segments render
// independently in their own color without bleeding through zero.
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

// Palette — tuned for high contrast against a white plot and for color-vision
// distinguishability (profit/loss never collide with spot/BE/strike marker hues).
const COLORS = {
  profit: "#15803D",       // darker forest green, readable on white
  loss: "#B91C1C",         // deep red, good AAA contrast
  fillProfit: "#22C55E",   // slightly lighter green for area (18% opacity)
  fillLoss: "#EF4444",
  spot: "#1D4ED8",         // blue — contrasts with the profit green, so the
                           // "Last Price" indicator is never confused with a BE line
  be: "#EA580C",           // orange — distinct from green BE used in Barchart
                           // *and* from profit green in our palette
  strike: "#475569",       // slate gray dashed — neutral, doesn't compete
  zero: "#0F172A",          // near-black zero axis for emphasis
  grid: "#E2E8F0",
  axis: "#64748B",
};

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
  const xRange = xMax - xMin || 1;

  // Stagger strike label positions vertically when clustered (< 6% of X range).
  const sortedStrikes = [...strikes].sort((a, b) => a - b);
  const strikeLabelPos: Array<"insideBottom" | "bottom"> = sortedStrikes.map((k, i) => {
    const prev = sortedStrikes[i - 1];
    const tooClose = prev !== undefined && (k - prev) / xRange < 0.06;
    return tooClose && strikeLabelPos[i - 1] === "bottom" ? "insideBottom" : "bottom";
  });

  return (
    <div className="h-[320px] sm:h-[380px] lg:h-[440px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 36, right: 28, bottom: 32, left: 12 }}>
          <CartesianGrid strokeDasharray="0" stroke={COLORS.grid} vertical={false} />
          <XAxis
            dataKey="S"
            type="number"
            domain={[xMin, xMax]}
            tickFormatter={(v) => `$${Number(v).toFixed(0)}`}
            stroke={COLORS.axis}
            fontSize={12}
            tickCount={7}
            allowDecimals={false}
            tick={{ fill: COLORS.axis, fontWeight: 500 }}
          />
          <YAxis
            tickFormatter={fmtMoney}
            stroke={COLORS.axis}
            fontSize={12}
            domain={yDomain ?? ["auto", "auto"]}
            allowDataOverflow={false}
            width={64}
            tickCount={6}
            tick={{ fill: COLORS.axis, fontWeight: 500 }}
          />
          <Tooltip
            contentStyle={{
              background: "#FFFFFF",
              border: "1px solid #CBD5E1",
              borderRadius: 10,
              boxShadow: "0 8px 24px rgba(15,23,42,0.12)",
              fontSize: 13,
              padding: "8px 12px",
            }}
            labelStyle={{ color: "#0F172A", fontWeight: 700, marginBottom: 4 }}
            labelFormatter={(v) => `Prezzo: $${Number(v).toFixed(2)}`}
            formatter={(v: unknown, name: string) => {
              if (v === null || v === undefined) return ["—", ""];
              const label = name === "pos" ? "Profitto" : name === "neg" ? "Perdita" : name === "today" ? "Oggi" : name;
              return [`$${Number(v).toFixed(2)}`, label];
            }}
          />

          {/* Zero axis (emphasized) */}
          <ReferenceLine y={0} stroke={COLORS.zero} strokeWidth={1.5} />

          {/* Fills (background layer) */}
          <Area type="linear" dataKey="pos" stroke="none" fill={COLORS.fillProfit} fillOpacity={0.16} isAnimationActive={false} connectNulls={false} />
          <Area type="linear" dataKey="neg" stroke="none" fill={COLORS.fillLoss} fillOpacity={0.16} isAnimationActive={false} connectNulls={false} />

          {/* Strikes — dashed slate, labels at bottom */}
          {sortedStrikes.map((k, i) => (
            <ReferenceLine
              key={`k${i}`}
              x={k}
              stroke={COLORS.strike}
              strokeDasharray="5 4"
              strokeWidth={1.2}
              ifOverflow="hidden"
              label={{
                value: sortedStrikes.length > 1 ? `K${i + 1} $${k.toFixed(0)}` : `K $${k.toFixed(0)}`,
                fill: COLORS.strike,
                fontSize: 11,
                fontWeight: 600,
                position: strikeLabelPos[i],
              }}
            />
          ))}

          {/* Break-evens — dashed orange (high-visibility) with label above axis */}
          {breakEvens.map((be, i) => (
            <ReferenceLine
              key={`be${i}`}
              x={be}
              stroke={COLORS.be}
              strokeDasharray="6 3"
              strokeWidth={1.6}
              ifOverflow="hidden"
              label={{
                value: `B/E $${be.toFixed(2)}`,
                fill: COLORS.be,
                fontSize: 11,
                fontWeight: 700,
                position: i % 2 === 0 ? "insideTopRight" : "insideTopLeft",
              }}
            />
          ))}

          {/* Payoff lines (foreground) */}
          <Line type="linear" dataKey="pos" stroke={COLORS.profit} strokeWidth={2.8} dot={false} isAnimationActive={false} connectNulls={false} name="pos" />
          <Line type="linear" dataKey="neg" stroke={COLORS.loss} strokeWidth={2.8} dot={false} isAnimationActive={false} connectNulls={false} name="neg" />

          {showToday && <Line type="monotone" dataKey="today" stroke="#475569" strokeWidth={1.5} strokeDasharray="5 3" dot={false} isAnimationActive={false} name="today" />}

          {/* Spot — solid blue, pill label. Drawn LAST so it sits on top of everything. */}
          {spot !== undefined && (
            <ReferenceLine
              x={spot}
              stroke={COLORS.spot}
              strokeWidth={2.5}
              label={(props: { viewBox?: { x: number; y: number } }) => {
                const viewBox = props?.viewBox;
                if (!viewBox) return <g />;
                const text = `Last Price: $${spot.toFixed(2)}`;
                const padX = 8;
                const approxW = text.length * 6.6 + padX * 2;
                const h = 20;
                const x = viewBox.x - approxW / 2;
                const y = viewBox.y - h - 4;
                return (
                  <g>
                    <rect x={x} y={y} width={approxW} height={h} rx={10} ry={10} fill={COLORS.spot} />
                    <text
                      x={viewBox.x}
                      y={y + h / 2 + 4}
                      textAnchor="middle"
                      fontSize={11}
                      fontWeight={700}
                      fill="#FFFFFF"
                    >
                      {text}
                    </text>
                  </g>
                );
              }}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

export const PayoffChart = memo(PayoffChartImpl);
