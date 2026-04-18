# ABTG Options Visualizer — Documento di Due Diligence

**Versione:** 0.2.0  
**Data:** Aprile 2026  
**Natura del documento:** Descrizione tecnica e funzionale ad uso informativo. Non costituisce consulenza finanziaria, sollecitazione all'investimento, ne promessa di rendimento.

---

## Panoramica

ABTG Options Visualizer e uno strumento analitico e didattico per la valutazione di strategie su opzioni di stile americano. La dashboard consente a un trader di costruire una posizione — singola o multi-leg — e di osservarne immediatamente il profilo di rischio/rendimento: payoff a scadenza, valore mark-to-market corrente, greche aggregate, probabilita di profitto e valore atteso.

Dalla versione 0.2.0, lo strumento integra inoltre un **modulo di gestione trade** con calcolo P&L per leg e per strategia, un **ticker in tempo reale** per l'aggiornamento automatico dei parametri di mercato, e funzionalita di **import/export** per la portabilita dei dati.

Il problema che risolve e concreto: analizzare una struttura multi-leg in modo visivo e quantitativo, seguire l'andamento delle operazioni in portafoglio, e generare report di performance — il tutto senza dipendere dal terminale del broker. E pensato per trader di opzioni con conoscenza base-intermedia delle greche e delle strategie strutturate, che vogliono velocizzare la fase di pre-trade analysis e il tracking delle posizioni aperte.

---

## Funzionalita principali

### 1. Costruttore di strategie con preset

La dashboard copre le strutture piu diffuse nell'operativita su opzioni equity USA:

**Single-leg:**
- Buy Call / Sell Call (naked)
- Buy Put / Sell Put (naked)
- Covered Call (azione long + short call OTM)

**Multi-leg:**
- Vertical spread (Bull Call Spread, Bear Put Spread, Bull Put Spread, Bear Call Spread) — sia debit che credit
- Straddle long e short (stessa strike, call + put, stesso expiry)
- Strangle long (put OTM + call OTM, strike diversi)
- Iron Condor (4 legs: short put spread OTM + short call spread OTM)
- Call Butterfly (3 strike equidistanti, posizione a profitto massimo sulla strike centrale)

Ogni preset genera automaticamente i leg con i premi teorici calcolati via Black-Scholes sui parametri inseriti. I leg sono poi modificabili singolarmente (strike, premio, quantita, direzione) tramite un leg builder custom che consente di rimuovere, aggiungere o alterare qualsiasi componente della struttura.

### 2. Payoff diagram a doppia curva

Il grafico di payoff mostra due serie distinte sull'asse prezzo del sottostante:

- **Curva a scadenza (expiry):** payoff teorico puro al termine della vita dell'opzione, calcolato come somma dei payoff intrinseci di ogni leg al netto dei premi pagati/incassati.
- **Curva mark-to-market oggi:** valore corrente della struttura per ogni livello di prezzo del sottostante, calcolato rivalutando ogni leg via Black-Scholes con il tempo residuo e la volatilita implicita correnti.

Sono evidenziati: i break-even (identificati con interpolazione lineare su 2000 punti), gli strike dei leg attivi e la posizione attuale dello spot.

### 3. Metriche chiave della struttura

Per ogni configurazione di leg la dashboard espone in tempo reale:

| Metrica | Descrizione |
|---|---|
| Net debit / credit | Flusso di cassa netto all'apertura della posizione (positivo = paghi, negativo = incassi) |
| Max profit | Massimo guadagno teorico a scadenza nell'intervallo di prezzo analizzato; segnala "illimitato" per posizioni naked long |
| Max perdita | Massima perdita teorica; segnala "illimitata" per posizioni naked short |
| Break-even | Prezzo/i del sottostante a cui il P/L a scadenza e zero |
| Risk/Reward ratio | Rapporto tra max profit e max perdita (non calcolato per posizioni unbounded) |
| Numero di leg | Conteggio dei contratti attivi nella struttura |

### 4. Probabilita di profitto (POP) e valore atteso (EV)

- **POP (Probability of Profit):** percentuale di probabilita che la strategia termini in profitto a scadenza. Calcolata integrando numericamente la densita di probabilita lognormale risk-neutral sul dominio in cui il payoff a scadenza e positivo. Il metodo di integrazione e la regola di Simpson con 4000 sottointervalli, con integrazione della PDF da 0.01xS a 5xS (copertura empiricamente sufficiente per volatilita tipiche di equity).

