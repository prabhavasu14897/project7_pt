import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "./Icon";

interface ListRowProps {
  title: ReactNode;
  description?: ReactNode;
  icon?: string;
  /** Key into `theme.categoryTones` for the icon tile; neutral tile when omitted. */
  tone?: string;
  /** Right side: a badge, a value or an action. A chevron is added for links. */
  trailing?: ReactNode;
  href?: string;
  onClick?: () => void;
  /** Marks the row as the current page in a navigation list. */
  current?: boolean;
  ariaLabel?: string;
  className?: string;
}

/**
 * One row of a list: an icon tile, a title with a supporting line, and a trailing detail.
 * Renders as a link, a button or plain content, so settings menus, report lists and timelines share one shape.
 */
export function ListRow({ title, description, icon, tone, trailing, href, onClick, current, ariaLabel, className }: ListRowProps) {
  const interactive = Boolean(href || onClick);
  const body = (
    <>
      {icon && (
        <span
          aria-hidden="true"
          className={cn("flex size-10 shrink-0 items-center justify-center rounded-md", !tone && "bg-surface-muted text-primary-dark")}
          style={tone ? { color: `var(--cn-tone-${tone}-fg)`, backgroundColor: `var(--cn-tone-${tone}-bg)` } : undefined}
        >
          <Icon name={icon} size={20} />
        </span>
      )}
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className={cn("text-sm font-semibold text-text sm:text-body", current && "text-primary-deep")}>{title}</span>
        {description && <span className="text-sm text-text-muted">{description}</span>}
      </span>
      {trailing && <span className="flex shrink-0 items-center gap-2 text-sm text-text-muted">{trailing}</span>}
      {href && <Icon name="chevron-right" size={18} aria-hidden="true" className="shrink-0 text-text-subtle" />}
    </>
  );
  const classes = cn(
    "flex min-h-14 w-full items-center gap-3 rounded-md px-3 py-2.5 text-left",
    interactive && "transition-colors duration-150 hover:bg-surface-muted",
    current && "bg-primary-soft hover:bg-primary-soft",
    className,
  );

  if (href) {
    return (
      <Link href={href} aria-current={current ? "page" : undefined} aria-label={ariaLabel} className={classes}>
        {body}
      </Link>
    );
  }
  if (onClick) {
    return (
      <button type="button" onClick={onClick} aria-label={ariaLabel} className={classes}>
        {body}
      </button>
    );
  }
  return <div className={classes}>{body}</div>;
}
