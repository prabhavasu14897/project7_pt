import { productConfig } from "@config/product.config";
import type { MedicineRule } from "@/types/models";
import { routes } from "@/lib/routes";

const { demoData } = productConfig;
type MedicineContent = typeof productConfig.content.medicines;

export type StockStatus = keyof MedicineContent["availability"];
export type MedicineSort = MedicineContent["sortOptions"][number]["value"];
export type RuleFilter = MedicineContent["ruleFilters"][number]["value"];
export type CategoryFilter = MedicineContent["categoryFilters"][number]["value"];

export interface MedicineOffer {
  pharmacyId: string;
  pharmacyName: string;
  verified: boolean;
  rating: number;
  reviews: number;
  eta: string;
  distance: string;
  price: number;
  stock: StockStatus;
}

export interface Medicine {
  id: string;
  name: string;
  pack: string;
  /** Dosage form; also the icon key for the medicine tile. */
  form: string;
  rule: MedicineRule;
  manufacturer: string;
  rating: number;
  reviews: number;
  description: string;
  uses: readonly string[];
  sideEffects: readonly string[];
  concerns: readonly string[];
  /** Listing MRP; the strike-through price. */
  mrp: number;
  offers: readonly MedicineOffer[];
  /** Pharmacy pre-selected on the detail page and shown on the listing card. Null when nothing is in stock. */
  defaultOffer: MedicineOffer | null;
  href: string;
}

export function isInStock(offer: MedicineOffer): boolean {
  return offer.stock !== "out-of-stock";
}

/** Only verified pharmacies with stock can fulfil an order. */
export function isOrderable(offer: MedicineOffer): boolean {
  return offer.verified && isInStock(offer);
}

/** Cheapest orderable offer, or none. Unverified pharmacies are never chosen for the user. */
function pickDefaultOffer(offers: readonly MedicineOffer[]): MedicineOffer | null {
  return [...offers].filter(isOrderable).sort((a, b) => a.price - b.price)[0] ?? null;
}

export const medicines: readonly Medicine[] = demoData.medicines.map((medicine) => {
  const offers = medicine.offers
    .map((offer): MedicineOffer | null => {
      const pharmacy = demoData.pharmacies.find((item) => item.id === offer.pharmacyId);
      if (!pharmacy) return null;
      return {
        pharmacyId: pharmacy.id,
        pharmacyName: pharmacy.name,
        verified: pharmacy.verified,
        rating: pharmacy.rating,
        reviews: pharmacy.reviews,
        eta: pharmacy.eta,
        distance: pharmacy.distance,
        price: offer.price,
        stock: offer.stock,
      };
    })
    .filter((offer) => offer !== null);

  return {
    id: medicine.id,
    name: medicine.name,
    pack: medicine.pack,
    form: medicine.form,
    rule: medicine.rule,
    manufacturer: medicine.manufacturer,
    rating: medicine.rating,
    reviews: medicine.reviews,
    description: medicine.description,
    uses: medicine.uses,
    sideEffects: medicine.sideEffects,
    concerns: medicine.concerns,
    mrp: medicine.mrp,
    offers,
    defaultOffer: pickDefaultOffer(offers),
    href: routes.medicine(medicine.id),
  };
});

/** Shopper-facing name for a concern tag, e.g. "fever" → "Fever & Cold". */
function concernLabel(key: string): string {
  return (
    productConfig.content.medicines.categoryFilters.find((item) => item.value === key)?.label ??
    productConfig.content.explore.concerns.find((item) => item.key === key)?.label ??
    key
  );
}

export function getMedicine(id: string): Medicine | undefined {
  return medicines.find((medicine) => medicine.id === id);
}

/** Price shown before a pharmacy is chosen: the default offer, falling back to the cheapest listed one. */
export function listingPrice(medicine: Medicine): number | null {
  if (medicine.rule === "restricted") return null;
  return medicine.defaultOffer?.price ?? [...medicine.offers].sort((a, b) => a.price - b.price)[0]?.price ?? null;
}

export interface MedicineFilter {
  query: string;
  category: CategoryFilter;
  rule: RuleFilter;
  sort: MedicineSort;
}

export function filterMedicines(filter: MedicineFilter): Medicine[] {
  const words = filter.query.toLowerCase().split(/\s+/).filter(Boolean);
  const matching = medicines.filter((medicine) => {
    const concernLabels = medicine.concerns.map((key) => concernLabel(key));
    const text = `${medicine.name} ${medicine.pack} ${medicine.manufacturer} ${medicine.uses.join(" ")} ${medicine.concerns.join(" ")} ${concernLabels.join(" ")}`.toLowerCase();
    return (
      words.every((word) => text.includes(word)) &&
      (filter.category === "all" || medicine.concerns.includes(filter.category)) &&
      // Restricted items only appear under "All", where their special-process notice is shown.
      (filter.rule === "all" || medicine.rule === filter.rule)
    );
  });

  const price = (medicine: Medicine) => listingPrice(medicine) ?? Number.POSITIVE_INFINITY;
  switch (filter.sort) {
    case "price-asc":
      return [...matching].sort((a, b) => price(a) - price(b));
    case "price-desc":
      // Unpriced (restricted) items sink to the end in both price orders.
      return [...matching].sort((a, b) => (price(b) === Infinity ? -1 : price(a) === Infinity ? 1 : price(b) - price(a)));
    case "rating":
      return [...matching].sort((a, b) => b.rating - a.rating);
    case "relevance":
      return matching;
  }
}
