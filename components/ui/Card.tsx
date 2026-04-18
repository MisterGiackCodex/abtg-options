import { type ReactNode } from "react";

export function Card({ title, children, className = "" }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <div className={`abtg-card p-4 ${className}`}>
      {title && <h3 className="text-sm uppercase tracking-wider text-abtg-gold mb-3 font-semibold">{title}</h3>}
      {children}
    </div>
  );
}
