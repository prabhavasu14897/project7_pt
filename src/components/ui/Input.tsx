"use client";

import { useId, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { Icon, type IconName } from "./Icon";

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label: string;
  /** Keep the label for screen readers but hide it visually (e.g. inside a compact toolbar). */
  hideLabel?: boolean;
  hint?: string;
  error?: string;
  leftIcon?: IconName;
  optionalLabel?: string;
  containerClassName?: string;
}

export function Input({
  label,
  hideLabel = false,
  hint,
  error,
  leftIcon,
  optionalLabel,
  id,
  className,
  containerClassName,
  required,
  ...rest
}: InputProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cn("flex flex-col gap-1.5", containerClassName)}>
      <label htmlFor={inputId} className={cn("text-sm font-semibold text-text", hideLabel && "sr-only")}>
        {label}
        {!required && optionalLabel && <span className="ml-1 font-normal text-text-muted">{optionalLabel}</span>}
      </label>
      <div className="relative">
        {leftIcon && (
          <Icon
            name={leftIcon}
            size={18}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted"
          />
        )}
        <input
          id={inputId}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            "h-12 w-full rounded-md border bg-surface px-4 text-body text-text placeholder:text-text-muted",
            "transition-colors duration-150 focus:outline-none focus-visible:outline-none focus:ring-3",
            "disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-text-muted",
            error
              ? "border-danger-text focus:border-danger-text focus:ring-danger-soft"
              : "border-border hover:border-border-strong focus:border-primary-dark focus:ring-primary-soft",
            leftIcon && "pl-11",
            className,
          )}
          {...rest}
        />
      </div>
      {error && (
        <p id={errorId} className="flex items-start gap-1.5 text-sm text-danger-text">
          <Icon name="alert" size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </p>
      )}
      {hint && (
        <p id={hintId} className="text-sm text-text-muted">
          {hint}
        </p>
      )}
    </div>
  );
}
