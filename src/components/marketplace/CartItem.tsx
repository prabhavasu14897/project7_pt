import Link from "next/link";
import type { MetaItem, Tone } from "@/types/models";
import { cn } from "@/lib/cn";
import { Badge } from "@/components/ui/Badge";
import { Icon, type IconName } from "@/components/ui/Icon";
import { IconButton } from "@/components/ui/IconButton";
import { Price } from "@/components/ui/Price";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { MetaList } from "./MetaList";

interface CartItemProps {
  title: string;
  href?: string;
  subtitle?: string;
  icon: string;
  tone: string;
  badges?: ReadonlyArray<{ label: string; tone: Tone; icon?: IconName }>;
  meta?: readonly MetaItem[];
  unitPrice: number;
  quantity: number;
  /** Omit to show a fixed quantity (e.g. as prescribed) with `fixedQuantityLabel`. */
  quantityControl?: {
    onChange: (value: number) => void;
    max: number;
    label: string;
    decreaseLabel: string;
    increaseLabel: string;
  };
  fixedQuantityLabel?: string;
  onRemove: () => void;
  removeLabel: string;
  className?: string;
}

/** One cart line: what it is, where it ships from, how many, and the line total. */
export function CartItem({
  title,
  href,
  subtitle,
  icon,
  tone,
  badges,
  meta,
  unitPrice,
  quantity,
  quantityControl,
  fixedQuantityLabel,
  onRemove,
  removeLabel,
  className,
}: CartItemProps) {
  return (
    <li className={cn("flex gap-3 py-4 sm:gap-4", className)}>
      <div
        className="flex size-16 shrink-0 items-center justify-center rounded-md sm:size-18"
        style={{
          color: `var(--cn-tone-${tone}-fg, var(--color-primary-dark))`,
          backgroundColor: `var(--cn-tone-${tone}-bg, var(--color-primary-soft))`,
        }}
      >
        <Icon name={icon} size={28} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 flex-col gap-0.5">
            <h3 className="text-body font-semibold leading-snug text-text">
              {href ? (
                <Link href={href} className="rounded-sm hover:text-primary-deep">
                  {title}
                </Link>
              ) : (
                title
              )}
            </h3>
            {subtitle && <p className="text-xs text-text-muted">{subtitle}</p>}
          </div>
          <IconButton icon="trash" label={removeLabel} onClick={onRemove} className="-mr-2 -mt-2 text-text-muted" />
        </div>

        {badges && badges.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {badges.map((badge) => (
              <Badge key={badge.label} tone={badge.tone} icon={badge.icon}>
                {badge.label}
              </Badge>
            ))}
          </div>
        )}
        {meta && <MetaList items={meta} />}

        <div className="mt-1 flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
          {quantityControl ? (
            <QuantityStepper
              label={quantityControl.label}
              hideLabel
              value={quantity}
              onChange={quantityControl.onChange}
              max={quantityControl.max}
              decreaseLabel={quantityControl.decreaseLabel}
              increaseLabel={quantityControl.increaseLabel}
            />
          ) : (
            <p className="text-sm text-text-muted">
              {fixedQuantityLabel} · <span className="font-semibold text-text tabular">{quantity}</span>
            </p>
          )}
          <Price amount={unitPrice * quantity} />
        </div>
      </div>
    </li>
  );
}
