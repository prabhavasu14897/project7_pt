"use client";

import Image from "next/image";
import { useEffect, useId, useMemo, useState, type ChangeEvent, type DragEvent } from "react";
import { productConfig } from "@config/product.config";
import { cn } from "@/lib/cn";
import { formatFileSize } from "@/lib/format";
import { buttonClasses } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { IconButton } from "@/components/ui/IconButton";

const defaults = productConfig.ui.upload;

interface UploadBoxProps {
  file: File | null;
  onFileChange: (file: File | null) => void;
  title?: string;
  description?: string;
  ctaLabel?: string;
  dropHint?: string;
  draggingLabel?: string;
  formatsLabel?: string;
  accept?: readonly string[];
  maxSizeMb?: number;
  typeErrorMessage?: string;
  sizeErrorMessage?: string;
  removeLabel?: string;
  replaceLabel?: string;
  /** Error from the parent, e.g. the pharmacist asked for a clearer photo. */
  error?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * Prescription file picker with drag and drop and client-side validation.
 * It only selects and validates a file; the parent decides what "submit" means.
 */
export function UploadBox({
  file,
  onFileChange,
  title = defaults.title,
  description = defaults.description,
  ctaLabel = defaults.cta,
  dropHint = defaults.dropHint,
  draggingLabel = defaults.dragging,
  formatsLabel = defaults.formats,
  accept = defaults.accept,
  maxSizeMb = defaults.maxSizeMb,
  typeErrorMessage = defaults.errorType,
  sizeErrorMessage = defaults.errorSize,
  removeLabel = productConfig.ui.actions.remove,
  replaceLabel = defaults.replace,
  error,
  disabled = false,
  className,
}: UploadBoxProps) {
  const inputId = useId();
  const messageId = `${inputId}-message`;
  const [dragging, setDragging] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const shownError = validationError ?? error ?? null;

  const previewUrl = useMemo(
    () => (file && file.type.startsWith("image/") ? URL.createObjectURL(file) : null),
    [file],
  );
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const selectFile = (candidate: File | undefined) => {
    if (!candidate) return;
    if (!accept.includes(candidate.type)) {
      setValidationError(typeErrorMessage);
      return;
    }
    if (candidate.size > maxSizeMb * 1024 * 1024) {
      setValidationError(sizeErrorMessage);
      return;
    }
    setValidationError(null);
    onFileChange(candidate);
  };

  const handleInput = (event: ChangeEvent<HTMLInputElement>) => {
    selectFile(event.target.files?.[0]);
    event.target.value = "";
  };

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setDragging(false);
    if (!disabled) selectFile(event.dataTransfer.files[0]);
  };

  const input = (
    <input
      id={inputId}
      type="file"
      accept={accept.join(",")}
      onChange={handleInput}
      disabled={disabled}
      aria-describedby={messageId}
      aria-invalid={shownError ? true : undefined}
      className="peer sr-only"
    />
  );

  const message = (
    <p
      id={messageId}
      role={shownError ? "alert" : undefined}
      className={cn("flex items-start gap-1.5 text-sm", shownError ? "text-danger-text" : "text-text-muted")}
    >
      {shownError && <Icon name="alert" size={16} className="mt-0.5 shrink-0" />}
      {shownError ?? formatsLabel}
    </p>
  );

  if (file) {
    return (
      <div className={cn("flex flex-col gap-2", className)}>
        <div className="flex items-center gap-3 rounded-lg border border-border bg-surface p-3 shadow-card">
          <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-md bg-primary-soft text-primary-dark">
            {previewUrl ? (
              <Image src={previewUrl} alt="" width={56} height={56} unoptimized className="size-full object-cover" />
            ) : (
              <Icon name="prescription" size={26} />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-text">{file.name}</p>
            <p className="text-xs text-text-muted tabular">{formatFileSize(file.size)}</p>
          </div>
          <div className="relative">
            {input}
            <label
              htmlFor={inputId}
              className={cn(
                buttonClasses({ variant: "ghost", size: "sm" }),
                "cursor-pointer text-primary-dark peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary-dark",
              )}
            >
              {replaceLabel}
            </label>
          </div>
          <IconButton icon="close" label={`${removeLabel} ${file.name}`} onClick={() => onFileChange(null)} disabled={disabled} />
        </div>
        {shownError && message}
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="relative">
        {input}
        <label
          htmlFor={inputId}
          onDragOver={(event) => {
            event.preventDefault();
            if (!disabled) setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={cn(
            "flex cursor-pointer flex-col items-center gap-3 rounded-lg border-2 border-dashed px-5 py-8 text-center transition-colors duration-150 sm:py-10",
            "peer-focus-visible:border-primary-dark peer-focus-visible:ring-3 peer-focus-visible:ring-primary-soft",
            dragging ? "border-primary-dark bg-primary-soft" : "border-border-strong bg-surface hover:border-primary-dark hover:bg-primary-soft/40",
            shownError && !dragging && "border-danger-text",
            disabled && "cursor-not-allowed opacity-60",
          )}
        >
          <span className="flex size-14 items-center justify-center rounded-full bg-primary-soft text-primary-dark">
            <Icon name={dragging ? "upload" : "prescription"} size={28} />
          </span>
          <span className="flex flex-col gap-1">
            <span className="text-h3 font-bold text-text">{dragging ? draggingLabel : title}</span>
            {!dragging && <span className="max-w-sm text-sm text-text-muted">{description}</span>}
          </span>
          {!dragging && (
            <span className="flex flex-col items-center gap-1.5">
              <span className={cn(buttonClasses({ variant: "outline", size: "md" }), "pointer-events-none text-primary-dark")}>
                <Icon name="upload" size={18} />
                {ctaLabel}
              </span>
              <span className="hidden text-xs text-text-subtle sm:block">{dropHint}</span>
            </span>
          )}
        </label>
      </div>
      {message}
    </div>
  );
}
