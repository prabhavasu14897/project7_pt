import { cn } from "@/lib/cn";
import { Button } from "./Button";

interface SectionHeaderProps {
  /** Heading id, so the section can use `aria-labelledby`. */
  id: string;
  title: string;
  action?: { label: string; href: string };
  className?: string;
}

export function SectionHeader({ id, title, action, className }: SectionHeaderProps) {
  return (
    <div className={cn("mb-4 flex items-center justify-between gap-4 sm:mb-5", className)}>
      <h2 id={id} className="text-h3 font-bold text-balance text-text sm:text-h2">
        {title}
      </h2>
      {action && (
        <Button variant="link" href={action.href} rightIcon="chevron-right" className="min-h-11 shrink-0">
          {action.label}
        </Button>
      )}
    </div>
  );
}
