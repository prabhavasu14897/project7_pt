import Image from "next/image";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";

interface HomeHeroProps {
  id: string;
  title: string;
  subtitle: string;
  /** Shorter line for narrow screens. */
  subtitleShort: string;
  cta: { label: string; href: string };
  /** The prescription upload entry; leads in the compact panel. */
  secondaryCta: { label: string; shortLabel: string; href: string };
  /** Compact phone strip: one line explaining the short Upload button. */
  uploadPrompt: string;
  image: { src: string; alt: string };
  /**
   * `full`: photo banner, used when there's no live order to lead with.
   * `compact`: slim brand panel that supports the order card: a strip on phones, a side panel on desktop.
   */
  variant?: "full" | "compact";
  className?: string;
}

/** Deep-teal brand panel. The page greeting is the h1, so this titles its own section with an h2. */
export function HomeHero({
  id,
  title,
  subtitle,
  subtitleShort,
  cta,
  secondaryCta,
  uploadPrompt,
  image,
  variant = "full",
  className,
}: HomeHeroProps) {
  if (variant === "compact") {
    return (
      <section
        aria-labelledby={id}
        className={cn(
          "flex items-center gap-4 rounded-xl bg-primary-deep p-4 text-white",
          "lg:flex-col lg:items-stretch lg:justify-between lg:gap-6 lg:p-6",
          className,
        )}
      >
        <div className="flex min-w-0 flex-1 flex-col gap-1 lg:flex-none lg:gap-2">
          <h2 id={id} className="text-body font-bold text-balance lg:text-h2 lg:font-extrabold lg:tracking-tight">
            {title}
          </h2>
          <p className="text-xs text-white/85 lg:hidden">{uploadPrompt}</p>
          <p className="hidden text-sm text-white/85 lg:block">{subtitle}</p>
        </div>
        <div className="flex shrink-0 flex-col gap-3">
          {/* Phones get the short label; the accessible name stays the full action. */}
          <span className="contents lg:hidden">
            <Button href={secondaryCta.href} variant="inverse" leftIcon="upload" aria-label={secondaryCta.label}>
              {secondaryCta.shortLabel}
            </Button>
          </span>
          <span className="hidden lg:contents">
            <Button href={secondaryCta.href} variant="inverse" leftIcon="upload" fullWidth>
              {secondaryCta.label}
            </Button>
          </span>
          <span className="hidden lg:contents">
            <Button href={cta.href} variant="inverseOutline" fullWidth>
              {cta.label}
            </Button>
          </span>
        </div>
      </section>
    );
  }

  return (
    <section
      aria-labelledby={id}
      className={cn(
        "relative isolate flex min-h-46 overflow-hidden rounded-xl bg-primary-deep text-white sm:min-h-64 lg:min-h-[19rem]",
        className,
      )}
    >
      <div className="relative z-10 flex w-[62%] flex-col justify-center gap-2 p-4 sm:w-[58%] sm:gap-4 sm:p-8 lg:w-[62%] lg:p-9">
        <h2 id={id} className="max-w-[11ch] text-h2 font-extrabold tracking-tight text-balance sm:text-h1 lg:text-display">
          {title}
        </h2>
        <p className="text-sm text-white/85 sm:hidden">{subtitleShort}</p>
        <p className="hidden max-w-[34ch] text-body text-white/85 sm:block">{subtitle}</p>
        <div className="mt-1 flex flex-wrap items-center gap-2 sm:mt-2 sm:gap-3">
          <Button href={cta.href} variant="inverse">
            {cta.label}
          </Button>
          <span className="hidden md:contents">
            <Button href={secondaryCta.href} variant="inverseOutline" leftIcon="upload">
              {secondaryCta.label}
            </Button>
          </span>
        </div>
      </div>

      <div className="absolute inset-y-0 right-0 w-[40%] sm:w-[42%] lg:w-[38%]">
        <Image
          src={image.src}
          alt={image.alt}
          fill
          priority
          sizes="(min-width: 1024px) 400px, 42vw"
          className="object-cover object-[50%_18%]"
        />
      </div>
    </section>
  );
}
