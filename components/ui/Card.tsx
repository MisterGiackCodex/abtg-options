import { type ReactNode } from "react";

export function Card({
  title,
  children,
  className = "",
  elevated = false,
}: {
  title?: string;
  children: ReactNode;
  className?: string;
  elevated?: boolean;
}) {
  return (
    <div className={`abtg-card p-6 ${elevated ? "shadow-elevated" : ""} ${className}`}>
      {title && (
        <h3 className="text-xs uppercase tracking-widest text-abtg-navy font-bold mb-4 pb-3 border-b border-abtg-border">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}
