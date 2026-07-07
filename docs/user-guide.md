# ABTG Option Tools — Guida all'Uso

**Strumento:** https://opzioni.mistergiack.dev
**Target:** trader italiani su opzioni americane — da principianti a trader operativi
**Scopo:** vedere esattamente cosa succede a una strategia in opzioni prima di aprirla.

---

## 1. Panoramica in 30 secondi

Tre tab principali:

- **Singola** — strategie con una sola gamba (Buy/Sell Call, Buy/Sell Put, Covered Call).
- **Multi-Leg** — strategie a più gambe (spread, straddle, strangle, iron condor, butterfly).
- **Confronto** — confronta fino a 3 strategie sullo stesso grafico per scegliere la migliore.

Ogni tab mantiene i **suoi parametri indipendenti**. Spostarti tra tab non cancella il lavoro fatto nell'altra.

---

## 2. Setup iniziale — 3 campi, 1 scelta

### A) Connetti il ticker (facoltativo ma consigliato)
In alto nella barra: digita il simbolo (es. `NVDA`) + Enter. Lo spot si aggiorna in automatico. Click sui chip per switch rapido tra ticker salvati.

### B) Parametri di Mercato
Nella card "Parametri di Mercato":
- **Spot** — prezzo sottostante (auto dal ticker se connesso)
- **Volatilità Implicita** — la leggi dal book del broker. Default 30%
- **Giorni a Scadenza (DTE)** — quanti giorni mancano
- **Risk-Free Rate** — tasso risk-free (4.5% indicativo)
- **Contratti** — numero di contratti (1 contratto = 100 azioni)

### C) Scegli la strategia
Nella card "Strategia":
1. Seleziona preset dal dropdown
2. Leggi il badge bias (Rialzista / Ribassista / Neutrale)
3. Apri "Guida alla Strategia" per capire: quando si usa, come funziona, break-even, errore comune
4. Imposta gli strike (K, K1, K2, K3...)

---

## 3. Lettura del Dashboard

### Metriche Chiave (8 valori sopra il grafico)
- **Debito / Credito** — negativo = paghi premio, positivo = incassi
- **Profitto Max** — guadagno massimo possibile
- **Perdita Max** — perdita massima possibile (∞ = illimitata, attenzione!)
- **Break-Even** — prezzo di pareggio a scadenza
- **POP** — probabilità di profitto (lognormale risk-neutral)
- **Valore Atteso** — EV medio del P&L pesato sulle probabilità
- **Risk / Reward** — rapporto profitto max / perdita max
- **Legs** — numero gambe + long/short

### Diagramma Payoff
- **Linea arancione** — P&L a scadenza
- **Linea tratteggiata** — P&L oggi (mark-to-market, include IV residua)
- **Linea verticale arancione** — spot attuale
- **Linee verticali grigie** — strike delle gambe
- **Linee verdi** — break-even

Sopra zero = profitto. Sotto zero = perdita.

### Greche Aggregate
- **Delta** — quanti $ guadagni/perdi per ogni $1 di movimento
- **Gamma** — velocità con cui cambia il Delta
- **Theta** — $ persi ogni giorno solo per scorrere del tempo
- **Vega** — $ per ogni +1% di volatilità implicita
- **Rho** — sensibilità ai tassi (rilevante solo su scadenze lunghe)

### Distribuzione Prezzo + POP
Curva blu = dove il mercato prevede il prezzo a scadenza. Zone verdi = prezzi in cui la tua strategia chiude in profitto. Più verde sotto la curva → POP più alta.

### Erosione Temporale (Time Decay)
- X = giorni alla scadenza (da oggi a zero, scorrendo verso destra)
- Linea arancione piena = valore a spot attuale
- Tratteggiate = valore a ±5% dallo spot
- Se la curva **scende** = sei compratore e perdi tempo
- Se la curva **sale** = sei venditore e guadagni tempo
- Accelera nelle ultime 2-3 settimane

### Analisi Scenari
Matrice: righe = giorni rimanenti, colonne = prezzo sottostante. Celle colorate = P&L in quello scenario. Usa per stress test: "se NVDA crolla -10% a 5 giorni dalla scadenza, quanto perdo?"

