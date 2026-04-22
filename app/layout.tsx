import type { Metadata } from "next";
import Image from "next/image";
import "./globals.css";

export const metadata: Metadata = {
  title: "ABTG Options Visualizer",
  description: "Visualizzatore di strategie su opzioni americane — Alfio Bardolla Training Group",
  icons: {
    icon: [
      { url: "/logo-abtg.svg", type: "image/svg+xml" },
    ],
    shortcut: "/logo-abtg.svg",
    apple: "/logo-abtg.svg",
  },
  openGraph: {
    title: "ABTG Options Visualizer",
    description: "Visualizzatore di strategie su opzioni americane",
    images: ["/logo-abtg.svg"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body>
        <header className="border-b border-abtg-border bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <a href="/" className="flex items-center gap-3">
              <Image src="/logo-abtg.svg" alt="ABTG" width={40} height={40} className="h-10 w-10 rounded-md" priority />
              <div className="text-abtg-navy font-bold tracking-wide text-base">ABTG Options Visualizer</div>
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
