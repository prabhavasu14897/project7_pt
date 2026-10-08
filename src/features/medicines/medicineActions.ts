import { productConfig } from "@config/product.config";
import type { CardAction, Tone } from "@/types/models";
import type { IconName } from "@/components/ui/Icon";
import { fillTemplate } from "@/lib/format";
import { medicinePrimaryAction, ruleBadge } from "@/lib/medicine";
import { routes } from "@/lib/routes";
import { buildActiveOrder } from "@/features/home/homeData";
import { isOrderable, type Medicine, type MedicineOffer } from "./medicineData";

const { ui, content } = productConfig;
const orderStrings = content.home.activeOrder;

export const activeOrder = buildActiveOrder();

interface Cart {
  has: (id: string) => boolean;
  add: (id: string, quantity?: number, pharmacyId?: string) => void;
  remove: (id: string) => void;
}

function named(action: string, item: string): string {
  return fillTemplate(ui.actions.itemLabel, { action, item });
}

/** The live order this medicine is already part of, if any. */
export function orderContaining(medicine: Medicine) {
  return activeOrder?.medicineIds.has(medicine.id) ? activeOrder : null;
}

/** The dispensing rule always leads; it is never replaced by order status. */
export function medicineBadge(medicine: Medicine): { label: string; tone: Tone; icon?: IconName } {
  return ruleBadge(medicine.rule);
}

/** Live order status shown beside the rule, when the medicine is already in review. */
export function medicineStatusBadge(medicine: Medicine): { label: string; tone: Tone; icon?: IconName } | undefined {
  return orderContaining(medicine)?.status;
}

/**
 * The one action a medicine card offers. Safety order matters:
 * in review → Track order; restricted → Consult a doctor; prescription → Upload; out of stock → disabled; OTC → Add/Added.
 * `offer` pins the card to one pharmacy (e.g. on that pharmacy's page); it defaults to the cheapest orderable one.
 */
export function medicineCardAction(medicine: Medicine, cart: Cart, offer: MedicineOffer | null = medicine.defaultOffer): CardAction {
  const order = orderContaining(medicine);
  if (order) {
    return { label: orderStrings.track, href: order.href, variant: "outline", ariaLabel: named(orderStrings.track, medicine.name) };
  }
  const primary = medicinePrimaryAction(medicine.rule);
  if (primary.kind === "unavailable") {
    // A working path instead of a dead button: restricted medicines point to a consultation.
    const label = content.medicineDetail.restricted.action;
    return { label, href: routes.explore({ category: "doctors" }), variant: "outline", ariaLabel: named(label, medicine.name) };
  }
  if (primary.kind === "upload") {
    // Short visible label keeps card footers on one line; the accessible name keeps the full action.
    return {
      label: ui.actions.uploadShort,
      href: routes.prescriptionUpload(medicine.id, offer?.pharmacyId),
      variant: "outline",
      ariaLabel: named(primary.label, medicine.name),
    };
  }
  if (!offer || !isOrderable(offer)) {
    // An unverified pharmacy can't fulfil orders even with stock; say why rather than claiming it's out of stock.
    const label = offer && !offer.verified ? content.providerDetail.pharmacy.notOrderable : content.medicines.availability["out-of-stock"];
    return { label, disabled: true, variant: "outline", ariaLabel: named(label, medicine.name) };
  }
  const added = cart.has(medicine.id);
  return {
    label: added ? ui.actions.added : primary.label,
    variant: added ? "secondary" : "primary",
    pressed: added,
    ariaLabel: named(primary.label, medicine.name),
    onClick: () => (added ? cart.remove(medicine.id) : cart.add(medicine.id, 1, offer.pharmacyId)),
  };
}
