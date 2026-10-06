import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/format";

export interface PriceRow {
  label: string;
  amount: number;
  /** `discount` renders as a negative in success text; `free` shows the free label instead of ₹0. */
  kind?: "default" | "discount" | "free";
}

interface PriceBreakdownProps {
  title?: string;
  rows: readonly PriceRow[];
  total: { label: string; amount: number };
  freeLabel: string;
  note?: string;
  className?: string;
}

/** Itemised totals as a description list; the total is the last, heaviest row. */
export function PriceBreakdown({ title, rows, total, freeLabel, note, className }: PriceBreakdownProps) {
  return (
    <section className={cn("flex flex-col gap-3", className)} aria-label={title}>
      {title && <h2 className="text-h3 font-bold text-text">{title}</h2>}
      <dl className="flex flex-col gap-2 text-sm tabular">
        {rows.map((row) => (
          <div key={row.label} className="flex items-baseline justify-between gap-4">
            <dt className="text-text-muted">{row.label}</dt>
            <dd
              className={cn(
                "font-semibold",
                row.kind === "discount" || row.kind === "free" ? "text-success-text" : "text-text",
              )}
            >
              {row.kind === "free" ? freeLabel : row.kind === "discount" ? `−${formatPrice(row.amount)}` : formatPrice(row.amount)}
            </dd>
          </div>
        ))}
        <div className="mt-1 flex items-baseline justify-between gap-4 border-t border-border pt-3">
          <dt className="text-body font-bold text-text">{total.label}</dt>
          <dd className="text-h3 font-extrabold text-text">{formatPrice(total.amount)}</dd>
        </div>
      </dl>
      {note && <p className="text-xs text-text-muted">{note}</p>}
    </section>
  );
}
