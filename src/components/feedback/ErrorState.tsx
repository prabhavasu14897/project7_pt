import { productConfig } from "@config/product.config";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

const strings = productConfig.ui;

interface ErrorStateProps {
  title?: string;
  /** Say how to recover, not just what went wrong. */
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
  retrying?: boolean;
  size?: "inline" | "page";
  className?: string;
}

export function ErrorState({
  title = strings.states.errorTitle,
  description = strings.states.errorDescription,
  onRetry,
  retryLabel = strings.actions.retry,
  retrying = false,
  size = "page",
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        "mx-auto flex max-w-md flex-col items-center text-center",
        size === "page" ? "gap-4 px-4 py-12 sm:py-16" : "gap-3 px-4 py-8",
        className,
      )}
    >
      <span
        className={cn(
          "flex items-center justify-center rounded-full bg-danger-soft text-danger-text",
          size === "page" ? "size-16" : "size-12",
        )}
      >
        <Icon name="alert" size={size === "page" ? 30 : 24} />
      </span>
      <div className="flex flex-col gap-1.5">
        <h2 className={cn("font-bold text-text", size === "page" ? "text-h2" : "text-h3")}>{title}</h2>
        <p className="text-sm text-text-muted sm:text-body">{description}</p>
      </div>
      {onRetry && (
        <Button variant="outline" onClick={onRetry} loading={retrying} className="mt-1">
          {retryLabel}
        </Button>
      )}
    </div>
  );
}
