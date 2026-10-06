import type { CardAction, TimelineStep, Tone } from "@/types/models";
import { cn } from "@/lib/cn";
import { ActionButton } from "@/components/ui/ActionButton";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import type { IconName } from "@/components/ui/Icon";

interface OrderStatusCardProps {
  heading: string;
  /** Short context under the heading, e.g. "Order #CN123456". */
  context?: string;
  status: { label: string; tone: Tone; icon?: IconName };
  items: string;
  description?: string;
  /** Omit for finished orders, where a progress bar says nothing. */
  steps?: readonly TimelineStep[];
  /** Visible progress text, e.g. "Step 2 of 6". Carries what the bar shows visually. */
  progressLabel?: string;
  note?: string;
  action?: CardAction;
  /** `split` puts progress and the action in a right-hand column from `lg` up, for wide dashboard slots. */
  layout?: "stacked" | "split";
  headingLevel?: "h2" | "h3";
  className?: string;
}

const currentSegment: Partial<Record<Tone, string>> = {
  warning: "bg-warning",
  danger: "bg-danger",
  info: "bg-secondary",
};

/** Compact summary of one in-progress order: status, contents, progress and the next action. */
export function OrderStatusCard({
  heading,
  context,
  status,
  items,
  description,
  steps,
  progressLabel,
  note,
  action,
  layout = "stacked",
  headingLevel: Heading = "h2",
  className,
}: OrderStatusCardProps) {
  const split = layout === "split";

  return (
    <Card padding="lg" className={cn("flex flex-col", className)}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
        <Heading className="text-h3 font-bold text-text">{heading}</Heading>
        {context && <p className="text-sm text-text-muted tabular">{context}</p>}
      </div>

      <div
        className={cn(
          "mt-3 flex flex-1 flex-col border-t border-border pt-4",
          split && "lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,17rem)] lg:items-center lg:gap-8",
        )}
      >
        <div className="flex flex-col items-start gap-2">
          <Badge tone={status.tone} icon={status.icon}>
            {status.label}
          </Badge>
          <p className="text-body font-semibold text-text">{items}</p>
          {description && <p className="max-w-[60ch] text-sm text-text-muted">{description}</p>}
        </div>

        <div className={cn("mt-4 flex flex-col", split ? "lg:mt-0" : "flex-1")}>
          {steps && steps.length > 0 && (
          <>
          <div aria-hidden="true" className="flex gap-1">
            {steps.map((step) => (
              <span
                key={step.key}
                className={cn(
                  "h-1.5 flex-1 rounded-full",
                  step.state === "complete" && "bg-primary-dark",
                  step.state === "current" && (currentSegment[status.tone] ?? "bg-primary"),
                  step.state === "attention" && "bg-warning",
                  step.state === "failed" && "bg-danger",
                  step.state === "upcoming" && "bg-border",
                )}
              />
            ))}
          </div>
          <p className="mt-2 flex flex-wrap justify-between gap-x-3 gap-y-0.5 text-xs text-text-muted">
            <span className="font-semibold text-text tabular">{progressLabel}</span>
            {note && <span>{note}</span>}
          </p>
          </>
          )}

          {action && (
            <div className={cn("mt-4", !split && "lg:mt-auto lg:pt-5")}>
              <ActionButton action={action} size="md" className="w-full" />
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
