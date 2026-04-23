"use client";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  CartesianGrid,
  Legend,
} from "recharts";

export interface CompareSeriesPoint {
  S: number;
  expiry: number;
}

export interface CompareSeries {
  label: string;
  color: string;
  points: CompareSeriesPoint[];
}

function fmtMoney(v: number): string {
  const a = Math.abs(v);
  if (a < 1000) return `$${v.toFixed(0)}`;
  if (a < 1_000_000) return `$${(v / 1000).toFixed(1)}k`;
  return `$${(v / 1_000_000).toFixed(2)}M`;
}

/** Merge N series into a single array keyed by S, so Recharts can render multiple Lines. */
function mergeSeries(series: CompareSeries[]): Record<string, number>[] {
  if (series.length === 0) return [];

  // Build a unified S key list from the first series (all series share same S range)
  return series[0].points.map((pt, i) => {
    const row: Record<string, number> = { S: pt.S };
    for (const s of series) {
      row[s.label] = s.points[i]?.expiry ?? 0;
    }
    return row;
  });
}

export function CompareChart({
  series,
  spot,
  yDomain,
}: {
  series: CompareSeries[];
  spot?: number;
  yDomain?: [number, number];
}) {
  const chartData = mergeSeries(series);

  return (
    <div className="h-[280px] sm:h-[340px] lg:h-[420px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 16, right: 24, bottom: 8, left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
          <XAxis
            dataKey="S"
            type="number"
            domain={["dataMin", "dataMax"]}
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
            contentStyle={{
              background: "#FFFFFF",
              border: "1px solid #E2E8F0",
              borderRadius: 8,
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            }}
            labelStyle={{ color: "#1A202C", fontWeight: 600 }}
            labelFormatter={(v) => `Prezzo: $${Number(v).toFixed(2)}`}
            formatter={(v: number, name: string) => [`$${v.toFixed(2)}`, name]}
          />
          <Legend
            verticalAlign="top"
            height={28}
            iconType="line"
            wrapperStyle={{ fontSize: 12, paddingBottom: 4 }}
          />
          <ReferenceLine y={0} stroke="#94A3B8" />
          {spot !== undefined && (
            <ReferenceLine
              x={spot}
              stroke="#EF7B10"
              strokeDasharray="4 4"
              label={{ value: "Spot", fill: "#EF7B10", fontSize: 10, position: "top" }}
            />
          )}
          {series.map((s) => (
            <Line
              key={s.label}
              type="monotone"
              dataKey={s.label}
              stroke={s.color}
              strokeWidth={2.5}
              dot={false}
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
