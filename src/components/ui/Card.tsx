import type { ElementType, HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

type CardVariant = "default" | "muted" | "outline" | "raised";
type CardPadding = "none" | "sm" | "md" | "lg";

interface CardProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
  variant?: CardVariant;
  padding?: CardPadding;
  /** Adds hover elevation; use only when the card contains a primary link or action. */
  interactive?: boolean;
  selected?: boolean;
  children: ReactNode;
}

const variantClasses: Record<CardVariant, string> = {
  default: "border border-border bg-surface shadow-card",
  muted: "bg-surface-muted",
  outline: "border border-border bg-surface",
  raised: "bg-surface shadow-raised",
};

const paddingClasses: Record<CardPadding, string> = {
  none: "",
  sm: "p-3",
  md: "p-4 sm:p-5",
  lg: "p-5 sm:p-6",
};

export function Card({
  as: Component = "div",
  variant = "default",
  padding = "md",
  interactive = false,
  selected = false,
  className,
  children,
  ...rest
}: CardProps) {
  return (
    <Component
      className={cn(
        "relative rounded-lg",
        variantClasses[variant],
        paddingClasses[padding],
        interactive &&
          "transition-[box-shadow,border-color] duration-200 hover:border-border-strong hover:shadow-raised focus-within:border-border-strong",
        selected && "border-primary-dark ring-1 ring-primary-dark",
        className,
      )}
      {...rest}
    >
      {children}
    </Component>
  );
}
