import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36";

export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get("symbol");
  if (!symbol) {
    return NextResponse.json({ error: "Parametro 'symbol' mancante" }, { status: 400 });
  }

  const ticker = encodeURIComponent(symbol.toUpperCase().trim());

  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1m&range=1d&includePrePost=true`;
    const res = await fetch(url, {
      headers: { "User-Agent": UA, "Accept": "application/json" },
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json({ error: `Yahoo Finance status ${res.status}` }, { status: 502 });
    }

    const data = await res.json();
    const result = data?.chart?.result?.[0];
    if (!result) {
      return NextResponse.json({ error: `Ticker '${symbol}' non trovato` }, { status: 404 });
    }

    const meta = result.meta;
    const closes: Array<number | null> = result.indicators?.quote?.[0]?.close ?? [];
    const timestamps: number[] = result.timestamp ?? [];

    // Prefer freshest 1-min bar close (more recent than meta in most cases)
    let price = meta.regularMarketPrice ?? 0;
    let ts = meta.regularMarketTime ?? Math.floor(Date.now() / 1000);
    for (let i = closes.length - 1; i >= 0; i--) {
      if (typeof closes[i] === "number" && !Number.isNaN(closes[i])) {
        const barTs = timestamps[i] ?? ts;
        if (barTs > ts) {
          price = closes[i] as number;
          ts = barTs;
        }
        break;
      }
    }

    const prevClose = meta.chartPreviousClose ?? meta.previousClose ?? price;
    const change = price - prevClose;
    const changePercent = prevClose > 0 ? (change / prevClose) * 100 : 0;

    return NextResponse.json(
      {
        symbol: meta.symbol,
        price,
        change: +change.toFixed(4),
        changePercent: +changePercent.toFixed(2),
        currency: meta.currency ?? "USD",
        timestamp: ts,
        marketState: meta.currentTradingPeriod ? undefined : undefined,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
          "Pragma": "no-cache",
        },
      },
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Errore sconosciuto";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
