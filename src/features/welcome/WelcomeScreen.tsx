import Image from "next/image";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { productConfig } from "@config/product.config";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { LogoMark } from "@/components/navigation/Logo";

const { brand, content } = productConfig;
const strings = content.welcome;
const photo = strings.image;

/** One staggered settle on load; the global reduced-motion rule turns it off. */
function Rise({ step, className, children }: { step: number; className?: string; children: ReactNode }) {
  const style: CSSProperties = { animationDelay: `${step * 80}ms` };
  return (
    <div style={style} className={cn("motion-safe:animate-[cn-rise_700ms_cubic-bezier(0.16,1,0.3,1)_both]", className)}>
      {children}
    </div>
  );
}

function TrustLine({ className }: { className?: string }) {
  return (
    <p className={cn("text-white/80", className)}>
      <Icon name="verified" size={16} aria-hidden="true" className="mr-1.5 inline-block align-[-3px]" />
      {strings.trustLine}
    </p>
  );
}

/**
 * The front door at `/`. Phones: the photo fills the top and fades into the field; the promise and actions sit below it.
 * lg+: as the reference board: greenery fills the screen with her sharp in the lower right, a deep blue-green shade from the left carries the promise,
 * one wide Get started with Log in beneath it, and the trust line at the foot.
 */
export function WelcomeScreen() {
  return (
    <section aria-labelledby="welcome-title" className="relative isolate flex min-h-dvh overflow-hidden bg-primary-deep text-white lg:bg-text">
      {/* Phones: one photo plate across the top, faded into the teal field. */}
      <div className="absolute inset-x-0 top-0 -z-10 h-[60%] overflow-hidden sm:h-[64%] lg:hidden">
        <Image src={photo.src} alt={photo.alt} fill priority sizes="100vw" quality={90} className="object-cover object-[100%_30%]" />
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-3/4 bg-linear-to-b from-transparent via-primary-deep/75 via-60% to-primary-deep" />
      </div>

      {/* Desktop, as the reference board: out-of-focus greenery fills the screen (a blurred, enlarged copy of the photo top-left corner, which is greenery only),
          she sits sharp in the lower right with soft edges, and a deep blue-green shade from the left carries the text.
          Showing the photo at about 60% of the width keeps the small source close to its real size. */}
      <div aria-hidden="true" className="absolute inset-0 -z-10 hidden overflow-hidden lg:block">
        <Image src={photo.src} alt="" fill sizes="50vw" quality={60} className="origin-top-left scale-[2.4] object-cover object-left-top blur-2xl" />
        <div
          className="absolute bottom-0 right-0 aspect-[496/338] w-[min(64vw,1100px)]"
          style={{ maskImage: "linear-gradient(to right, transparent, #000 32%), linear-gradient(to bottom, transparent, #000 22%)", maskComposite: "intersect", WebkitMaskComposite: "source-in" }}
        >
          <Image src={photo.src} alt="" fill sizes="64vw" quality={90} className="object-cover" />
        </div>
        {/* A deep blue-green shade from the left so the text reads over the photo, easing out before her face. */}
        <div className="absolute inset-0 bg-linear-to-r from-text from-10% via-text/80 via-40% to-text/0 to-75%" />
        <div className="absolute inset-0 bg-text/15" />
      </div>

      <div className="container-page flex min-h-dvh flex-col pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-10 sm:pt-14 lg:py-12">
        <div className="flex flex-1 flex-col items-center justify-end gap-5 pb-7 text-center lg:pb-0 lg:max-w-xl lg:items-start lg:justify-center lg:gap-8 lg:text-left">
          <Rise step={0} className="flex items-center gap-3 lg:gap-4">
            <span aria-hidden="true" className="flex size-12 items-center justify-center rounded-lg bg-white shadow-raised sm:size-14 lg:size-auto lg:bg-transparent lg:shadow-none [&>svg]:size-[34px] sm:[&>svg]:size-10 lg:[&>svg]:size-[4.75rem]">
              <LogoMark size={48} />
            </span>
            <h1 id="welcome-title" className="text-[clamp(2.5rem,7vw,4.75rem)] font-extrabold leading-none tracking-[-0.03em]">
              {brand.name}
            </h1>
          </Rise>

          <Rise step={1} className="flex flex-col gap-3">
            <p className="text-balance text-h3 font-bold sm:text-h2 lg:text-[2rem] lg:leading-tight">{brand.tagline}</p>
            <p className="text-sm text-white/85 sm:text-body">{strings.services}</p>
          </Rise>

          <Rise step={3} className="hidden w-full flex-col items-start gap-5 lg:mt-2 lg:flex">
            <Button href={routes.home()} size="lg" className="w-full max-w-md text-h3 font-bold focus-visible:outline-white">
              {strings.getStarted}
            </Button>
            <Button href={routes.signIn()} variant="inverseOutline" className="w-52 focus-visible:outline-white">
              {strings.logIn}
            </Button>
          </Rise>
        </div>

        <Rise step={3} className="mx-auto flex w-full max-w-md flex-col items-center gap-2 lg:hidden">
          <Button href={routes.home()} variant="inverse" size="lg" fullWidth className="font-bold">
            {strings.getStarted}
          </Button>
          <p className="flex flex-wrap items-center justify-center gap-x-1.5 text-sm text-white/80">
            {strings.haveAccount}
            <Link href={routes.signIn()} className="inline-flex min-h-11 items-center font-bold text-white underline underline-offset-4 hover:no-underline focus-visible:outline-white">
              {strings.logIn}
            </Link>
          </p>
        </Rise>

        <Rise step={4} className="mt-4 flex justify-center lg:mt-0 lg:justify-start">
          <TrustLine className="max-w-md text-balance text-center text-xs sm:text-sm lg:text-left" />
        </Rise>
      </div>
    </section>
  );
}
