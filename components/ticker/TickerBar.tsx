"use client";
import { useEffect, useRef, useState } from "react";
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

function QuoteAge({ ts }: { ts: number }) {
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));
  useEffect(() => {
    const id = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(id);
  }, []);
  const age = Math.max(0, now - ts);
  const label = age < 60 ? `${age}s fa` : age < 3600 ? `${Math.floor(age / 60)}m fa` : `${Math.floor(age / 3600)}h fa`;
  const color = age < 60 ? "text-abtg-profit" : age < 900 ? "text-yellow-500" : "text-abtg-loss";
  return <span className={`text-[10px] font-mono ${color}`} title="Età ultimo dato">● {label}</span>;
}

const POPULAR = ["SPY", "QQQ", "AAPL", "NVDA", "TSLA", "MSFT"];
const RECENT_KEY = "abtg.recentTickers";
const MAX_RECENT = 6;

function loadRecent(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveRecent(list: string[]) {
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(list));
  } catch {}
}

export function TickerBar({ quote, status, error, onConnect, onDisconnect }: TickerBarProps) {
  const [input, setInput] = useState("");
  const [recent, setRecent] = useState<string[]>([]);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const connected = status === "live" || status === "loading";

  useEffect(() => { setRecent(loadRecent()); }, []);

  const switchTo = (sym: string) => {
    const s = sym.trim().toUpperCase();
    if (!s) return;
    onConnect(s);
    setInput("");
    inputRef.current?.blur();
    setRecent((prev) => {
      const next = [s, ...prev.filter((x) => x !== s)].slice(0, MAX_RECENT);
      saveRecent(next);
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    switchTo(input);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setInput("");
      inputRef.current?.blur();
    }
  };

  const suggestions = input
    ? [...recent, ...POPULAR.filter((p) => !recent.includes(p))]
        .filter((s) => s.startsWith(input.toUpperCase()) && s !== input.toUpperCase())
        .slice(0, 6)
    : [];

  return (
    <div className="bg-white border border-abtg-border rounded-xl px-5 py-3 flex items-center gap-4 flex-wrap shadow-card">
      <form onSubmit={handleSubmit} className="flex items-center gap-2 relative">
        <input
          ref={inputRef}
          type="text"
          placeholder="Cerca ticker (Enter)"
          value={input}
          onChange={(e) => setInput(e.target.value.toUpperCase())}
          onKeyDown={handleKey}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          className="abtg-input w-40 text-sm"
          autoComplete="off"
          spellCheck={false}
        />
        {focused && suggestions.length > 0 && (
          <div className="absolute top-full left-0 mt-1 bg-white border border-abtg-border rounded-lg shadow-card-hover z-20 w-40">
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onMouseDown={(e) => { e.preventDefault(); switchTo(s); }}
                className="w-full text-left px-3 py-2 text-xs hover:bg-abtg-bg font-mono text-abtg-text transition"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </form>

      <div className="flex items-center gap-1 flex-wrap">
        {(recent.length > 0 ? recent : POPULAR).slice(0, MAX_RECENT).map((s) => {
          const active = quote?.symbol === s;
          return (
            <button
              key={s}
              type="button"
              onClick={() => switchTo(s)}
              className={`text-xs font-mono px-2.5 py-1 rounded-md border transition-colors ${
                active
                  ? "bg-abtg-navy/10 text-abtg-navy border-abtg-navy/40 font-semibold"
                  : "bg-abtg-bg text-abtg-muted border-abtg-border hover:border-abtg-navy/40 hover:text-abtg-navy"
              }`}
            >
              {s}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${statusDot[status]}`} />
        <span className="text-xs text-abtg-muted font-medium">{statusLabel[status]}</span>
      </div>

      {quote && (
        <div className="flex items-center gap-3 ml-auto">
          <span className="text-sm font-bold text-abtg-navy">{quote.symbol}</span>
          <span className="text-lg font-mono text-abtg-text font-semibold">${quote.price.toFixed(2)}</span>
          <span className={`text-sm font-mono font-medium ${quote.change >= 0 ? "text-abtg-profit" : "text-abtg-loss"}`}>
            {quote.change >= 0 ? "+" : ""}
            {quote.change.toFixed(2)} ({quote.changePercent >= 0 ? "+" : ""}
            {quote.changePercent.toFixed(2)}%)
          </span>
          {connected && (
            <button
              type="button"
              onClick={onDisconnect}
              className="text-abtg-muted hover:text-abtg-loss text-sm px-1 transition"
              title="Disconnetti"
              aria-label="Disconnetti"
            >
              ✕
            </button>
          )}
        </div>
      )}

      {error && !quote && <span className="text-xs text-abtg-loss ml-auto font-medium">{error}</span>}

      {status === "live" && quote && <QuoteAge ts={quote.timestamp} />}
    </div>
  );
}
