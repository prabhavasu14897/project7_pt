import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";

export interface TrustItem {
  key: string;
  title: string;
  description: string;
  icon: string;
}

interface TrustStripProps {
  items: readonly TrustItem[];
  className?: string;
}

/** One quiet panel of safety promises. Used on Home and, later, at checkout. */
export function TrustStrip({ items, className }: TrustStripProps) {
  return (
    <ul
      className={cn(
        "grid grid-cols-1 gap-x-6 gap-y-5 rounded-lg bg-surface-muted p-5 min-[480px]:grid-cols-2 sm:p-6 lg:grid-cols-4 lg:gap-0 lg:px-0",
        className,
      )}
    >
      {items.map((item) => (
        <li key={item.key} className="flex items-start gap-3 lg:border-border lg:px-6 lg:not-first:border-l">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-surface text-primary-dark">
            <Icon name={item.icon} size={20} />
          </span>
          <span className="flex flex-col gap-0.5">
            <span className="text-sm font-bold text-text">{item.title}</span>
            <span className="text-sm text-text-muted">{item.description}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
