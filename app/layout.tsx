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
        <header className="border-b border-abtg-border bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <a href="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-abtg-navy text-white font-black grid place-items-center text-sm">A</div>
              <div>
                <div className="text-abtg-navy font-bold tracking-wide text-base">ABTG Options</div>
                <div className="text-xs text-abtg-muted">Opzioni Americane — Strumento Professionale</div>
              </div>
            </a>
            <nav className="flex gap-6 text-sm">
              <a href="/" className="text-abtg-muted hover:text-abtg-navy transition font-medium">Dashboard</a>
              <a href="/trades" className="text-abtg-muted hover:text-abtg-navy transition font-medium">Trade Manager</a>
              <a href="/learn" className="text-abtg-muted hover:text-abtg-navy transition font-medium">Impara</a>
            </nav>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>
        <footer className="border-t border-abtg-border mt-12 bg-white">
          <div className="max-w-7xl mx-auto px-6 py-5 text-xs text-abtg-muted">
            <strong className="text-abtg-text">Disclaimer:</strong> Questo strumento è solo a scopo didattico e non costituisce consulenza finanziaria.
            I calcoli utilizzano il modello Black-Scholes e assunzioni lognormali risk-neutral; i risultati reali possono differire.
            © Alfio Bardolla Training Group — strumento didattico.
          </div>
        </footer>
      </body>
    </html>
  );
}
