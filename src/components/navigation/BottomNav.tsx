import Link from "next/link";
import type { NavItem } from "@/types/models";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";

interface BottomNavProps {
  items: readonly NavItem[];
  activeKey?: string;
  label: string;
  className?: string;
}

/** Mobile/tablet primary navigation. Hidden from `lg` up, where the header nav takes over. */
export function BottomNav({ items, activeKey, label, className }: BottomNavProps) {
  return (
    <nav
      aria-label={label}
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 shadow-nav backdrop-blur-sm lg:hidden",
        "pb-[env(safe-area-inset-bottom)]",
        className,
      )}
    >
      <ul className="mx-auto flex max-w-xl items-stretch justify-between px-2">
        {items.map((item) => {
          const active = item.key === activeKey;
          return (
            <li key={item.key} className="flex-1">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-16 flex-col items-center justify-center gap-1 rounded-md text-xs font-semibold transition-colors duration-150",
                  active ? "text-primary-deep" : "text-text-muted hover:text-text",
                )}
              >
                <span
                  className={cn(
                    "flex h-7 w-12 items-center justify-center rounded-full transition-colors duration-150",
                    active && "bg-primary-soft",
                  )}
                >
                  <Icon name={item.icon} size={21} strokeWidth={active ? 2.2 : 1.9} />
                </span>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
