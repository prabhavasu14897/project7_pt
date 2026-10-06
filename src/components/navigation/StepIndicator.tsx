import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";

interface StepIndicatorProps {
  steps: readonly string[];
  /** Zero-based index of the current step. */
  current: number;
  label: string;
  className?: string;
}

/** Compact multi-step progress (e.g. Cart → Delivery → Payment). The current step is marked for assistive tech. */
export function StepIndicator({ steps, current, label, className }: StepIndicatorProps) {
  return (
    <ol aria-label={label} className={cn("flex items-center gap-2 text-sm", className)}>
      {steps.map((step, index) => {
        const done = index < current;
        const active = index === current;
        return (
          <li key={step} aria-current={active ? "step" : undefined} className="flex items-center gap-2">
            <span
              className={cn(
                "flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold tabular",
                done && "bg-primary-dark text-white",
                active && "border-2 border-primary-dark text-primary-deep",
                !done && !active && "border border-border-strong text-text-muted",
              )}
            >
              {done ? <Icon name="check" size={14} strokeWidth={3} /> : index + 1}
            </span>
            <span className={cn("font-semibold", active ? "text-text" : "text-text-muted")}>{step}</span>
            {index < steps.length - 1 && <span aria-hidden="true" className="mx-1 h-px w-6 bg-border-strong sm:w-10" />}
          </li>
        );
      })}
    </ol>
  );
}