- **EV (Expected Value):** valore atteso del payoff a scadenza sotto la stessa distribuzione risk-neutral. Calcolato come integrale di payoff x PDF sullo stesso dominio con la regola di Simpson a 800 punti. Un EV vicino a zero e il risultato atteso in un mercato efficiente; la metrica e utile per confrontare strutture alternative, non per prevedere rendimenti futuri.

La distribuzione risk-neutral assume moto browniano geometrico (GBM) con parametro di drift pari a r - q - 0.5sigma^2, coerente con la misura neutrale al rischio del modello Black-Scholes.

### 5. Greche aggregate di portafoglio

Le cinque greche standard sono calcolate per ogni leg via Black-Scholes e sommate con il relativo segno (long +1, short -1) e moltiplicatore contrattuale (x100):

| Greca | Definizione nella dashboard |
|---|---|
| Delta | Variazione del valore della struttura per $1 di movimento del sottostante |
| Gamma | Tasso di variazione del delta per $1 di movimento del sottostante |
| Theta | Decadimento temporale giornaliero (per 1 giorno di calendario) |
| Vega | Sensibilita a una variazione dell'1% di volatilita implicita |
| Rho | Sensibilita a una variazione dell'1% del tasso risk-free |

Il theta e espresso in dollari per giorno, il vega in dollari per punto percentuale di IV, il rho in dollari per punto percentuale di tasso.

### 6. Scenario analysis

Tabella di P/L a scadenza calcolato su nove scenari di prezzo: -25%, -15%, -10%, -5%, 0%, +5%, +10%, +15%, +25% rispetto allo spot corrente. Per ciascuno scenario sono riportati il prezzo assoluto, la variazione percentuale, il P/L in dollari e il P/L percentuale rispetto al valore nozionale (spot x 100).

### 7. Distribuzione probabilistica con zona profitto

Visualizzazione della PDF lognormale risk-neutral sovrapposta all'asse prezzi, con shading verde sulle zone in cui il payoff a scadenza e positivo. Fornisce una lettura intuitiva della distribuzione di probabilita del prezzo a scadenza in relazione alla struttura costruita.

### 8. Sezione educativa integrata

Una pagina "Impara" raccoglie definizioni operative delle greche, descrizione delle strutture multi-leg piu comuni e una spiegazione trasparente dei limiti del modello di pricing utilizzato.

### 9. Integrazione dati di mercato in tempo reale

La versione 0.2.0 introduce un modulo di **ticker in tempo reale** che consente di collegare la dashboard a un simbolo di mercato e ricevere aggiornamenti automatici del prezzo.

**Funzionamento:**
- L'utente inserisce un simbolo (es. AAPL, SPY, TSLA) nella barra ticker in cima alla dashboard e clicca "Connetti".
- Il sistema interroga Yahoo Finance tramite un proxy API interno (Route Handler Next.js su `/api/quote`) per evitare problemi CORS.
- Il prezzo si aggiorna automaticamente ogni 15 secondi tramite polling.
- Quando connesso, lo spot della dashboard viene auto-popolato con il prezzo live, aggiornando in tempo reale tutti i calcoli (payoff, greche, POP, EV, scenari).
- Un indicatore visivo (pallino verde/giallo/grigio) mostra lo stato della connessione.
- L'utente puo disconnettersi in qualsiasi momento per tornare alla modalita di input manuale.

**Endpoint opzionale — Options Chain:**
- `/api/chain?symbol=AAPL&expiry=2026-05-15` restituisce la catena di opzioni con strike, bid/ask, IV e open interest.
- Utile per auto-popolare la volatilita implicita e visualizzare gli strike disponibili per una scadenza specifica.

**Fonte dati:** Yahoo Finance public API (endpoint v8/chart e v7/options). Nessuna API key richiesta.

**Ritardo:** I dati gratuiti di Yahoo Finance hanno un ritardo di circa 15 minuti. Questo e indicato chiaramente nell'interfaccia. Per operativita real-time e necessario un provider di dati premium.

**Privacy:** Nessun dato utente viene inviato a servizi esterni. Le uniche richieste sono query sul simbolo ticker, proxate tramite il server Next.js dell'applicazione.

