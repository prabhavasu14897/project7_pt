import { productConfig } from "@config/product.config";
import type { MedicineRule, MetaItem, Tone } from "@/types/models";
import type { IconName } from "@/components/ui/Icon";
import { fillTemplate } from "@/lib/format";
import { ruleBadge } from "@/lib/medicine";
import { buildPrescriptionSteps, prescriptionStageCount } from "@/lib/prescription";
import { routes } from "@/lib/routes";

const { demoData, ui, content, statuses } = productConfig;
const home = content.home;

/* Resolves the config references used by Home into card-ready view models. */

export interface PopularItem {
  key: string;
  kind: "medicine" | "lab-test" | "home-care";
  id: string;
  title: string;
  subtitle?: string;
  icon: string;
  tone: string;
  href: string;
  rule?: MedicineRule;
  badge?: { label: string; tone: Tone; icon?: IconName };
  rating?: { value: number; count?: number };
  price: { amount: number; mrp?: number; unit?: string };
  meta?: readonly MetaItem[];
}

export type ProviderKind = "doctor" | "pharmacy" | "lab";

export interface ProviderItem {
  key: string;
  kind: ProviderKind;
  name: string;
  subtitle?: string;
  imageShape: "circle" | "rounded";
  verified: boolean;
  rating: { value: number; count?: number };
  meta: readonly MetaItem[];
  price?: { amount: number; unit?: string };
  href: string;
  actionLabel: string;
  actionVariant: "primary" | "outline";
}

function resolvePopular(ref: (typeof demoData.popular)[number]): PopularItem | null {
  const key = `${ref.kind}-${ref.id}`;
  switch (ref.kind) {
    case "medicine": {
      const medicine = demoData.medicines.find((item) => item.id === ref.id);
      // Restricted items have no purchase flow, so they never appear as "popular".
      if (!medicine || medicine.rule === "restricted") return null;
      return {
        key,
        kind: ref.kind,
        id: medicine.id,
        title: medicine.name,
        subtitle: medicine.pack,
        icon: "medicines",
        tone: "medicines",
        href: routes.medicine(medicine.id),
        rule: medicine.rule,
        badge: ruleBadge(medicine.rule),
        price: { amount: medicine.price, mrp: medicine.mrp },
      };
    }
    case "lab-test": {
      const test = demoData.labTests.find((item) => item.id === ref.id);
      if (!test) return null;
      return {
        key,
        kind: ref.kind,
        id: test.id,
        title: test.name,
        icon: "lab-tests",
        tone: "lab-tests",
        href: routes.labTest(test.id),
        rating: { value: test.rating, count: test.reviews },
        meta: [{ icon: "home", label: test.mode }],
        price: { amount: test.price, mrp: test.mrp },
      };
    }
    case "home-care": {
      const service = demoData.homeCare.find((item) => item.id === ref.id);
      if (!service) return null;
      return {
        key,
        kind: ref.kind,
        id: service.id,
        title: service.name,
        icon: "home-care",
        tone: "home-care",
        href: routes.homeCare(service.id),
        rating: { value: service.rating, count: service.reviews },
        meta: [{ icon: "clock", label: service.mode }],
        price: { amount: service.price, unit: ui.units[service.unit] },
      };
    }
  }
}

