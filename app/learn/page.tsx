import { Card } from "@/components/ui/Card";

export default function LearnPage() {
  return (
    <div className="space-y-8">

      {/* PAGE HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-abtg-navy">
          Le opzioni americane non sono complicate. Sono mal spiegate.
        </h1>
        <p className="text-abtg-muted mt-2 text-sm max-w-2xl">
          Questa guida ti d&agrave; i concetti operativi che contano davvero &mdash; con esempi numerici reali,
          regole pratiche e zero teoria inutile. Leggi una sezione alla volta. Ogni blocco ti lascia
          una convinzione nuova che puoi usare domani mattina sul mercato.
        </p>
      </div>

      {/* 1. COSA SONO LE OPZIONI AMERICANE */}
      <Card title="Cosa Sono le Opzioni Americane">
        <div className="space-y-4 text-sm">
          <p className="text-abtg-text leading-relaxed">
            La maggior parte dei trader che si avvicina alle opzioni impara la teoria europea &mdash; e poi
            va a operare sul mercato americano senza capire la differenza. Quel gap costa denaro.
          </p>

          <div className="space-y-2">
            <h3 className="font-bold text-abtg-navy">La differenza che cambia tutto</h3>
            <p className="text-abtg-text leading-relaxed">
              Un&apos;opzione <strong className="text-abtg-navy">europea</strong> si pu&ograve; esercitare
              solo alla scadenza. Un&apos;opzione <strong className="text-abtg-navy">americana</strong> si
              pu&ograve; esercitare <strong className="text-abtg-navy">in qualunque momento</strong> prima
              della scadenza &mdash; e questa flessibilit&agrave; ha un prezzo che si riflette nel premio.
            </p>
            <p className="text-abtg-text leading-relaxed">
              Su azioni USA (equity options) le opzioni sono quasi sempre americane. Su indici come
              SPX o XSP sono europee. I future options sono anch&apos;essi europei.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-abtg-navy">Esempio concreto</h3>
            <p className="text-abtg-text leading-relaxed">
              AAPL quota $175. Compri una call strike 170 (ITM) con 30 giorni alla scadenza per $6,50.
              Il giorno dopo AAPL sale a $182 e la call vale $12,80. Con uno stile americano puoi
              <strong className="text-abtg-profit"> esercitare subito</strong> e incassare il profitto.
              Con una europea devi aspettare la scadenza, esponendoti a 29 giorni di rischio in pi&ugrave;.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-abtg-navy">Quando l&apos;esercizio anticipato conviene davvero</h3>
            <ul className="space-y-1 list-disc list-inside text-abtg-text">
              <li>Deep ITM call su azioni che staccano dividendo: eserciti il giorno prima per incassare il dividendo</li>
              <li>Deep ITM put con poco valore temporale residuo: eserciti per monetizzare subito</li>
              <li>In tutti gli altri casi, <strong className="text-abtg-navy">vendere l&apos;opzione sul mercato</strong> &egrave; quasi sempre pi&ugrave; vantaggioso che esercitarla</li>
            </ul>
          </div>

          <div className="border-l-4 border-abtg-navy pl-4 bg-abtg-navy/5 py-2 rounded-r">
            <p className="text-abtg-navy font-bold text-xs uppercase tracking-wide mb-1">Regola d&apos;oro</p>
            <p className="text-abtg-text">
              Prima di esercitare, confronta il valore intrinseco con il prezzo bid dell&apos;opzione sul mercato.
              Se il bid &egrave; superiore al valore intrinseco, vendi &mdash; non esercitare.
            </p>
          </div>
        </div>
      </Card>

      {/* 2. LE 5 GRECHE */}
      <Card title="Le 5 Greche che Devi Conoscere">
        <div className="space-y-2 text-sm mb-4">
          <p className="text-abtg-text leading-relaxed">
            I trader che perdono denaro sistematicamente ignorano le greche. Non perch&eacute; siano difficili &mdash;
            ma perch&eacute; non capiscono cosa gli costano ogni giorno. Ecco le 5 greche con un esempio
            operativo per ognuna.
          </p>
        </div>

        <div className="space-y-6 text-sm">

          {/* DELTA */}
          <div className="space-y-2">
            <h3 className="font-bold text-abtg-navy">Delta (&Delta;) &mdash; quanto si muove il tuo P&amp;L</h3>
            <p className="text-abtg-text leading-relaxed">
              Il Delta misura di quanto varia il prezzo dell&apos;opzione per ogni $1 di movimento del sottostante.
              Una call ATM ha Delta circa 0,50: se NVDA sale di $1, la tua call guadagna ~$0,50.
              Una put ha Delta negativo: se NVDA sale di $1, una put ATM perde ~$0,50.
            </p>
            <p className="text-abtg-text leading-relaxed">
              <strong className="text-abtg-profit">Quando ti fa vincere:</strong> hai una call con Delta 0,70 e il titolo fa +$5. Guadagni ~$350 per contratto (0,70 &times; $5 &times; 100).
            </p>
            <p className="text-abtg-text leading-relaxed">
              <strong className="text-abtg-loss">Quando ti fa perdere:</strong> hai una call Delta 0,30 e pensi che il titolo salir&agrave; forte. Ma se sale solo $2, guadagni solo $60 per contratto &mdash; meno di quanto pensavi.
            </p>
            <div className="border-l-4 border-abtg-navy pl-3 py-1">
              <p className="text-abtg-muted text-xs"><strong className="text-abtg-navy">Regola operativa:</strong> Per un&apos;esposizione direzionale pulita, scegli opzioni con Delta 0,40&ndash;0,60. Sotto 0,20 stai comprando lotteria, non posizione.</p>
            </div>
          </div>

          {/* GAMMA */}
          <div className="space-y-2">
            <h3 className="font-bold text-abtg-navy">Gamma (&Gamma;) &mdash; l&apos;acceleratore (o il freno)</h3>
            <p className="text-abtg-text leading-relaxed">
              Il Gamma misura la velocit&agrave; con cui cambia il Delta. Alta vicino alla scadenza e ATM.
              Se sei long gamma, un movimento forte ti avvantaggia in modo non lineare.
              Se sei short gamma (hai venduto opzioni), un movimento brusco ti penalizza pi&ugrave; del previsto.
            </p>
            <p className="text-abtg-text leading-relaxed">
              <strong className="text-abtg-profit">Quando ti fa vincere:</strong> compri uno straddle prima di earnings. Il titolo muove del 10%. Il tuo Delta cresce velocemente con il Gamma, amplificando il guadagno.
            </p>
            <p className="text-abtg-text leading-relaxed">
              <strong className="text-abtg-loss">Quando ti fa perdere:</strong> hai venduto un iron condor. Il titolo rompe il range di $3 in un giorno. Il Gamma alto ti porta fuori dal range molto prima di quanto stimavi.
            </p>
            <div className="border-l-4 border-abtg-navy pl-3 py-1">
              <p className="text-abtg-muted text-xs"><strong className="text-abtg-navy">Regola operativa:</strong> Attenzione al Gamma nelle ultime 2 settimane prima della scadenza: raddoppia (o peggio) la tua esposizione reale al movimento del sottostante.</p>
            </div>
          </div>

          {/* THETA */}
          <div className="space-y-2">
            <h3 className="font-bold text-abtg-navy">Theta (&Theta;) &mdash; il tempo che lavora contro di te (o per te)</h3>
            <p className="text-abtg-text leading-relaxed">
              Il Theta &egrave; il decadimento temporale giornaliero del premio. Ogni giorno che passa,
              un&apos;opzione perde valore anche se il sottostante non si muove.
            </p>
            <p className="text-abtg-text leading-relaxed">
              Esempio: compri una call su TSLA a $4,20. Il Theta &egrave; &minus;$0,08. Dopo 10 giorni di mercato
              laterale, la call vale ~$3,40. Hai perso $80 per contratto senza che TSLA si sia mossa.
            </p>
            <p className="text-abtg-text leading-relaxed">
              <strong className="text-abtg-profit">Quando ti fa vincere:</strong> vendi opzioni (credit spread, iron condor). Il Theta lavora per te: ogni giorno che passa senza movimenti brutti, il tuo profitto cresce.
            </p>
            <p className="text-abtg-text leading-relaxed">
              <strong className="text-abtg-loss">Quando ti fa perdere:</strong> compri opzioni e aspetti. Il tempo &egrave; il tuo nemico numero uno &mdash; anche se hai ragione sulla direzione, potresti arrivare tardi.
            </p>
            <div className="border-l-4 border-abtg-navy pl-3 py-1">
              <p className="text-abtg-muted text-xs"><strong className="text-abtg-navy">Regola operativa:</strong> Se compri opzioni, il titolo deve muovere abbastanza e in fretta da coprire il Theta che bruci ogni giorno. Calcola il tuo &quot;break-even giornaliero&quot; prima di entrare.</p>
            </div>
          </div>

          {/* VEGA */}
          <div className="space-y-2">
            <h3 className="font-bold text-abtg-navy">Vega (&nu;) &mdash; il rischio nascosto della volatilit&agrave;</h3>
            <p className="text-abtg-text leading-relaxed">
              Il Vega misura quanto varia il prezzo dell&apos;opzione per ogni 1% di variazione della
              volatilit&agrave; implicita (IV). &Egrave; il rischio che la maggior parte dei principianti ignora completamente.
            </p>
            <p className="text-abtg-text leading-relaxed">
              Esempio: compri una call su SPY per $3,50. La IV era al 18% (alta per un earnings).
              Dopo l&apos;earnings la IV crolla al 12% &mdash; il cosiddetto &quot;IV crush&quot;. La call ora vale $2,10,
              <strong className="text-abtg-loss"> anche se SPY &egrave; salito</strong>.
            </p>
            <p className="text-abtg-text leading-relaxed">
              <strong className="text-abtg-profit">Quando ti fa vincere:</strong> vendi opzioni quando la IV &egrave; alta (dopo un&apos;esplosione di volatilit&agrave;). L&apos;IV scende, il valore delle opzioni vendute cala, e ricompri pi&ugrave; a buon mercato.
            </p>
            <div className="border-l-4 border-abtg-navy pl-3 py-1">
              <p className="text-abtg-muted text-xs"><strong className="text-abtg-navy">Regola operativa:</strong> Prima di comprare opzioni su un earnings, controlla l&apos;IV rank (IVR). Se &egrave; sopra 70, il mercato sta prezzando molto rischio &mdash; comprare ti espone all&apos;IV crush.</p>
            </div>
          </div>

          {/* RHO */}
          <div className="space-y-2">
            <h3 className="font-bold text-abtg-navy">Rho (&rho;) &mdash; i tassi contano (su scadenze lunghe)</h3>
            <p className="text-abtg-text leading-relaxed">
              Il Rho misura la sensibilit&agrave; dell&apos;opzione a una variazione dell&apos;1% dei tassi d&apos;interesse.
              Su opzioni a breve scadenza (&lt;60 giorni) &egrave; trascurabile. Diventa rilevante su LEAPS
              (opzioni con scadenza 1&ndash;2 anni).
            </p>
            <p className="text-abtg-text leading-relaxed">
              Le call hanno Rho positivo (beneficiano dall&apos;aumento dei tassi), le put hanno Rho negativo.
              In un contesto di tassi alti, le call LEAPS costano di pi&ugrave; rispetto a un mercato a tassi bassi.
            </p>
            <div className="border-l-4 border-abtg-navy pl-3 py-1">
              <p className="text-abtg-muted text-xs"><strong className="text-abtg-navy">Regola operativa:</strong> Se operi su scadenze brevi (&lt;45 giorni), ignora il Rho. Se usi LEAPS, considera l&apos;impatto dei tassi nel tuo costo di posizione totale.</p>
            </div>
          </div>
        </div>
      </Card>

      {/* 3. POP e EV */}
      <Card title="Probabilit&agrave; di Profitto (POP) e Valore Atteso (EV)">
        <div className="space-y-4 text-sm">
          <p className="text-abtg-text leading-relaxed">
            &quot;Questa strategia ha il 75% di probabilit&agrave; di profitto &mdash; come pu&ograve; andare male?&quot;
            Quasi tutti i trader principianti fanno questo errore. Confondono la probabilit&agrave; con la certezza,
            e ignorano quanto perdono quando quella probabilit&agrave; non si verifica.
          </p>

          <div className="space-y-2">
            <h3 className="font-bold text-abtg-navy">Cos&apos;&egrave; la POP</h3>
            <p className="text-abtg-text leading-relaxed">
              La POP (Probability of Profit) stima la probabilit&agrave; che la strategia termini in profitto
              a scadenza. &Egrave; calcolata partendo dalla distribuzione lognormale del sottostante implicita
              nella volatilit&agrave; corrente del mercato.
            </p>
            <p className="text-abtg-text leading-relaxed">
              Esempio: vendi un put spread su META, strike 460/450, incassando $1,80 di credito.
              Il tuo break-even &egrave; a $458,20. La POP dice 72%: il mercato stima 72 probabilit&agrave;
              su 100 che META resti sopra $458,20 alla scadenza.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-abtg-navy">Cosa NON &egrave; la POP &mdash; e perch&eacute; brucia i conti</h3>
            <ul className="space-y-1 list-disc list-inside text-abtg-text">
              <li className="text-abtg-loss">Non &egrave; una garanzia: su 100 trade con POP 72%, 28 vanno male</li>
              <li className="text-abtg-loss">Non dice quanto perdi quando va male: spesso la perdita massima &egrave; 3&ndash;5x il credito incassato</li>
              <li className="text-abtg-loss">Non &egrave; stabile: la POP cambia ogni giorno con il prezzo e la IV</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-abtg-navy">Cos&apos;&egrave; l&apos;Expected Value (EV)</h3>
            <p className="text-abtg-text leading-relaxed">
              L&apos;EV &egrave; il profitto medio atteso su ogni singolo trade, pesato per tutte le probabilit&agrave; di
              outcome. In un mercato efficiente tende a zero. Ma &egrave; lo strumento giusto per
              <strong className="text-abtg-navy"> confrontare</strong> strategie diverse sullo stesso sottostante.
            </p>
            <p className="text-abtg-text leading-relaxed">
              Esempio con numeri: vendi iron condor, credito $1,20, perdita massima $3,80, POP 68%.
            </p>
            <ul className="space-y-1 text-abtg-text list-none ml-2">
              <li>EV = (0,68 &times; $1,20) &minus; (0,32 &times; $3,80) = <strong className="text-abtg-profit">$0,816</strong> &minus; <strong className="text-abtg-loss">$1,216</strong> = <strong className="text-abtg-loss">&minus;$0,40</strong></li>
            </ul>
            <p className="text-abtg-text leading-relaxed">
              EV negativo non significa che il trade sia sbagliato &mdash; significa che il tuo edge reale
              deve venire da gestione attiva, selezione del timing e uscite disciplinate.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-abtg-navy">Come usare POP ed EV per filtrare le strategie</h3>
            <ul className="space-y-1 list-disc list-inside text-abtg-text">
              <li>Usa la POP per dimensionare il rischio: pi&ugrave; alta la POP, pi&ugrave; basso il credito &mdash; capisce quanto vale davvero quel &quot;vantaggio&quot;</li>
              <li>Confronta EV tra strategie alternative sullo stesso sottostante e scadenza</li>
              <li>Non cercare solo alta POP: cerca il miglior rapporto credito/perdita massima dato il tuo scenario di mercato</li>
            </ul>
          </div>

          <div className="border-l-4 border-abtg-navy pl-4 bg-abtg-navy/5 py-2 rounded-r">
            <p className="text-abtg-navy font-bold text-xs uppercase tracking-wide mb-1">Regola d&apos;oro</p>
            <p className="text-abtg-text">
              POP al 70% con perdita massima 5x il credito &egrave; peggio di POP al 55% con perdita massima 2x il credito.
              Guarda sempre il rapporto rischio/ricompensa insieme alla probabilit&agrave;, non separatamente.
            </p>
          </div>
        </div>
      </Card>

      {/* 4. STRATEGIE MULTI-LEG */}
      <Card title="Strategie Multi-Leg">
        <div className="space-y-2 text-sm mb-5">
          <p className="text-abtg-text leading-relaxed">
            Scegliere la strategia sbagliata per il contesto di mercato &egrave; come usare uno strumento giusto
            nel momento sbagliato. Ogni struttura ha il suo ambiente ideale. Ecco quando usarle,
            i numeri tipici e l&apos;errore che fanno quasi tutti.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 text-sm">

          {/* VERTICAL SPREAD */}
          <div className="space-y-2">
            <h3 className="font-bold text-abtg-navy uppercase tracking-wide text-xs">Vertical Spread</h3>
            <p className="text-abtg-text"><strong>Struttura:</strong> compra e vendi opzioni dello stesso tipo (entrambe call o entrambe put), stessa scadenza, strike diversi.</p>
            <p className="text-abtg-text"><strong>Quando usarla:</strong> hai un bias direzionale moderato. Non vuoi comprare una naked option ma vuoi esposizione direzionale con rischio definito.</p>
            <p className="text-abtg-text">
              <strong>Esempio &mdash; Bull Call Spread:</strong> NVDA a $180. Compri call 180 a $6,50, vendi call 190 a $3,20. Costo netto: $3,30. Profitto massimo: $6,70 (se NVDA &gt; $190 a scadenza). Break-even: $183,30.
            </p>
            <p className="text-abtg-loss text-xs"><strong>Errore comune:</strong> vendere lo spread troppo vicino (spread stretto) per pagare meno, perdendo potenziale di profitto sproporzionatamente.</p>
          </div>

          {/* STRADDLE / STRANGLE */}
          <div className="space-y-2">
            <h3 className="font-bold text-abtg-navy uppercase tracking-wide text-xs">Straddle / Strangle</h3>
            <p className="text-abtg-text"><strong>Struttura:</strong> compra call e put sullo stesso sottostante e scadenza. Straddle: stesso strike (ATM). Strangle: strike OTM (pi&ugrave; economico, richiede movimento maggiore).</p>
            <p className="text-abtg-text"><strong>Quando usarla:</strong> ti aspetti un movimento forte ma non sai la direzione. Tipicamente prima di earnings, dati macro, eventi societari.</p>
            <p className="text-abtg-text">
              <strong>Esempio &mdash; Strangle:</strong> AMZN a $190. Compri call 195 a $3,80 e put 185 a $3,60. Costo totale: $7,40. Devi che AMZN si muova pi&ugrave; di $7,40 in qualsiasi direzione per guadagnare.
            </p>
            <p className="text-abtg-loss text-xs"><strong>Errore comune:</strong> comprare lo straddle il giorno prima degli earnings quando la IV &egrave; gi&agrave; esplosa. L&apos;IV crush post-earnings azzera il guadagno anche con un movimento del 5%.</p>
          </div>

          {/* IRON CONDOR */}
          <div className="space-y-2">
            <h3 className="font-bold text-abtg-navy uppercase tracking-wide text-xs">Iron Condor</h3>
            <p className="text-abtg-text"><strong>Struttura:</strong> 4 legs. Vendi put spread OTM + vendi call spread OTM. Incassi un credito. Profitti se il sottostante rimane nel range tra i due spread venduti.</p>
            <p className="text-abtg-text"><strong>Quando usarla:</strong> mercato laterale, IV alta, bassa aspettativa di movimento direzionale forte. Ideale 30&ndash;45 giorni alla scadenza.</p>
            <p className="text-abtg-text">
              <strong>Esempio:</strong> SPY a $530. Vendi put 515/510 e call 545/550. Credito totale: $1,60. Perdita massima: $3,40. Break-even: $516,60 &ndash; $546,60.
            </p>
            <p className="text-abtg-loss text-xs"><strong>Errore comune:</strong> non gestire quando il prezzo si avvicina a uno dei lati. Aspettare sperando che &quot;torni indietro&quot; trasforma una perdita gestibile in una perdita massima.</p>
          </div>

          {/* BUTTERFLY */}
          <div className="space-y-2">
            <h3 className="font-bold text-abtg-navy uppercase tracking-wide text-xs">Butterfly</h3>
            <p className="text-abtg-text"><strong>Struttura:</strong> 3 strike equidistanti, stesso tipo di opzione. Compri 1 ITM + vendi 2 ATM + compri 1 OTM. Costo basso, profitto massimo al centro.</p>
            <p className="text-abtg-text"><strong>Quando usarla:</strong> ti aspetti che il prezzo resti vicino a un livello preciso a scadenza. Utile su pin trade (opzione vicina a strike magnet) o per scommettere su range stretto con rischio limitato.</p>
            <p className="text-abtg-text">
              <strong>Esempio:</strong> AAPL a $175. Compri call 170, vendi 2 call 175, compri call 180. Costo: $1,50. Profitto massimo: $3,50 se AAPL chiude a $175 a scadenza.
            </p>
            <p className="text-abtg-loss text-xs"><strong>Errore comune:</strong> usare la butterfly come &quot;trade economico&quot; senza avere una visione precisa sul prezzo target. Senza un pin chiaro, la probabilit&agrave; di raggiungere il profitto massimo &egrave; molto bassa.</p>
          </div>
        </div>

        <div className="border-l-4 border-abtg-navy pl-4 bg-abtg-navy/5 py-2 rounded-r mt-5">
          <p className="text-abtg-navy font-bold text-xs uppercase tracking-wide mb-1">Regola d&apos;oro</p>
          <p className="text-abtg-text text-sm">
            Prima di scegliere la strategia, rispondi a 3 domande: (1) Ho un bias direzionale? (2) Mi aspetto che la IV salga o scenda? (3) Quanto tempo ho a disposizione?
            Le risposte determinano la struttura. Non scegliere la strategia per abitudine.
          </p>
        </div>
      </Card>

      {/* 5. 5 ERRORI CHE UCCIDONO I TRADER */}
      <Card title="I 5 Errori che Uccidono il 90% dei Trader di Opzioni">
        <div className="space-y-2 text-sm mb-4">
          <p className="text-abtg-text leading-relaxed">
            Non &egrave; la mancanza di conoscenza che distrugge i conti. Sono gli stessi 5 errori ripetuti
            in modo sistematico, spesso con la certezza di stare facendo la cosa giusta.
          </p>
        </div>

        <div className="space-y-5 text-sm">

          <div className="space-y-1">
            <h3 className="font-bold text-abtg-navy">1. Comprare opzioni OTM &quot;perch&eacute; costano poco&quot;</h3>
            <p className="text-abtg-text">
              Una call strike 200 su un titolo a $170 costa $0,40. Sembra poco rischio. In realt&agrave; stai
              comprando una probabilit&agrave; molto bassa di profitto con Theta che erode il valore ogni giorno.
              Per guadagnare servono un movimento enorme <em>e</em> in poco tempo.
            </p>
            <p className="text-abtg-loss"><strong>Costo reale:</strong> il 90% di queste posizioni scade a zero. Stai pagando lotteria, non costruendo un edge.</p>
            <p className="text-abtg-text"><strong>Come evitarlo:</strong> se vuoi direzionalit&agrave; con rischio limitato, usa uno spread. Non comprare opzioni con Delta inferiore a 0,25 senza una tesi specifica e un piano di uscita temporale.</p>
          </div>

          <div className="space-y-1">
            <h3 className="font-bold text-abtg-navy">2. Ignorare l&apos;IV prima di comprare</h3>
            <p className="text-abtg-text">
              Comprare una call su TSLA il giorno prima degli earnings sembra ovvio se pensi che salir&agrave;.
              Ma se la IV &egrave; al 90% (altissima), stai pagando un premio enorme per la volatilit&agrave; attesa.
              Dopo l&apos;evento la IV crolla al 40% &mdash; e la tua call perde met&agrave; del valore anche se TSLA sale del 4%.
            </p>
            <p className="text-abtg-loss"><strong>Costo reale:</strong> questo fenomeno (IV crush) &egrave; la causa numero uno di perdite nei trade su earnings per i compratori di opzioni.</p>
            <p className="text-abtg-text"><strong>Come evitarlo:</strong> prima di comprare, guarda l&apos;IV Rank (IVR). Sopra 50 significa che la IV &egrave; elevata rispetto alla sua storia &mdash; comprare &egrave; costoso. Considera vendere premium invece.</p>
          </div>

          <div className="space-y-1">
            <h3 className="font-bold text-abtg-navy">3. Non avere un piano di uscita prima di entrare</h3>
            <p className="text-abtg-text">
              Apri un iron condor con credito $1,50. Va bene per 2 settimane, poi il mercato rompe
              verso il lato call. Aspetti. Il giorno dopo rompe di pi&ugrave;. Aspetti ancora.
              Alla fine chiudi con perdita massima ($3,50) invece di gestire a $2,50.
            </p>
            <p className="text-abtg-loss"><strong>Costo reale:</strong> senza regola di stop, ogni posizione perde pi&ugrave; del necessario perch&eacute; la speranza &egrave; un piano.</p>
            <p className="text-abtg-text"><strong>Come evitarlo:</strong> prima di aprire il trade, definisci: (a) a che prezzo esci in perdita (es. 2x il credito), (b) a che % di profitto chiudi prima della scadenza (es. 50% del credito), (c) quale evento ti fa rivedere la posizione.</p>
          </div>

          <div className="space-y-1">
            <h3 className="font-bold text-abtg-navy">4. Over-leveraging &mdash; troppe posizioni rispetto al capitale</h3>
            <p className="text-abtg-text">
              Le opzioni permettono di controllare $10.000 di azioni con $500 di margine. Questo &egrave;
              pericoloso perch&eacute; invita a mettere troppe posizioni. Un mercato avverso simultaneo su
              3&ndash;4 posizioni non correlate abbastanza pu&ograve; fare &ndash;20% del portafoglio in una settimana.
            </p>
            <p className="text-abtg-loss"><strong>Costo reale:</strong> i conti sopravvivono ai singoli trade in perdita. Non sopravvivono a drawdown concentrati che tolgono la capacit&agrave; psicologica di continuare.</p>
            <p className="text-abtg-text"><strong>Come evitarlo:</strong> max 2&ndash;5% del capitale su ogni singola posizione. Su trade ad alto rischio (compro opzioni), max 1&ndash;2%. Calcola il rischio massimo in dollari, non in percentuale del premio pagato.</p>
          </div>

          <div className="space-y-1">
            <h3 className="font-bold text-abtg-navy">5. Confondere simulazione con operativit&agrave; reale</h3>
            <p className="text-abtg-text">
              I risultati teorici di Black-Scholes e i valori del simulatore sono basati su distribuzione
              lognormale del sottostante. Il mercato reale ha code pi&ugrave; spesse (fat tails): eventi rari
              accadono pi&ugrave; spesso di quanto il modello preveda. Un &ndash;10% in un giorno su un titolo
              &egrave; &quot;impossibile&quot; secondo il modello, ma accade.
            </p>
            <p className="text-abtg-loss"><strong>Costo reale:</strong> chi vende opzioni basandosi solo sulle probabilit&agrave; del modello senza considerare il rischio di coda si espone a perdite catastrofiche su eventi rari.</p>
            <p className="text-abtg-text"><strong>Come evitarlo:</strong> usa sempre spread con perdita massima definita, non naked options. Tieni sempre margine di sicurezza tra le posizioni e il capitale totale.</p>
          </div>
        </div>

        <div className="border-l-4 border-abtg-navy pl-4 bg-abtg-navy/5 py-2 rounded-r mt-5">
          <p className="text-abtg-navy font-bold text-xs uppercase tracking-wide mb-1">Regola d&apos;oro</p>
          <p className="text-abtg-text text-sm">
            Il tuo primo obiettivo nelle opzioni non &egrave; guadagnare &mdash; &egrave; non perdere per errori
            evitabili. Proteggere il capitale ti tiene nel gioco abbastanza a lungo da imparare.
          </p>
        </div>
      </Card>

      {/* 6. COME USARE QUESTO STRUMENTO */}
      <Card title="Come Usare Questo Strumento &mdash; Workflow Passo per Passo">
        <div className="space-y-2 text-sm mb-4">
          <p className="text-abtg-text leading-relaxed">
            Lo strumento &egrave; potente solo se sai come leggerlo. Ecco il flusso operativo completo
            dall&apos;idea di trade all&apos;output finale.
          </p>
        </div>

        <div className="space-y-5 text-sm">

          <div className="space-y-1">
            <h3 className="font-bold text-abtg-navy">Step 1 &mdash; Inserisci i dati del sottostante</h3>
            <p className="text-abtg-text">Inserisci il <strong>prezzo spot</strong> attuale del titolo o ETF (es. SPY a $530). Questo &egrave; il punto di partenza di tutti i calcoli.</p>
            <p className="text-abtg-muted text-xs">Fonte consigliata: prezzo bid/ask mid sul tuo broker in orario di mercato aperto. Evita prezzi delayed o after-hours per scadenze brevi.</p>
          </div>

          <div className="space-y-1">
            <h3 className="font-bold text-abtg-navy">Step 2 &mdash; Imposta la Volatilit&agrave; Implicita (IV)</h3>
            <p className="text-abtg-text">La IV &egrave; il parametro pi&ugrave; impattante sul pricing. Inserisci la IV corrente delle opzioni ATM sul tuo broker (in %, es. 22%). Una IV errata rende tutti i calcoli inaffidabili.</p>
            <ul className="space-y-1 list-disc list-inside text-abtg-muted text-xs">
              <li>IV bassa (&lt;20% su SPY): opzioni economiche, buon momento per comprare</li>
              <li>IV alta (&gt;30% su SPY): opzioni care, buon momento per vendere premium</li>
              <li>Controlla sempre la IV specifica della scadenza che stai analizzando (term structure)</li>
            </ul>
          </div>

          <div className="space-y-1">
            <h3 className="font-bold text-abtg-navy">Step 3 &mdash; Scegli i giorni alla scadenza (DTE)</h3>
            <p className="text-abtg-text">Il DTE (Days to Expiration) determina quanto Theta bruci o guadagni ogni giorno. Scenari tipici:</p>
            <ul className="space-y-1 list-disc list-inside text-abtg-text">
              <li><strong>7&ndash;14 DTE:</strong> alto Theta decay, alta esposizione al Gamma. Per chi vende premium vicino alla scadenza</li>
              <li><strong>30&ndash;45 DTE:</strong> il sweet spot per iron condor e spread. Buon equilibrio tra Theta e rischio Gamma</li>
              <li><strong>60&ndash;90 DTE:</strong> pi&ugrave; margine di tempo per aggiustamenti. Adatto a spread direzionali e strutture pi&ugrave; complesse</li>
            </ul>
          </div>

          <div className="space-y-1">
            <h3 className="font-bold text-abtg-navy">Step 4 &mdash; Scegli la strategia in base al tuo bias</h3>
            <ul className="space-y-1 list-disc list-inside text-abtg-text">
              <li><strong>Rialzista moderato + IV alta:</strong> Bull put spread (vendi put OTM, compri put pi&ugrave; OTM)</li>
              <li><strong>Ribassista moderato + IV alta:</strong> Bear call spread</li>
              <li><strong>Laterale + IV alta:</strong> Iron condor o short strangle</li>
              <li><strong>Direzionale forte + IV bassa:</strong> Vertical debit spread o long option</li>
              <li><strong>Evento imminente (earnings) + bias forte:</strong> Vertical debit spread, non naked option</li>
            </ul>
          </div>

          <div className="space-y-1">
            <h3 className="font-bold text-abtg-navy">Step 5 &mdash; Leggi POP, EV e Risk/Reward</h3>
            <p className="text-abtg-text">Dopo aver configurato la strategia, analizza questi 3 numeri insieme:</p>
            <ul className="space-y-1 list-disc list-inside text-abtg-text">
              <li><strong>POP &gt; 60% + R/R accettabile:</strong> trade equilibrato</li>
              <li><strong>POP alta ma R/R 1:5 o peggio:</strong> attenzione &mdash; una singola perdita azzera 4&ndash;5 operazioni vincenti</li>
              <li><strong>EV positivo:</strong> indica che sul lungo periodo questa struttura dovrebbe generare profitto &mdash; ma serve disciplina nel rispettarla</li>
            </ul>
          </div>

          <div className="space-y-1">
            <h3 className="font-bold text-abtg-navy">Step 6 &mdash; Scarica il report e confronta con il broker</h3>
            <p className="text-abtg-text">
              Scarica il report PDF con i parametri della strategia analizzata. Poi apri il tuo broker,
              inserisci la stessa struttura e confronta: premio incassato/pagato, greche, break-even.
              Se i numeri differiscono significativamente, la IV che hai inserito potrebbe non essere accurata.
            </p>
            <p className="text-abtg-muted text-xs">Il report &egrave; uno snapshot teorico. I prezzi reali sul mercato riflettono bid/ask spread, liquidit&agrave; e aggiustamenti del market maker &mdash; usa sempre i dati live del broker per l&apos;ordine finale.</p>
          </div>
        </div>

        <div className="border-l-4 border-abtg-navy pl-4 bg-abtg-navy/5 py-2 rounded-r mt-5">
          <p className="text-abtg-navy font-bold text-xs uppercase tracking-wide mb-1">Regola d&apos;oro</p>
          <p className="text-abtg-text text-sm">
            Usa lo strumento per costruire la logica del trade prima di aprire il broker. Chi apre
            il broker senza un&apos;analisi strutturata opera di impulso. Chi struttura prima e verifica dopo
            opera con metodo.
          </p>
        </div>
      </Card>

      {/* 7. LIMITI DEL MODELLO */}
      <Card title="Limiti del Modello &mdash; Cosa Non Ti Dice il Calcolatore">
        <div className="space-y-4 text-sm">
          <p className="text-abtg-text leading-relaxed">
            Uno strumento che non conosce i propri limiti &egrave; pericoloso. Questo calcolatore usa il
            modello <strong className="text-abtg-navy">Black-Scholes</strong> con alcune ipotesi che nel
            mercato reale non si verificano sempre. Sapere dove il modello sbaglia ti protegge.
          </p>

          <div className="space-y-2">
            <h3 className="font-bold text-abtg-navy">Le ipotesi che il modello assume (e il mercato viola)</h3>
            <ul className="space-y-1 list-disc list-inside text-abtg-text">
              <li><strong>Volatilit&agrave; costante:</strong> il modello usa un&apos;unica IV per tutta la durata. In realt&agrave; la IV cambia ogni giorno e varia per strike (volatility smile/skew)</li>
              <li><strong>Distribuzione lognormale:</strong> il modello sottostima eventi estremi. I mercati reali hanno &quot;code spesse&quot; &mdash; i crolli del &ndash;10% in un giorno avvengono pi&ugrave; spesso di quanto il modello preveda</li>
              <li><strong>Nessun dividendo / costo di finanziamento:</strong> i dividendi influenzano il valore delle opzioni americane, in particolare per l&apos;early exercise</li>
              <li><strong>Mercato liquido e continuo:</strong> in realt&agrave; su titoli poco liquidi il bid/ask spread pu&ograve; divorare tutto il vantaggio teorico</li>
              <li><strong>Esercizio solo a scadenza:</strong> Black-Scholes &egrave; un modello europeo. Per opzioni americane deep ITM il prezzo teorico pu&ograve; divergere dall&apos;early exercise premium reale</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-abtg-navy">Come cross-checkare con il tuo broker</h3>
            <ul className="space-y-1 list-disc list-inside text-abtg-text">
              <li>Confronta le greche dello strumento con le greche mostrate nella catena opzioni del tuo broker (ThinkorSwim, IBKR, Tastytrade)</li>
              <li>Se il Delta o Theta differisce di pi&ugrave; del 10&ndash;15%, verifica che la IV inserita corrisponda alla IV ATM della scadenza selezionata</li>
              <li>Per iron condor e butterfly, confronta il profitto/perdita massima teorica con quello mostrato nel ticket dell&apos;ordine &mdash; devono coincidere entro pochi centesimi</li>
              <li>Su titoli con dividendi imminenti, considera che la call deep ITM potrebbe avere un valore di early exercise non catturato dal modello</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-abtg-navy">Disclaimer operativo</h3>
            <p className="text-abtg-text leading-relaxed">
              Questo strumento &egrave; <strong className="text-abtg-navy">esclusivamente didattico</strong>.
              I valori teorici prodotti non costituiscono consulenza finanziaria, segnali operativi
              o garanzia di risultati. I mercati finanziari comportano rischio di perdita del capitale
              investito. Prima di operare con strumenti derivati verifica sempre la tua propensione
              al rischio e consulta un professionista abilitato.
            </p>
            <p className="text-abtg-text leading-relaxed">
              I prezzi reali sul mercato riflettono fattori non catturati dal modello: liquidit&agrave;,
              bid/ask spread, aggiustamenti dei market maker, eventi societari e macro. Usa sempre
              i dati live del tuo broker per qualsiasi decisione operativa.
            </p>
          </div>

          <div className="border-l-4 border-abtg-navy pl-4 bg-abtg-navy/5 py-2 rounded-r">
            <p className="text-abtg-navy font-bold text-xs uppercase tracking-wide mb-1">Regola d&apos;oro</p>
            <p className="text-abtg-text">
              Il modello ti dice dove dovresti essere. Il mercato ti dice dove sei. La differenza tra i due &egrave; il tuo lavoro come trader.
              Usa il calcolatore per costruire il ragionamento, il broker per eseguirlo.
            </p>
          </div>
        </div>
      </Card>

    </div>
  );
}
