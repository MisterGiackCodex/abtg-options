import type { PresetId } from "./multileg";

export interface StrategyGuide {
  when: string;        // quando si usa
  how: string;         // come funziona
  profit: string;      // scenario di profitto
  loss: string;        // scenario di perdita
  breakeven: string;   // break-even
  tip?: string;        // nota operativa
}

export const STRATEGY_GUIDE: Record<PresetId, StrategyGuide> = {
  buyCall: {
    when: "Ti aspetti un rialzo deciso del sottostante entro la scadenza.",
    how: "Compri una call: paghi un premio e ottieni il diritto di comprare il sottostante al prezzo K.",
    profit: "Illimitato al rialzo: ogni dollaro sopra K+premio è profitto.",
    loss: "Limitata al premio pagato se il prezzo resta sotto K.",
    breakeven: "Strike K + premio pagato.",
    tip: "Il tempo gioca contro (Theta negativo): serve movimento rapido. Meglio con IV bassa.",
  },
  sellCall: {
    when: "Ti aspetti ribasso o lateralità e vuoi incassare premio.",
    how: "Vendi una call: incassi il premio e ti obblighi a consegnare il sottostante a K se ti esercitano.",
    profit: "Limitato al premio incassato se il prezzo resta sotto K a scadenza.",
    loss: "Illimitata al rialzo: per ogni dollaro sopra K perdi $100 per contratto.",
    breakeven: "Strike K + premio incassato.",
    tip: "Strategia rischiosa senza copertura. Meglio se coperta con azioni (Covered Call) o con call lunga più OTM (Bear Call Spread).",
  },
  buyPut: {
    when: "Ti aspetti un ribasso del sottostante o vuoi coprire un portafoglio.",
    how: "Compri una put: paghi un premio e ottieni il diritto di vendere il sottostante al prezzo K.",
    profit: "Crescente al ribasso: massimo se il prezzo va a zero.",
    loss: "Limitata al premio pagato se il prezzo resta sopra K.",
    breakeven: "Strike K − premio pagato.",
    tip: "Ottima per hedging di posizioni lunghe. Theta negativo: non tenerla troppo a lungo senza movimento.",
  },
  sellPut: {
    when: "Ti aspetti lateralità o rialzo e ti va bene comprare il sottostante se scende a K.",
    how: "Vendi una put: incassi il premio; se il prezzo scende sotto K vieni esercitato e compri a K.",
    profit: "Limitato al premio incassato se il prezzo resta sopra K.",
    loss: "Grande se il prezzo crolla: massimo (K − premio) × 100 per contratto.",
    breakeven: "Strike K − premio incassato.",
    tip: "Classica tecnica per entrare in azioni a sconto. Richiede margine o cash-secured.",
  },
  coveredCall: {
    when: "Possiedi già 100 azioni per contratto e vuoi generare reddito senza aspettative di forte rialzo.",
    how: "Tieni le azioni e vendi una call: incassi il premio e ti obblighi a consegnare a K.",
    profit: "Premio incassato + eventuale guadagno azioni fino a K. Cap sopra K.",
    loss: "Come le azioni sotto il prezzo d'ingresso − premio: il premio riduce il costo medio.",
    breakeven: "Prezzo d'ingresso azioni − premio incassato.",
    tip: "Ideale in mercati lateriali o lievemente rialzisti. Strategia 'income' molto diffusa.",
  },
  bullCallSpread: {
    when: "Ti aspetti rialzo moderato e vuoi ridurre il costo di una long call.",
    how: "Long call K1 (ATM/ITM) + short call K2 (OTM, K2>K1). Paghi la differenza netta.",
    profit: "Limitato a (K2 − K1) × 100 − debito se il prezzo chiude ≥ K2.",
    loss: "Limitata al debito netto se il prezzo chiude ≤ K1.",
    breakeven: "K1 + debito netto.",
    tip: "Rischio/rendimento chiaro, Theta meno aggressivo della long call. Serve movimento direzionale.",
  },
  bearPutSpread: {
    when: "Ti aspetti ribasso moderato e vuoi ridurre il costo di una long put.",
    how: "Long put K1 (alto) + short put K2 (basso, K2<K1). Paghi la differenza netta.",
    profit: "Limitato a (K1 − K2) × 100 − debito se il prezzo chiude ≤ K2.",
    loss: "Limitata al debito netto se il prezzo chiude ≥ K1.",
    breakeven: "K1 − debito netto.",
    tip: "Controparte ribassista del Bull Call Spread. Utile quando la put secca costa troppo.",
  },
  bullPutSpread: {
    when: "Ti aspetti lateralità o rialzo. Vuoi incassare premio con rischio limitato.",
    how: "Short put K1 (alto) + long put K2 (basso, K2<K1). Incassi netto premio (credit spread).",
    profit: "Limitato al credito incassato se il prezzo chiude ≥ K1.",
    loss: "Limitata a (K1 − K2) × 100 − credito se il prezzo chiude ≤ K2.",
    breakeven: "K1 − credito incassato.",
    tip: "Più sicura del short put perché la perdita è capped. Bene con IV alta e Theta positivo.",
  },
  bearCallSpread: {
    when: "Ti aspetti lateralità o ribasso. Vuoi incassare premio con rischio limitato.",
    how: "Short call K1 (basso) + long call K2 (alto, K2>K1). Incassi netto premio (credit spread).",
    profit: "Limitato al credito incassato se il prezzo chiude ≤ K1.",
    loss: "Limitata a (K2 − K1) × 100 − credito se il prezzo chiude ≥ K2.",
    breakeven: "K1 + credito incassato.",
    tip: "Controparte ribassista del Bull Put Spread. Ottima con resistenze tecniche forti.",
  },
  longStraddle: {
    when: "Ti aspetti un grande movimento ma non sai la direzione (earnings, news, eventi).",
    how: "Long call + long put allo stesso strike K (ATM). Paghi due premi.",
    profit: "Illimitato al rialzo, grande al ribasso (capped a K × 100). Serve movimento > premio totale.",
    loss: "Limitata al premio totale pagato se il prezzo resta vicino a K.",
    breakeven: "K ± premio totale (due B/E: sopra e sotto).",
    tip: "Costoso: IV alta ne aumenta il prezzo. Colpito duro da IV crush post-evento.",
  },
  shortStraddle: {
    when: "Ti aspetti che il prezzo resti molto vicino a K. Scommetti contro il movimento.",
    how: "Short call + short put stesso strike K. Incassi due premi.",
    profit: "Limitato al premio totale incassato se il prezzo chiude esattamente a K.",
    loss: "Illimitata in entrambe le direzioni. Rischio estremo.",
    breakeven: "K ± premio totale.",
    tip: "Strategia ad alto rischio — richiede capitale e monitoraggio continuo. Theta positivo alto.",
  },
  longStrangle: {
    when: "Aspetti grande movimento ma vuoi pagare meno rispetto allo straddle.",
    how: "Long put OTM (Kp) + long call OTM (Kc, Kc>Kp). Più economica ma serve movimento più ampio.",
    profit: "Illimitato al rialzo, grande al ribasso. B/E più lontani rispetto allo straddle.",
    loss: "Limitata al premio totale se il prezzo resta tra Kp e Kc a scadenza.",
    breakeven: "Kp − premio totale (giù) e Kc + premio totale (su).",
    tip: "Meno costosa dello straddle ma servono mosse più grandi. Theta alto in prossimità di scadenza.",
  },
  ironCondor: {
    when: "Ti aspetti forte lateralità. Vuoi incassare premio con rischio limitato da entrambi i lati.",
    how: "Short put Kp1 + long put Kp2 (più basso) + short call Kc1 + long call Kc2 (più alto). Quattro gambe.",
    profit: "Limitato al credito totale se il prezzo resta tra Kp1 e Kc1 a scadenza.",
    loss: "Limitata alla larghezza dell'ala più stretta − credito.",
    breakeven: "Kp1 − credito (giù) e Kc1 + credito (su).",
    tip: "Strategia 'income' preferita dai trader avanzati in mercati laterali. Theta positivo, richiede monitoraggio delle ali.",
  },
  butterfly: {
    when: "Ti aspetti che il prezzo chiuda esattamente a un livello preciso (K2).",
    how: "Long call K1 + 2 short call K2 + long call K3 (K1<K2<K3, equidistanti). Debito netto basso.",
    profit: "Massimo a K2 esatto: (K2 − K1) × 100 − debito.",
    loss: "Limitata al debito netto se il prezzo finisce fuori dal range K1-K3.",
    breakeven: "K1 + debito (sotto) e K3 − debito (sopra).",
    tip: "Costo molto basso, profitto elevato se azzecchi K2. Probabilità di successo bassa.",
  },
};