function resolveProvider(ref: (typeof demoData.recommended)[number]): ProviderItem | null {
  const key = `${ref.kind}-${ref.id}`;
  switch (ref.kind) {
    case "doctor": {
      const doctor = demoData.doctors.find((item) => item.id === ref.id);
      if (!doctor) return null;
      return {
        key,
        kind: ref.kind,
        name: doctor.name,
        subtitle: doctor.specialty,
        imageShape: "circle",
        verified: true,
        rating: { value: doctor.rating, count: doctor.reviews },
        meta: [{ icon: "clock", label: doctor.duration }],
        price: { amount: doctor.fee, unit: ui.units.consult },
        href: routes.doctor(doctor.id),
        actionLabel: ui.actions.book,
        actionVariant: "primary",
      };
    }
    case "pharmacy": {
      const pharmacy = demoData.pharmacies.find((item) => item.id === ref.id);
      if (!pharmacy) return null;
      return {
        key,
        kind: ref.kind,
        name: pharmacy.name,
        imageShape: "rounded",
        verified: pharmacy.verified,
        rating: { value: pharmacy.rating, count: pharmacy.reviews },
        meta: [
          { icon: "delivery", label: pharmacy.eta },
          { icon: "distance", label: pharmacy.distance },
        ],
        href: routes.pharmacy(pharmacy.id),
        actionLabel: ui.actions.view,
        actionVariant: "outline",
      };
    }
    case "lab": {
      const lab = demoData.labs.find((item) => item.id === ref.id);
      if (!lab) return null;
      return {
        key,
        kind: ref.kind,
        name: lab.name,
        imageShape: "rounded",
        verified: lab.verified,
        rating: { value: lab.rating, count: lab.reviews },
        meta: [
          { icon: "home", label: lab.mode },
          { icon: "clock", label: lab.turnaround },
        ],
        href: routes.lab(lab.id),
        actionLabel: ui.actions.view,
        actionVariant: "outline",
      };
    }
  }
}

export const popularItems = demoData.popular.map(resolvePopular).filter((item): item is PopularItem => item !== null);

export const recommendedProviders = demoData.recommended
  .map(resolveProvider)
  .filter((item): item is ProviderItem => item !== null);

const lastOrderMedicine = demoData.medicines.find((item) => item.id === demoData.lastOrder.medicineId);

export const quickActions = home.quickActions.map((action) => {
  const description = fillTemplate(action.description, { lastOrder: lastOrderMedicine?.name ?? "" }).trim();
  // A missing last order leaves the row as a plain label rather than an empty line.
  return { ...action, description: description || undefined };
});

export interface ActiveOrder {
  id: string;
  href: string;
  /** Medicine ids in the order, so other sections can recognise them. */
  medicineIds: ReadonlySet<string>;
  items: string;
  steps: ReturnType<typeof buildPrescriptionSteps>;
  status: { label: string; tone: Tone; icon: IconName };
  description?: string;
  progressLabel: string;
  note?: string;
}

/**
 * The signed-in user's in-progress prescription order, or null when there is nothing valid to show
 * (no order, an out-of-range stage, or no medicines that resolve). Stage comes from demo data and is never auto-advanced.
 */
export function buildActiveOrder(): ActiveOrder | null {
  const order: (typeof demoData.activeOrder) | null = demoData.activeOrder;
  if (!order) return null;

  const stage = statuses.prescription[order.stage];
  const medicines = order.medicineIds
    .map((id) => demoData.medicines.find((item) => item.id === id))
    .filter((item) => item !== undefined);
  const [first] = medicines;
  if (!stage || !first) return null;

  const pharmacy = demoData.pharmacies.find((item) => item.id === order.pharmacyId);
  const reviewing = stage.key === "under-review";

  return {
    id: order.id,
    href: routes.order(order.id),
    medicineIds: new Set(medicines.map((item) => item.id)),
    items:
      medicines.length > 1
        ? fillTemplate(home.activeOrder.itemsMore, { first: first.name, count: medicines.length - 1 })
        : first.name,
    steps: buildPrescriptionSteps(order.stage),
    status: {
      label: stage.label,
      tone: reviewing ? "warning" : "primary",
      icon: reviewing ? "clock" : "delivery",
    },
    description: stage.description,
    progressLabel: fillTemplate(home.activeOrder.stepOf, { current: order.stage + 1, total: prescriptionStageCount }),
    // Only meaningful while a pharmacist is actually reviewing.
    note: reviewing && pharmacy ? fillTemplate(home.activeOrder.pharmacyNote, { pharmacy: pharmacy.name }) : undefined,
  };
}
