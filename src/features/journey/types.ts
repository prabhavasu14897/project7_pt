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

export interface JourneyState {
  version: number;
  prescriptions: Prescription[];
  cart: Record<string, CartLine>;
  checkout: CheckoutDraft;
  orders: Order[];
  prototype: { failNextPayment: boolean };
}
