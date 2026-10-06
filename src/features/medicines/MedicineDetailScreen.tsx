"use client";

import Link from "next/link";
import { useState } from "react";
import { productConfig } from "@config/product.config";
import { fillTemplate } from "@/lib/format";
import { routes } from "@/lib/routes";
import { Notice } from "@/components/feedback/Notice";
import { ProviderCard } from "@/components/marketplace/ProviderCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { Price } from "@/components/ui/Price";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { Rating } from "@/components/ui/Rating";
import { TabPanel, Tabs } from "@/components/ui/Tabs";
import { useCart } from "@/features/cart/CartProvider";
import { medicineBadge, medicineStatusBadge, orderContaining } from "./medicineActions";
import { getMedicine, isOrderable, type Medicine, type MedicineOffer } from "./medicineData";

const { content, ui, categories } = productConfig;
const listingHref = categories.find((item) => item.key === "medicines")?.href ?? "/";
const strings = content.medicineDetail;
const listStrings = content.medicines;
const orderStrings = content.home.activeOrder;

type InfoTab = keyof typeof strings.tabs;

const MAX_QUANTITY = 10;

export function MedicineDetailScreen({ id }: { id: string }) {
  const medicine = getMedicine(id);
  if (!medicine) return null;
  return <Detail medicine={medicine} />;
}

