import Image from "next/image";
import { cn } from "@/lib/cn";

interface AvatarProps {
  name: string;
  src?: string;
  size?: "sm" | "md" | "lg";
  shape?: "circle" | "rounded";
  className?: string;
}

const sizePx = { sm: 40, md: 56, lg: 72 } as const;
const textSize = { sm: "text-sm", md: "text-h3", lg: "text-h2" } as const;

function initials(name: string): string {
  return name
    .replace(/^Dr\.?\s+/i, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/** Photo when available; otherwise initials on a soft teal tile (no stock imagery required). */
export function Avatar({ name, src, size = "md", shape = "circle", className }: AvatarProps) {
  const px = sizePx[size];
  const radius = shape === "circle" ? "rounded-full" : "rounded-md";

  if (src) {
    return (
      <Image
        src={src}
        alt={name}
        width={px}
        height={px}
        className={cn("shrink-0 object-cover", radius, className)}
        style={{ width: px, height: px }}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex shrink-0 items-center justify-center bg-primary-soft font-bold text-primary-deep",
        radius,
        textSize[size],
        className,
      )}
      style={{ width: px, height: px }}
    >
      {initials(name)}
    </span>
  );
}