### 10. Gestione trade e persistenza

La versione 0.2.0 introduce un **Trade Manager** completo accessibile dalla pagina `/trades`, che permette di salvare, tracciare e analizzare le operazioni su opzioni.

**Modello dati:**
Ogni trade contiene:
- Metadati: nome dell'operazione, ticker, data di ingresso, data di scadenza, note
- Contesto di mercato all'ingresso: spot, IV, tasso risk-free
- Legs: tipo (call/put/stock), direzione (long/short), strike, premio d'ingresso, premio corrente, quantita, status (open/closed/expired)
- Status complessivo del trade: open, closed, expired

**Persistenza:**
I trade sono salvati nel `localStorage` del browser con chiave `abtg-trades-v1`. Questo significa:
- Nessun server, account o registrazione necessari
- I dati sono disponibili immediatamente alla riapertura del browser
- I dati sono locali al browser: cancellare i dati di navigazione elimina i trade
- Non vengono memorizzati dati sensibili (nessun numero di conto, nessun order ID reale)

**Import/Export:**
- **JSON:** esportazione/importazione dell'intero portafoglio trade in formato JSON, per backup o trasferimento tra browser/dispositivi
- **CSV:** esportazione in formato CSV apribile in Excel o Google Sheets, con una riga per ogni leg e i dati del trade genitore

**Flusso di salvataggio:**
Dalla dashboard principale, dopo aver configurato una strategia, l'utente clicca "Salva come Trade". Si apre una modale dove inserisce nome dell'operazione e ticker. I leg, i premi e il contesto di mercato vengono catturati automaticamente dalla configurazione corrente.

### 11. Calcolo P&L per leg e per strategia

Ogni trade salvato include un calcolo automatico del P&L (Profit & Loss) a due livelli:

**P&L per singolo leg:**
- **Entry value:** premio pagato/incassato all'apertura x quantita x 100 x segno (long +1, short -1)
- **Current value:** per leg aperti, calcolato rivalutando il premio via Black-Scholes con i parametri di mercato correnti; per leg chiusi, registrato al prezzo di chiusura; per leg scaduti, calcolato sul valore intrinseco
- **P&L non realizzato ($):** current value - entry value (solo per leg aperti)
- **P&L non realizzato (%):** percentuale sul costo d'ingresso
- **P&L realizzato ($):** registrato alla chiusura del trade
- **P&L realizzato (%):** percentuale sul costo d'ingresso

**P&L aggregato per strategia:**
- **Totale non realizzato:** somma dei P&L non realizzati di tutti i leg
- **Totale realizzato:** somma dei P&L realizzati di tutti i leg
- **P&L totale:** non realizzato + realizzato
- **P&L totale (%):** percentuale rispetto al net debit complessivo d'ingresso
- **Giorni detenuti:** numero di giorni dalla data di ingresso ad oggi

**Visualizzazione:**
- La pagina Trade Manager mostra il P&L di ogni trade nella lista principale
- La pagina dettaglio trade mostra una card P&L riassuntiva + una tabella per-leg con tutti i dettagli
- I colori seguono la convenzione: verde per profitto, rosso per perdita
- Il P&L e espresso sia in dollari assoluti che in percentuale

