import { productConfig } from "@config/product.config";
import type { TimelineState, TimelineStep } from "@/types/models";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";

const stateLabels = productConfig.ui.timeline;

interface StatusTimelineProps {
  steps: readonly TimelineStep[];
  label: string;
  className?: string;
}

function Indicator({ state }: { state: TimelineState }) {
  const base = "relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full";
  switch (state) {
    case "complete":
      return (
        <span className={cn(base, "bg-success text-white")}>
          <Icon name="check" size={16} strokeWidth={3} />
        </span>
      );
    case "current":
      return (
        <span className={cn(base, "border-2 border-primary-dark bg-surface")}>
          <span className="size-2.5 rounded-full bg-primary-dark motion-safe:animate-[cn-pulse-ring_1.6s_ease-out_infinite]" />
        </span>
      );
    case "attention":
      return (
        <span className={cn(base, "border-2 border-warning bg-warning-soft text-warning-text")}>
          <Icon name="alert" size={15} strokeWidth={2.4} />
        </span>
      );
    case "failed":
      return (
        <span className={cn(base, "border-2 border-danger bg-danger-soft text-danger-text")}>
          <Icon name="close" size={15} strokeWidth={2.6} />
        </span>
      );
    default:
      return (
        <span className={cn(base, "border-2 border-border bg-surface")}>
          <span className="size-1.5 rounded-full bg-border-strong" />
        </span>
      );
  }
}

/**
 * Vertical progress for prescription verification, order delivery and lab collection.
 * Every step states its status in text (visually hidden) as well as color and icon.
 */
export function StatusTimeline({ steps, label, className }: StatusTimelineProps) {
  return (
    <ol aria-label={label} className={cn("flex flex-col", className)}>
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        const isActive = step.state === "current" || step.state === "attention";
        const nextReached = steps[index + 1] && steps[index + 1]?.state !== "upcoming";

        return (
          <li key={step.key} aria-current={isActive ? "step" : undefined} className="relative flex gap-3 sm:gap-4">
            <div className="relative flex flex-col items-center pt-3">
              <Indicator state={step.state} />
              {!isLast && (
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute top-10 -bottom-3 w-0.5 rounded-full",
                    step.state === "complete" && nextReached ? "bg-success" : "bg-border",
                  )}
                />
              )}
            </div>

            <div
              className={cn(
                "mb-2 flex min-w-0 flex-1 flex-col gap-0.5 rounded-md px-3 py-3",
                step.state === "current" && "bg-primary-soft/60",
                step.state === "attention" && "bg-warning-soft",
                step.state === "failed" && "bg-danger-soft",
              )}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                <p
                  className={cn(
                    "text-sm font-semibold",
                    step.state === "upcoming" ? "text-text-muted" : "text-text",
                    step.state === "current" && "text-primary-deep",
                    step.state === "attention" && "text-warning-text",
                    step.state === "failed" && "text-danger-text",
                  )}
                >
                  {step.label}
                  <span className="sr-only">: {stateLabels[step.state]}</span>
                </p>
                {step.timestamp && <p className="text-xs text-text-muted tabular">{step.timestamp}</p>}
              </div>
              {step.description && (
                <p className={cn("text-sm", "text-text-muted")}>
                  {step.description}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
