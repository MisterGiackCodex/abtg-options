"use client";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { TradeList } from "@/components/trades/TradeList";
import { TradeActions } from "@/components/trades/TradeActions";
import { useTrades } from "@/hooks/useTrades";

export default function TradesPage() {
  const router = useRouter();
  const { trades, deleteTrade, closeTrade, importJSON, exportJSON, exportCSV } = useTrades();

  const defaultCtx = { S: 100, T: 30 / 365, r: 0.045, sigma: 0.3 };

  const handleClose = (id: string) => {
    if (!confirm("Confermi la chiusura di questo trade? I prezzi verranno registrati ai valori correnti di mercato.")) return;
    const trade = trades.find((t) => t.id === id);
    if (!trade) return;
    const closePrices: Record<string, number> = {};
    for (const leg of trade.legs) {
      closePrices[leg.id] = leg.currentPremium;
    }
    closeTrade(id, closePrices);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Sei sicuro di voler eliminare definitivamente questo trade?")) return;
    deleteTrade(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-abtg-navy">Trade Manager</h1>
          <p className="text-sm text-abtg-muted mt-1">
            {trades.length} trade totali · {trades.filter((t) => t.status === "open").length} aperti
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <a href="/" className="abtg-btn-navy text-xs px-4 py-2 rounded-lg">+ Nuovo Trade</a>
          <TradeActions onImportJSON={importJSON} onExportJSON={exportJSON} onExportCSV={exportCSV} />
        </div>
      </div>

      <Card title="Le Tue Operazioni">
        <TradeList
          trades={trades}
          defaultCtx={defaultCtx}
          onSelect={(id) => router.push(`/trades/${id}`)}
          onDelete={handleDelete}
          onClose={handleClose}
        />
      </Card>
    </div>
  );
}
