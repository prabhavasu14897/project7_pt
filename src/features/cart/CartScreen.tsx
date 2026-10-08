"use client";

import { useState, type FormEvent } from "react";
import { productConfig } from "@config/product.config";
import { fillTemplate, formatPrice } from "@/lib/format";
import { ruleBadge } from "@/lib/medicine";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Notice } from "@/components/feedback/Notice";
import { CartItem } from "@/components/marketplace/CartItem";
import { PriceBreakdown } from "@/components/marketplace/PriceBreakdown";
import { MobileActionBar, PayTotal } from "@/components/navigation/MobileActionBar";
import { StepIndicator } from "@/components/navigation/StepIndicator";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { Input } from "@/components/ui/Input";
import { journey, useJourney } from "@/features/journey/store";
import { computeTotals, findCoupon, groupByPharmacy, pharmacyName, toOrderLines } from "@/features/journey/pricing";
import { blockedLines, priceRows } from "@/features/journey/selectors";
import { getMedicine } from "@/features/medicines/medicineData";

const { content, demoData } = productConfig;
const strings = content.cart;
const detail = content.medicineDetail;

const MAX_QUANTITY = 10;

export function CartScreen() {
  const state = useJourney();
  const lines = toOrderLines(state.cart);
  const totals = computeTotals(lines, state.checkout);
  const blocked = blockedLines(state);
  const coupon = findCoupon(state.checkout.couponCode);
  const [code, setCode] = useState("");
  const [couponError, setCouponError] = useState<string | undefined>();

  if (lines.length === 0) {
    return (
      <div className="container-page py-8">
        <EmptyState
          icon="cart"
          title={strings.emptyTitle}
          description={strings.emptyDescription}
          action={{ label: strings.emptyAction, href: productConfig.categories.find((item) => item.key === "medicines")?.href ?? "/" }}
        />
      </div>
    );
  }

  function applyCoupon(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!findCoupon(code)) return setCouponError(strings.couponInvalid);
    journey.updateCheckout({ couponCode: code.trim().toUpperCase() });
    setCode("");
    setCouponError(undefined);
  }

  return (
    <div className="container-page flex flex-col gap-5 pb-12 pt-4 sm:pt-6 lg:pb-16 lg:pt-8">
      <div className="flex flex-col gap-3">
        <StepIndicator steps={content.checkout.steps} current={0} label={content.checkout.stepsLabel} />
        <div className="flex flex-col gap-1">
          <h1 className="text-h1 font-extrabold tracking-tight text-text">{strings.title}</h1>
          <p className="text-sm font-semibold text-text-muted tabular">
            {fillTemplate(strings.itemCount, { count: lines.reduce((sum, line) => sum + line.quantity, 0) })}
          </p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-12 lg:items-start lg:gap-8">
        <div className="flex flex-col gap-4 lg:col-span-8">
          {groupByPharmacy(lines).map((group) => (
            <Card key={group.pharmacyId} as="section" padding="lg" aria-label={fillTemplate(strings.fromPharmacy, { pharmacy: pharmacyName(group.pharmacyId) })}>
              <h2 className="flex items-center gap-2 border-b border-border pb-3 text-sm font-normal text-text-muted">
                <Icon name="location" size={16} className="shrink-0 text-primary-dark" />
                <span className="font-semibold text-text">{fillTemplate(strings.fromPharmacy, { pharmacy: pharmacyName(group.pharmacyId) })}</span>
                <span>· {demoData.pharmacies.find((item) => item.id === group.pharmacyId)?.eta}</span>
              </h2>
              <ul className="divide-y divide-border">
                {group.lines.map((line) => {
                  const medicine = getMedicine(line.medicineId);
                  if (!medicine) return null;
                  const rule = ruleBadge(medicine.rule);
                  const isRx = medicine.rule === "prescription";
                  const needsApproval = blocked.includes(line.medicineId);
                  return (
                    <CartItem
                      key={line.medicineId}
                      title={medicine.name}
                      href={medicine.href}
                      subtitle={medicine.pack}
                      icon={medicine.form}
                      tone="medicines"
                      // One status per line: Rx lines show their verification state, OTC lines their rule.
                      badges={[
                        isRx
                          ? needsApproval
                            ? { label: strings.prescriptionMissing, tone: "danger" as const, icon: "alert" as const }
                            : { label: strings.prescriptionApproved, tone: "success" as const, icon: "verified" as const }
                          : rule,
                      ]}
                      unitPrice={line.unitPrice}
                      quantity={line.quantity}
                      // Prescription items ship as prescribed; only OTC quantities can change here.
                      quantityControl={
                        isRx
                          ? undefined
                          : {
                              onChange: (value) => journey.setQuantity(line.medicineId, value),
                              max: MAX_QUANTITY,
                              label: detail.quantity,
                              decreaseLabel: detail.decrease,
                              increaseLabel: detail.increase,
                            }
                      }
                      fixedQuantityLabel={strings.prescribedQuantity}
                      onRemove={() => journey.removeFromCart(line.medicineId)}
                      removeLabel={fillTemplate(strings.remove, { item: medicine.name })}
                    />
                  );
                })}
              </ul>
            </Card>
          ))}
        </div>

        <Card padding="lg" className="flex flex-col gap-5 lg:sticky lg:top-24 lg:col-span-4">
          {coupon ? (
            <div className="flex items-center justify-between gap-3 rounded-md bg-success-soft p-3">
              <p className="flex items-center gap-2 text-sm text-success-text">
                <Icon name="tag" size={16} className="shrink-0" />
                {fillTemplate(strings.couponApplied, { code: coupon.code, description: coupon.description })}
              </p>
              <Button variant="link" className="min-h-11 shrink-0" onClick={() => journey.updateCheckout({ couponCode: null })}>
                {strings.couponRemove}
              </Button>
            </div>
          ) : (
            <form onSubmit={applyCoupon} className="flex items-start gap-2">
              <Input
                label={strings.couponLabel}
                hideLabel
                leftIcon="tag"
                placeholder={strings.couponPlaceholder}
                value={code}
                onChange={(event) => {
                  setCode(event.target.value);
                  setCouponError(undefined);
                }}
                error={couponError}
                containerClassName="flex-1"
                autoCapitalize="characters"
              />
              <Button type="submit" variant="outline" className="h-12">
                {strings.couponApply}
              </Button>
            </form>
          )}

          <PriceBreakdown
            title={strings.summaryTitle}
            rows={priceRows(totals)}
            total={{ label: strings.total, amount: totals.total }}
            freeLabel={strings.free}
            note={fillTemplate(strings.freeDeliveryHint, { amount: formatPrice(demoData.delivery.freeAbove) })}
          />

          {blocked.length > 0 && <Notice tone="danger" icon="alert" title={strings.blocked} />}
          <span className="hidden lg:contents">
            <Button href={blocked.length > 0 ? undefined : "/checkout"} size="lg" fullWidth disabled={blocked.length > 0} rightIcon="chevron-right">
              {strings.checkout}
            </Button>
          </span>
        </Card>
      </div>

      <MobileActionBar summary={<PayTotal label={strings.total} amount={totals.total} />}>
        <Button href={blocked.length > 0 ? undefined : "/checkout"} disabled={blocked.length > 0} rightIcon="chevron-right">
          {strings.checkout}
        </Button>
      </MobileActionBar>

    </div>
  );
}
