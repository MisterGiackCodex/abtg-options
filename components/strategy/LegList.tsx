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
    <div className="space-y-2">
      <div className="grid grid-cols-12 gap-2 text-xs uppercase tracking-wide text-abtg-muted px-1">
        <div className="col-span-2">Tipo</div>
        <div className="col-span-2">Lato</div>
        <div className="col-span-2">Strike</div>
        <div className="col-span-3">Premio</div>
        <div className="col-span-2">Qty</div>
        <div className="col-span-1"></div>
      </div>
      {legs.map((l, i) => (
        <div key={l.id} className="grid grid-cols-12 gap-2 items-center bg-abtg-bg border border-abtg-border rounded p-2">
          <select className="abtg-input col-span-2" value={l.kind} onChange={(e) => update(i, { kind: e.target.value as Leg["kind"] })}>
            <option value="call">Call</option>
            <option value="put">Put</option>
            <option value="stock">Stock</option>
          </select>
          <select className="abtg-input col-span-2" value={l.side} onChange={(e) => update(i, { side: e.target.value as Leg["side"] })}>
            <option value="long">Long</option>
            <option value="short">Short</option>
          </select>
          <input type="number" className="abtg-input col-span-2" value={l.strike} step={0.5} onChange={(e) => update(i, { strike: parseFloat(e.target.value) || 0 })} disabled={l.kind === "stock"} />
          <input type="number" className="abtg-input col-span-3" value={l.premium} step={0.01} onChange={(e) => update(i, { premium: parseFloat(e.target.value) || 0 })} />
          <input type="number" className="abtg-input col-span-2" value={l.quantity} step={1} min={1} onChange={(e) => update(i, { quantity: Math.max(1, parseInt(e.target.value) || 1) })} />
          <button className="col-span-1 text-abtg-loss hover:text-red-400 text-sm" onClick={() => remove(i)} aria-label="rimuovi">✕</button>
        </div>
      ))}
      <button
        className="abtg-btn w-full"
        onClick={() => onChange([...legs, { id: `leg_${Date.now()}`, kind: "call", side: "long", strike: 100, premium: 1, quantity: 1 }])}
      >+ Aggiungi leg</button>
    </div>
  );
}
