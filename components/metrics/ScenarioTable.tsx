import type { Leg } from "@/lib/pricing/strategies";
import { strategyPayoff } from "@/lib/pricing/strategies";

export function ScenarioTable({ legs, spot }: { legs: Leg[]; spot: number }) {
  const steps = [-25, -15, -10, -5, 0, 5, 10, 15, 25];
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-abtg-muted text-xs uppercase tracking-wide">
            <th className="text-left py-2 px-2">Prezzo</th>
            <th className="text-left py-2 px-2">Variazione</th>
            <th className="text-right py-2 px-2">P/L totale</th>
            <th className="text-right py-2 px-2">P/L %</th>
          </tr>
        </thead>
        <tbody>
          {steps.map((pct) => {
            const S = spot * (1 + pct / 100);
            const pl = strategyPayoff(legs, S);
            const tone = pl > 0 ? "text-abtg-profit" : pl < 0 ? "text-abtg-loss" : "text-abtg-text";
            return (
              <tr key={pct} className="border-t border-abtg-border">
                <td className="py-2 px-2">${S.toFixed(2)}</td>
                <td className={`py-2 px-2 ${pct > 0 ? "text-abtg-profit" : pct < 0 ? "text-abtg-loss" : ""}`}>{pct > 0 ? "+" : ""}{pct}%</td>
                <td className={`py-2 px-2 text-right font-semibold ${tone}`}>${pl.toFixed(2)}</td>
                <td className={`py-2 px-2 text-right ${tone}`}>{((pl / (spot * 100)) * 100).toFixed(2)}%</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
