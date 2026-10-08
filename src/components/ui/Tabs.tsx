"use client";

import { useRef, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface TabItem<T extends string = string> {
  value: T;
  label: string;
  count?: number;
  disabled?: boolean;
}

type TabsVariant = "segmented" | "underline" | "chips";

interface TabsProps<T extends string> {
  /** Base id that ties tabs to panels: tab = `${id}-tab-${value}`, panel = `${id}-panel-${value}`. */
  id: string;
  items: readonly TabItem<T>[];
  value: T;
  onChange: (value: T) => void;
  variant?: TabsVariant;
  label: string;
  className?: string;
  /** Set when TabPanel elements are rendered, so aria-controls points at something real. */
  hasPanels?: boolean;
}

const listClasses: Record<TabsVariant, string> = {
  segmented: "inline-flex w-full rounded-lg bg-surface-muted p-1 sm:w-auto",
  underline: "flex w-full gap-6 border-b border-border overflow-x-auto scrollbar-none",
  // Chips scroll sideways on narrow screens instead of wrapping into a tall block.
  chips: "-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-none sm:mx-0 sm:flex-wrap sm:px-0",
};

const tabClasses: Record<TabsVariant, { base: string; active: string; idle: string }> = {
  segmented: {
    base: "h-11 flex-1 rounded-md px-5 text-sm font-semibold sm:flex-none",
    active: "bg-surface text-primary-deep shadow-card",
    idle: "text-text-muted hover:text-text",
  },
  underline: {
    base: "relative -mb-px h-11 shrink-0 border-b-2 px-1 text-sm font-semibold",
    active: "border-primary-dark text-primary-deep",
    idle: "border-transparent text-text-muted hover:text-text",
  },
  chips: {
    base: "h-9 shrink-0 rounded-full border px-4 text-sm font-semibold relative after:absolute after:-inset-y-1 after:inset-x-0 after:content-['']",
    active: "border-primary-dark bg-primary-dark text-white",
    idle: "border-border bg-surface text-text hover:border-border-strong",
  },
};

export function Tabs<T extends string>({
  id,
  items,
  value,
  onChange,
  variant = "segmented",
  label,
  className,
  hasPanels = false,
}: TabsProps<T>) {
  const refs = useRef<Array<HTMLButtonElement | null>>([]);

  const focusTab = (index: number) => {
    const item = items[index];
    if (!item) return;
    refs.current[index]?.focus();
    onChange(item.value);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const enabled = items.map((item, i) => (item.disabled ? -1 : i)).filter((i) => i >= 0);
    const position = enabled.indexOf(index);
    let next: number | undefined;
    if (event.key === "ArrowRight") next = enabled[(position + 1) % enabled.length];
    else if (event.key === "ArrowLeft") next = enabled[(position - 1 + enabled.length) % enabled.length];
    else if (event.key === "Home") next = enabled[0];
    else if (event.key === "End") next = enabled[enabled.length - 1];
    if (next === undefined) return;
    event.preventDefault();
    focusTab(next);
  };

  const styles = tabClasses[variant];

  return (
    <div role="tablist" aria-label={label} className={cn(listClasses[variant], className)}>
      {items.map((item, index) => {
        const selected = item.value === value;
        return (
          <button
            key={item.value}
            ref={(node) => {
              refs.current[index] = node;
            }}
            id={`${id}-tab-${item.value}`}
            type="button"
            role="tab"
            aria-selected={selected}
            aria-controls={hasPanels ? `${id}-panel-${item.value}` : undefined}
            tabIndex={selected ? 0 : -1}
            disabled={item.disabled}
            onClick={() => onChange(item.value)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            className={cn(
              "inline-flex items-center justify-center gap-1.5 whitespace-nowrap transition-colors duration-150",
              "disabled:cursor-not-allowed disabled:opacity-50",
              styles.base,
              selected ? styles.active : styles.idle,
            )}
          >
            {item.label}
            {item.count !== undefined && " "}
            {item.count !== undefined && (
              <span
                className={cn(
                  "rounded-full px-1.5 text-xs tabular",
                  selected && variant === "chips" ? "bg-white/20" : "bg-surface-muted text-text-muted",
                )}
              >
                {item.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

interface TabPanelProps {
  id: string;
  value: string;
  children: ReactNode;
  className?: string;
}

export function TabPanel({ id, value, children, className }: TabPanelProps) {
  return (
    <div role="tabpanel" id={`${id}-panel-${value}`} aria-labelledby={`${id}-tab-${value}`} tabIndex={0} className={className}>
      {children}
    </div>
  );
}
