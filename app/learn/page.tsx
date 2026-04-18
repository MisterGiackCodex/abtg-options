import { Card } from "@/components/ui/Card";

export default function LearnPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-abtg-gold">Impara — Opzioni Americane</h1>

      <Card title="Cosa sono le opzioni americane">
        <p className="text-sm text-abtg-text leading-relaxed">
          Un'opzione americana puo essere esercitata <strong>in qualunque momento</strong> prima della scadenza, a differenza delle opzioni europee che si esercitano solo alla data di scadenza.
          Gran parte delle opzioni su azioni USA (equity options) sono di stile americano. Futures options e alcuni ETF (es. SPX) sono invece europee.
        </p>
      </Card>

      <Card title="Le Greche in breve">
        <ul className="space-y-2 text-sm">
          <li><strong className="text-abtg-gold">Delta (Δ)</strong> — Variazione del prezzo dell'opzione per ogni $1 di movimento del sottostante. Long call: 0 a +1. Long put: -1 a 0.</li>
          <li><strong className="text-abtg-gold">Gamma (Γ)</strong> — Velocita di variazione del delta. Massimo ATM, cala ITM/OTM.</li>
          <li><strong className="text-abtg-gold">Theta (Θ)</strong> — Decadimento temporale giornaliero. Nemico del compratore, amico del venditore.</li>
          <li><strong className="text-abtg-gold">Vega (ν)</strong> — Sensibilita a variazioni di volatilita implicita (per 1% di IV).</li>
          <li><strong className="text-abtg-gold">Rho (ρ)</strong> — Sensibilita ai tassi di interesse (per 1%). Rilevante su scadenze lunghe.</li>
        </ul>
      </Card>

      <Card title="Probability of Profit (POP) ed Expected Value (EV)">
        <p className="text-sm leading-relaxed">
          <strong className="text-abtg-gold">POP</strong> stima la probabilita che la strategia termini in profitto a scadenza, assumendo che il prezzo del sottostante segua una distribuzione <em>lognormale</em> risk-neutral.
          E calcolata integrando la densita di probabilita sulle zone in cui il payoff e positivo.
        </p>
        <p className="text-sm leading-relaxed mt-2">
          <strong className="text-abtg-gold">Expected Value</strong> e il profitto medio atteso a scadenza sotto la stessa distribuzione.
          In un mercato efficiente e vicino a zero al netto dei costi — serve a confrontare strategie, non a prevedere profitti.
        </p>
      </Card>

      <Card title="Strategie Multi-Leg">
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="text-abtg-gold font-semibold mb-1">Vertical Spread</h4>
            <p>Due opzioni stesso tipo, stesso expiry, strike diversi. Rischio e profitto limitati. Debit o credit.</p>
          </div>
          <div>
            <h4 className="text-abtg-gold font-semibold mb-1">Straddle / Strangle</h4>
            <p>Long call + long put: profitto su forti movimenti in qualunque direzione. Strangle usa strike OTM (piu economico).</p>
          </div>
          <div>
            <h4 className="text-abtg-gold font-semibold mb-1">Iron Condor</h4>
            <p>4 legs: vendi put spread OTM e call spread OTM. Profitto se il prezzo resta nel range centrale.</p>
          </div>
          <div>
            <h4 className="text-abtg-gold font-semibold mb-1">Butterfly</h4>
            <p>3 strike equidistanti. Profitto massimo se il prezzo scade esattamente al centro.</p>
          </div>
        </div>
      </Card>

      <Card title="Limiti del modello">
        <p className="text-sm leading-relaxed">
          Il pricing usa Black-Scholes, che assume esercizio solo a scadenza (opzioni europee). Per opzioni americane su sottostanti che pagano dividendi il prezzo teorico puo differire dall'early exercise premium.
          Questo strumento e <strong>didattico</strong>: per operativita reale usa dati di mercato live e verifica le Greche sul book del tuo broker.
        </p>
      </Card>
    </div>
  );
}
