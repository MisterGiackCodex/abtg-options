import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get("symbol");
  if (!symbol) {
    return NextResponse.json({ error: "Parametro 'symbol' mancante" }, { status: 400 });
  }

  const ticker = encodeURIComponent(symbol.toUpperCase().trim());

  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=1d`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      return NextResponse.json({ error: `Yahoo Finance ha risposto con status ${res.status}` }, { status: 502 });
    }

    const data = await res.json();
    const result = data?.chart?.result?.[0];
    if (!result) {
      return NextResponse.json({ error: `Ticker '${symbol}' non trovato` }, { status: 404 });
    }

    const meta = result.meta;
    const price = meta.regularMarketPrice ?? 0;
    const prevClose = meta.chartPreviousClose ?? meta.previousClose ?? price;
    const change = price - prevClose;
    const changePercent = prevClose > 0 ? (change / prevClose) * 100 : 0;

    return NextResponse.json({
      symbol: meta.symbol,
      price,
      change: +change.toFixed(4),
      changePercent: +changePercent.toFixed(2),
      currency: meta.currency ?? "USD",
      timestamp: meta.regularMarketTime ?? Math.floor(Date.now() / 1000),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Errore sconosciuto";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
