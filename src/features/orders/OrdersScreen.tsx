"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { productConfig } from "@config/product.config";
import type { CardAction, TimelineStep } from "@/types/models";
import { fillTemplate, formatDateTime, formatPrice } from "@/lib/format";
import { EmptyState } from "@/components/feedback/EmptyState";
import { OrderStatusCard } from "@/components/healthcare/OrderStatusCard";
import { TabPanel, Tabs } from "@/components/ui/Tabs";
import { journey, useJourney } from "@/features/journey/store";
import {
  isOngoing,
  medicineNames,
  orderBadge,
  orderItemNames,
  orderTimeline,
  prescriptionBadge,
  prescriptionTimeline,
  summariseItems,
  type StatusBadge,
} from "@/features/journey/selectors";
import type { Order, Prescription } from "@/features/journey/types";
import { getMedicine } from "@/features/medicines/medicineData";

const { content, categories, ui } = productConfig;
const strings = content.orders;
const medicinesHref = categories.find((item) => item.key === "medicines")?.href ?? "/";

type Tab = keyof typeof strings.tabs;

interface Entry {
  key: string;
  at: string;
  heading: string;
  context: string;
  status: StatusBadge;
  items: string;
  description?: string;
  /** Absent for finished orders, where a progress bar would only say "Step 4 of 4". */
  steps?: TimelineStep[];
  action: CardAction;
}

function progress(steps: readonly TimelineStep[]): string {
  const reached = steps.filter((step) => step.state !== "upcoming").length;
  return fillTemplate(content.home.activeOrder.stepOf, { current: reached, total: steps.length });
}

function fromPrescription(prescription: Prescription): Entry {
  const steps = prescriptionTimeline(prescription);
  const current = steps.find((step) => step.state === "current" || step.state === "attention");
  const uploadedAt = prescription.history[0]?.at ?? "";
  return {
    key: prescription.id,
    at: uploadedAt,
    heading: fillTemplate(strings.requestTitle, { id: prescription.id }),
    context: uploadedAt ? formatDateTime(uploadedAt) : "",
    status: prescriptionBadge(prescription),
    items: summariseItems(medicineNames(prescription.medicineIds)),
    description: current?.description,
    steps,
    action: { label: strings.verify, href: `/prescriptions/${prescription.id}` },
  };
}

/** One named next step per status. */
function orderAction(order: Order, reorder: (id: string) => void): CardAction {
  const details = `/orders/${order.id}`;
  if (isOngoing(order)) return { label: strings.track, href: details };
  const canReorder = order.lines.some((line) => getMedicine(line.medicineId)?.rule === "otc");
  if (order.status === "payment-failed" && canReorder) return { label: strings.retry, onClick: () => reorder(order.id) };
  if (order.status === "delivered" && canReorder) {
    const hasRx = order.lines.some((line) => getMedicine(line.medicineId)?.rule !== "otc");
    return { label: hasRx ? strings.reorderOtc : strings.reorder, variant: "outline", onClick: () => reorder(order.id) };
  }
  return { label: strings.viewDetails, href: details, variant: "outline" };
}

function fromOrder(order: Order, reorder: (id: string) => void): Entry {
  const steps = orderTimeline(order);
  const current = [...steps].reverse().find((step) => step.state !== "upcoming");
  return {
    key: order.id,
    at: order.placedAt,
    heading: fillTemplate(strings.orderTitle, { id: order.id }),
    context: `${formatDateTime(order.placedAt)} · ${formatPrice(order.totals.total)}`,
    status: orderBadge(order),
    items: summariseItems(orderItemNames(order)),
    description: current?.description,
    steps: isOngoing(order) ? steps : undefined,
    action: orderAction(order, reorder),
  };
}

export function OrdersScreen() {
  const state = useJourney();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("ongoing");

  const reorder = (id: string) => {
    journey.reorder(id);
    router.push(content.medicineDetail.cartHref);
  };

  // A prescription stays "ongoing" until an order has been placed with it.
  const ordered = new Set(state.orders.flatMap((order) => order.lines.map((line) => line.prescriptionId)).filter(Boolean));
  const openRequests = state.prescriptions.filter((item) => !ordered.has(item.id)).map(fromPrescription);

  const byNewest = (a: Entry, b: Entry) => b.at.localeCompare(a.at);
  const ongoing = [...openRequests, ...state.orders.filter(isOngoing).map((order) => fromOrder(order, reorder))].sort(byNewest);
  const past = state.orders
    .filter((order) => !isOngoing(order))
    .map((order) => fromOrder(order, reorder))
    .sort(byNewest);
  const entries = tab === "ongoing" ? ongoing : past;

  const tabItems = (Object.keys(strings.tabs) as Tab[]).map((key) => ({
    value: key,
    label: strings.tabs[key],
    count: key === "ongoing" ? ongoing.length : past.length,
  }));

  return (
    <div className="container-page flex flex-col gap-5 pb-12 pt-4 sm:pt-6 lg:pb-16 lg:pt-8">
      <h1 className="text-h1 font-extrabold tracking-tight text-text">{strings.title}</h1>
      <Tabs
        id="orders"
        variant="segmented"
        label={strings.tabsLabel}
        items={tabItems}
        value={tab}
        onChange={setTab}
        hasPanels
        className="sm:self-start"
      />
      <TabPanel id="orders" value={tab} className="rounded-lg focus-visible:outline-offset-4">
        {entries.length > 0 ? (
          <ul className="grid gap-4 lg:grid-cols-2">
            {entries.map((entry) => (
              <li key={entry.key} className="flex">
                <OrderStatusCard
                  className="flex-1"
                  heading={entry.heading}
                  context={entry.context}
                  status={entry.status}
                  items={entry.items}
                  description={entry.description}
                  steps={entry.steps}
                  progressLabel={entry.steps ? progress(entry.steps) : undefined}
                  action={entry.action}
                />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            icon="orders"
            title={tab === "ongoing" ? strings.emptyOngoingTitle : strings.emptyPastTitle}
            description={tab === "ongoing" ? strings.emptyOngoing : strings.emptyPast}
            action={{ label: strings.browse, href: medicinesHref }}
            secondaryAction={{ label: ui.actions.uploadPrescription, href: "/prescriptions/upload" }}
          />
        )}
      </TabPanel>
    </div>
  );
}