---

## 4. Workflow operativo — aprire un trade reale

1. **Definisci il bias** (Rialzista, Ribassista, Neutrale) in base all'analisi tecnica/fondamentale
2. **Apri la dashboard**, connetti il ticker
3. **Imposta DTE** realistico (15-45 giorni è il sweet spot tipico per strategie retail)
4. **Imposta IV** copiando dal tuo broker
5. **Scegli preset** che corrisponde al bias
6. **Leggi la Guida alla Strategia** per evitare l'errore comune
7. **Regola gli strike** — per OTM tipicamente 1 deviazione standard dallo spot
8. **Controlla le metriche chiave**:
   - POP > 60% per strategie credit
   - R/R > 1.5 per strategie debit
   - Perdita Max ≤ 2% del capitale totale
9. **Osserva il payoff** — il B/E è realistico rispetto al movimento atteso?
10. **Verifica Greche** — Theta aggressivo? Vega troppo esposto?
11. **Apri Time Decay** — sopporta l'erosione fino alla tua data di uscita target?
12. **Stress test Scenari** — se sbaglio direzione, quanto perdo?
13. **Scarica Report** (PNG) come journal dell'analisi
14. **Cross-check sul broker** prima di inviare l'ordine

---

## 5. Confronto fra strategie

Tab **Confronto**:
1. Slot A e B prepopolati (Buy Call vs Sell Call)
2. Cambia preset di ogni slot dal dropdown
3. Imposta strike e contratti per ciascuno
4. Aggiungi slot C per tre-vie (max 3)
5. Il grafico overlaya i payoff — orange/verde/blu
6. La tabella sotto confronta: Debito, Max Profit, Max Loss, B/E, POP, EV, R/R

Uso tipico: scegliere fra Bull Call Spread vs Long Call, o fra Iron Condor vs Short Strangle.

---

## 6. Report PNG

Header "Metriche Chiave":
1. Scrivi un titolo (es. "NVDA Earnings Play — Bull Call Spread")
2. Click "↓ Scarica Report"
3. File salvato: `abtg_<titolo>_<timestamp>.png` — 1200px, scala 2x
4. Usalo come journal / condividilo con il tuo team / stampa

Il report contiene: titolo, ticker, parametri mercato, 8 metriche, payoff chart, greche. Disclaimer didattico incluso.

---

## 7. Sezione Impara

`/learn` — guida completa:
- Opzioni americane vs europee
- 5 Greche spiegate con esempi numerici
- POP / EV — cosa sono, cosa NON sono
- Strategie multi-leg con when-to-use e errori comuni
- **5 errori che uccidono il 90% dei trader**
- **Come usare questo strumento** (workflow passo-passo)
- Limiti del modello Black-Scholes

Leggila prima di aprire il primo trade.

---

## 8. Domande frequenti

**I dati sono real-time?**
No. Yahoo Finance free feed ha ~15 min di ritardo strutturale. Il badge "età quote" mostra quanto è vecchio il dato. Per operatività live usa il feed del tuo broker.

**Posso salvare i trade?**
Non in questa versione. Usa il bottone "Scarica Report" come journal.

**Supporta opzioni su indici / futures?**
Sì funzionalmente, ma il modello Black-Scholes assume esercizio europeo. Per opzioni americane con dividendi il prezzo teorico può divergere dal reale — cross-check sul broker.

**La POP è affidabile?**
È una stima risk-neutral lognormale. Dà una baseline oggettiva per confrontare strategie. Non è una predizione. Mercati in stress o earnings distorcono la distribuzione.

---

## 9. Disclaimer

Strumento esclusivamente **didattico**. Non è consulenza finanziaria. I calcoli sono basati su Black-Scholes e distribuzione lognormale risk-neutral — i risultati reali possono differire significativamente. Verifica sempre le Greche e i prezzi sul book del tuo broker prima di aprire una posizione.

© ABTG Option Tools — Alfio Bardolla Training Group.
