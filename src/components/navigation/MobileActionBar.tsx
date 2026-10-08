import type { ReactNode } from "react";
import { Price } from "@/components/ui/Price";
import { cn } from "@/lib/cn";

interface MobileActionBarProps {
  /** Left side, e.g. the amount to pay. */
  summary: ReactNode;
  /** The primary action. */
  children: ReactNode;
  className?: string;
}

/**
 * Phone-only bar that keeps the total and primary action in the thumb zone, just above the bottom navigation.
 * Place it last in the page so it sticks for the whole scroll. Hidden from `lg`, where the summary card is visible.
 */
export function MobileActionBar({ summary, children, className }: MobileActionBarProps) {
  return (
    <div
      className={cn(
        "sticky bottom-[calc(4.25rem+env(safe-area-inset-bottom))] z-30 -mx-4 flex items-center gap-3 border-t border-border bg-surface/95 px-4 py-3 shadow-nav backdrop-blur-sm sm:-mx-6 sm:px-6 lg:hidden",
        className,
      )}
    >
      <div className="min-w-0 flex-1">{summary}</div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

/** Labelled amount for the bar's left side, so the number never stands alone. */
export function PayTotal({ label, amount }: { label: string; amount: number }) {
  return (
    <span className="flex flex-col">
      <span className="text-xs text-text-muted">{label}</span>
      <Price amount={amount} size="lg" />
    </span>
  );
}
