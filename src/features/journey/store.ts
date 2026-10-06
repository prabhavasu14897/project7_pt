"use client";

import { useSyncExternalStore } from "react";
import { productConfig } from "@config/product.config";
import { getMedicine } from "@/features/medicines/medicineData";
import { computeTotals, toOrderLines, unitPrice } from "./pricing";
import type { CartLine, CheckoutDraft, JourneyState, Order, OrderStatus, Prescription, PrescriptionStatus } from "./types";

const { demoData } = productConfig;
const STORAGE_KEY = "carenow.journey";
const VERSION = 2;

const MINUTE = 60_000;
const DAY = 24 * 60 * MINUTE;

/** Order of delivery statuses a presenter can advance through. */
export const orderProgression: readonly OrderStatus[] = ["confirmed", "preparing", "out-for-delivery", "delivered"];

/** Minutes from the previous stage, for simulated courier updates. */
const stageGapMinutes: Partial<Record<OrderStatus, number>> = { preparing: 6, "out-for-delivery": 18, delivered: 24 };

function iso(ms: number): string {
  return new Date(ms).toISOString();
}

/** Demo state relative to `now`, so seeded times read naturally ("12 min ago", "3 days ago"). */
function seed(now: number): JourneyState {
  const rx = demoData.seedPrescription;
  const uploaded = now - rx.uploadedMinutesAgo * MINUTE;

  const orders: Order[] = demoData.orderHistory.map((entry) => {
    const placed = now - entry.daysAgo * DAY;
    const lines = entry.lines.map((line) => ({ ...line, unitPrice: unitPrice(line.medicineId, line.pharmacyId) }));
    const totals = computeTotals(lines, { couponCode: null, slotId: entry.slotId });
    const status = entry.status as OrderStatus;
    const reached =
      status === "delivered"
        ? orderProgression
        : status === "cancelled"
          ? (["confirmed", "cancelled"] as const)
          : (["payment-failed"] as const);
    return {
      id: entry.id,
      placedAt: iso(placed),
      lines,
      addressId: entry.addressId,
      slotId: entry.slotId,
      paymentMethod: entry.paymentMethod,
      totals: { items: totals.items, discount: totals.discount, delivery: totals.delivery, expressFee: totals.expressFee, total: totals.total },
      status,
      history: reached.map((step, index) => ({ status: step, at: iso(placed + index * 40 * MINUTE) })),
    };
  });

  return {
    version: VERSION,
    prescriptions: [
      {
        id: rx.id,
        orderRef: rx.orderRef,
        medicineIds: [...demoData.activeOrder.medicineIds],
        pharmacyId: demoData.activeOrder.pharmacyId,
        fileName: rx.fileName,
        fileSizeKb: rx.fileSizeKb,
        status: "under-review",
        history: [
          { status: "uploaded", at: iso(uploaded) },
          { status: "under-review", at: iso(uploaded + MINUTE) },
        ],
      },
    ],
    cart: {},
    checkout: {
      addressId: demoData.addresses[0]?.id ?? "",
      slotId: demoData.deliverySlots[0]?.id ?? "",
      laterSlot: demoData.laterSlots[0] ?? "",
      couponCode: null,
      paymentMethod: demoData.paymentMethods[0]?.id ?? "",
      upiId: "",
      wallet: demoData.wallets[0] ?? "",
    },
    orders,
    prototype: { failNextPayment: false },
  };
}

/* ---------- external store ---------- */

let state: JourneyState | null = null;
const listeners = new Set<() => void>();
// Rendered on the server and during hydration; screens show a skeleton until the client store is ready.
const serverState = seed(0);

function read(): JourneyState {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as JourneyState;
      if (parsed.version === VERSION) return parsed;
    }
  } catch {
    // Storage blocked or corrupt: fall back to fresh demo data.
  }
  return seed(Date.now());
}

function getSnapshot(): JourneyState {
  state ??= read();
  return state;
}

function setState(update: (current: JourneyState) => JourneyState) {
  state = update(getSnapshot());
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Not persisted; the in-memory journey still works for this tab.
  }
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useJourney(): JourneyState {
  return useSyncExternalStore(subscribe, getSnapshot, () => serverState);
}

const noopSubscribe = () => () => {};
/** False during server render and hydration, true once the browser store can be read. */
export function useHydrated(): boolean {
  return useSyncExternalStore(noopSubscribe, () => true, () => false);
}

/* ---------- ids ---------- */

function nextId(prefix: string, existing: readonly string[], start: number): string {
  const numbers = existing.map((id) => Number.parseInt(id.replace(/\D/g, ""), 10)).filter(Number.isFinite);
  return `${prefix}${Math.max(start, ...numbers) + 1}`;
}

/* ---------- actions ---------- */

