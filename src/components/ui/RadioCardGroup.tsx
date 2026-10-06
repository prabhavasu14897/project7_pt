"use client";

import { useId, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "./Icon";

export interface RadioCardOption<T extends string = string> {
  value: T;
  label: string;
  description?: string;
  icon?: string;
  /** Right-aligned extra, e.g. a fee. */
  aside?: string;
  disabled?: boolean;
}

interface RadioCardGroupProps<T extends string> {
  legend: string;
  hideLegend?: boolean;
  options: readonly RadioCardOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Layout of the options. */
  columns?: 1 | 2 | 3;
  /** Rendered under the selected option, e.g. a UPI field. */
  renderSelected?: (value: T) => ReactNode;
  className?: string;
}

const columnClass = { 1: "", 2: "sm:grid-cols-2", 3: "sm:grid-cols-3" } as const;

/** Native radio inputs styled as selectable cards: arrow keys, labels and screen readers work as standard. */
export function RadioCardGroup<T extends string>({
  legend,
  hideLegend = false,
  options,
  value,
  onChange,
  columns = 1,
  renderSelected,
  className,
}: RadioCardGroupProps<T>) {
  const name = useId();
  return (
    <fieldset className={cn("flex flex-col gap-3", className)}>
      <legend className={cn("mb-3 text-h3 font-bold text-text", hideLegend && "sr-only")}>{legend}</legend>
      <div className={cn("grid gap-3", columnClass[columns])}>
        {options.map((option) => {
          const checked = option.value === value;
          return (
            <div key={option.value} className="flex flex-col">
              <label
                className={cn(
                  "flex min-h-14 cursor-pointer items-center gap-3 rounded-lg border bg-surface p-3.5 transition-[border-color,box-shadow] duration-150 sm:p-4",
                  "has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-primary-soft",
                  checked ? "border-primary-dark ring-1 ring-primary-dark" : "border-border hover:border-border-strong",
                  option.disabled && "cursor-not-allowed opacity-60 hover:border-border",
                )}
              >
                <input
                  type="radio"
                  name={name}
                  value={option.value}
                  checked={checked}
                  disabled={option.disabled}
                  onChange={() => onChange(option.value)}
                  className="size-5 shrink-0 accent-[var(--color-primary-dark)]"
                />
                {option.icon && (
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-surface-muted text-primary-dark">
                    <Icon name={option.icon} size={20} />
                  </span>
                )}
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="text-sm font-semibold text-text sm:text-body">{option.label}</span>
                  {option.description && <span className="text-sm text-text-muted">{option.description}</span>}
                </span>
                {option.aside && <span className="shrink-0 text-sm font-semibold text-text tabular">{option.aside}</span>}
              </label>
              {checked && renderSelected && <div className="px-1 pt-3">{renderSelected(option.value)}</div>}
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}
