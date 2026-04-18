"use client";
import { useState } from "react";
import type { FeedStatus } from "@/hooks/useMarketFeed";
import type { TickerQuote } from "@/lib/data/marketFeed";

interface TickerBarProps {
  quote: TickerQuote | null;
  status: FeedStatus;
  error: string | null;
  onConnect: (symbol: string) => void;
  onDisconnect: () => void;
}

const statusDot: Record<FeedStatus, string> = {
  idle: "bg-abtg-muted",
  loading: "bg-yellow-400 animate-pulse",
  live: "bg-abtg-profit",
  error: "bg-abtg-loss",
};

const statusLabel: Record<FeedStatus, string> = {
  idle: "Disconnesso",
  loading: "Connessione...",
  live: "Live",
  error: "Errore",
};

export function TickerBar({ quote, status, error, onConnect, onDisconnect }: TickerBarProps) {
  const [input, setInput] = useState("");
  const connected = status === "live" || status === "loading";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sym = input.trim().toUpperCase();
    if (sym) onConnect(sym);
  };

  return (
    <div className="bg-abtg-surface border border-abtg-border rounded-lg px-4 py-3 flex items-center gap-4 flex-wrap">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Ticker (es. AAPL)"
          value={input}
          onChange={(e) => setInput(e.target.value.toUpperCase())}
          className="abtg-input w-32 text-sm"
          disabled={connected}
        />
        {connected ? (
          <button type="button" onClick={onDisconnect} className="abtg-btn text-xs bg-abtg-loss/20 text-abtg-loss hover:bg-abtg-loss/30">
            Disconnetti
          </button>
        ) : (
          <button type="submit" className="abtg-btn text-xs" disabled={!input.trim()}>
            Connetti
          </button>
        )}
      </form>

      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${statusDot[status]}`} />
        <span className="text-xs text-abtg-muted">{statusLabel[status]}</span>
      </div>

      {quote && (
        <div className="flex items-center gap-3 ml-auto">
          <span className="text-sm font-bold text-abtg-gold">{quote.symbol}</span>
          <span className="text-lg font-mono text-abtg-text">${quote.price.toFixed(2)}</span>
          <span className={`text-sm font-mono ${quote.change >= 0 ? "text-abtg-profit" : "text-abtg-loss"}`}>
            {quote.change >= 0 ? "+" : ""}
            {quote.change.toFixed(2)} ({quote.changePercent >= 0 ? "+" : ""}
            {quote.changePercent.toFixed(2)}%)
          </span>
        </div>
      )}

      {error && <span className="text-xs text-abtg-loss ml-auto">{error}</span>}

      {status === "live" && (
        <span className="text-[10px] text-abtg-muted">Dati con ~15min di ritardo</span>
      )}
    </div>
  );
}
