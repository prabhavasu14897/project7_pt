import Link from "next/link";
import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";

interface CategoryCardProps {
  label: string;
  href: string;
  icon: string;
  /** Key into `theme.categoryTones` (usually the category key). */
  tone: string;
  description?: string;
  /** `tile`: Home grid (icon above label). `row`: Explore list (icon, text, chevron). */
  variant?: "tile" | "row";
  /** Row only: `sm` hides the chevron on narrow two-column grids. */
  chevron?: "always" | "sm";
  className?: string;
}

function toneStyle(tone: string): CSSProperties {
  return {
    color: `var(--cn-tone-${tone}-fg, var(--color-primary-dark))`,
    backgroundColor: `var(--cn-tone-${tone}-bg, var(--color-primary-soft))`,
  };
}

export function CategoryCard({ label, href, icon, tone, description, variant = "tile", chevron = "always", className }: CategoryCardProps) {
  if (variant === "row") {
    return (
      <Link
        href={href}
        className={cn(
          "group flex items-center gap-3 rounded-lg border border-border bg-surface p-3.5 shadow-card sm:gap-4 sm:p-4",
          "transition-[box-shadow,border-color] duration-200 hover:border-border-strong hover:shadow-raised",
          className,
        )}
      >
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full sm:size-12" style={toneStyle(tone)}>
          <Icon name={icon} size={22} />
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="text-sm font-semibold leading-snug text-text sm:text-body">{label}</span>
          {description && <span className="text-xs text-text-muted sm:text-sm">{description}</span>}
        </span>
        <Icon
          name="chevron-right"
          size={20}
          className={cn(
            "shrink-0 text-text-subtle transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-text-muted",
            chevron === "sm" && "hidden sm:block",
          )}
        />
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        "group flex flex-col items-center gap-2 rounded-lg border border-border bg-surface px-1 py-3 text-center shadow-card",
        "transition-[box-shadow,border-color] duration-200 hover:border-border-strong hover:shadow-raised sm:gap-3 sm:px-2 sm:py-5",
        className,
      )}
    >
      <span
        className="flex size-11 items-center justify-center rounded-lg transition-transform duration-200 group-hover:scale-105 sm:size-14"
        style={toneStyle(tone)}
      >
        <Icon name={icon} size={24} />
      </span>
      <span className="text-xs font-semibold leading-tight text-text sm:text-sm">{label}</span>
    </Link>
  );
}
