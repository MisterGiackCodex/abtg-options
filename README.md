# ABTG Options Visualizer

Fork migliorato della dashboard ABTG sulle opzioni americane, con supporto a **strategie multi-leg**, **Probability of Profit** ed **Expected Value**.

## Setup locale

```bash
cd abtg-options
npm install
npm run dev
```

Apri [http://localhost:3000](http://localhost:3000).

## Feature

- **Single-Leg**: Buy/Sell Call, Buy/Sell Put, Covered Call (replica dell'originale)
- **Multi-Leg**: Vertical spreads (Bull/Bear Call/Put), Straddle/Strangle (long/short), Iron Condor, Butterfly
- **Leg builder custom**: aggiungi/rimuovi/modifica qualsiasi leg
- **Payoff chart**: curva a scadenza + curva mark-to-market oggi, con break-even e strike marcati
- **POP & EV**: probabilita di profitto e valore atteso sotto distribuzione lognormale risk-neutral
- **Greche aggregate**: delta/gamma/theta/vega/rho sommati su tutti i legs con moltiplicatore 100
- **Scenario table**: P/L a ±5/10/15/25% dallo spot
- **Distribuzione + zona profitto**: PDF lognormale sovrapposta con shading verde sulle zone profit

## Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS con palette ABTG (dark + oro)
- Recharts per i grafici
- Black-Scholes implementato in TS (`lib/pricing/blackScholes.ts`)
- CRR binomial tree disponibile in `lib/pricing/binomial.ts` (preparato per v2 con pricing americano)

## Deploy (TODO)

Il deploy su VPS Contabo arrivera dopo la validazione locale. Pattern previsto: `/var/www/abtg-options` + Dockerfile + nginx reverse proxy, coerente con gli altri siti.
