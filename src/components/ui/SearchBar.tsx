"use client";

import { useId, useState, type FormEvent } from "react";
import { productConfig } from "@config/product.config";
import { cn } from "@/lib/cn";
import { Icon } from "./Icon";

const strings = productConfig.ui.search;

interface SearchBarProps {
  placeholder?: string;
  label?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  size?: "md" | "lg";
  /** `filled` sits on white surfaces (header); `surface` sits on the tinted page background. */
  appearance?: "filled" | "surface";
  className?: string;
}

export function SearchBar({
  placeholder = strings.placeholder,
  label = strings.label,
  value,
  defaultValue = "",
  onValueChange,
  onSubmit,
  size = "md",
  appearance = "surface",
  className,
}: SearchBarProps) {
  const id = useId();
  const [internal, setInternal] = useState(defaultValue);
  const current = value ?? internal;

  const update = (next: string) => {
    if (value === undefined) setInternal(next);
    onValueChange?.(next);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = current.trim();
    if (query) onSubmit?.(query);
  };

  return (
    <form role="search" onSubmit={handleSubmit} className={cn("relative w-full", className)}>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <Icon
        name="search"
        size={size === "lg" ? 20 : 18}
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"
      />
      <input
        id={id}
        type="search"
        enterKeyHint="search"
        autoComplete="off"
        value={current}
        onChange={(event) => update(event.target.value)}
        placeholder={placeholder}
        className={cn(
          "w-full rounded-lg border pl-11 pr-12 text-text placeholder:text-text-muted",
          "transition-[border-color,box-shadow] duration-150 focus:outline-none focus-visible:outline-none",
          "focus:border-primary-dark focus:ring-3 focus:ring-primary-soft",
          size === "lg" ? "h-13 text-body" : "h-11 text-sm",
          appearance === "filled"
            ? "border-transparent bg-surface-muted hover:border-border focus:bg-surface"
            : "border-border bg-surface shadow-card hover:border-border-strong",
        )}
      />
      {current && (
        <button
          type="button"
          onClick={() => update("")}
          aria-label={strings.clear}
          className="absolute right-1 top-1/2 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-md text-text-muted hover:bg-surface-muted hover:text-text"
        >
          <Icon name="close" size={18} />
        </button>
      )}
    </form>
  );
}
