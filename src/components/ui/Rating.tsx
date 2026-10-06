import { Star } from "lucide-react";
import { productConfig } from "@config/product.config";
import { cn } from "@/lib/cn";
import { formatCompact } from "@/lib/format";

const strings = productConfig.ui.rating;

interface RatingProps {
  value: number;
  count?: number;
  size?: "sm" | "md";
  className?: string;
}

export function Rating({ value, count, size = "sm", className }: RatingProps) {
  const rounded = value.toFixed(1);
  const label = `${rounded} ${strings.outOf}${count ? `, ${count.toLocaleString()} ${strings.reviews}` : ""}`;

  return (
    <span
      role="img"
      aria-label={label}
      className={cn("inline-flex items-center gap-1 tabular", size === "sm" ? "text-xs" : "text-sm", className)}
    >
      <Star aria-hidden="true" size={size === "sm" ? 14 : 16} className="fill-rating text-rating" strokeWidth={1.5} />
      <span className="font-bold text-text">{rounded}</span>
      {count !== undefined && <span className="text-text-muted">({formatCompact(count)})</span>}
    </span>
  );
}
