# ABTG Options — Developer Guide

Guida tecnica per sviluppatori che devono clonare, capire, adattare e deployare l'applicazione su un server proprio.

> **Repo pubblica:** https://github.com/MisterGiackCodex/abtg-options
> **Demo live:** https://opzioni.mistergiack.dev
> **Stack:** Next.js 14 (App Router) · TypeScript · Tailwind · Recharts · Docker

---

## 1. Cosa fa l'applicazione

Dashboard di analisi per strategie di opzioni americane (single-leg + multi-leg), con:

- Pricing Black-Scholes (CRR binomial disponibile ma non usato di default) per premi, greche, curva payoff a scadenza e curva mark-to-market.
- Probability of Profit (POP) e Expected Value (EV) sotto distribuzione lognormale risk-neutral.
- Grafico payoff stile Barchart (area profit/loss, break-even, strike, last price pill).
- Scenario table ±5/10/15/25%, distribuzione lognormale con shading profit zone, greche aggregate con moltiplicatore 100.
- Integrazione quote/option-chain via **Yahoo Finance** (endpoint pubblico, nessuna API key).
- Trade journal client-side (localStorage) con P/L realizzato, report e confronto.

**Nessun database. Nessun auth. Nessun segreto.** Tutto server-rendered on demand o client-side.

---

## 2. Requisiti

| Componente | Versione consigliata |
|---|---|
| Node.js | 20.x (LTS) |
| npm | 10.x |
| Docker | 24+ (per build produzione) |
| nginx | qualsiasi recente (solo se reverse-proxy) |

Nessuna DB, nessun Redis, nessun servizio esterno a parte l'endpoint Yahoo Finance (HTTPS pubblico, chiamato lato server).

---

## 3. Clone + esecuzione locale

```bash
git clone https://github.com/MisterGiackCodex/abtg-options.git
cd abtg-options
npm install
npm run dev
```

App su `http://localhost:3000`.

Build produzione locale:

```bash
npm run build
npm start   # serve su :3000
```

---

## 4. Struttura progetto

```
abtg-options/
├─ app/                        # Next.js App Router
│  ├─ layout.tsx               # root layout + Tailwind globals
│  ├─ page.tsx                 # dashboard principale (~1000 righe, single file)
│  ├─ globals.css              # stile base + palette ABTG
│  ├─ learn/                   # pagina educativa statica
│  └─ api/
│     ├─ quote/route.ts        # GET /api/quote?symbol=AAPL  → prezzo live
│     └─ chain/route.ts        # GET /api/chain?symbol=AAPL&expiry=... → option chain
│
├─ components/
│  ├─ charts/
│  │  ├─ PayoffChart.tsx       # payoff a scadenza (Barchart-style)
│  │  ├─ POPDistribution.tsx   # lognormale + zona profitto
│  │  ├─ TimeDecayChart.tsx    # decadimento theta nel tempo
│  │  └─ CompareChart.tsx      # confronto fino a 3 strategie
│  ├─ strategy/LegList.tsx     # leg builder multi-leg
│  ├─ metrics/                 # MetricsPanel, ScenarioTable
│  ├─ ticker/TickerBar.tsx     # barra simbolo + quote live
│  ├─ trades/                  # trade journal (save/list/report/pnl)
│  └─ ui/                      # Card, NumberField (primitive)
│
├─ hooks/
│  ├─ useMarketFeed.ts         # polling /api/quote con debounce
│  └─ useTrades.ts             # persistence trade journal (localStorage)
│
├─ lib/
│  ├─ pricing/
│  │  ├─ blackScholes.ts       # BS + greche (call/put)
│  │  ├─ binomial.ts           # CRR binomial (preparato per opzioni americane v2)
│  │  └─ strategies.ts         # payoff/greche/metriche per single + multi-leg
│  ├─ presets/
│  │  ├─ multileg.ts           # definizione preset multi-leg + defaultK
│  │  └─ guide.ts              # testi educativi per preset
│  ├─ probability/
│  │  ├─ lognormal.ts          # PDF/CDF lognormale risk-neutral
│  │  ├─ pop.ts                # Probability of Profit
│  │  └─ expectedValue.ts      # EV via integrazione numerica
│  ├─ trades/                  # tipi + storage localStorage + calcolo PnL
│  └─ data/marketFeed.ts       # client lato-frontend per /api/quote
│
├─ deploy/
│  ├─ deploy.sh                # script deploy rsync→VPS (vecchio, lasciato per riferimento)
│  └─ nginx-opzioni            # esempio config nginx reverse proxy → :3060
│
├─ docs/
│  ├─ user-guide.md            # guida utente finale (italiano)
│  └─ marketing-kit.md         # copy marketing
│
├─ Dockerfile                  # multi-stage build (deps → build → runner)
├─ docker-compose.yml          # container singolo, port 127.0.0.1:3060:3060
├─ next.config.js              # opzionale DEMO_BUILD=true per export statico
├─ tailwind.config.ts          # palette ABTG (dark + oro)
└─ package.json
```

