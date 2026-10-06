import type { MetaItem } from "@/types/models";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";

interface MetaListProps {
  items: readonly MetaItem[];
  className?: string;
}

/** Small icon + text facts: ETA, distance, collection mode, consult duration. */
export function MetaList({ items, className }: MetaListProps) {
  if (items.length === 0) return null;
  return (
    <ul className={cn("flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-muted", className)}>
      {items.map((item) => (
        <li key={item.label} className="inline-flex items-center gap-1">
          {item.icon && <Icon name={item.icon} size={14} className="shrink-0 text-text-subtle" />}
          {item.label}
        </li>
      ))}
    </ul>
  );
}
