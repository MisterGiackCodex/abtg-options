import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get("symbol");
  if (!symbol) {
    return NextResponse.json({ error: "Parametro 'symbol' mancante" }, { status: 400 });
  }

  const ticker = encodeURIComponent(symbol.toUpperCase().trim());
  const expiry = req.nextUrl.searchParams.get("expiry"); // unix timestamp or ISO date

  try {
    let url = `https://query1.finance.yahoo.com/v7/finance/options/${ticker}`;
    if (expiry) {
      const ts = expiry.includes("-")
        ? Math.floor(new Date(expiry).getTime() / 1000)
        : Number(expiry);
      url += `?date=${ts}`;
    }

    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      return NextResponse.json({ error: `Yahoo Finance ha risposto con status ${res.status}` }, { status: 502 });
    }

    const data = await res.json();
    const result = data?.optionChain?.result?.[0];
    if (!result) {
      return NextResponse.json({ error: `Dati opzioni non trovati per '${symbol}'` }, { status: 404 });
    }

    const expirations = (result.expirationDates ?? []).map((ts: number) =>
      new Date(ts * 1000).toISOString().slice(0, 10),
    );

    const mapContract = (c: Record<string, unknown>) => ({
      strike: c.strike as number,
      bid: (c.bid as number) ?? 0,
      ask: (c.ask as number) ?? 0,
      mid: (((c.bid as number) ?? 0) + ((c.ask as number) ?? 0)) / 2,
      iv: (c.impliedVolatility as number) ?? 0,
      volume: (c.volume as number) ?? 0,
      oi: (c.openInterest as number) ?? 0,
      lastPrice: (c.lastPrice as number) ?? 0,
    });

    const options = result.options?.[0] ?? {};
    const calls = (options.calls ?? []).map(mapContract);
    const puts = (options.puts ?? []).map(mapContract);

    return NextResponse.json({
      symbol: result.underlyingSymbol ?? symbol,
      expirations,
      calls,
      puts,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Errore sconosciuto";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
