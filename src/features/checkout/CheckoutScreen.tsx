"use client";

import { productConfig } from "@config/product.config";
import { formatPrice } from "@/lib/format";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Notice } from "@/components/feedback/Notice";
import { PriceBreakdown } from "@/components/marketplace/PriceBreakdown";
import { MobileActionBar, PayTotal } from "@/components/navigation/MobileActionBar";
import { StepIndicator } from "@/components/navigation/StepIndicator";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { RadioCardGroup } from "@/components/ui/RadioCardGroup";
import { Select } from "@/components/ui/Select";
import { journey, useJourney } from "@/features/journey/store";
import { computeTotals, toOrderLines } from "@/features/journey/pricing";
import { blockedLines, priceRows } from "@/features/journey/selectors";
import { getMedicine } from "@/features/medicines/medicineData";

const { content, demoData } = productConfig;
const strings = content.checkout;
const cartStrings = content.cart;
const cartHref = content.medicineDetail.cartHref;

export function CheckoutScreen() {
  const state = useJourney();
  const lines = toOrderLines(state.cart);
  const totals = computeTotals(lines, state.checkout);
  const blocked = blockedLines(state).length > 0;

  if (lines.length === 0 || blocked) {
    return (
      <div className="container-page py-8">
        <EmptyState
          icon="cart"
          title={lines.length === 0 ? cartStrings.emptyTitle : cartStrings.blocked}
          description={lines.length === 0 ? strings.emptyRedirect : undefined}
          action={{ label: content.checkout.steps[0] ?? "", href: cartHref }}
        />
      </div>
    );
  }

  return (
    <div className="container-page flex flex-col gap-5 pb-12 pt-4 sm:pt-6 lg:pb-16 lg:pt-8">
      <div className="flex flex-col gap-3">
        <StepIndicator steps={strings.steps} current={1} label={strings.stepsLabel} />
        <h1 className="text-h1 font-extrabold tracking-tight text-text">{strings.title}</h1>
      </div>

      <div className="grid gap-5 lg:grid-cols-12 lg:items-start lg:gap-8">
        <div className="flex flex-col gap-5 lg:col-span-8">
          <Card padding="lg">
            <RadioCardGroup
              legend={strings.addressTitle}
              columns={2}
              value={state.checkout.addressId}
              onChange={(addressId) => journey.updateCheckout({ addressId })}
              options={state.addresses.map((address) => ({
                value: address.id,
                label: address.label,
                description: `${address.line1}, ${address.line2}`,
                icon: address.id === "home" ? "home" : "location",
              }))}
            />
          </Card>

          <Card padding="lg">
            <RadioCardGroup
              legend={strings.slotTitle}
              columns={3}
              value={state.checkout.slotId}
              onChange={(slotId) => journey.updateCheckout({ slotId })}
              options={demoData.deliverySlots.map((slot) => ({
                value: slot.id,
                label: slot.label,
                description: slot.detail,
                aside: slot.fee > 0 ? `+${formatPrice(slot.fee)}` : undefined,
              }))}
              renderSelected={(slotId) =>
                slotId === "later" ? (
                  <Select
                    label={strings.laterSlotLabel}
                    layout="stacked"
                    value={state.checkout.laterSlot}
                    options={demoData.laterSlots.map((slot) => ({ value: slot, label: slot }))}
                    onChange={(laterSlot) => journey.updateCheckout({ laterSlot })}
                  />
                ) : null
              }
            />
          </Card>

          <Card padding="lg" className="flex flex-col gap-3">
            <h2 className="text-h3 font-bold text-text">{strings.itemsTitle}</h2>
            <ul className="flex flex-col divide-y divide-border text-sm">
              {lines.map((line) => (
                <li key={line.medicineId} className="flex items-baseline justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                  <span className="text-text">
                    {getMedicine(line.medicineId)?.name} <span className="text-text-muted tabular">× {line.quantity}</span>
                  </span>
                  <span className="font-semibold text-text tabular">{formatPrice(line.unitPrice * line.quantity)}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <Card padding="lg" className="flex flex-col gap-5 lg:sticky lg:top-24 lg:col-span-4">
          <PriceBreakdown
            title={cartStrings.summaryTitle}
            rows={priceRows(totals)}
            total={{ label: cartStrings.total, amount: totals.total }}
            freeLabel={cartStrings.free}
          />
          {lines.some((line) => line.prescriptionId) && (
            <Notice tone="success" icon="verified" title={cartStrings.prescriptionApproved} />
          )}
          <span className="hidden lg:contents">
            <Button href="/checkout/payment" size="lg" fullWidth rightIcon="chevron-right">
              {strings.continue}
            </Button>
          </span>
        </Card>
      </div>

      <MobileActionBar summary={<PayTotal label={cartStrings.total} amount={totals.total} />}>
        <Button href="/checkout/payment" rightIcon="chevron-right">
          {strings.continue}
        </Button>
      </MobileActionBar>
    </div>
  );
}
