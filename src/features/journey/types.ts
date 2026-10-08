/** Prototype journey state: prescription requests, cart, checkout choices and orders. API-shaped so it can be swapped for a backend. */

export type PrescriptionStatus = "under-review" | "approved" | "needs-clarification";

export interface PrescriptionEvent {
  status: "uploaded" | PrescriptionStatus;
  at: string;
}

export interface Prescription {
  id: string;
  /** Order reference shown to the user while the request is in review (e.g. Home's active order). */
  orderRef?: string;
  medicineIds: string[];
  /** Pharmacy the user had chosen when uploading; reviews happen there. */
  pharmacyId?: string;
  fileName: string;
  fileSizeKb: number;
  status: PrescriptionStatus;
  /** Pharmacist's note when clarification is needed. */
  note?: string;
  history: PrescriptionEvent[];
}

export interface CartLine {
  medicineId: string;
  quantity: number;
  pharmacyId?: string;
  /** Required for prescription medicines; must point at an approved prescription. */
  prescriptionId?: string;
}

export interface CheckoutDraft {
  addressId: string;
  slotId: string;
  laterSlot: string;
  couponCode: string | null;
  paymentMethod: string;
  upiId: string;
  wallet: string;
}

export type OrderStatus = "confirmed" | "preparing" | "out-for-delivery" | "delivered" | "cancelled" | "payment-failed";

export interface OrderLine {
  medicineId: string;
  pharmacyId: string;
  quantity: number;
  unitPrice: number;
  prescriptionId?: string;
}

export interface OrderTotals {
  items: number;
  discount: number;
  /** All delivery charges, including `expressFee`. */
  delivery: number;
  expressFee?: number;
  total: number;
}

export interface Order {
  id: string;
  placedAt: string;
  lines: OrderLine[];
  addressId: string;
  slotId: string;
  /** Chosen "later" slot label, when slotId is "later". */
  laterSlot?: string;
  paymentMethod: string;
  totals: OrderTotals;
  status: OrderStatus;
  history: Array<{ status: OrderStatus; at: string }>;
}

export type BookingStatus = "confirmed" | "completed" | "cancelled";

/** A paid appointment: doctor consult, home-care visit or health-package collection. */
export interface Booking {
  id: string;
  kind: "doctor" | "home-care" | "package" | "lab-test";
  serviceId: string;
  title: string;
  providerId: string;
  providerName: string;
  /** Who the care is for (family member id and display name). */
  patientId: string;
  patientName: string;
  /** Video, clinic or at home. */
  mode: "online" | "clinic" | "home";
  slotAt: string;
  addressId?: string;
  fee: number;
  paymentMethod: string;
  status: BookingStatus;
  /** Lab tests: index of the collection step in progress (1 = waiting for a technician). */
  progress?: number;
  createdAt: string;
}

export interface JourneyState {
  version: number;
  prescriptions: Prescription[];
  cart: Record<string, CartLine>;
  checkout: CheckoutDraft;
  orders: Order[];
  bookings: Booking[];
  profile: Profile;
  familyMembers: FamilyMember[];
  addresses: Address[];
  savedPayments: SavedPayment[];
  reminders: Reminder[];
  reports: LabReport[];
  settings: Settings;
  session: { signedOut: boolean };
  prototype: { failNextPayment: boolean };
}

/* ---------- personal area ---------- */

export interface Profile {
  name: string;
  /** 10-digit mobile number without the country code. */
  phone: string;
  email: string;
  /** yyyy-mm-dd. */
  dob: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  /** "You", "Mother, 62". */
  relation: string;
}

export interface Address {
  id: string;
  label: string;
  line1: string;
  line2: string;
  phone: string;
}

export interface SavedPayment {
  id: string;
  /** A payment method id: "card", "upi". */
  kind: string;
  label: string;
  detail: string;
}

export type ReminderKind = "medicine" | "checkup" | "habit";
export type ReminderRepeat = "daily" | "weekly" | "once";

export interface Reminder {
  id: string;
  patientId: string;
  kind: ReminderKind;
  title: string;
  detail: string;
  /** "HH:mm", local time. */
  time: string;
  repeat: ReminderRepeat;
  /** Weekly reminders: 0 = Sunday. */
  weekday?: number;
  /** One-off reminders: yyyy-mm-dd. */
  date?: string;
  enabled: boolean;
  /** Days the reminder was ticked off (yyyy-mm-dd) and when. */
  done: Array<{ day: string; at: string }>;
}

/** A lab report as the lab shared it. Values come from config by test; nothing here interprets them. */
export interface LabReport {
  id: string;
  testId: string;
  labId: string;
  patientId: string;
  collectedAt: string;
  reportedAt: string;
  /** Set when the report came from a booking made in this session. */
  bookingId?: string;
}

export interface Settings {
  notifications: Record<string, boolean>;
  channels: Record<string, boolean>;
  privacy: Record<string, boolean>;
}
