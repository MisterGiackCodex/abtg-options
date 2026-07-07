# ABTG Options Visualizer — Scenari di Test

## 1. Dashboard Base

- [ ] Aprire l'applicazione — la dashboard si carica correttamente con tema scuro e palette ABTG
- [ ] Modificare il campo "Spot" — tutti i grafici e metriche si aggiornano in tempo reale
- [ ] Modificare "Volatilita impl." — i premi dei leg e le metriche si ricalcolano
- [ ] Modificare "Giorni a scadenza" — il payoff "oggi" cambia, quello a scadenza resta uguale
- [ ] Modificare "Contratti" — P&L, greche e metriche scalano correttamente

## 2. Strategie Preset

- [ ] Selezionare "Buy Call" — 1 leg long call, payoff a hockey stick
- [ ] Selezionare "Bull Call Spread" — 2 leg, payoff a forma trapezioidale
- [ ] Selezionare "Iron Condor" — 4 leg, payoff a profitto limitato con 2 break-even
- [ ] Selezionare "Call Butterfly" — 3 leg, profitto massimo sulla strike centrale
- [ ] Passare tra tab "Single-Leg" e "Multi-Leg" — i preset cambiano correttamente
- [ ] Modificare gli strike — i premi si ricalcolano via Black-Scholes

## 3. Leg Builder Personalizzato

- [ ] Modificare il premio di un leg — il valore personalizzato viene usato nei calcoli
- [ ] Cambiare la direzione di un leg (long/short) — payoff si inverte
- [ ] Aggiungere un leg manualmente — i calcoli includono il nuovo leg
- [ ] Rimuovere un leg — i calcoli si aggiornano
- [ ] Cliccare "Ripristina preset" — i leg tornano ai valori originali

## 4. Metriche e Grafici

- [ ] Verificare Net debit/credit — positivo = paghi, negativo = incassi
- [ ] Verificare Max profit / Max perdita — coerenti con il payoff diagram
- [ ] Verificare Break-even — i punti verdi sul grafico corrispondono ai valori mostrati
- [ ] Verificare POP — percentuale ragionevole (es. ~50% per ATM, >50% per credit spread)
- [ ] Verificare greche — Delta positivo per posizioni bullish, negativo per bearish
- [ ] Scenario table — P&L a +/- 5%, 10%, 15%, 25% coerenti con il grafico

## 5. Salvataggio Trade

- [ ] Cliccare "Salva come Trade" sulla dashboard
- [ ] Compilare nome e ticker — il bottone "Salva" diventa attivo
- [ ] Salvare il trade — verificare che appare nella pagina Trades
- [ ] I dati del trade (legs, spot, IV, DTE) corrispondono a quelli della dashboard

## 6. Trade Manager (/trades)

- [ ] La lista mostra tutti i trade salvati con P&L calcolato
- [ ] Filtrare per status (Tutti, Aperti, Chiusi, Scaduti)
- [ ] Cliccare su un trade — si apre la pagina dettaglio
- [ ] Il P&L per-leg mostra entry premium, current premium, guadagno/perdita in $ e %
- [ ] Il P&L totale del trade e la somma dei P&L per-leg
- [ ] "Giorni Detenuti" e calcolato correttamente dalla data di ingresso

## 7. Chiusura Trade

- [ ] Nella lista trade, cliccare "Chiudi" su un trade aperto
- [ ] Confermare — lo status diventa "closed"
- [ ] Il P&L realizzato viene registrato
- [ ] Il trade chiuso mostra i prezzi di chiusura nella tabella per-leg

## 8. Import / Export

- [ ] Cliccare "Esporta JSON" — scarica un file .json con tutti i trade
- [ ] Cliccare "Esporta CSV" — scarica un file .csv apribile in Excel
- [ ] Cliccare "Importa JSON" — selezionare `sample-trades.json`
- [ ] I trade importati appaiono nella lista con dati corretti
- [ ] Esportare di nuovo — il file contiene sia i vecchi che i nuovi trade

## 9. Persistenza

- [ ] Salvare un trade, chiudere il browser, riaprire — il trade e ancora presente
- [ ] Cancellare la cache/localStorage — i trade vengono persi (comportamento atteso)

## 10. Stampa Report

- [ ] Dalla pagina dettaglio trade, cliccare "Stampa Report"
- [ ] L'anteprima di stampa mostra P&L, grafico e greche senza header/footer/bottoni

## 11. Navigazione

- [ ] Link "Dashboard" — torna alla pagina principale
- [ ] Link "Trades" — apre il trade manager
- [ ] Link "Impara" — apre la pagina educativa
- [ ] Navigazione fluida tra le pagine senza errori

## 12. Ticker Live (solo versione server, NON nella demo statica)

- [ ] Inserire un ticker (es. AAPL) e cliccare "Connetti"
- [ ] Il prezzo si aggiorna automaticamente ogni 15 secondi
- [ ] Lo spot nella dashboard si auto-popola dal prezzo live
- [ ] L'indicatore mostra pallino verde quando connesso
- [ ] Cliccare "Disconnetti" — torna a modalita manuale
- [ ] Inserire un ticker inesistente — mostra errore senza crash
