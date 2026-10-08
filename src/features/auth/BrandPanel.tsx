import Image from "next/image";
import { productConfig } from "@config/product.config";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";
import { LogoMark } from "@/components/navigation/Logo";

const { brand, content } = productConfig;

/**
 * Desktop brand side of sign-in: the deep-teal band from Home, the brand promise, a doctor photo
 * that takes whatever height is left, and the safety promises CareNow already makes elsewhere.
 */
export function BrandPanel({ className }: { className?: string }) {
  return (
    <section
      aria-labelledby="brand-panel-title"
      className={cn("relative isolate flex-col gap-6 overflow-hidden rounded-xl bg-primary-deep p-10 text-white xl:p-12", className)}
    >
      <p className="flex items-center gap-2.5 text-h3 font-extrabold tracking-tight">
        <span className="flex size-11 items-center justify-center rounded-lg bg-white">
          <LogoMark size={28} />
        </span>
        {brand.name}
      </p>

      <div className="flex max-w-md flex-col gap-3">
        <h2 id="brand-panel-title" className="text-balance text-display font-extrabold tracking-tight">
          {content.auth.brandTitle}
        </h2>
        <p className="text-body text-white/85">{content.auth.brandBody}</p>
      </div>

      <div className="relative min-h-40 flex-1 overflow-hidden rounded-lg bg-white/10">
        <Image src={content.auth.brandImage.src} alt={content.auth.brandImage.alt} fill sizes="(min-width: 1280px) 560px, 45vw" className="object-cover object-[50%_30%]" />
      </div>

      <ul className="grid grid-cols-2 gap-x-6 gap-y-3">
        {content.trust.map((item) => (
          <li key={item.key} className="flex items-center gap-2.5">
            <span aria-hidden="true" className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/10">
              <Icon name={item.icon} size={16} />
            </span>
            <span className="text-sm font-semibold">{item.title}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