**File "caldi" da conoscere subito:**
- `app/page.tsx` — orchestratore dashboard, gestisce stato di single/multi/confronto.
- `lib/pricing/strategies.ts` — cuore del motore: costruzione payoff, break-even, metriche.
- `components/charts/PayoffChart.tsx` — grafico payoff (palette, label, stagger strike).
- `lib/presets/multileg.ts` — aggiungere/modificare preset multi-leg parte da qui.

---

## 5. Architettura e flusso dati

```
Browser
  │
  ├─ Input utente (spot, IV, DTE, strike, preset…) ──► React state in app/page.tsx
  │
  ├─ TickerBar ──► GET /api/quote?symbol=XYZ ──► Yahoo Finance (server-side)
  │                                                      └─ refresh on-demand
  │
  └─ Render:
       ├─ lib/pricing/strategies.ts  →  payoff[], greeks, breakEvens, metrics
       ├─ lib/probability/pop.ts     →  POP
       ├─ lib/probability/expectedValue.ts → EV
       └─ recharts components        →  PayoffChart, POPDistribution, ScenarioTable
```

- **Nessuna persistence server-side.** Trade journal = localStorage.
- **API routes** sono solo proxy verso Yahoo Finance (aggira CORS + spoof UA).
- **Nessuna autenticazione**. L'app è pubblica e read-only lato server.

---

## 6. Endpoint API

### `GET /api/quote?symbol=AAPL`
Proxy Yahoo Finance v8 chart. Ritorna prezzo live + change + %.
```json
{ "symbol": "AAPL", "price": 185.42, "change": 1.23, "changePercent": 0.67, "currency": "USD", "timestamp": 1745500000 }
```
Errori: 400 (symbol mancante), 404 (non trovato), 502 (Yahoo down).

### `GET /api/chain?symbol=AAPL&expiry=2026-05-16`
Proxy Yahoo Finance v7 options. Ritorna calls + puts + lista scadenze.
```json
{ "symbol": "AAPL", "expirations": ["2026-05-16", ...], "calls": [{"strike":185, "bid":3.2, "ask":3.4, "mid":3.3, "iv":0.28, ...}], "puts": [...] }
```

**Importante:** Yahoo può rate-limitare o bloccare in base all'IP. Se si deploya su un hosting aggressivo (AWS, GCP) considerare un cache-layer o un provider alternativo (Polygon, Tradier) modificando solo questi due file.

---

## 7. Variabili d'ambiente

**Nessuna richiesta per l'esecuzione base.**

Variabili opzionali:
- `DEMO_BUILD=true` → `next build` produce export statico (niente API routes, quote/chain disabilitati).
- `NODE_ENV=production` → settato automaticamente dal Dockerfile.

Nessuna `.env.example` perché non serve. Se in futuro si aggiungono provider dati a pagamento, creare `.env.local` (già ignorato da `.gitignore`).

---

## 8. Deploy con Docker (raccomandato)

Il `Dockerfile` è multi-stage, porta il container a **~200 MB** e espone la porta **3060**.

### Build + run singolo
```bash
docker build -t abtg-options-app .
docker run -d --name abtg-options --restart unless-stopped -p 127.0.0.1:3060:3060 abtg-options-app
```

### Con docker-compose
```bash
docker compose up -d --build
```

