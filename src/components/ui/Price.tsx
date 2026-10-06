import { productConfig } from "@config/product.config";
import { cn } from "@/lib/cn";
import { discountPercent, formatPrice } from "@/lib/format";

const strings = productConfig.ui.price;

interface PriceProps {
  amount: number;
  mrp?: number;
  /** e.g. "/ visit", "/ session" */
  unit?: string;
  size?: "sm" | "md" | "lg";
  showDiscount?: boolean;
  className?: string;
}

const sizeClasses = { sm: "text-sm", md: "text-body", lg: "text-h2" } as const;

export function Price({ amount, mrp, unit, size = "md", showDiscount = true, className }: PriceProps) {
  const discount = mrp ? discountPercent(amount, mrp) : 0;

  return (
    <span className={cn("inline-flex flex-wrap items-baseline gap-x-2 gap-y-0.5 tabular", className)}>
      <span className={cn("font-bold text-text", sizeClasses[size])}>
        {formatPrice(amount)}
        {unit && <span className="ml-0.5 text-sm font-medium text-text-muted">{unit}</span>}
      </span>
      {discount > 0 && mrp && (
        <>
          <span className="text-xs text-text-muted line-through">
            <span className="sr-only">{strings.mrp} </span>
            {formatPrice(mrp)}
          </span>
          {showDiscount && (
            <span className="text-xs font-semibold text-success-text">
              {discount}% {strings.off}
            </span>
          )}
        </>
      )}
    </span>
  );
}
