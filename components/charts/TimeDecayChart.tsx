"use client";
import { ResponsiveContainer, ComposedChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine, Legend } from "recharts";
import { strategyValueNow, type Leg, type MarketCtx } from "@/lib/pricing/strategies";

function fmtMoney(v: number): string {
  const a = Math.abs(v);
  if (a < 1000) return `$${v.toFixed(0)}`;
  if (a < 1_000_000) return `$${(v / 1000).toFixed(1)}k`;
  return `$${(v / 1_000_000).toFixed(2)}M`;
}

interface TimeDecayPoint {
  days: number;
  atSpot: number;
  below: number;
  above: number;
}

export function TimeDecayChart({
  legs, ctx, steps = 40,
}: {
  legs: Leg[];
  ctx: MarketCtx;
  steps?: number;
}) {
  const currentDays = Math.max(1, Math.round(ctx.T * 365));
  const data: TimeDecayPoint[] = [];

  const spotDown = ctx.S * 0.95;
  const spotUp = ctx.S * 1.05;

  for (let i = 0; i <= steps; i++) {
    const days = (currentDays * (steps - i)) / steps; // from currentDays down to 0
    const T = Math.max(0.0001, days / 365);
    data.push({
      days: +days.toFixed(1),
      atSpot: strategyValueNow(legs, { ...ctx, S: ctx.S, T }),
      below: strategyValueNow(legs, { ...ctx, S: spotDown, T }),
      above: strategyValueNow(legs, { ...ctx, S: spotUp, T }),
    });
  }

  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer>
        <ComposedChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
          <XAxis
            dataKey="days"
            type="number"
            reversed
            domain={[0, currentDays]}
            tickFormatter={(v) => `${v}g`}
            stroke="#64748B"
            fontSize={11}
            label={{ value: "Giorni alla scadenza", position: "insideBottom", offset: -2, fill: "#64748B", fontSize: 10 }}
          />
          <YAxis tickFormatter={fmtMoney} stroke="#64748B" fontSize={11} />
          <Tooltip
            contentStyle={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 8, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
            labelStyle={{ color: "#1A202C", fontWeight: 600 }}
            labelFormatter={(v) => `${v} giorni alla scadenza`}
            formatter={(v: number, name: string) => {
              const label =
                name === "atSpot" ? `@ $${ctx.S.toFixed(2)} (spot)` :
                name === "below" ? `@ $${spotDown.toFixed(2)} (-5%)` :
                name === "above" ? `@ $${spotUp.toFixed(2)} (+5%)` : name;
              return [`$${v.toFixed(2)}`, label];
            }}
          />
          <ReferenceLine y={0} stroke="#94A3B8" />
          <Legend
            verticalAlign="top"
            height={24}
            iconSize={10}
            wrapperStyle={{ fontSize: 11, color: "#64748B" }}
            formatter={(v) =>
              v === "atSpot" ? `Spot $${ctx.S.toFixed(2)}` :
              v === "below" ? `-5% ($${spotDown.toFixed(2)})` :
              v === "above" ? `+5% ($${spotUp.toFixed(2)})` : v
            }
          />
          <Line type="monotone" dataKey="below" stroke="#DC2626" strokeWidth={1.5} strokeDasharray="4 3" dot={false} isAnimationActive={false} />
          <Line type="monotone" dataKey="atSpot" stroke="#EF7B10" strokeWidth={2.5} dot={false} isAnimationActive={false} />
          <Line type="monotone" dataKey="above" stroke="#16A34A" strokeWidth={1.5} strokeDasharray="4 3" dot={false} isAnimationActive={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
