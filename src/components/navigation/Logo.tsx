import Link from "next/link";
import { useId } from "react";
import { cn } from "@/lib/cn";

interface LogoProps {
  name: string;
  href?: string;
  size?: "sm" | "md";
  className?: string;
}

/** Heart-and-cross mark from the reference boards, drawn in the brand teal → blue. */
export function LogoMark({ size = 28 }: { size?: number }) {
  const gradientId = useId();
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 32 32" fill="none">
      <defs>
        <linearGradient id={gradientId} x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--color-primary)" />
          <stop offset="1" stopColor="var(--color-secondary)" />
        </linearGradient>
      </defs>
      <path
        d="M16 28.5s-11.5-6.9-11.5-15.2A6.8 6.8 0 0 1 16 8.4a6.8 6.8 0 0 1 11.5 4.9c0 8.3-11.5 15.2-11.5 15.2Z"
        fill={`url(#${gradientId})`}
      />
      <path d="M16 12.5v9M11.5 17h9" stroke="white" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({ name, href = "/", size = "md", className }: LogoProps) {
  return (
    <Link
      href={href}
      className={cn("inline-flex min-h-11 shrink-0 items-center gap-2 rounded-md font-extrabold tracking-tight text-text", className)}
    >
      <LogoMark size={size === "md" ? 30 : 26} />
      <span className={size === "md" ? "text-h3" : "text-body"}>{name}</span>
    </Link>
  );
}
