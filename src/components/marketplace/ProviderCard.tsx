import Link from "next/link";
import type { CardAction, MetaItem } from "@/types/models";
import { cn } from "@/lib/cn";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { ActionButton } from "@/components/ui/ActionButton";
import { Card } from "@/components/ui/Card";
import { Price } from "@/components/ui/Price";
import { Rating } from "@/components/ui/Rating";
import { MetaList } from "./MetaList";

export interface ProviderCardProps {
  name: string;
  href?: string;
  subtitle?: string;
  image?: string;
  /** Doctors use circular portraits; pharmacies and labs use rounded logo tiles. */
  imageShape?: "circle" | "rounded";
  verifiedLabel?: string;
  /** Shown in the same slot as `verifiedLabel` for providers still being checked. */
  pendingLabel?: string;
  /** Stretches the name link over the whole card; use when the card has no separate action. */
  linkCoversCard?: boolean;
  rating?: { value: number; count?: number };
  meta?: readonly MetaItem[];
  price?: { amount: number; mrp?: number; unit?: string };
  action?: CardAction;
  selected?: boolean;
  headingLevel?: "h2" | "h3" | "h4";
  className?: string;
}

/**
 * Pharmacy, doctor and diagnostic-lab row. Puts trust signals first: name, verification, rating, ETA.
 * From `sm` up, price and action move into a right-hand column like the desktop pharmacy comparison.
 */
export function ProviderCard({
  name,
  href,
  subtitle,
  image,
  imageShape = "circle",
  verifiedLabel,
  pendingLabel,
  linkCoversCard = false,
  rating,
  meta,
  price,
  action,
  selected = false,
  headingLevel: Heading = "h3",
  className,
}: ProviderCardProps) {
  return (
    <Card
      as="article"
      padding="sm"
      interactive={Boolean(href)}
      selected={selected}
      className={cn("flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4 sm:p-4", className)}
    >
      <div className="flex min-w-0 flex-1 gap-3 sm:gap-4">
        <Avatar name={name} src={image} shape={imageShape} size="md" />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <Heading className="text-body font-semibold leading-snug text-text">
              {href ? (
                <Link
                  href={href}
                  className={cn(
                    "rounded-sm hover:text-primary-deep",
                    linkCoversCard && "after:absolute after:inset-0 after:rounded-lg after:content-['']",
                  )}
                >
                  {name}
                </Link>
              ) : (
                name
              )}
            </Heading>
            {verifiedLabel ? (
              <Badge tone="success" icon="verified">
                {verifiedLabel}
              </Badge>
            ) : (
              pendingLabel && (
                <Badge tone="neutral" icon="clock">
                  {pendingLabel}
                </Badge>
              )
            )}
          </div>
          {subtitle && <p className="text-sm text-text-muted">{subtitle}</p>}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            {rating && <Rating value={rating.value} count={rating.count} />}
            {meta && <MetaList items={meta} />}
          </div>
        </div>
      </div>

      {(price || action) && (
        <div className="flex items-center justify-between gap-3 border-t border-border pt-3 sm:flex-col sm:items-end sm:justify-center sm:border-t-0 sm:pt-0">
          {price && <Price amount={price.amount} mrp={price.mrp} unit={price.unit} showDiscount={false} />}
          {action && (
            <ActionButton
              action={action}
              variant={selected ? "secondary" : undefined}
              leftIcon={selected ? "check" : undefined}
              pressed={action.onClick ? selected : undefined}
              // ml-auto keeps the action on the right when there's no price beside it.
              className="ml-auto min-w-22"
            />
          )}
        </div>
      )}
    </Card>
  );
}
