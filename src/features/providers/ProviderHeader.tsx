import Link from "next/link";
import type { ReactNode } from "react";
import { productConfig } from "@config/product.config";
import type { MetaItem } from "@/types/models";
import { Notice } from "@/components/feedback/Notice";
import { MetaList } from "@/components/marketplace/MetaList";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { Rating } from "@/components/ui/Rating";

const { content, ui } = productConfig;
const strings = content.providerDetail;

interface ProviderHeaderProps {
  name: string;
  verified: boolean;
  rating: number;
  reviews: number;
  meta: readonly MetaItem[];
  /** Where the breadcrumb's parent link goes, and what it says. */
  back: { label: string; href: string };
  /** Where "See verified providers" leads when this one isn't verified. */
  verifiedHref: string;
  children?: ReactNode;
}

/** Breadcrumb, identity card and, for unverified providers, why nothing can be ordered here. Shared by pharmacy and lab pages. */
export function ProviderHeader({ name, verified, rating, reviews, meta, back, verifiedHref, children }: ProviderHeaderProps) {
  return (
    <>
      <nav aria-label={strings.breadcrumbLabel}>
        <ol className="flex flex-wrap items-center gap-1.5 text-sm text-text-muted">
          <li>
            <Link href={back.href} className="inline-flex min-h-11 items-center rounded-sm hover:text-text">
              {back.label}
            </Link>
          </li>
          <li aria-hidden="true">
            <Icon name="chevron-right" size={14} />
          </li>
          <li aria-current="page" className="font-semibold text-text">
            {name}
          </li>
        </ol>
      </nav>

      <Card padding="lg" className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <Avatar name={name} shape="rounded" size="lg" />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <h1 className="text-h1 font-extrabold tracking-tight text-text">{name}</h1>
          <div className="flex flex-wrap items-center gap-2">
            {verified ? (
              <Badge tone="success" icon="verified">
                {ui.labels.verified}
              </Badge>
            ) : (
              <Badge tone="neutral" icon="clock">
                {content.explore.notVerified}
              </Badge>
            )}
            <Rating value={rating} count={reviews} size="md" />
          </div>
          <MetaList items={meta} />
          {children}
        </div>
      </Card>

      {!verified && (
        <Notice tone="neutral" icon="clock" title={content.explore.notVerified}>
          <p>{strings.notVerifiedNote}</p>
          <Button href={verifiedHref} variant="link" size="sm" rightIcon="chevron-right" className="mt-1">
            {strings.browseVerified}
          </Button>
        </Notice>
      )}
    </>
  );
}
