"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { productConfig } from "@config/product.config";
import { fillTemplate, formatDateTime, formatPrice } from "@/lib/format";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Notice } from "@/components/feedback/Notice";
import { PrototypeControls } from "@/components/feedback/PrototypeControls";
import { StatusTimeline } from "@/components/healthcare/StatusTimeline";
import { PriceBreakdown } from "@/components/marketplace/PriceBreakdown";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { journey, orderProgression, useJourney } from "@/features/journey/store";
import { pharmacyName } from "@/features/journey/pricing";
import { expectedArrival, orderBadge, orderTimeline, prescriptionForOrderRef, priceRows } from "@/features/journey/selectors";
import { getMedicine } from "@/features/medicines/medicineData";

const { content, demoData } = productConfig;
const strings = content.tracking;
const cartHref = content.medicineDetail.cartHref;

export function OrderTrackingScreen({ id }: { id: string }) {
  const router = useRouter();
  const state = useJourney();
  const order = state.orders.find((item) => item.id === id);
  // Home's active order is still a prescription in review: send it to the verification view.
  const request = order ? undefined : prescriptionForOrderRef(state, id);
  const [confirmingCancel, setConfirmingCancel] = useState(false);

  useEffect(() => {
    if (request) router.replace(`/prescriptions/${request.id}`);
  }, [request, router]);

  if (request) return null;
  if (!order) {
    return (
      <div className="container-page py-8">
        <EmptyState
          icon="orders"
          title={strings.notFoundTitle}
          description={strings.notFoundDescription}
          action={{ label: strings.backToOrders, href: "/orders" }}
        />
      </div>
    );
  }

  const badge = orderBadge(order);
  const arrival = expectedArrival(order);
  const timelineNow = orderTimeline(order).find((step) => step.state === "current");
  const address = demoData.addresses.find((item) => item.id === order.addressId);
  const method = demoData.paymentMethods.find((item) => item.id === order.paymentMethod);
  const partner = demoData.deliveryPartner;
  const canAdvance = orderProgression.indexOf(order.status) >= 0 && order.status !== "delivered";
  const canCancel = order.status === "confirmed" || order.status === "preparing";
  const deliveredAt = order.history.find((event) => event.status === "delivered")?.at;
  const pharmacies = [...new Set(order.lines.map((line) => pharmacyName(line.pharmacyId)))].join(", ");

  function reorder() {
    journey.reorder(order!.id);
    router.push(cartHref);
  }

  return (
    <div className="container-page flex flex-col gap-5 pb-12 pt-4 sm:pt-6 lg:pb-16 lg:pt-8">
      <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
        <div className="flex flex-col gap-1">
          <h1 className="text-h1 font-extrabold tracking-tight text-text">
            {content.home.activeOrder.orderPrefix} #{order.id}
          </h1>
          <p className="text-sm text-text-muted tabular">{fillTemplate(strings.placedAt, { time: formatDateTime(order.placedAt) })}</p>
        </div>
        <Badge tone={badge.tone} icon={badge.icon} size="md">
          {badge.label}
        </Badge>
      </div>

      <div className="grid gap-5 lg:grid-cols-12 lg:items-start lg:gap-8">
        <div className="flex flex-col gap-5 lg:col-span-7">
          {/* Arrival is the headline while an order is on its way; the courier joins it once dispatched. */}
          {arrival && (
            <Card padding="lg" className="flex flex-col gap-4">
              <div role="status" className="flex flex-col gap-1">
                <p className="text-h2 font-extrabold tracking-tight text-text">{arrival}</p>
                <p className="text-sm text-text-muted">
                  {order.status === "confirmed" ? fillTemplate(strings.justPlaced, { pharmacy: pharmacies }) : timelineNow?.description}
                </p>
              </div>
              {order.status === "out-for-delivery" && (
                <div className="flex flex-wrap items-center gap-4 border-t border-border pt-4">
                  <Avatar name={partner.name} />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="text-xs font-semibold text-text-muted">{strings.partnerTitle}</span>
                    <span className="text-body font-semibold text-text">{partner.name}</span>
                    <span className="text-sm text-text-muted tabular">{partner.vehicle}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button href={`tel:${partner.phone}`} variant="outline" leftIcon="phone">
                      {strings.call}
                    </Button>
                    <Button href={`sms:${partner.phone}`} variant="outline" leftIcon="message">
                      {strings.message}
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          )}
          {order.status === "delivered" && deliveredAt && (
            <Notice tone="success" icon="package" title={badge.label} live>
              {fillTemplate(strings.delivered, { time: formatDateTime(deliveredAt) })}
            </Notice>
          )}
          {order.status === "payment-failed" && (
            <Notice tone="danger" icon="alert" title={content.payment.failedTitle}>
              {productConfig.statuses.orderPaymentFailed.description}
            </Notice>
          )}


          <Card padding="lg" className="flex flex-col gap-4">
            <StatusTimeline steps={orderTimeline(order)} label={strings.timelineLabel} />
            {canCancel &&
              (confirmingCancel ? (
                <div className="flex flex-col gap-3 rounded-md bg-surface-muted p-4">
                  <p className="text-sm text-text">{strings.cancelConfirm}</p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="danger"
                      onClick={() => {
                        journey.cancelOrder(order.id);
                        setConfirmingCancel(false);
                      }}
                    >
                      {strings.cancelYes}
                    </Button>
                    <Button variant="ghost" onClick={() => setConfirmingCancel(false)}>
                      {strings.cancelNo}
                    </Button>
                  </div>
                </div>
              ) : (
                <Button variant="outline" leftIcon="close" className="self-start" onClick={() => setConfirmingCancel(true)}>
                  {strings.cancel}
                </Button>
              ))}
          </Card>

          {canAdvance && (
            <PrototypeControls title={content.prototype.title} description={content.prototype.description}>
              <Button size="sm" variant="outline" leftIcon="delivery" onClick={() => journey.advanceOrder(order.id)}>
                {content.prototype.advanceOrder}
              </Button>
            </PrototypeControls>
          )}
        </div>

        <div className="flex flex-col gap-5 lg:col-span-5">
          <Card padding="lg" className="flex flex-col gap-4">
            <h2 className="text-h3 font-bold text-text">{strings.itemsTitle}</h2>
            <ul className="flex flex-col divide-y divide-border text-sm">
              {order.lines.map((line) => (
                <li key={line.medicineId} className="flex items-baseline justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                  <span className="flex flex-col">
                    <span className="text-text">
                      {getMedicine(line.medicineId)?.name} <span className="text-text-muted tabular">× {line.quantity}</span>
                    </span>
                    <span className="text-xs text-text-muted">{pharmacyName(line.pharmacyId)}</span>
                  </span>
                  <span className="font-semibold text-text tabular">{formatPrice(line.unitPrice * line.quantity)}</span>
                </li>
              ))}
            </ul>
            <PriceBreakdown
              rows={priceRows(order.totals)}
              total={{ label: content.cart.total, amount: order.totals.total }}
              freeLabel={content.cart.free}
              className="border-t border-border pt-4"
            />
            {(order.status === "delivered" || order.status === "cancelled" || order.status === "payment-failed") &&
              order.lines.some((line) => getMedicine(line.medicineId)?.rule === "otc") && (
                <Button variant={order.status === "payment-failed" ? "primary" : "outline"} leftIcon="reorder" onClick={reorder}>
                  {order.status === "payment-failed" ? content.orders.retry : strings.reorder}
                </Button>
              )}
          </Card>

          <Card padding="lg" className="flex flex-col gap-3 text-sm">
            <h2 className="text-h3 font-bold text-text">{strings.addressTitle}</h2>
            {address && (
              <p className="text-text">
                <span className="font-semibold">{address.label}</span> · {address.line1}, {address.line2}
              </p>
            )}
            {method && order.status !== "payment-failed" && (
              <p className="text-text-muted">{fillTemplate(strings.paidWith, { method: method.label })}</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
