import type { ReactNode } from "react";
import type { Tone } from "@/types/models";
import { cn } from "@/lib/cn";
import { Icon, type IconName } from "./Icon";

const toneClasses: Record<Tone, string> = {
  neutral: "bg-surface-muted text-text-muted",
  primary: "bg-primary-soft text-primary-deep",
  info: "bg-secondary-soft text-secondary-text",
  success: "bg-success-soft text-success-text",
  warning: "bg-warning-soft text-warning-text",
  danger: "bg-danger-soft text-danger-text",
};

interface BadgeProps {
  tone?: Tone;
  icon?: IconName;
  size?: "sm" | "md";
  children: ReactNode;
  className?: string;
}

/** Status pill. Always carries text so status never relies on color alone. */
export function Badge({ tone = "neutral", icon, size = "sm", children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1 whitespace-nowrap rounded-full font-semibold",
        size === "sm" ? "h-6 px-2.5 text-xs" : "h-7 px-3 text-sm",
        toneClasses[tone],
        className,
      )}
    >
      {icon && <Icon name={icon} size={size === "sm" ? 13 : 15} strokeWidth={2.2} />}
      {children}
    </span>
  );
}