**Calcolo del prezzo corrente per leg aperti:**
Per ogni leg aperto di tipo call o put, il prezzo corrente viene calcolato invocando il modello Black-Scholes (`blackScholes()`) con:
- S = spot corrente (dal contesto di mercato all'ingresso o dal ticker live se connesso)
- K = strike del leg
- T = tempo residuo alla scadenza (calcolato dalla data di scadenza del trade)
- r = tasso risk-free memorizzato all'ingresso
- sigma = volatilita implicita memorizzata all'ingresso

Questo garantisce coerenza con il motore di pricing gia utilizzato nella dashboard principale.

### 12. Demo per tester

Il progetto include una cartella `demo/` contenente tutto il necessario per distribuire una versione testabile dell'applicazione senza richiedere competenze tecniche o strumenti di sviluppo.

**Contenuto della cartella demo:**
- `dist/` — Build statica dell'applicazione (generata dallo script `build-demo.sh`), apribile direttamente nel browser senza server
- `sample-trades.json` — File con 4 trade di esempio precaricati (Bull Call Spread, Iron Condor, Covered Call, Long Put) in stati diversi (open, closed, expired) per testare tutte le funzionalita del Trade Manager
- `test-scenarios.md` — Checklist dettagliata di 12 categorie di test con circa 50 scenari specifici da verificare
- `README.md` — Istruzioni complete per i tester: cosa aprire, come testare, cosa non funziona nella versione statica

**Come distribuire:**
Zippare la cartella `demo/` (con `dist/` generata) e inviarla ai tester. I tester aprono `dist/index.html` nel browser. Non serve installare nulla.

**Limitazioni della build statica:**
- Il ticker in tempo reale non funziona (richiede il server Next.js per il proxy API)
- Tutte le altre funzionalita (dashboard, trade manager, P&L, import/export) funzionano normalmente
- I dati sono memorizzati nel localStorage del browser locale

---

## Fonti dati e logica di calcolo

**Prezzi del sottostante e volatilita implicita:** nella versione 0.2.0, il prezzo spot puo essere aggiornato automaticamente tramite il modulo ticker in tempo reale collegato a Yahoo Finance. La volatilita implicita, il tasso risk-free e i giorni a scadenza restano parametri configurabili manualmente. I premi dei singoli leg sono inizializzati automaticamente dal modello Black-Scholes sui parametri correnti e possono essere sovrascritti manualmente.

**Modello di pricing:** Black-Scholes con dividendi continui (modello di Merton), implementato in TypeScript nella libreria interna `lib/pricing/blackScholes.ts`. La funzione di distribuzione normale cumulativa e approssimata con il metodo di Abramowitz & Stegun (serie polinomiale, errore massimo circa 7.5 x 10^-8), sufficiente per applicazioni analitiche.

**Calcolo delle greche:** derivato analiticamente dal modello Black-Scholes (formule chiuse), non per differenza finita. La coerenza tra greche e pricing e garantita dalla medesima implementazione.

**Distribuzione risk-neutral:** lognormale parametrizzata con mu = ln(S) + (r - q - 0.5sigma^2)T e s = sigma * sqrt(T), coerente con la misura Q del modello.

**Calcolo P&L:** il motore P&L (`lib/trades/pnl.ts`) riusa direttamente la funzione `blackScholes()` per rivalutare ogni leg aperto ai parametri di mercato correnti. Per i leg chiusi, utilizza il prezzo di chiusura registrato. Per i leg scaduti, calcola il valore intrinseco.

**Albero binomiale CRR:** un modello binomiale Cox-Ross-Rubinstein con 200 passi e supporto all'esercizio anticipato (opzioni americane) e disponibile nel codebase (`lib/pricing/binomial.ts`) ma non e ancora esposto nell'interfaccia utente nella versione corrente.

---

## Flusso utente

### Flusso di analisi pre-trade

1. **Connessione ticker (opzionale):** il trader inserisce il simbolo del sottostante nella barra ticker e clicca "Connetti". Lo spot viene aggiornato automaticamente dal mercato. In alternativa, tutti i parametri possono essere inseriti manualmente.

2. **Configurazione del mercato:** il trader verifica/modifica spot corrente, volatilita implicita (IV in %), giorni a scadenza e tasso risk-free. Se il ticker e connesso, lo spot si aggiorna automaticamente.

3. **Selezione della struttura:** scelta tra le tab Single-Leg e Multi-Leg, poi selezione del preset di strategia dal menu a tendina. La dashboard genera immediatamente i leg con premi teorici.

4. **Personalizzazione degli strike e dei contratti:** i campi strike (K1, K2, K3, K4 a seconda della struttura) e il numero di contratti sono modificabili in tempo reale. Ogni modifica ricalcola premi, greche e grafici istantaneamente.

5. **Personalizzazione fine dei leg:** il leg builder consente di editare il premio di un singolo leg (per esempio per usare il prezzo effettivo di mercato invece di quello teorico), cambiare la direzione (long/short) o aggiungere leg aggiuntivi per costruire strutture non presenti nei preset.

6. **Analisi del profilo di rischio:** il trader legge payoff a scadenza vs. curva odierna, break-even, max profit/loss, POP ed EV. La scenario table fornisce rapidamente i P/L su movimenti percentuali specifici.

7. **Lettura delle greche aggregate:** il pannello greche mostra l'esposizione netta della struttura completa, inclusa la gestione di posizioni su azioni (delta neutro, covered call ecc.).

8. **Decisione e salvataggio:** sulla base del profilo visivo e delle metriche, il trader valuta se la struttura e coerente con la sua view di mercato. Se decide di procedere, puo salvare la configurazione come trade tramite il bottone "Salva come Trade".

### Flusso di gestione trade

9. **Monitoraggio portafoglio:** nella pagina Trade Manager (`/trades`), il trader vede tutti i trade salvati con P&L corrente in dollari e percentuale. Puo filtrare per stato (aperti, chiusi, scaduti).

10. **Analisi dettaglio trade:** cliccando su un trade, si apre la pagina di dettaglio con P&L per-leg, payoff chart, greche aggregate e note. Il trader puo verificare come sta performando ogni singolo leg della struttura.

11. **Chiusura trade:** quando il trader decide di chiudere la posizione (sul broker esterno), registra la chiusura nel Trade Manager. Il P&L realizzato viene calcolato e memorizzato.

12. **Reporting:** il trader puo esportare il portafoglio trade in JSON (per backup) o CSV (per analisi in Excel), oppure stampare il report di un singolo trade direttamente dal browser.

---

## Stack tecnico

- **Framework:** Next.js 14 con App Router, TypeScript
- **UI:** Tailwind CSS con palette dark personalizzata (ABTG)
- **Grafici:** Recharts (libreria React per grafici basati su SVG)
- **Pricing e calcolo:** librerie TypeScript pure (`lib/pricing/`, `lib/probability/`, `lib/trades/`) senza dipendenze esterne per la matematica finanziaria; tutto il calcolo avviene lato client nel browser
- **Dati di mercato:** Yahoo Finance via proxy API interno (Next.js Route Handler), polling a 15 secondi
- **Persistenza:** localStorage del browser per i trade salvati
- **Import/Export:** JSON e CSV generati lato client

---

## Limiti attuali e assunzioni

**1. Dati di mercato con ritardo.**
I dati forniti da Yahoo Finance tramite l'endpoint pubblico gratuito hanno un ritardo di circa 15 minuti rispetto al mercato in tempo reale. Per operativita intraday e necessario un provider di dati premium con feed real-time. Lo strumento indica chiaramente questo ritardo nell'interfaccia.

**2. Black-Scholes assume esercizio europeo.**
Il modello di pricing utilizzato per greche, payoff today e mark-to-market e Black-Scholes (europeo). Per opzioni americane su sottostanti che pagano dividendi significativi il modello puo sottostimare il valore dell'opzione per via dell'early exercise premium. L'albero binomiale CRR per opzioni americane e implementato ma non ancora integrato nell'interfaccia.

**3. Volatilita implicita piatta (no volatility smile/skew).**
La dashboard usa un unico parametro sigma per tutti gli strike e per entrambe le curve (scadenza e oggi). I mercati reali esibiscono volatility smile e term structure: la IV di una put OTM e tipicamente diversa da quella di una call OTM. Per strutture come iron condor o butterfly questo e un limite rilevante nella stima di POP e EV, che possono differire materialmente da quelli osservabili sul mercato.

**4. POP ed EV sotto distribuzione risk-neutral, non storica.**
La misura di probabilita utilizzata e quella neutrale al rischio (Q), coerente con il no-arbitrage pricing ma non con le probabilita empiriche (P). Un trader che voglia stimare la probabilita reale di profitto dovrebbe usare una distribuzione calibrata su rendimenti storici o su volatilita realizzata, che possono differire significativamente dalla IV di mercato.

**5. Scenario table calcolata a scadenza, non mark-to-market.**
I P/L della tabella scenari sono payoff a scadenza, non il valore corrente della struttura se il prezzo si muovesse oggi. Per strategie con lunga vita residua la differenza e sostanziale, in particolare per il theta.

**6. Nessuna gestione di commissioni e slippage.**
Il calcolo del net debit/credit e del P&L non include commissioni del broker, differenziale bid/ask, costi di margine o impatto di mercato. Per strutture multi-leg questi costi sono spesso significativi rispetto al profitto atteso.

**7. P&L calcolato su prezzi teorici, non di mercato.**
Il P&L dei trade aperti e calcolato rivalutando i leg via Black-Scholes con i parametri memorizzati all'ingresso (o aggiornati dal ticker). I prezzi reali bid/ask sul mercato possono differire significativamente, soprattutto per opzioni poco liquide o deep OTM/ITM.

**8. Persistenza locale al browser.**
I trade sono memorizzati nel localStorage del browser. Non esiste sincronizzazione tra dispositivi, non c'e backup automatico, e cancellare i dati del browser elimina tutti i trade. Si raccomanda l'export periodico in JSON come forma di backup.

**9. Dipendenza dal proxy API Yahoo Finance.**
Il modulo ticker in tempo reale dipende dalla disponibilita dell'endpoint pubblico di Yahoo Finance e dal proxy API interno. Cambiamenti nell'API di Yahoo o nel formato dei dati possono interrompere il servizio senza preavviso. Il fallback alla modalita manuale e sempre disponibile.

**10. Versione in sviluppo attivo.**
Il numero di versione (0.2.0) indica uno stato di sviluppo iniziale con funzionalita core complete. Il deploy su VPS non e ancora avvenuto. Alcune funzionalita (es. pricing americano via albero binomiale, integrazione automatica dell'IV dalla options chain) sono presenti nel codebase ma non ancora esposte nell'UI.

---

## Valore per il trader

Per un trader che opera su opzioni equity USA, ABTG Options Visualizer consolida in un'unica interfaccia le fasi critiche dell'operativita:

**Pre-trade analysis:** valutazione visiva e quantitativa della struttura prima dell'apertura, con ricalcolo istantaneo al variare dei parametri. Utile per confrontare rapidamente strutture alternative (es. iron condor vs. strangle, debit spread vs. credit spread).

**Tracking delle posizioni:** registrazione dei trade aperti con monitoraggio del P&L per leg e per strategia, sia in dollari che in percentuale. Il trader vede a colpo d'occhio quali posizioni stanno performando e quali richiedono attenzione.

**Reporting:** esportazione del portafoglio in CSV per analisi esterne, stampa report per singolo trade, backup in JSON per la portabilita dei dati.

**Monitoraggio mercato:** aggiornamento automatico dello spot dal ticker in tempo reale, senza necessita di inserire manualmente il prezzo ogni volta che si vuole ricontrollare una posizione.

La dashboard non sostituisce il terminale del broker per quotazioni live, ne e un sistema di order management. E uno strumento di analisi, scenario planning e tracking, utile nella fase di costruzione, revisione e monitoraggio di una strategia, non nella fase di esecuzione.

---

## Come utilizzare lo strumento — Guida rapida per il manager

### Accesso e avvio
1. Aprire l'applicazione nel browser (URL fornito dal team tecnico o aprire `index.html` dalla build demo)
2. La pagina principale (Dashboard) si presenta con un tema scuro e la palette ABTG gold

### Analisi di una strategia
1. Inserire il ticker nella barra in alto (es. "AAPL") e cliccare "Connetti" per aggiornamento automatico del prezzo
2. Selezionare la strategia desiderata dal menu (es. "Bull Call Spread")
3. Configurare gli strike e il numero di contratti
4. Leggere le metriche chiave: net debit, max profit, max loss, break-even, POP
5. Osservare il grafico payoff per visualizzare il profilo di rischio

### Salvare e tracciare un trade
1. Dopo aver configurato la strategia, cliccare "Salva come Trade"
2. Inserire un nome descrittivo e il ticker
3. Navigare alla pagina "Trades" per vedere tutte le operazioni salvate
4. Cliccare su un trade per il dettaglio con P&L per-leg

### Esportare i dati
1. Nella pagina Trades, cliccare "Esporta CSV" per un file apribile in Excel
2. Cliccare "Esporta JSON" per un backup completo dei dati
3. Per importare trade da un altro browser/dispositivo, usare "Importa JSON"

### Generare un report
1. Aprire il dettaglio di un trade
2. Cliccare "Stampa Report" per generare una versione stampabile con P&L, grafico e greche

---

*Questo documento descrive le funzionalita della dashboard ABTG Options Visualizer nella versione 0.2.0. Non costituisce offerta di servizi di investimento, consulenza finanziaria o sollecitazione all'acquisto di strumenti finanziari. L'utilizzo dello strumento e sotto la piena responsabilita dell'utente.*
