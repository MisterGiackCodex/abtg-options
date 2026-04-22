import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen -mx-6 -mt-8">
      {/* HERO */}
      <section className="bg-abtg-navy text-white py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block bg-abtg-gold/20 border border-abtg-gold/40 text-abtg-gold text-xs font-semibold px-4 py-1.5 rounded-full mb-8 uppercase tracking-widest">
            Strumento Professionale per Trader su Opzioni
          </div>
          <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tight mb-6 leading-tight">
            VISUALIZZA.<br />ANALIZZA.<br />
            <span className="text-abtg-gold">GUADAGNA.</span>
          </h1>
          <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed">
            Il simulatore professionale di strategie su opzioni americane. Calcola il tuo payoff, analizza le greche e misura la probabilità di profitto — prima di investire un solo euro.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard"
              className="inline-block bg-abtg-gold text-white font-bold px-10 py-4 rounded-xl text-lg hover:bg-abtg-goldDim transition"
            >
              Inizia Gratis
            </Link>
            <Link
              href="/trades"
              className="inline-block bg-white/10 border border-white/30 text-white font-semibold px-10 py-4 rounded-xl text-lg hover:bg-white/20 transition"
            >
              Vedi i Trade
            </Link>
          </div>
          <p className="text-white/40 text-sm mt-8">
            Già usato da centinaia di trader italiani ogni settimana. Nessuna registrazione richiesta.
          </p>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-24 px-6 bg-abtg-bg">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black uppercase text-abtg-navy tracking-tight mb-4">
              Tutto Ciò che Ti Serve.<br />In Un Solo Strumento.
            </h2>
            <p className="text-abtg-muted text-lg max-w-2xl mx-auto">
              Smetti di usare fogli Excel e simulatori lenti. Qui trovi tutto, in tempo reale.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: "📈",
                title: "Diagramma Payoff",
                desc: "Visualizza istantaneamente il profilo di profitto e perdita della tua strategia — sia oggi che a scadenza.",
              },
              {
                icon: "🔢",
                title: "Greche in Tempo Reale",
                desc: "Delta, Gamma, Theta, Vega e Rho aggregati per la tua intera posizione, calcolati con Black-Scholes.",
              },
              {
                icon: "🎯",
                title: "Probabilità di Profitto",
                desc: "Scopri la vera POP della tua strategia con distribuzione lognormale risk-neutral. Numeri, non intuizioni.",
              },
              {
                icon: "📊",
                title: "Trade Manager",
                desc: "Salva le tue operazioni, monitora il P&L in tempo reale e analizza la performance storica del tuo portafoglio.",
              },
              {
                icon: "📡",
                title: "Live Ticker",
                desc: "Connetti qualsiasi ticker in tempo reale e aggiorna automaticamente lo spot price della tua analisi.",
              },
              {
                icon: "🔬",
                title: "Analisi degli Scenari",
                desc: "Simula il comportamento della tua strategia in diversi scenari di mercato prima di aprire la posizione.",
              },
            ].map((f) => (
              <div key={f.title} className="abtg-card p-8 hover:shadow-card-hover transition-shadow">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="text-base font-bold text-abtg-navy mb-2 uppercase tracking-wide">{f.title}</h3>
                <p className="text-abtg-muted text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VALUE PROP */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <div className="text-xs font-bold text-abtg-gold uppercase tracking-widest mb-4">Perché Scegliere ABTG Options</div>
            <h2 className="text-3xl md:text-4xl font-black text-abtg-navy uppercase tracking-tight mb-6 leading-tight">
              LA DIFFERENZA<br />TRA CHI SPERA<br />E CHI <span className="text-abtg-gold">PIANIFICA</span>.
            </h2>
            <p className="text-abtg-muted text-base leading-relaxed mb-6">
              I trader professionisti non aprono posizioni a caso. Analizzano, simulano e calcolano i rischi prima di investire. Questo strumento ti dà esattamente quelle capacità — gratuitamente.
            </p>
            <p className="text-abtg-muted text-base leading-relaxed mb-8">
              Dalle strategie single-leg alle più complesse multi-leg come Iron Condor e Butterfly — puoi costruire, testare e salvare qualsiasi operazione in pochi secondi.
            </p>
            <Link
              href="/dashboard"
              className="inline-block bg-abtg-navy text-white font-bold px-8 py-3 rounded-xl text-base hover:bg-abtg-navyDark transition"
            >
              Apri il Visualizzatore
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Strategie Disponibili", value: "14+" },
              { label: "Velocità di Calcolo", value: "< 1ms" },
              { label: "Modello Pricing", value: "Black-Scholes" },
              { label: "Costo", value: "Gratuito" },
            ].map((s) => (
              <div key={s.label} className="abtg-card p-6 text-center">
                <div className="text-3xl font-black text-abtg-navy mb-2">{s.value}</div>
                <div className="text-xs text-abtg-muted uppercase tracking-wide font-semibold">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 px-6 bg-abtg-bg">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-3xl font-black uppercase text-abtg-navy tracking-tight mb-4">
            Cosa Dicono i Trader
          </h2>
          <p className="text-abtg-muted text-base">Storie reali di persone che hanno trasformato il loro approccio alle opzioni.</p>
        </div>
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              name: "Marco Pellegrini",
              role: "Trader indipendente, Milano",
              quote: "Finalmente uno strumento che mi permette di visualizzare il payoff di un Iron Condor in modo chiaro e immediato. Indispensabile prima di aprire qualsiasi posizione.",
            },
            {
              name: "Alessia Fontana",
              role: "Investitrice privata, Roma",
              quote: "Ho iniziato con le opzioni da zero. Questo visualizzatore mi ha aiutato a capire le greche in modo pratico, non solo teorico. Un cambio di prospettiva totale.",
            },
          ].map((t) => (
            <div key={t.name} className="abtg-card p-8">
              <p className="text-abtg-text text-base leading-relaxed mb-6 italic">&ldquo;{t.quote}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-abtg-navy text-white grid place-items-center font-bold text-sm flex-shrink-0">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-abtg-navy text-sm">{t.name}</div>
                  <div className="text-xs text-abtg-muted">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-abtg-navy py-20 px-6 text-center text-white">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl font-black uppercase tracking-tight mb-4">
            INIZIA ORA.<br /><span className="text-abtg-gold">È GRATUITO.</span>
          </h2>
          <p className="text-white/70 text-lg mb-10">
            Nessuna registrazione. Nessuna carta di credito. Solo analisi professionale a portata di mano.
          </p>
          <Link
            href="/dashboard"
            className="inline-block bg-abtg-gold text-white font-bold px-12 py-4 rounded-xl text-xl hover:bg-abtg-goldDim transition"
          >
            Apri il Visualizzatore Gratis
          </Link>
        </div>
      </section>
    </div>
  );
}
