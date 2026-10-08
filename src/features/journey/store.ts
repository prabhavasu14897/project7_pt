"use client";

import { useSyncExternalStore } from "react";
import { productConfig } from "@config/product.config";
import { getMedicine } from "@/features/medicines/medicineData";
import { computeTotals, toOrderLines, unitPrice } from "./pricing";
import { dayKey } from "@/lib/format";
import type {
  Address,
  Booking,
  CartLine,
  CheckoutDraft,
  FamilyMember,
  JourneyState,
  LabReport,
  Order,
  OrderStatus,
  Prescription,
  PrescriptionStatus,
  Profile,
  Reminder,
  ReminderKind,
  ReminderRepeat,
  Settings,
} from "./types";

const { demoData } = productConfig;
const STORAGE_KEY = "carenow.journey";
const VERSION = 5;

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
    // One past consult, so booking history isn't empty on first visit.
    bookings: [
      {
        id: "BK2041",
        kind: "doctor",
        serviceId: "priya-sharma",
        title: "Dr. Priya Sharma",
        providerId: "priya-sharma",
        providerName: "Dr. Priya Sharma",
        patientId: "self",
        patientName: demoData.familyMembers[0]?.name ?? "",
        mode: "online",
        slotAt: iso(now - 12 * DAY),
        fee: demoData.doctors[0]?.consult.online ?? 0,
        paymentMethod: "upi",
        status: "completed",
        createdAt: iso(now - 13 * DAY),
      },
    ],
    profile: { ...demoData.profile },
    familyMembers: demoData.familyMembers.map((member) => ({ ...member })),
    addresses: demoData.addresses.map((address) => ({ ...address })),
    savedPayments: demoData.savedPayments.map((item) => ({ ...item })),
    reminders: demoData.reminderSeed.map((item): Reminder => {
      const weekday = "weekday" in item ? item.weekday : undefined;
      const dueInDays = "dueInDays" in item ? item.dueInDays : undefined;
      return {
        id: item.id,
        patientId: item.patientId,
        kind: item.kind as ReminderKind,
        title: item.title,
        detail: item.detail,
        time: item.time,
        repeat: item.repeat as ReminderRepeat,
        weekday,
        date: dueInDays !== undefined ? dayKey(new Date(now + dueInDays * DAY)) : undefined,
        enabled: true,
        done: [],
      };
    }),
    reports: demoData.pastReports.map((item): LabReport => {
      const collected = now - item.daysAgo * DAY;
      return { id: item.id, testId: item.testId, labId: item.labId, patientId: item.patientId, collectedAt: iso(collected), reportedAt: iso(collected + DAY) };
    }),
    settings: {
      notifications: { ...demoData.settingsSeed.notifications },
      channels: { ...demoData.settingsSeed.channels },
      privacy: { ...demoData.settingsSeed.privacy },
    },
    session: { signedOut: false },
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

  /**
   * Pays for and confirms a booking. The "Next payment fails" prototype toggle makes it fail once,
   * booking nothing, so the user can retry.
   */
  placeBooking(input: Omit<Booking, "id" | "status" | "createdAt" | "progress">): { ok: true; bookingId: string } | { ok: false } {
    const current = getSnapshot();
    if (current.prototype.failNextPayment) {
      setState((s) => ({ ...s, prototype: { ...s.prototype, failNextPayment: false } }));
      return { ok: false };
    }
    const id = nextId("BK", current.bookings.map((item) => item.id), 2041);
    // Sample collection starts at "waiting for a technician", never at "assigned".
    const booking: Booking = { ...input, id, status: "confirmed", ...(input.kind === "lab-test" ? { progress: 1 } : {}), createdAt: iso(Date.now()) };
    setState((s) => ({ ...s, bookings: [booking, ...s.bookings] }));
    return { ok: true, bookingId: id };
  },

  cancelBooking(id: string) {
    setState((s) => ({
      ...s,
      bookings: s.bookings.map((item) => (item.id === id && item.status === "confirmed" ? { ...item, status: "cancelled" } : item)),
    }));
  },

  /**
   * Prototype control: the next sample-collection update (assigned, on the way, collected).
   * The step after "collected" is the report, which completes the booking.
   */
  advanceBooking(id: string, steps: number) {
    setState((s) => ({
      ...s,
      bookings: s.bookings.map((item) => {
        if (item.id !== id || item.status !== "confirmed" || item.progress === undefined) return item;
        const progress = item.progress + 1;
        return progress >= steps - 1 ? { ...item, progress: steps, status: "completed" } : { ...item, progress };
      }),
      reports: s.reports.concat(
        s.bookings
          .filter((item) => item.id === id && item.kind === "lab-test" && item.progress !== undefined && item.progress + 1 >= steps - 1)
          .filter((item) => !s.reports.some((report) => report.bookingId === item.id))
          .map((item) => ({
            id: `R${item.id.replace(/^BK/, "")}`,
            testId: item.serviceId,
            labId: item.providerId,
            patientId: item.patientId,
            collectedAt: item.slotAt,
            reportedAt: iso(Date.now()),
            bookingId: item.id,
          })),
      ),
    }));
  },

  /** Prototype control: the visit or consult happened. */
  completeBooking(id: string) {
    setState((s) => ({
      ...s,
      bookings: s.bookings.map((item) => (item.id === id && item.status === "confirmed" ? { ...item, status: "completed" } : item)),
    }));
  },

  /* ---------- profile and settings ---------- */

  updateProfile(profile: Profile) {
    setState((s) => ({
      ...s,
      profile,
      // The account holder's own entry follows their name.
      familyMembers: s.familyMembers.map((member) => (member.id === "self" ? { ...member, name: profile.name.split(" ")[0] ?? profile.name } : member)),
    }));
  },

  addFamilyMember(member: Omit<FamilyMember, "id">): string {
    const id = `member-${Date.now().toString(36)}`;
    setState((s) => ({ ...s, familyMembers: [...s.familyMembers, { ...member, id }] }));
    return id;
  },

  /** The account holder can't be removed; past bookings keep the name they were made with. */
  removeFamilyMember(id: string) {
    if (id === "self") return;
    setState((s) => ({
      ...s,
      familyMembers: s.familyMembers.filter((member) => member.id !== id),
      reminders: s.reminders.filter((reminder) => reminder.patientId !== id),
    }));
  },

  addAddress(address: Omit<Address, "id">): string {
    const id = `address-${Date.now().toString(36)}`;
    setState((s) => ({ ...s, addresses: [...s.addresses, { ...address, id }] }));
    return id;
  },

  /** The default address (the one checkout uses) can't be removed. */
  removeAddress(id: string) {
    setState((s) => (s.checkout.addressId === id ? s : { ...s, addresses: s.addresses.filter((address) => address.id !== id) }));
  },

  addUpi(upiId: string): string {
    const id = `upi-${Date.now().toString(36)}`;
    setState((s) => ({ ...s, savedPayments: [...s.savedPayments, { id, kind: "upi", label: upiId, detail: "UPI ID" }] }));
    return id;
  },

  removePayment(id: string) {
    setState((s) => ({ ...s, savedPayments: s.savedPayments.filter((item) => item.id !== id) }));
  },

  /** Checkout opens on the default method; a UPI ID is pre-filled. */
  setDefaultPayment(id: string) {
    setState((s) => {
      const saved = s.savedPayments.find((item) => item.id === id);
      if (!saved) return s;
      return {
        ...s,
        savedPayments: [saved, ...s.savedPayments.filter((item) => item.id !== id)],
        checkout: { ...s.checkout, paymentMethod: saved.kind, upiId: saved.kind === "upi" ? saved.label : s.checkout.upiId },
      };
    });
  },

  setSetting(group: keyof Settings, key: string, value: boolean) {
    setState((s) => ({ ...s, settings: { ...s.settings, [group]: { ...s.settings[group], [key]: value } } }));
  },

  signOut() {
    setState((s) => ({ ...s, session: { signedOut: true } }));
  },

  signIn() {
    setState((s) => ({ ...s, session: { signedOut: false } }));
  },

  /* ---------- reminders ---------- */

  addReminder(reminder: Omit<Reminder, "id" | "enabled" | "done">): string {
    const id = `rem-${Date.now().toString(36)}`;
    setState((s) => ({ ...s, reminders: [...s.reminders, { ...reminder, id, enabled: true, done: [] }] }));
    return id;
  },

  setReminderEnabled(id: string, enabled: boolean) {
    setState((s) => ({ ...s, reminders: s.reminders.map((item) => (item.id === id ? { ...item, enabled } : item)) }));
  },

  /** Tick a reminder off for a day, or untick it. */
  toggleReminderDone(id: string, day: string) {
    setState((s) => ({
      ...s,
      reminders: s.reminders.map((item) => {
        if (item.id !== id) return item;
        const done = item.done.some((entry) => entry.day === day)
          ? item.done.filter((entry) => entry.day !== day)
          : [...item.done, { day, at: iso(Date.now()) }];
        return { ...item, done };
      }),
    }));
  },

  removeReminder(id: string) {
    setState((s) => ({ ...s, reminders: s.reminders.filter((item) => item.id !== id) }));
  },

  setFailNextPayment(value: boolean) {
    setState((s) => ({ ...s, prototype: { ...s.prototype, failNextPayment: value } }));
  },

  reset() {
    setState(() => seed(Date.now()));
  },
};
