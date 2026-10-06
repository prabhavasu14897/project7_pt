"use client";

import { useId } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";

interface LocationPickerProps {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
  /** `compact` shows just the city (mobile header); `full` adds the state. */
  display?: "compact" | "full";
  className?: string;
}

function cityOf(location: string): string {
  return location.split(",")[0]?.trim() ?? location;
}

/** Native select styled as a pill: keyboard, screen reader and mobile pickers work for free. */
export function LocationPicker({ label, value, options, onChange, display = "compact", className }: LocationPickerProps) {
  const id = useId();
  return (
    <div className={cn("relative inline-flex", className)}>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <Icon name="location" size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-primary-dark" />
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={cn(
          "h-10 max-w-[13rem] cursor-pointer appearance-none truncate rounded-full border border-border bg-surface pl-8 pr-8 text-sm font-semibold text-text",
          "hover:border-border-strong focus:outline-none focus-visible:border-primary-dark focus-visible:ring-3 focus-visible:ring-primary-soft",
        )}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {display === "compact" ? cityOf(option) : option}
          </option>
        ))}
      </select>
      <Icon name="chevron-down" size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-muted" />
    </div>
  );
}
