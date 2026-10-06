import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";

export type NoticeTone = "warning" | "danger" | "success" | "info" | "neutral";

const toneClass: Record<NoticeTone, string> = {
  warning: "bg-warning-soft text-warning-text",
  danger: "bg-danger-soft text-danger-text",
  success: "bg-success-soft text-success-text",
  info: "bg-secondary-soft text-secondary-text",
  neutral: "bg-surface-muted text-text",
};

interface NoticeProps {
  tone: NoticeTone;
  icon: string;
  title: string;
  children?: ReactNode;
  /** Announce changes, e.g. a payment result. */
  live?: boolean;
  className?: string;
}

/** Soft status panel: icon and title carry the state (never color alone), body text stays readable. */
export function Notice({ tone, icon, title, children, live = false, className }: NoticeProps) {
  return (
    <div role={live ? "status" : undefined} className={cn("flex gap-3 rounded-md p-4", toneClass[tone], className)}>
      <Icon name={icon} size={20} className="mt-0.5 shrink-0" />
      <div className="flex min-w-0 flex-col gap-1">
        <p className="text-sm font-bold">{title}</p>
        {children && <div className="text-sm text-text">{children}</div>}
      </div>
    </div>
  );
}
