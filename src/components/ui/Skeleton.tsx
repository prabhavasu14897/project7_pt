import { cn } from "@/lib/cn";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative block overflow-hidden rounded-sm bg-surface-muted",
        "after:absolute after:inset-0 after:-translate-x-full after:animate-[cn-shimmer_1.4s_infinite]",
        "after:bg-linear-to-r after:from-transparent after:via-white/70 after:to-transparent",
        className,
      )}
    />
  );
}
