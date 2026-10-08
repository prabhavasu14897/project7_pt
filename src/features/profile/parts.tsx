import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";

/** A titled settings group. Sections stack these; nothing nests inside another card. */
export function SettingsCard({ id, title, action, children, className }: {
  id: string;
  title: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card as="section" aria-labelledby={id} padding="lg" className={cn("flex flex-col gap-3", className)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id={id} className="text-h3 font-bold text-text">
          {title}
        </h2>
        {action}
      </div>
      {children}
    </Card>
  );
}

/** The result of the last action, announced to screen readers; empty keeps the live region mounted. */
export function StatusLine({ message, className }: { message: string; className?: string }) {
  return (
    <p role="status" className={message ? cn("flex items-center gap-1.5 text-sm font-semibold text-success-text", className) : "sr-only"}>
      {message && <Icon name="check" size={16} aria-hidden="true" className="shrink-0" />}
      {message}
    </p>
  );
}

/** Saves a text file to the device, so "Download" buttons leave the user with something real. */
export function saveFile(name: string, text: string, type = "text/plain") {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
}
