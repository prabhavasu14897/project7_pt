import { productConfig } from "@config/product.config";
import type { TimelineStep, Tone } from "@/types/models";
import type { IconName } from "@/components/ui/Icon";
import { fillTemplate, formatDateTime, formatTime } from "@/lib/format";
import { getMedicine } from "@/features/medicines/medicineData";
import type { PriceRow } from "@/components/marketplace/PriceBreakdown";
import type { JourneyState, Order, OrderStatus, Prescription, PrescriptionStatus } from "./types";

const { statuses, content } = productConfig;

export interface StatusBadge {
  label: string;
  tone: Tone;
  icon: IconName;
}

export function findPrescription(state: JourneyState, id: string): Prescription | undefined {
  return state.prescriptions.find((item) => item.id === id);
}

export function prescriptionForOrderRef(state: JourneyState, orderRef: string): Prescription | undefined {
  return state.prescriptions.find((item) => item.orderRef === orderRef);
}

export function medicineNames(ids: readonly string[]): string[] {
  return ids.map((id) => getMedicine(id)?.name).filter((name): name is string => Boolean(name));
}

/** "Amoxicillin 500mg + 1 more". */
export function summariseItems(names: readonly string[]): string {
  const [first, ...rest] = names;
  if (!first) return "";
  return rest.length > 0 ? fillTemplate(content.orders.itemsMore, { first, count: rest.length }) : first;
}

function eventTime(history: ReadonlyArray<{ status: string; at: string }>, status: string): string | undefined {
  const event = [...history].reverse().find((item) => item.status === status);
  return event ? formatDateTime(event.at) : undefined;
}

/* ---------- prescriptions ---------- */

const prescriptionBadges: Record<PrescriptionStatus, StatusBadge> = {
  "under-review": { label: statuses.prescription[1]?.label ?? "", tone: "warning", icon: "clock" },
  approved: { label: statuses.prescription[2]?.label ?? "", tone: "success", icon: "verified" },
  "needs-clarification": { label: statuses.prescriptionClarification.label, tone: "warning", icon: "alert" },
};

export function prescriptionBadge(prescription: Prescription): StatusBadge {
  return prescriptionBadges[prescription.status];
}

/** Uploaded → Under review (or Needs clarification) → Approved → Choose pharmacy and pay. */
export function prescriptionTimeline(prescription: Prescription): TimelineStep[] {
  const [uploaded, review, approved] = statuses.prescription;
  const next = content.verification.nextStep;
  const isApproved = prescription.status === "approved";
  const clarifying = prescription.status === "needs-clarification";
  return [
    { key: "uploaded", label: uploaded?.label ?? "", description: uploaded?.description, state: "complete", timestamp: eventTime(prescription.history, "uploaded") },
    clarifying
      ? {
          key: "needs-clarification",
          label: statuses.prescriptionClarification.label,
          description: prescription.note ?? statuses.prescriptionClarification.description,
          state: "attention",
          timestamp: eventTime(prescription.history, "needs-clarification"),
        }
      : {
          key: "under-review",
          label: review?.label ?? "",
          description: review?.description,
          state: isApproved ? "complete" : "current",
          timestamp: eventTime(prescription.history, "under-review"),
        },
    {
      key: "approved",
      label: approved?.label ?? "",
      description: isApproved ? statuses.orderVerifiedStep.description : approved?.description,
      state: isApproved ? "complete" : "upcoming",
      timestamp: eventTime(prescription.history, "approved"),
    },
    { key: next.key, label: next.label, description: next.description, state: isApproved ? "current" : "upcoming" },
  ];
}

/* ---------- orders ---------- */

const orderBadges: Record<OrderStatus, StatusBadge> = {
  confirmed: { label: statuses.order[0]?.label ?? "", tone: "primary", icon: "check" },
  preparing: { label: statuses.order[1]?.label ?? "", tone: "info", icon: "package" },
  "out-for-delivery": { label: statuses.order[2]?.label ?? "", tone: "info", icon: "delivery" },
  delivered: { label: statuses.order[3]?.label ?? "", tone: "success", icon: "check" },
  cancelled: { label: statuses.orderCancelled.label, tone: "neutral", icon: "close" },
  "payment-failed": { label: statuses.orderPaymentFailed.label, tone: "danger", icon: "alert" },
};

export function orderBadge(order: Order): StatusBadge {
  return orderBadges[order.status];
}

export function isOngoing(order: Order): boolean {
  return order.status === "confirmed" || order.status === "preparing" || order.status === "out-for-delivery";
}

