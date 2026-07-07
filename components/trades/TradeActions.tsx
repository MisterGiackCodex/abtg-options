"use client";
import { useRef } from "react";

interface TradeActionsProps {
  onImportJSON: (json: string) => void;
  onExportJSON: () => string;
  onExportCSV: () => string;
}

function downloadFile(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function TradeActions({ onImportJSON, onExportJSON, onExportCSV }: TradeActionsProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        onImportJSON(reader.result as string);
      } catch (err) {
        alert(`Errore importazione: ${err instanceof Error ? err.message : err}`);
      }
    };
    reader.readAsText(file);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="flex gap-2 flex-wrap">
      <input ref={fileRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
      <button className="abtg-btn text-xs" onClick={() => fileRef.current?.click()}>
        Importa JSON
      </button>
      <button
        className="abtg-btn text-xs"
        onClick={() => downloadFile(onExportJSON(), `abtg-trades-${new Date().toISOString().slice(0, 10)}.json`, "application/json")}
      >
        Esporta JSON
      </button>
      <button
        className="abtg-btn text-xs"
        onClick={() => downloadFile(onExportCSV(), `abtg-trades-${new Date().toISOString().slice(0, 10)}.csv`, "text/csv")}
      >
        Esporta CSV
      </button>
    </div>
  );
}
