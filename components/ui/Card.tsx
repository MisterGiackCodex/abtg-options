import { type ReactNode } from "react";

export function Card({
  title,
  children,
  className = "",
  elevated = false,
  padding = "p-6",
}: {
  title?: string;
  children: ReactNode;
  className?: string;
  elevated?: boolean;
  /** Override internal padding. Defaults to "p-6". Pass "p-4" for compact cards. */
  padding?: string;
}) {
  return (
    <div className={`abtg-card ${padding} ${elevated ? "shadow-elevated" : ""} ${className}`}>
      {title && (
        <h3 className="text-xs uppercase tracking-widest text-abtg-navy font-bold mb-3 pb-2.5 border-b border-abtg-border">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}
