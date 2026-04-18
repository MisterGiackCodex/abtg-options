# ABTG Options Visualizer — Demo per Tester

## Cosa contiene questa cartella

Questa cartella contiene tutto il necessario per testare il visualizzatore di opzioni ABTG senza bisogno di installare Node.js o alcun tool di sviluppo.

## Cosa mandare ai tester

Zippare e inviare **solo** questi file/cartelle:

```
demo/
  dist/           <-- L'applicazione completa (generata con build-demo.sh)
  sample-trades.json  <-- Trade di esempio per testare l'importazione
  test-scenarios.md   <-- Checklist scenari da verificare
  README.md           <-- Questo file (istruzioni)
```

**NON mandare** il resto del progetto (codice sorgente, `node_modules`, `.next`, ecc.)

## Come eseguire la demo

1. Estrarre lo zip
2. Aprire `dist/index.html` in un browser moderno (Chrome, Firefox, Edge, Safari)
3. L'applicazione funziona completamente offline, senza server

## Come testare

Seguire la checklist in `test-scenarios.md`. Per testare l'importazione dei trade, usare il file `sample-trades.json`.

## Limitazioni della versione demo

- **Nessun dato live:** Il ticker in tempo reale richiede il server Next.js. Nella demo statica, tutti i dati vanno inseriti manualmente.
- **localStorage:** I trade salvati sono memorizzati nel browser. Cancellando i dati del browser si perdono i trade.
- **Nessun server richiesto:** L'applicazione funziona aprendo direttamente il file HTML.

## Come generare la build demo (per sviluppatori)

```bash
cd abtg-options
chmod +x demo/build-demo.sh
./demo/build-demo.sh
```

Questo genera `demo/dist/` con l'export statico completo.

## Contatti

Per segnalare bug o problemi durante il testing, contattare il team di sviluppo.
