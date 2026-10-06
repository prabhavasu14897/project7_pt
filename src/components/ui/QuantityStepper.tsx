"use client";

import { cn } from "@/lib/cn";
import { Icon } from "./Icon";

interface QuantityStepperProps {
  /** Group label, e.g. "Quantity". */
  label: string;
  /** Keep the label for screen readers only, e.g. inside a cart row. */
  hideLabel?: boolean;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  decreaseLabel: string;
  increaseLabel: string;
  disabled?: boolean;
  className?: string;
}

const buttonClass = cn(
  "inline-flex size-11 items-center justify-center text-text transition-colors duration-150",
  "hover:bg-surface-muted disabled:cursor-not-allowed disabled:text-text-subtle disabled:hover:bg-transparent",
);

/** − value + control with 44px targets. The current value is announced politely as it changes. */
export function QuantityStepper({
  label,
  hideLabel = false,
  value,
  onChange,
  min = 1,
  max = 10,
  decreaseLabel,
  increaseLabel,
  disabled = false,
  className,
}: QuantityStepperProps) {
  return (
    <div role="group" aria-label={label} className={cn("flex items-center gap-3", className)}>
      <span className={cn("text-sm font-semibold text-text-muted", hideLabel && "sr-only")}>{label}</span>
      <div className="inline-flex items-center overflow-hidden rounded-md border border-border bg-surface">
        <button
          type="button"
          className={buttonClass}
          aria-label={decreaseLabel}
          disabled={disabled || value <= min}
          onClick={() => onChange(Math.max(min, value - 1))}
        >
          <Icon name="minus" size={18} />
        </button>
        <output aria-live="polite" className="min-w-10 text-center text-body font-bold text-text tabular">
          {value}
        </output>
        <button
          type="button"
          className={buttonClass}
          aria-label={increaseLabel}
          disabled={disabled || value >= max}
          onClick={() => onChange(Math.min(max, value + 1))}
        >
          <Icon name="plus" size={18} />
        </button>
      </div>
    </div>
  );
}
