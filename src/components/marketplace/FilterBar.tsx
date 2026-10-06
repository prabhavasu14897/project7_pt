import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";

interface FilterBarProps {
  /** Main filter, usually a chip row (scrolls sideways on phones). */
  primary: ReactNode;
  /** Secondary controls: segmented filters, toggles, sort. One row under the chips; sort-like controls push right from `sm`. */
  secondary?: ReactNode;
  /** Shown only while any filter is active. */
  clear?: { label: string; onClick: () => void };
  label: string;
  className?: string;
}

/**
 * Listing filters: chips get a full-width row of their own (so they never wrap under the controls),
 * with compact controls on the row beneath.
 */
export function FilterBar({ primary, secondary, clear, label, className }: FilterBarProps) {
  return (
    <div role="region" aria-label={label} className={cn("flex flex-col gap-3", className)}>
      <div className="min-w-0">{primary}</div>
      {(secondary || clear) && (
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {secondary}
          {clear && (
            <Button variant="link" onClick={clear.onClick} className="min-h-11">
              {clear.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