export function hasPrescriptionItems(order: Order): boolean {
  return order.lines.some((line) => line.prescriptionId);
}

/** Delivery stages with times; Rx orders start with a completed "Prescription verified" step. Ends in a failed step when cancelled or unpaid. */
/** `verifiedAt`: when the prescription behind an Rx order was approved, for the first step's timestamp. */
export function orderTimeline(order: Order, verifiedAt?: string): TimelineStep[] {
  if (order.status === "payment-failed") {
    const failed = statuses.orderPaymentFailed;
    return [{ key: failed.key, label: failed.label, description: failed.description, state: "failed", timestamp: formatDateTime(order.placedAt) }];
  }
  const reachedIndex = order.status === "cancelled"
    ? Math.max(0, ...order.history.map((event) => statuses.order.findIndex((step) => step.key === event.status)))
    : statuses.order.findIndex((step) => step.key === order.status);

  const steps: TimelineStep[] = statuses.order.map((step, index) => {
    const isFinal = index === statuses.order.length - 1;
    const state: TimelineStep["state"] =
      index < reachedIndex || (index === reachedIndex && (isFinal || order.status === "cancelled"))
        ? "complete"
        : index === reachedIndex
          ? "current"
          : "upcoming";
    return { key: step.key, label: step.label, description: step.description, state, timestamp: eventTime(order.history, step.key) };
  });

  const verified = statuses.orderVerifiedStep;
  const withRx: TimelineStep[] = hasPrescriptionItems(order)
    ? [
        {
          key: verified.key,
          label: verified.label,
          description: verified.description,
          state: "complete",
          timestamp: verifiedAt ? formatDateTime(verifiedAt) : undefined,
        },
        ...steps,
      ]
    : steps;

  if (order.status !== "cancelled") return withRx;
  const cancelled = statuses.orderCancelled;
  return [
    ...withRx.filter((step) => step.state === "complete"),
    { key: cancelled.key, label: cancelled.label, description: cancelled.description, state: "failed", timestamp: eventTime(order.history, "cancelled") },
  ];
}

export function orderItemNames(order: Order): string[] {
  return medicineNames(order.lines.map((line) => line.medicineId));
}

/* ---------- money ---------- */

/** Rows for PriceBreakdown, shared by cart, checkout, payment and the order summary. */
export function priceRows(totals: { items: number; discount: number; delivery: number; expressFee?: number }): PriceRow[] {
  const strings = content.cart;
  const rows: PriceRow[] = [{ label: strings.itemTotal, amount: totals.items }];
  if (totals.discount > 0) rows.push({ label: strings.discount, amount: totals.discount, kind: "discount" });
  const shipment = totals.delivery - (totals.expressFee ?? 0);
  rows.push({ label: strings.delivery, amount: shipment, kind: shipment === 0 ? "free" : "default" });
  if (totals.expressFee) rows.push({ label: strings.expressFee, amount: totals.expressFee });
  return rows;
}

/** A cart is checkout-ready only when every prescription line points at an approved prescription. */
export function blockedLines(state: JourneyState): string[] {
  return Object.values(state.cart)
    .filter((line) => {
      if (getMedicine(line.medicineId)?.rule !== "prescription") return false;
      const prescription = line.prescriptionId ? findPrescription(state, line.prescriptionId) : undefined;
      return prescription?.status !== "approved";
    })
    .map((line) => line.medicineId);
}

/** When an ongoing order should arrive, as a headline: express is placed time + 1 hour, slots use their label. */
export function expectedArrival(order: Order): string | undefined {
  if (!isOngoing(order)) return undefined;
  const strings = content.tracking;
  if (order.slotId === "express") {
    return fillTemplate(strings.arrivingBy, { time: formatTime(new Date(Date.parse(order.placedAt) + 60 * 60_000).toISOString()) });
  }
  if (order.slotId === "later" && order.laterSlot) return fillTemplate(strings.arrivingSlot, { slot: order.laterSlot });
  const slot = productConfig.demoData.deliverySlots.find((item) => item.id === order.slotId);
  return slot ? fillTemplate(strings.arrivingSlot, { slot: `${slot.label}, ${slot.detail}` }) : undefined;
}

/** When the prescription behind an order was approved, if the order has one. */
export function orderVerifiedAt(state: JourneyState, order: Order): string | undefined {
  const prescriptionId = order.lines.find((line) => line.prescriptionId)?.prescriptionId;
  const prescription = prescriptionId ? findPrescription(state, prescriptionId) : undefined;
  return [...(prescription?.history ?? [])].reverse().find((event) => event.status === "approved")?.at;
}
