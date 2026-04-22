import type { Metadata } from "next";
import Image from "next/image";
import { Roboto } from "next/font/google";
import "./globals.css";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  variable: "--font-roboto",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ABTG Option Tools — Vedi cosa succede prima di premere invio",
  description: "Vedi esattamente cosa succede alla tua strategia prima di premere invio.",
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
    <html lang="it" className={roboto.variable}>
      <body className="font-sans">
        <header className="border-b border-abtg-border bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
            <a href="/" className="flex items-center gap-3 min-w-0">
              <Image src="/logo-abtg.svg" alt="ABTG Option Tools" width={40} height={40} className="h-10 w-10 rounded-md shrink-0" priority />
              <div className="min-w-0">
                <div className="text-abtg-navy font-black tracking-tight text-xl leading-none">ABTG Option Tools</div>
                <div className="text-[11px] text-abtg-muted font-normal leading-tight mt-1 hidden sm:block">
                  Vedi esattamente cosa succede alla tua strategia prima di premere invio.
                </div>
              </div>
            </a>
            <nav className="flex gap-5 text-sm">
              <a href="/" className="text-abtg-muted hover:text-abtg-navy transition font-medium">Dashboard</a>
              <a href="/trades" className="text-abtg-muted hover:text-abtg-navy transition font-medium">Trade Manager</a>
              <a href="/learn" className="text-abtg-muted hover:text-abtg-navy transition font-medium">Impara</a>
            </nav>
          </div>
        </header>
        <main className="max-w-[1600px] mx-auto px-4 md:px-6 py-6">{children}</main>
        <footer className="border-t border-abtg-border mt-12 bg-white">
          <div className="max-w-7xl mx-auto px-6 py-5 text-xs text-abtg-muted">
            <strong className="text-abtg-text">Disclaimer:</strong> Questo strumento è solo a scopo didattico e non costituisce consulenza finanziaria.
            I calcoli utilizzano il modello Black-Scholes e assunzioni lognormali risk-neutral; i risultati reali possono differire.
            © ABTG Option Tools — strumento didattico di Alfio Bardolla Training Group.
          </div>
        </footer>
      </body>
    </html>
  );
}
