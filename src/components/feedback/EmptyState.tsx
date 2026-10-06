import type { CardAction } from "@/types/models";
import { cn } from "@/lib/cn";
import { ActionButton } from "@/components/ui/ActionButton";
import { Icon, type IconName } from "@/components/ui/Icon";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: IconName;
  action?: CardAction;
  secondaryAction?: CardAction;
  /** `inline` sits inside a card or list; `page` fills a screen section. */
  size?: "inline" | "page";
  className?: string;
}

export function EmptyState({ title, description, icon = "search", action, secondaryAction, size = "page", className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "mx-auto flex max-w-md flex-col items-center text-center",
        size === "page" ? "gap-4 px-4 py-12 sm:py-16" : "gap-3 px-4 py-8",
        className,
      )}
    >
      <span
        className={cn(
          "flex items-center justify-center rounded-full bg-primary-soft text-primary-dark",
          size === "page" ? "size-16" : "size-12",
        )}
      >
        <Icon name={icon} size={size === "page" ? 30 : 24} />
      </span>
      <div className="flex flex-col gap-1.5">
        <h2 className={cn("font-bold text-text", size === "page" ? "text-h2" : "text-h3")}>{title}</h2>
        {description && <p className="text-sm text-text-muted sm:text-body">{description}</p>}
      </div>
      {(action || secondaryAction) && (
        <div className="mt-1 flex flex-col items-center gap-2 sm:flex-row">
          {action && <ActionButton action={action} size="md" />}
          {secondaryAction && <ActionButton action={secondaryAction} size="md" variant="ghost" />}
        </div>
      )}
    </div>
  );
}
