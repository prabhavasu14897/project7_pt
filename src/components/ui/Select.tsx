"use client";

import { useId } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "./Icon";

export interface SelectOption<T extends string = string> {
  value: T;
  label: string;
}

interface SelectProps<T extends string> {
  label: string;
  /** Keep the label for screen readers only, e.g. in a compact filter row. */
  hideLabel?: boolean;
  /** `stacked` puts the label above the field, for form layouts. */
  layout?: "inline" | "stacked";
  value: T;
  options: readonly SelectOption<T>[];
  onChange: (value: T) => void;
  className?: string;
}

/** Native select styled to the control vocabulary: keyboard, screen-reader and mobile pickers work for free. */
export function Select<T extends string>({
  label,
  hideLabel = false,
  layout = "inline",
  value,
  options,
  onChange,
  className,
}: SelectProps<T>) {
  const id = useId();
  return (
    <div className={cn(layout === "stacked" ? "flex flex-col gap-1.5" : "flex items-center gap-2", className)}>
      <label
        htmlFor={id}
        className={cn("shrink-0 text-sm font-semibold", layout === "stacked" ? "text-text" : "text-text-muted", hideLabel && "sr-only")}
      >
        {label}
      </label>
      <div className={cn("relative min-w-0", layout === "inline" && "flex-1")}>
        <select
          id={id}
          value={value}
          onChange={(event) => {
            const next = options.find((option) => option.value === event.target.value);
            if (next) onChange(next.value);
          }}
          className={cn(
            "h-11 w-full cursor-pointer appearance-none truncate rounded-md border border-border bg-surface pl-3.5 pr-9 text-sm font-semibold text-text",
            "transition-colors duration-150 hover:border-border-strong",
            "focus:outline-none focus-visible:border-primary-dark focus-visible:ring-3 focus-visible:ring-primary-soft",
          )}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <Icon
          name="chevron-down"
          size={16}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-muted"
        />
      </div>
    </div>
  );
}