export const journey = {
  uploadPrescription(input: { medicineIds: string[]; pharmacyId?: string; fileName: string; fileSizeKb: number }): string {
    const current = getSnapshot();
    const id = nextId("RX-", current.prescriptions.map((item) => item.id), 48213);
    const now = Date.now();
    const prescription: Prescription = {
      id,
      medicineIds: input.medicineIds,
      pharmacyId: input.pharmacyId,
      fileName: input.fileName,
      fileSizeKb: input.fileSizeKb,
      // Always lands in review first: approval is never instant.
      status: "under-review",
      history: [
        { status: "uploaded", at: iso(now) },
        { status: "under-review", at: iso(now) },
      ],
    };
    setState((s) => ({ ...s, prescriptions: [prescription, ...s.prescriptions] }));
    return id;
  },

  /** Prototype control: the pharmacist's decision. */
  decidePrescription(id: string, status: Exclude<PrescriptionStatus, "under-review">, note?: string) {
    setState((s) => ({
      ...s,
      prescriptions: s.prescriptions.map((item) =>
        item.id === id && item.status === "under-review"
          ? { ...item, status, note, history: [...item.history, { status, at: iso(Date.now()) }] }
          : item,
      ),
    }));
  },

  reuploadPrescription(id: string, file: { fileName: string; fileSizeKb: number }) {
    const now = iso(Date.now());
    setState((s) => ({
      ...s,
      prescriptions: s.prescriptions.map((item) =>
        item.id === id
          ? {
              ...item,
              ...file,
              status: "under-review",
              note: undefined,
              history: [...item.history, { status: "uploaded", at: now }, { status: "under-review", at: now }],
            }
          : item,
      ),
    }));
  },

  /* cart */
  addToCart(line: CartLine) {
    setState((s) => {
      const existing = s.cart[line.medicineId];
      // One medicine ships from one pharmacy: a different pharmacy replaces the line.
      const keep = existing && existing.pharmacyId === line.pharmacyId ? existing.quantity : 0;
      return { ...s, cart: { ...s.cart, [line.medicineId]: { ...line, quantity: keep + line.quantity } } };
    });
  },
  /** Prescription items arrive at the prescribed quantity, replacing any earlier line. */
  addPrescribed(prescriptionId: string, medicineIds: readonly string[], pharmacyId: string) {
    setState((s) => {
      const cart = { ...s.cart };
      for (const medicineId of medicineIds) cart[medicineId] = { medicineId, quantity: 1, pharmacyId, prescriptionId };
      return { ...s, cart };
    });
  },
  setQuantity(medicineId: string, quantity: number) {
    setState((s) => {
      const line = s.cart[medicineId];
      if (!line) return s;
      return { ...s, cart: { ...s.cart, [medicineId]: { ...line, quantity } } };
    });
  },
  removeFromCart(medicineId: string) {
    setState((s) => {
      const { [medicineId]: _removed, ...cart } = s.cart;
      return { ...s, cart };
    });
  },

  /* checkout */
  updateCheckout(patch: Partial<CheckoutDraft>) {
    setState((s) => ({ ...s, checkout: { ...s.checkout, ...patch } }));
  },

  /**
   * Pays for the current cart. Success creates a confirmed order and empties the cart;
   * failure (prototype toggle) changes nothing except clearing the toggle, so the user can retry.
   */
  placeOrder(): { ok: true; orderId: string } | { ok: false } {
    const current = getSnapshot();
    if (current.prototype.failNextPayment) {
      setState((s) => ({ ...s, prototype: { ...s.prototype, failNextPayment: false } }));
      return { ok: false };
    }
    const lines = toOrderLines(current.cart);
    const totals = computeTotals(lines, current.checkout);
    // A prescription that was shown with an order number keeps it once paid, so the user tracks one order end to end.
    const reference = lines
      .map((line) => current.prescriptions.find((item) => item.id === line.prescriptionId)?.orderRef)
      .find((ref) => ref && !current.orders.some((order) => order.id === ref));
    const orderId = reference ?? nextId("CN", [...current.orders.map((o) => o.id), demoData.activeOrder.id], 123456);
    const now = iso(Date.now());
    const order: Order = {
      id: orderId,
      placedAt: now,
      lines,
      addressId: current.checkout.addressId,
      slotId: current.checkout.slotId,
      laterSlot: current.checkout.slotId === "later" ? current.checkout.laterSlot : undefined,
      paymentMethod: current.checkout.paymentMethod,
      totals: { items: totals.items, discount: totals.discount, delivery: totals.delivery, expressFee: totals.expressFee, total: totals.total },
      status: "confirmed",
      history: [{ status: "confirmed", at: now }],
    };
    setState((s) => ({ ...s, orders: [order, ...s.orders], cart: {}, checkout: { ...s.checkout, couponCode: null } }));
    return { ok: true, orderId };
  },

  /** Prototype control: the courier's next update. */
  advanceOrder(id: string) {
    setState((s) => ({
      ...s,
      orders: s.orders.map((order) => {
        const index = orderProgression.indexOf(order.status);
        const next = orderProgression[index + 1];
        if (order.id !== id || index < 0 || !next) return order;
        // Simulated courier time: each stage lands a plausible gap after the previous one.
        const last = Date.parse(order.history[order.history.length - 1]?.at ?? order.placedAt);
        const at = iso(last + (stageGapMinutes[next] ?? 10) * MINUTE);
        return { ...order, status: next, history: [...order.history, { status: next, at }] };
      }),
    }));
  },

  cancelOrder(id: string) {
    setState((s) => ({
      ...s,
      orders: s.orders.map((order) =>
        order.id === id && (order.status === "confirmed" || order.status === "preparing")
          ? { ...order, status: "cancelled", history: [...order.history, { status: "cancelled", at: iso(Date.now()) }] }
          : order,
      ),
    }));
  },

  /** Puts a past order's items back in the cart (reorder, or retry after a failed payment). */
  reorder(id: string) {
    const order = getSnapshot().orders.find((item) => item.id === id);
    if (!order) return;
    for (const line of order.lines) {
      // Prescription items need a fresh, approved prescription, so they aren't re-added.
      if (getMedicine(line.medicineId)?.rule !== "otc") continue;
      journey.addToCart({ medicineId: line.medicineId, quantity: line.quantity, pharmacyId: line.pharmacyId });
    }
  },

  setFailNextPayment(value: boolean) {
    setState((s) => ({ ...s, prototype: { ...s.prototype, failNextPayment: value } }));
  },

  reset() {
    setState(() => seed(Date.now()));
  },
};
