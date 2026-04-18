"use client";
import { type ChangeEvent } from "react";

export function NumberField({
  label, value, onChange, step = 0.01, min, max, suffix,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
  min?: number;
  max?: number;
  suffix?: string;
}) {
  return (
    <div>
      <label className="abtg-label">{label}{suffix ? ` (${suffix})` : ""}</label>
      <input
        type="number"
        className="abtg-input"
        value={Number.isFinite(value) ? value : 0}
        step={step}
        min={min}
        max={max}
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          const v = parseFloat(e.target.value);
          onChange(Number.isFinite(v) ? v : 0);
        }}
      />
    </div>
  );
}
