"use client";
import type { Leg } from "@/lib/pricing/strategies";

export function LegList({ legs, onChange }: { legs: Leg[]; onChange: (legs: Leg[]) => void }) {
  const update = (idx: number, patch: Partial<Leg>) => {
    const copy = legs.slice();
    copy[idx] = { ...copy[idx], ...patch };
    onChange(copy);
  };
  const remove = (idx: number) => onChange(legs.filter((_, i) => i !== idx));

  return (
    <div className="space-y-3">
      {legs.map((l, i) => (
        <div key={l.id} className="bg-abtg-bg border border-abtg-border rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-abtg-navy uppercase tracking-wider">Leg {i + 1}</span>
            <button
              className="text-abtg-loss hover:text-red-700 text-xs px-1 transition font-medium"
              onClick={() => remove(i)}
              aria-label="rimuovi"
            >
              Rimuovi
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-abtg-muted mb-1 block font-semibold">Tipo</label>
              <select
                className="abtg-input text-sm py-1.5"
                value={l.kind}
                onChange={(e) => update(i, { kind: e.target.value as Leg["kind"] })}
              >
                <option value="call">Call</option>
                <option value="put">Put</option>
                <option value="stock">Stock</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-abtg-muted mb-1 block font-semibold">Lato</label>
              <select
                className="abtg-input text-sm py-1.5"
                value={l.side}
                onChange={(e) => update(i, { side: e.target.value as Leg["side"] })}
              >
                <option value="long">Long</option>
                <option value="short">Short</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-abtg-muted mb-1 block font-semibold">Strike</label>
              <input
                type="number"
                className="abtg-input text-sm py-1.5 font-mono"
                value={l.strike}
                step={0.5}
                onChange={(e) => update(i, { strike: parseFloat(e.target.value) || 0 })}
                disabled={l.kind === "stock"}
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-abtg-muted mb-1 block font-semibold">Premio</label>
              <input
                type="number"
                className="abtg-input text-sm py-1.5 font-mono"
                value={l.premium}
                step={0.01}
                onChange={(e) => update(i, { premium: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-abtg-muted mb-1 block font-semibold">Qty</label>
              <input
                type="number"
                className="abtg-input text-sm py-1.5 font-mono"
                value={l.quantity}
                step={1}
                min={1}
                onChange={(e) => update(i, { quantity: Math.max(1, parseInt(e.target.value) || 1) })}
              />
            </div>
          </div>
        </div>
      ))}
      <button
        className="abtg-btn w-full text-sm"
        onClick={() => onChange([...legs, { id: `leg_${Date.now()}`, kind: "call", side: "long", strike: 100, premium: 1, quantity: 1 }])}
      >
        + Aggiungi Leg
      </button>
    </div>
  );
}
