import { productConfig } from "@config/product.config";
import { getMedicine } from "@/features/medicines/medicineData";
import type { CartLine, CheckoutDraft, OrderLine, OrderTotals } from "./types";

const { demoData } = productConfig;

/** Unit price for a medicine at a pharmacy, falling back to the listing price. */
export function unitPrice(medicineId: string, pharmacyId?: string): number {
  const medicine = getMedicine(medicineId);
  if (!medicine) return 0;
  const offer = medicine.offers.find((item) => item.pharmacyId === pharmacyId) ?? medicine.defaultOffer;
  return offer?.price ?? 0;
}

export function pharmacyName(pharmacyId?: string): string {
  return demoData.pharmacies.find((item) => item.id === pharmacyId)?.name ?? "";
}

/** Cart lines resolved to priced order lines. Lines without a pharmacy use the medicine's default one. */
export function toOrderLines(cart: Record<string, CartLine>): OrderLine[] {
  return Object.values(cart).map((line) => {
    const pharmacyId = line.pharmacyId ?? getMedicine(line.medicineId)?.defaultOffer?.pharmacyId ?? "";
    return {
      medicineId: line.medicineId,
      pharmacyId,
      quantity: line.quantity,
      unitPrice: unitPrice(line.medicineId, pharmacyId),
      prescriptionId: line.prescriptionId,
    };
  });
}

/** Lines grouped by fulfilling pharmacy, in first-seen order. Each group ships separately. */
export function groupByPharmacy(lines: readonly OrderLine[]): Array<{ pharmacyId: string; lines: OrderLine[]; subtotal: number }> {
  const groups = new Map<string, OrderLine[]>();
  for (const line of lines) groups.set(line.pharmacyId, [...(groups.get(line.pharmacyId) ?? []), line]);
  return [...groups].map(([pharmacyId, group]) => ({
    pharmacyId,
    lines: group,
    subtotal: group.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0),
  }));
}

export function findCoupon(code: string | null) {
  if (!code) return undefined;
  return demoData.coupons.find((coupon) => coupon.code === code.trim().toUpperCase());
}

/**
 * Delivery: each pharmacy shipment is free above the threshold, otherwise a flat fee.
 * Express adds its fee once. Coupons discount items only.
 */
export function computeTotals(lines: readonly OrderLine[], draft: Pick<CheckoutDraft, "couponCode" | "slotId">): OrderTotals & {
  expressFee: number;
  shipmentFees: number;
} {
  const items = lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
  const shipmentFees = groupByPharmacy(lines).reduce(
    (sum, group) => sum + (group.subtotal >= demoData.delivery.freeAbove ? 0 : demoData.delivery.fee),
    0,
  );
  const expressFee = demoData.deliverySlots.find((slot) => slot.id === draft.slotId)?.fee ?? 0;
  const coupon = findCoupon(draft.couponCode);
  const discount = coupon ? Math.min(Math.round((items * coupon.percent) / 100), coupon.maxDiscount) : 0;
  const delivery = lines.length > 0 ? shipmentFees + expressFee : 0;
  return { items, discount, delivery, total: Math.max(0, items - discount + delivery), expressFee, shipmentFees };
}
