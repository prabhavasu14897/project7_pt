"use client";

import { useId } from "react";
import { cn } from "@/lib/cn";

interface SwitchProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** Shown instead of the description when the setting can't be changed. */
  lockedNote?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * A labelled on/off setting. The whole row is the control (role="switch"), so the tap target is the row,
 * and the state is announced as on/off, never shown by colour alone: the knob moves and the track fills.
 */
export function Switch({ label, description, checked, onChange, lockedNote, disabled, className }: SwitchProps) {
  const descriptionId = useId();
  const note = lockedNote ?? description;
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-describedby={note ? descriptionId : undefined}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "flex min-h-14 w-full items-center gap-4 rounded-md py-3 text-left transition-colors duration-150",
        disabled ? "cursor-not-allowed" : "cursor-pointer",
        className,
      )}
    >
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-sm font-semibold text-text sm:text-body">{label}</span>
        {note && (
          <span id={descriptionId} className="text-sm text-text-muted">
            {note}
          </span>
        )}
      </span>
      <span
        aria-hidden="true"
        className={cn(
          "relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border transition-colors duration-150",
          checked ? "border-primary-dark bg-primary-dark" : "border-border-strong bg-surface-muted",
          disabled && "opacity-60",
        )}
      >
        <span
          className={cn(
            "absolute size-5 rounded-full bg-surface shadow-card transition-transform duration-150 motion-reduce:transition-none",
            checked ? "translate-x-6" : "translate-x-1",
          )}
        />
      </span>
    </button>
  );
}
