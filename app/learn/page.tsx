import { Card } from "@/components/ui/Card";

export default function LearnPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-abtg-navy">Impara — Opzioni Americane</h1>
        <p className="text-abtg-muted mt-1 text-sm">Guida rapida ai concetti fondamentali per operare con consapevolezza.</p>
      </div>

      <Card title="Cosa Sono le Opzioni Americane">
        <p className="text-sm text-abtg-text leading-relaxed">
          Un&apos;opzione americana può essere esercitata <strong className="text-abtg-navy">in qualunque momento</strong> prima della scadenza, a differenza delle opzioni europee che si esercitano solo alla data di scadenza.
          Gran parte delle opzioni su azioni USA (equity options) sono di stile americano. Futures options e alcuni ETF (es. SPX) sono invece europee.
        </p>
      </Card>

      <Card title="Le Greche in Breve">
        <ul className="space-y-3 text-sm">
          <li><strong className="text-abtg-navy">Delta (Δ)</strong> — Variazione del prezzo dell&apos;opzione per ogni $1 di movimento del sottostante. Long call: 0 a +1. Long put: -1 a 0.</li>
          <li><strong className="text-abtg-navy">Gamma (Γ)</strong> — Velocità di variazione del delta. Massimo ATM, cala ITM/OTM.</li>
          <li><strong className="text-abtg-navy">Theta (Θ)</strong> — Decadimento temporale giornaliero. Nemico del compratore, amico del venditore.</li>
          <li><strong className="text-abtg-navy">Vega (ν)</strong> — Sensibilità a variazioni di volatilità implicita (per 1% di IV).</li>
          <li><strong className="text-abtg-navy">Rho (ρ)</strong> — Sensibilità ai tassi di interesse (per 1%). Rilevante su scadenze lunghe.</li>
        </ul>
      </Card>

      <Card title="Probability of Profit (POP) ed Expected Value (EV)">
        <p className="text-sm leading-relaxed">
          <strong className="text-abtg-navy">POP</strong> stima la probabilità che la strategia termini in profitto a scadenza, assumendo che il prezzo del sottostante segua una distribuzione <em>lognormale</em> risk-neutral.
          È calcolata integrando la densità di probabilità sulle zone in cui il payoff è positivo.
        </p>
        <p className="text-sm leading-relaxed mt-3">
          <strong className="text-abtg-navy">Expected Value</strong> è il profitto medio atteso a scadenza sotto la stessa distribuzione.
          In un mercato efficiente è vicino a zero al netto dei costi — serve a confrontare strategie, non a prevedere profitti.
        </p>
      </Card>

      <Card title="Strategie Multi-Leg">
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="text-abtg-navy font-bold mb-1 uppercase tracking-wide text-xs">Vertical Spread</h4>
            <p className="text-abtg-muted">Due opzioni stesso tipo, stesso expiry, strike diversi. Rischio e profitto limitati. Debit o credit.</p>
          </div>
          <div>
            <h4 className="text-abtg-navy font-bold mb-1 uppercase tracking-wide text-xs">Straddle / Strangle</h4>
            <p className="text-abtg-muted">Long call + long put: profitto su forti movimenti in qualunque direzione. Strangle usa strike OTM (più economico).</p>
          </div>
          <div>
            <h4 className="text-abtg-navy font-bold mb-1 uppercase tracking-wide text-xs">Iron Condor</h4>
            <p className="text-abtg-muted">4 legs: vendi put spread OTM e call spread OTM. Profitto se il prezzo resta nel range centrale.</p>
          </div>
          <div>
            <h4 className="text-abtg-navy font-bold mb-1 uppercase tracking-wide text-xs">Butterfly</h4>
            <p className="text-abtg-muted">3 strike equidistanti. Profitto massimo se il prezzo scade esattamente al centro.</p>
          </div>
        </div>
      </Card>

      <Card title="Limiti del Modello">
        <p className="text-sm leading-relaxed text-abtg-muted">
          Il pricing usa Black-Scholes, che assume esercizio solo a scadenza (opzioni europee). Per opzioni americane su sottostanti che pagano dividendi il prezzo teorico può differire dall&apos;early exercise premium.
          Questo strumento è <strong className="text-abtg-text">esclusivamente didattico</strong>: per operatività reale usa dati di mercato live e verifica le Greche sul book del tuo broker.
        </p>
      </Card>
    </div>
  );
}
