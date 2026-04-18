"use client";
import { useState } from "react";
import type { Leg, MarketCtx } from "@/lib/pricing/strategies";
import type { Trade, TradeLeg } from "@/lib/trades/types";
import { generateId } from "@/lib/trades/storage";

interface SaveTradeModalProps {
  legs: Leg[];
  ctx: MarketCtx;
  onSave: (trade: Omit<Trade, "id">) => void;
  onClose: () => void;
}

export function SaveTradeModal({ legs, ctx, onSave, onClose }: SaveTradeModalProps) {
  const [name, setName] = useState("");
  const [ticker, setTicker] = useState("");
  const [expirationDate, setExpirationDate] = useState("");
  const [notes, setNotes] = useState("");

  const daysToExpiry = Math.round(ctx.T * 365);
  const defaultExpiry = new Date(Date.now() + daysToExpiry * 86_400_000).toISOString().slice(0, 10);

  const handleSave = () => {
    if (!name.trim() || !ticker.trim()) return;

    const tradeLegs: TradeLeg[] = legs.map((l) => ({
      id: generateId(),
      kind: l.kind,
      side: l.side,
      strike: l.strike,
      entryPremium: l.premium,
      currentPremium: l.premium,
      quantity: l.quantity,
      status: "open",
    }));

    onSave({
      name: name.trim(),
      ticker: ticker.trim().toUpperCase(),
      entryDate: new Date().toISOString().slice(0, 10),
      expirationDate: expirationDate || defaultExpiry,
      legs: tradeLegs,
      marketCtxAtEntry: { S: ctx.S, sigma: ctx.sigma, r: ctx.r },
      notes,
      status: "open",
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-abtg-surface border border-abtg-border rounded-lg p-6 w-full max-w-md space-y-4" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-bold text-abtg-gold">Salva come Trade</h3>

        <div>
          <label className="text-xs text-abtg-muted block mb-1">Nome operazione *</label>
          <input className="abtg-input w-full" placeholder="es. AAPL Bull Call Spread" value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-abtg-muted block mb-1">Ticker *</label>
            <input className="abtg-input w-full" placeholder="es. AAPL" value={ticker} onChange={(e) => setTicker(e.target.value.toUpperCase())} />
          </div>
          <div>
            <label className="text-xs text-abtg-muted block mb-1">Scadenza</label>
            <input type="date" className="abtg-input w-full" value={expirationDate || defaultExpiry} onChange={(e) => setExpirationDate(e.target.value)} />
          </div>
        </div>

        <div>
          <label className="text-xs text-abtg-muted block mb-1">Note</label>
          <textarea className="abtg-input w-full h-20 resize-none" placeholder="Note sulla strategia..." value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>

        <div className="text-xs text-abtg-muted">
          {legs.length} leg{legs.length !== 1 ? "s" : ""} | Spot: ${ctx.S.toFixed(2)} | IV: {(ctx.sigma * 100).toFixed(1)}% | DTE: {daysToExpiry}
        </div>

        <div className="flex gap-3 justify-end">
          <button className="abtg-btn text-xs bg-abtg-border text-abtg-muted" onClick={onClose}>Annulla</button>
          <button className="abtg-btn text-xs" onClick={handleSave} disabled={!name.trim() || !ticker.trim()}>Salva Trade</button>
        </div>
      </div>
    </div>
  );
}
