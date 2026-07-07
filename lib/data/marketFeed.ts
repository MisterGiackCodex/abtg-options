export interface TickerQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  currency: string;
  timestamp: number;
}

export async function fetchQuote(symbol: string): Promise<TickerQuote> {
  const res = await fetch(`/api/quote?symbol=${encodeURIComponent(symbol)}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Errore ${res.status}`);
  }
  return res.json();
}

export function startPolling(
  symbol: string,
  intervalMs: number,
  onUpdate: (q: TickerQuote) => void,
  onError?: (err: Error) => void,
): () => void {
  let active = true;

  const poll = async () => {
    if (!active) return;
    try {
      const q = await fetchQuote(symbol);
      if (active) onUpdate(q);
    } catch (err) {
      if (active && onError) onError(err instanceof Error ? err : new Error(String(err)));
    }
  };

  poll();
  const id = setInterval(poll, intervalMs);

  return () => {
    active = false;
    clearInterval(id);
  };
}
