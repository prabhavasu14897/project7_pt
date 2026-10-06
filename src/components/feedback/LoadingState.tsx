import { productConfig } from "@config/product.config";
import { cn } from "@/lib/cn";
import { Skeleton } from "@/components/ui/Skeleton";
import { Spinner } from "@/components/ui/Spinner";

interface LoadingStateProps {
  /** Name the real operation, e.g. "Finding pharmacies near you". */
  label?: string;
  /** `spinner` for short waits; `list` and `tiles` mirror ProductCard rows and CategoryCard tiles to avoid layout shift. */
  variant?: "spinner" | "list" | "tiles";
  count?: number;
  className?: string;
}

function ListSkeleton() {
  return (
    <div className="flex gap-3 rounded-lg border border-border bg-surface p-3 sm:gap-4 sm:p-4">
      <Skeleton className="size-18 shrink-0 rounded-md sm:size-20" />
      <div className="flex flex-1 flex-col gap-2 py-1">
        <Skeleton className="h-4 w-3/5" />
        <Skeleton className="h-3 w-2/5" />
        <div className="mt-auto flex items-end justify-between">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-9 w-18 rounded-md" />
        </div>
      </div>
    </div>
  );
}

function TileSkeleton() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-border bg-surface px-2 py-5">
      <Skeleton className="size-14 rounded-lg" />
      <Skeleton className="h-3 w-14" />
    </div>
  );
}

export function LoadingState({ label = productConfig.ui.loading.default, variant = "spinner", count = 3, className }: LoadingStateProps) {
  if (variant === "spinner") {
    return (
      <div role="status" className={cn("flex flex-col items-center justify-center gap-3 py-12 text-text-muted", className)}>
        <Spinner size={28} className="text-primary-dark" />
        <p className="text-sm font-medium">{label}</p>
      </div>
    );
  }

  return (
    <div role="status" aria-busy="true" className={className}>
      <span className="sr-only">{label}</span>
      <div
        className={cn(
          variant === "list" ? "grid gap-3 md:grid-cols-2" : "grid grid-cols-4 gap-3 sm:grid-cols-5",
        )}
      >
        {Array.from({ length: count }, (_, index) =>
          variant === "list" ? <ListSkeleton key={index} /> : <TileSkeleton key={index} />,
        )}
      </div>
    </div>
  );
}