function Detail({ medicine }: { medicine: Medicine }) {
  const cart = useCart();
  const [offerId, setOfferId] = useState<string | null>(medicine.defaultOffer?.pharmacyId ?? null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState<{ count: number; pharmacy: string } | null>(null);
  const [tab, setTab] = useState<InfoTab>("description");

  const order = orderContaining(medicine);
  const restricted = medicine.rule === "restricted";
  const offer: MedicineOffer | undefined = medicine.offers.find((item) => item.pharmacyId === offerId);
  const anyInStock = medicine.defaultOffer !== null;
  const shownPrice = offer?.price ?? medicine.defaultOffer?.price;
  const badge = medicineBadge(medicine);
  const statusBadge = medicineStatusBadge(medicine);

  const tabItems = (Object.keys(strings.tabs) as InfoTab[]).map((key) => ({ value: key, label: strings.tabs[key] }));
  const tabContent: Record<InfoTab, string | readonly string[]> = {
    description: medicine.description,
    uses: medicine.uses,
    sideEffects: medicine.sideEffects,
  };

  function addToCart() {
    if (!offer) return;
    cart.add(medicine.id, quantity, offer.pharmacyId);
    setAdded({ count: quantity, pharmacy: offer.pharmacyName });
  }

  /** The purchase panel's body follows the safety order: in review, restricted, prescription, out of stock, OTC. */
  function purchasePanel() {
    if (order) {
      return (
        <>
          <Notice tone="warning" icon="clock" title={strings.rxInOrder.title}>
            {fillTemplate(strings.rxInOrder.body, { id: order.id })}
          </Notice>
          <Button href={order.href} size="lg" fullWidth>
            {orderStrings.track}
          </Button>
        </>
      );
    }
    if (restricted) {
      return (
        <>
          <Notice tone="danger" icon="restricted" title={strings.restricted.title}>
            {strings.restricted.body}
          </Notice>
          <Button href={routes.explore({ category: "doctors" })} variant="outline" size="lg" fullWidth leftIcon="doctors">
            {strings.restricted.action}
          </Button>
        </>
      );
    }
    if (!anyInStock) {
      return (
        <Notice tone="neutral" icon="alert" title={strings.outOfStock.title}>
          {strings.outOfStock.body}
        </Notice>
      );
    }
    if (medicine.rule === "prescription") {
      return (
        <>
          <Notice tone="warning" icon="prescription" title={strings.rx.title}>
            {fillTemplate(strings.rx.body, { pharmacy: offer?.pharmacyName ?? "" })}
          </Notice>
          <ol aria-label={strings.rx.stepsLabel} className="flex flex-col gap-2">
            {strings.rx.steps.map((step, index) => (
              <li key={step} className="flex items-center gap-3 text-sm text-text">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-surface-muted text-xs font-bold text-text-muted tabular">
                  {index + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
          {/* Upload starts verification; nothing reaches the cart until a pharmacist approves. */}
          <Button href={routes.prescriptionUpload(medicine.id, offer?.pharmacyId)} size="lg" fullWidth leftIcon="upload">
            {ui.actions.uploadPrescription}
          </Button>
        </>
      );
    }
    return (
      <>
        <QuantityStepper
          label={strings.quantity}
          value={quantity}
          onChange={(value) => {
            setQuantity(value);
            setAdded(null);
          }}
          max={MAX_QUANTITY}
          decreaseLabel={strings.decrease}
          increaseLabel={strings.increase}
        />
        <Button size="lg" fullWidth leftIcon="cart" onClick={addToCart} disabled={!offer}>
          {strings.addToCart}
        </Button>
        <p aria-live="polite" className="min-h-5 text-sm">
          {added && (
            <span className="flex flex-wrap items-center gap-x-2 text-success-text">
              <Icon name="check" size={16} />
              {fillTemplate(strings.addedToCart, added)}
              <Link href={strings.cartHref} className="font-semibold text-primary-dark underline underline-offset-4">
                {strings.viewCart}
              </Link>
            </span>
          )}
        </p>
      </>
    );
  }

  return (
    <div className="container-page flex flex-col gap-5 pb-12 pt-4 sm:pt-6 lg:pb-16 lg:pt-8">
      <nav aria-label={strings.breadcrumbLabel}>
        <ol className="flex flex-wrap items-center gap-1.5 text-sm text-text-muted">
          <li>
            <Link href={routes.explore()} className="rounded-sm hover:text-text">
              {content.explore.title}
            </Link>
          </li>
          <li aria-hidden="true">
            <Icon name="chevron-right" size={14} />
          </li>
          <li>
            <Link href={listingHref} className="rounded-sm hover:text-text">
              {listStrings.title}
            </Link>
          </li>
          <li aria-hidden="true">
            <Icon name="chevron-right" size={14} />
          </li>
          <li aria-current="page" className="font-semibold text-text">
            {medicine.name}
          </li>
        </ol>
      </nav>

      {/* Desktop: summary and info on the left, purchase panel on the right. Phones read summary → purchase → info. */}
      <div className="grid gap-5 lg:grid-cols-12 lg:grid-rows-[auto_1fr] lg:items-start lg:gap-8">
        <Card padding="lg" className="flex flex-col gap-5 sm:flex-row lg:col-span-7">
          <div className="flex size-28 shrink-0 items-center justify-center self-start rounded-lg bg-[var(--cn-tone-medicines-bg)] text-[var(--cn-tone-medicines-fg)] sm:size-36">
            <Icon name={medicine.form} size={56} strokeWidth={1.6} />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <h1 className="text-h1 font-extrabold tracking-tight text-text">{medicine.name}</h1>
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={badge.tone} icon={badge.icon}>
                  {badge.label}
                </Badge>
                {statusBadge && (
                  <Badge tone={statusBadge.tone} icon={statusBadge.icon}>
                    {statusBadge.label}
                  </Badge>
                )}
                {medicine.reviews > 0 && <Rating value={medicine.rating} count={medicine.reviews} size="md" />}
              </div>
            </div>
            {shownPrice !== undefined && !restricted && <Price amount={shownPrice} mrp={medicine.mrp} size="lg" />}
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
              <dt className="text-text-muted">{strings.manufacturer}</dt>
              <dd className="font-semibold text-text">{medicine.manufacturer}</dd>
              <dt className="text-text-muted">{strings.pack}</dt>
              <dd className="font-semibold text-text">{medicine.pack}</dd>
              {!restricted && (
                <>
                  <dt className="text-text-muted">{strings.availability}</dt>
                  <dd className="font-semibold text-text">
                    {offer ? listStrings.availability[offer.stock] : listStrings.unavailableEverywhere}
                  </dd>
                </>
              )}
            </dl>
          </div>
        </Card>

        <div className="flex flex-col gap-5 lg:col-span-5 lg:row-span-2">
          <Card padding="lg" className="flex flex-col gap-4">
            {offer && !restricted && (
              <p className="flex items-center gap-2 text-sm text-text-muted">
                <Icon name="location" size={16} className="shrink-0 text-primary-dark" />
                <span>
                  <span className="font-semibold text-text">{offer.pharmacyName}</span> · {offer.eta}
                </span>
              </p>
            )}
            {purchasePanel()}
          </Card>

          {!restricted && medicine.offers.length > 0 && (
            <section aria-labelledby="medicine-pharmacies" className="flex flex-col gap-3">
              <h2 id="medicine-pharmacies" className="text-h3 font-bold text-text">
                {strings.pharmaciesTitle}
              </h2>
              <ul aria-label={strings.pharmaciesLabel} className="flex flex-col gap-3">
                {medicine.offers.map((item) => {
                  const selected = item.pharmacyId === offerId;
                  const orderable = isOrderable(item);
                  return (
                    <li key={item.pharmacyId}>
                      <ProviderCard
                        name={item.pharmacyName}
                        imageShape="rounded"
                        headingLevel="h3"
                        verifiedLabel={item.verified ? ui.labels.verified : undefined}
                        pendingLabel={item.verified ? undefined : content.explore.notVerified}
                        rating={{ value: item.rating, count: item.reviews }}
                        subtitle={item.verified ? undefined : listStrings.notSelectable}
                        meta={[
                          { icon: "package", label: listStrings.availability[item.stock] },
                          { icon: "delivery", label: item.eta },
                          { icon: "distance", label: item.distance },
                        ]}
                        price={{ amount: item.price }}
                        selected={selected}
                        action={{
                          label: selected ? ui.actions.selected : ui.actions.select,
                          ariaLabel: fillTemplate(ui.actions.itemLabel, {
                            action: selected ? ui.actions.selected : ui.actions.select,
                            item: item.pharmacyName,
                          }),
                          // Unverified or out-of-stock pharmacies can't fulfil an order, so they can't be chosen.
                          disabled: !orderable || Boolean(order),
                          variant: selected ? undefined : "outline",
                          onClick: () => {
                            setOfferId(item.pharmacyId);
                            setAdded(null);
                          },
                        }}
                      />
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
        </div>

        <Card padding="lg" className="flex flex-col gap-4 lg:col-span-7">
          <Tabs
            id="medicine-info"
            variant="underline"
            label={strings.infoTabsLabel}
            items={tabItems}
            value={tab}
            onChange={setTab}
            hasPanels
          />
          <TabPanel id="medicine-info" value={tab} className="rounded-sm text-body text-text">
            {(() => {
              const value = tabContent[tab];
              if (typeof value === "string") return <p className="max-w-[65ch]">{value}</p>;
              if (value.length === 0) return <p className="text-text-muted">{strings.noInfo}</p>;
              return (
                <ul className="flex list-disc flex-col gap-1.5 pl-5 marker:text-text-muted">
                  {value.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              );
            })()}
          </TabPanel>
          <p className="flex items-start gap-2 border-t border-border pt-4 text-xs text-text-muted">
            <Icon name="alert" size={14} className="mt-0.5 shrink-0" />
            {strings.infoNote}
          </p>
        </Card>
      </div>
    </div>
  );
}
