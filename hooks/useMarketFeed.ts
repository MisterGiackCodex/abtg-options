"use client";
import { useEffect, useRef, useState } from "react";
import { type TickerQuote, startPolling } from "@/lib/data/marketFeed";

export type FeedStatus = "idle" | "loading" | "live" | "error";

export function useMarketFeed(symbol: string | null, intervalMs = 15_000) {
  const [quote, setQuote] = useState<TickerQuote | null>(null);
  const [status, setStatus] = useState<FeedStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!symbol) {
      setStatus("idle");
      setQuote(null);
      setError(null);
      return;
    }

    setStatus("loading");
    setError(null);

    const cleanup = startPolling(
      symbol,
      intervalMs,
      (q) => {
        setQuote(q);
        setStatus("live");
        setError(null);
      },
      (err) => {
        setStatus("error");
        setError(err.message);
      },
    );

    cleanupRef.current = cleanup;

    return () => {
      cleanup();
      cleanupRef.current = null;
    };
  }, [symbol, intervalMs]);

  return { quote, status, error };
}
