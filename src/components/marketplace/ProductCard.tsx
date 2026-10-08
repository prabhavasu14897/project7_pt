import Image from "next/image";
import Link from "next/link";
import type { CardAction, MetaItem, Tone } from "@/types/models";
import { cn } from "@/lib/cn";
import { Badge } from "@/components/ui/Badge";
import { ActionButton } from "@/components/ui/ActionButton";
import { Card } from "@/components/ui/Card";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Price } from "@/components/ui/Price";
import { Rating } from "@/components/ui/Rating";
import { MetaList } from "./MetaList";

export interface ProductCardProps {
  title: string;
  href?: string;
  subtitle?: string;
  image?: { src: string; alt: string };
  /** Fallback thumbnail when there is no product photo. */
  icon?: string;
  /** Key into `theme.categoryTones` for the fallback thumbnail tint. */
  tone?: string;
  badge?: { label: string; tone: Tone; icon?: IconName };
  /** Live state shown beside `badge` (e.g. "Under review"), so the item's rule stays visible. */
  statusBadge?: { label: string; tone: Tone; icon?: IconName };
  rating?: { value: number; count?: number };
  price?: { amount: number; mrp?: number; unit?: string };
  meta?: readonly MetaItem[];
  action?: CardAction;
  /** Explains a disabled or special state, e.g. why a restricted item can't be bought. */
  note?: string;
  headingLevel?: "h2" | "h3" | "h4";
  className?: string;
}

/**
 * Horizontal listing row used by medicines, lab tests, home-care services and packages.
 * Thumbnail · details · price and action. Mobile and desktop share the same layout; desktop grids place rows side by side.
 */
export function ProductCard({
  title,
  href,
  subtitle,
  image,
  icon = "package",
  tone = "medicines",
  badge,
  statusBadge,
  rating,
  price,
  meta,
  action,
  note,
  headingLevel: Heading = "h3",
  className,
}: ProductCardProps) {
  return (
    <Card as="article" padding="sm" interactive={Boolean(href)} className={cn("flex gap-3 sm:gap-4 sm:p-4", className)}>
      <div
        className="flex size-18 shrink-0 items-center justify-center overflow-hidden rounded-md sm:size-20"
        style={
          image
            ? undefined
            : {
                color: `var(--cn-tone-${tone}-fg, var(--color-primary-dark))`,
                backgroundColor: `var(--cn-tone-${tone}-bg, var(--color-primary-soft))`,
              }
        }
      >
        {image ? (
          <Image src={image.src} alt={image.alt} width={80} height={80} className="size-full object-cover" />
        ) : (
          <Icon name={icon} size={30} />
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <Heading className="text-body font-semibold leading-snug text-text">
          {href ? (
            <Link href={href} className="-my-3 inline-block rounded-sm py-3 hover:text-primary-deep">
              {title}
            </Link>
          ) : (
            title
          )}
        </Heading>
        {subtitle && <p className="text-xs text-text-muted">{subtitle}</p>}

        {(badge || statusBadge || rating) && (
          <div className="mt-0.5 flex flex-wrap items-center gap-2">
            {badge && (
              <Badge tone={badge.tone} icon={badge.icon}>
                {badge.label}
              </Badge>
            )}
            {statusBadge && (
              <Badge tone={statusBadge.tone} icon={statusBadge.icon}>
                {statusBadge.label}
              </Badge>
            )}
            {rating && <Rating value={rating.value} count={rating.count} />}
          </div>
        )}

        {meta && <MetaList items={meta} className="mt-0.5" />}
        {note && (
          <p className="mt-1 flex items-start gap-1.5 text-xs text-text-muted">
            <Icon name="alert" size={14} className="mt-px shrink-0" />
            {note}
          </p>
        )}

        {/* The price never shrinks; a wide action wraps below it rather than pushing the discount onto a second line. */}
        {(price || action) && (
          <div className="mt-auto flex flex-wrap items-end justify-between gap-x-3 gap-y-2 pt-2">
            {price ? (
              <span className="shrink-0">
                <Price amount={price.amount} mrp={price.mrp} unit={price.unit} />
              </span>
            ) : (
              <span />
            )}
            {action && <ActionButton action={action} className="ml-auto min-w-18" />}
          </div>
        )}

      </div>
    </Card>
  );
}
