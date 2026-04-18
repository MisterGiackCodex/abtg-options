import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ABTG Options Visualizer",
  description: "Visualizzatore di strategie su opzioni americane — Alfio Bardolla Training Group",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body>
        <header className="border-b border-abtg-border bg-abtg-surface">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded bg-abtg-gold text-abtg-bg font-black grid place-items-center">A</div>
              <div>
                <div className="text-abtg-gold font-bold tracking-wide">ABTG Options Visualizer</div>
                <div className="text-xs text-abtg-muted">Opzioni Americane — Strumento didattico</div>
              </div>
            </div>
            <nav className="flex gap-4 text-sm">
              <a href="/" className="text-abtg-text hover:text-abtg-gold transition">Dashboard</a>
              <a href="/trades" className="text-abtg-text hover:text-abtg-gold transition">Trades</a>
              <a href="/learn" className="text-abtg-text hover:text-abtg-gold transition">Impara</a>
            </nav>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-6 py-6">{children}</main>
        <footer className="border-t border-abtg-border mt-10 bg-abtg-surface">
          <div className="max-w-7xl mx-auto px-6 py-4 text-xs text-abtg-muted">
            <strong className="text-abtg-text">Disclaimer:</strong> Questo strumento e solo a scopo didattico e non costituisce consulenza finanziaria.
            I calcoli usano il modello Black-Scholes e assunzioni lognormali risk-neutral; i risultati reali possono differire.
            © Alfio Bardolla Training Group — fork didattico.
          </div>
        </footer>
      </body>
    </html>
  );
}
