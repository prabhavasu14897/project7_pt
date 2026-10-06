import Link from "next/link";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { Icon, type IconName } from "./Icon";

type IconButtonVariant = "ghost" | "outline" | "soft";

interface IconButtonOwnProps {
  icon: IconName | (string & {});
  /** Accessible name. Required because the control has no visible text. */
  label: string;
  variant?: IconButtonVariant;
  /** Small count bubble, e.g. cart items. Hidden when 0. */
  count?: number;
  active?: boolean;
  className?: string;
}

type IconButtonProps =
  | (IconButtonOwnProps & Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof IconButtonOwnProps> & { href?: undefined })
  | (IconButtonOwnProps & { href: string });

const variantClasses: Record<IconButtonVariant, string> = {
  ghost: "text-text hover:bg-surface-muted",
  outline: "border border-border bg-surface text-text hover:border-primary-dark hover:text-primary-deep",
  soft: "bg-primary-soft text-primary-deep hover:bg-[color-mix(in_srgb,var(--color-primary-soft)_80%,var(--color-primary)_20%)]",
};

function omitOwnProps<T extends IconButtonOwnProps & { href?: undefined }>(props: T) {
  const { icon, label, variant, count, active, className, href, ...rest } = props;
  return rest;
}

export function IconButton(props: IconButtonProps) {
  const { icon, label, variant = "ghost", count, active, className } = props;
  const classes = cn(
    "relative inline-flex size-11 shrink-0 items-center justify-center rounded-md transition-colors duration-150",
    "disabled:cursor-not-allowed disabled:opacity-50",
    variantClasses[variant],
    active && "bg-primary-soft text-primary-deep",
    className,
  );
  const visibleCount = count && count > 0 ? (count > 9 ? "9+" : String(count)) : null;
  const accessibleName = visibleCount ? `${label} (${count})` : label;
  const content = (
    <>
      <Icon name={icon} size={22} />
      {visibleCount && (
        <span
          aria-hidden="true"
          className="absolute right-1 top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary-dark px-1 text-[11px] font-bold leading-none text-white ring-2 ring-surface"
        >
          {visibleCount}
        </span>
      )}
    </>
  );

  if (props.href !== undefined) {
    return (
      <Link href={props.href} className={classes} aria-label={accessibleName} aria-current={active ? "page" : undefined}>
        {content}
      </Link>
    );
  }

  const { type = "button", ...nativeProps } = props;
  return (
    <button type={type} className={classes} aria-label={accessibleName} aria-pressed={active} {...omitOwnProps(nativeProps)}>
      {content}
    </button>
  );
}