Il compose binda solo su `127.0.0.1`: esporre al pubblico va fatto tramite reverse proxy (vedi §9).

### Aggiornamenti
```bash
git pull
docker build -t abtg-options-app .
docker rm -f abtg-options
docker run -d --name abtg-options --restart unless-stopped -p 127.0.0.1:3060:3060 abtg-options-app
```

---

## 9. Reverse proxy nginx (esempio)

File di riferimento: `deploy/nginx-opzioni`. Replica minima:

```nginx
server {
    listen 80;
    server_name opzioni.example.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name opzioni.example.com;

    ssl_certificate     /etc/letsencrypt/live/opzioni.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/opzioni.example.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:3060;
        proxy_http_version 1.1;
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_set_header Upgrade           $http_upgrade;
        proxy_set_header Connection        "upgrade";
        proxy_read_timeout 60s;
    }
}
```

SSL via Let's Encrypt:
```bash
certbot --nginx -d opzioni.example.com
```

---

## 10. Deploy senza Docker (VPS Linux)

```bash
git clone https://github.com/MisterGiackCodex/abtg-options.git
cd abtg-options
npm ci
npm run build
# Con pm2:
pm2 start "npx next start -p 3060" --name abtg-options
pm2 save
```

---

## 11. Come estendere

**Aggiungere un preset multi-leg:**
1. Editare `lib/presets/multileg.ts`: aggiungere voce con `legs`, `defaultK`, `bias`.
2. Editare `lib/presets/guide.ts`: aggiungere testo educativo.
3. Il dropdown + la renderizzazione si aggiornano automaticamente.

**Sostituire Yahoo con altro provider dati:**
1. Modificare `app/api/quote/route.ts` e `app/api/chain/route.ts`.
2. Mantenere l'output JSON identico (il frontend non cambia).

**Abilitare pricing americano (binomial):**
- `lib/pricing/binomial.ts` è già pronto (CRR). Swappare la chiamata in `lib/pricing/strategies.ts`.

**Trade journal server-side:**
- Oggi è `localStorage`. Per multi-device, sostituire `lib/trades/storage.ts` con chiamate a un backend proprio (DB + API route protetta).

---

## 12. Build demo statica (export)

```bash
DEMO_BUILD=true npm run build
# Output in ./out — servibile da qualsiasi CDN/static host.
```
Attenzione: in modalità export le API routes **non funzionano** → niente quote live né option chain. Utile solo per screenshot/demo offline.

---

## 13. Sicurezza & note

- **Nessun segreto nel repo**. History verificata: zero `.env`, zero token.
- **API `/api/*`** sono proxy read-only senza auth. Se esposte al pubblico potrebbero essere abusate come proxy Yahoo: valutare rate-limiting nginx:
  ```nginx
  limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
  location /api/ { limit_req zone=api burst=20; proxy_pass http://127.0.0.1:3060; }
  ```
- **Yahoo Finance non è un endpoint garantito**. Può cambiare schema senza preavviso. Integrazione canonica = provider a pagamento.
- **Nessun tracking / analytics attivo**. Aggiungere uno snippet in `app/layout.tsx` se serve.

---

## 14. Troubleshooting rapido

| Sintomo | Causa probabile | Fix |
|---|---|---|
| `/api/quote` ritorna 502 | Yahoo ha rate-limitato l'IP | Cambiare IP di uscita o aggiungere un cache layer |
| Build Docker fallisce su `npm ci` | Node <20 | Usare `node:20-alpine` (default nel Dockerfile) |
| Grafico payoff vuoto | Strike non coerenti col preset | Verificare `defaultK` in `lib/presets/multileg.ts` |
| Container non raggiungibile | Nginx non punta su 127.0.0.1:3060 | Controllare `proxy_pass` e `docker ps` |
| CSS mancante in produzione | Tailwind non ha trovato i sorgenti | Verificare `content` in `tailwind.config.ts` |

---

## 15. Contatti / handover

- Owner: Giacomo Bertuso — `giacomob5496@gmail.com`
- Issue tracker: GitHub Issues del repo
- User guide (italiano, per utente finale): `docs/user-guide.md`
- Due diligence tecnica (scelte architetturali): `DUE_DILIGENCE.md`
