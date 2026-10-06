import Link from "next/link";
import type { NavItem } from "@/types/models";
import { cn } from "@/lib/cn";

interface DesktopNavProps {
  items: readonly NavItem[];
  activeKey?: string;
  label: string;
  className?: string;
}

export function DesktopNav({ items, activeKey, label, className }: DesktopNavProps) {
  return (
    <nav aria-label={label} className={className}>
      <ul className="flex items-center gap-1">
        {items.map((item) => {
          const active = item.key === activeKey;
          return (
            <li key={item.key}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative inline-flex h-11 items-center rounded-md px-3.5 text-sm font-semibold transition-colors duration-150",
                  active ? "text-primary-deep" : "text-text-muted hover:bg-surface-muted hover:text-text",
                  // Active indicator sits on the header's bottom edge.
                  active && "after:absolute after:inset-x-3.5 after:-bottom-[14px] after:h-0.5 after:rounded-full after:bg-primary-dark",
                )}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
