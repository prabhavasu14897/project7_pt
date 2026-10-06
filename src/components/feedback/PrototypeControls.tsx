import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";

interface PrototypeControlsProps {
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
}

/**
 * Demo-only panel for events that come from outside the app in production (pharmacist, bank, courier).
 * Dashed and muted so it never reads as part of the product UI.
 */
export function PrototypeControls({ title, description, children, className }: PrototypeControlsProps) {
  return (
    <aside
      aria-label={title}
      className={cn("flex flex-col gap-3 rounded-lg border border-dashed border-border-strong bg-surface-muted p-4", className)}
    >
      <div className="flex items-start gap-2">
        <Icon name="prototype" size={18} className="mt-0.5 shrink-0 text-text-muted" />
        <div className="flex flex-col gap-0.5">
          <p className="text-sm font-bold text-text">{title}</p>
          <p className="text-xs text-text-muted">{description}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">{children}</div>
    </aside>
  );
}
