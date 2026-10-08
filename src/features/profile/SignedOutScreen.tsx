"use client";

import { productConfig } from "@config/product.config";
import { routes } from "@/lib/routes";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

const strings = productConfig.content.signedOut;

/** After logout, and in place of any personal page while signed out. Signing back in returns to `next`, or Home. */
export function SignedOutScreen({ next }: { next?: string }) {
  return (
    <div className="container-page flex justify-center pb-16 pt-10 sm:pt-16">
      <div className="flex max-w-md flex-col items-center gap-5 text-center">
        <span aria-hidden="true" className="flex size-16 items-center justify-center rounded-full bg-primary-soft text-primary-dark">
          <Icon name="lock" size={28} />
        </span>
        <div className="flex flex-col gap-2">
          <h1 className="text-h1 font-extrabold tracking-tight text-text">{strings.title}</h1>
          <p className="text-body text-text-muted">{strings.body}</p>
        </div>
        <Button size="lg" leftIcon="profile" href={routes.signIn(next)}>
          {strings.signIn}
        </Button>
        <p className="text-xs text-text-muted">{strings.prototypeNote}</p>
      </div>
    </div>
  );
}
