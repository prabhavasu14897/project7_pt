import { productConfig } from "@config/product.config";
import type { CategoryKey, MedicineRule, MetaItem, Tone } from "@/types/models";
import type { IconName } from "@/components/ui/Icon";
import { fillTemplate } from "@/lib/format";
import { ruleBadge } from "@/lib/medicine";
import { routes } from "@/lib/routes";

const { categories, demoData, ui, content } = productConfig;
const strings = content.explore;

/* Everything Explore can show, resolved once from config into card-ready view models. */

export type ConcernKey = (typeof strings.concerns)[number]["key"];

interface CatalogBase {
  key: string;
  id: string;
  category: CategoryKey;
  title: string;
  href: string;
  concerns: readonly string[];
  /** Lower-cased text the search box matches against. */
  searchText: string;
}

/** Rendered with ProductCard: medicines, tests, packages and home-care services. */
export interface ProductItem extends CatalogBase {
  kind: "medicine" | "lab-test" | "home-care" | "health-package";
  subtitle?: string;
  icon: string;
  rule?: MedicineRule;
  badge?: { label: string; tone: Tone; icon?: IconName };
  rating?: { value: number; count?: number };
  price?: { amount: number; mrp?: number; unit?: string };
  meta?: readonly MetaItem[];
}

/** Rendered with ProviderCard: doctors are both an item and a provider. */
export interface DoctorItem extends CatalogBase {
  kind: "doctor";
  specialty: string;
  verified: boolean;
  rating: { value: number; count?: number };
  meta: readonly MetaItem[];
  price: { amount: number; unit?: string };
}

export type CatalogItem = ProductItem | DoctorItem;

export interface NearbyProvider {
  key: string;
  kind: "pharmacy" | "lab";
  name: string;
  verified: boolean;
  rating: { value: number; count?: number };
  meta: readonly MetaItem[];
  /** Kilometres, for sorting by distance. */
  distanceKm: number;
  href: string;
  /** Categories this provider fulfils, so a category view shows only relevant providers. */
  serves: readonly CategoryKey[];
}

function searchable(...parts: Array<string | undefined>): string {
  return parts.filter(Boolean).join(" ").toLowerCase();
}

function kilometres(distance: string): number {
  const value = Number.parseFloat(distance);
  return Number.isFinite(value) ? value : Number.POSITIVE_INFINITY;
}

const medicines: ProductItem[] = demoData.medicines.map((medicine) => ({
  key: `medicine-${medicine.id}`,
  kind: "medicine",
  id: medicine.id,
  category: "medicines",
  title: medicine.name,
  subtitle: medicine.pack,
  icon: "medicines",
  href: routes.medicine(medicine.id),
  rule: medicine.rule,
  badge: ruleBadge(medicine.rule),
  // Restricted items have no price: they can't be bought through CareNow.
  price: medicine.rule === "restricted" ? undefined : { amount: medicine.price, mrp: medicine.mrp },
  concerns: medicine.concerns,
  searchText: searchable(medicine.name, medicine.pack, productConfig.medicineRules[medicine.rule].shortLabel),
}));

const labTests: ProductItem[] = demoData.labTests.map((test) => ({
  key: `lab-test-${test.id}`,
  kind: "lab-test",
  id: test.id,
  category: "lab-tests",
  title: test.name,
  icon: "lab-tests",
  href: routes.labTest(test.id),
  rating: { value: test.rating, count: test.reviews },
  meta: [{ icon: "home", label: test.mode }],
  price: { amount: test.price, mrp: test.mrp },
  concerns: test.concerns,
  searchText: searchable(test.name, test.mode),
}));

const doctors: DoctorItem[] = demoData.doctors.map((doctor) => ({
  key: `doctor-${doctor.id}`,
  kind: "doctor",
  id: doctor.id,
  category: "doctors",
  title: doctor.name,
  specialty: doctor.specialty,
  verified: doctor.verified,
  href: routes.doctor(doctor.id),
  rating: { value: doctor.rating, count: doctor.reviews },
  meta: [{ icon: "clock", label: doctor.duration }],
  price: { amount: doctor.fee, unit: ui.units.consult },
  concerns: doctor.concerns,
  searchText: searchable(doctor.name, doctor.specialty),
}));

const homeCare: ProductItem[] = demoData.homeCare.map((service) => ({
  key: `home-care-${service.id}`,
  kind: "home-care",
  id: service.id,
  category: "home-care",
  title: service.name,
  icon: "home-care",
  href: routes.homeCare(service.id),
  rating: { value: service.rating, count: service.reviews },
  meta: [{ icon: "clock", label: service.mode }],
  price: { amount: service.price, unit: ui.units[service.unit] },
  concerns: service.concerns,
  searchText: searchable(service.name, service.mode),
}));

const healthPackages: ProductItem[] = demoData.healthPackages.map((item) => ({
  key: `health-package-${item.id}`,
  kind: "health-package",
  id: item.id,
  category: "health-packages",
  title: item.name,
  subtitle: fillTemplate(strings.testsIncluded, { count: item.tests }),
  icon: "health-packages",
  href: routes.healthPackage(item.id),
  rating: { value: item.rating, count: item.reviews },
  meta: [{ icon: "home", label: item.mode }],
  price: { amount: item.price, mrp: item.mrp },
  concerns: item.concerns,
  searchText: searchable(item.name, item.mode),
}));

/** Every item, in category order. */
export const catalog: readonly CatalogItem[] = [...medicines, ...labTests, ...doctors, ...homeCare, ...healthPackages];

/** Pharmacies and labs, nearest first. */
export const nearbyProviders: readonly NearbyProvider[] = [
  ...demoData.pharmacies.map(
    (pharmacy): NearbyProvider => ({
      key: `pharmacy-${pharmacy.id}`,
      kind: "pharmacy",
      name: pharmacy.name,
      verified: pharmacy.verified,
      rating: { value: pharmacy.rating, count: pharmacy.reviews },
      meta: [
        { icon: "delivery", label: pharmacy.eta },
        { icon: "distance", label: pharmacy.distance },
      ],
      distanceKm: kilometres(pharmacy.distance),
      href: routes.pharmacy(pharmacy.id),
      serves: ["medicines"],
    }),
  ),
  ...demoData.labs.map(
    (lab): NearbyProvider => ({
      key: `lab-${lab.id}`,
      kind: "lab",
      name: lab.name,
      verified: lab.verified,
      rating: { value: lab.rating, count: lab.reviews },
      meta: [
        { icon: "home", label: lab.mode },
        { icon: "distance", label: lab.distance },
      ],
      distanceKm: kilometres(lab.distance),
      href: routes.lab(lab.id),
      serves: ["lab-tests", "health-packages"],
    }),
  ),
].sort((a, b) => a.distanceKm - b.distanceKm);

export function isCategoryKey(value: string | null): value is CategoryKey {
  return categories.some((category) => category.key === value);
}

export function isConcernKey(value: string | null): value is ConcernKey {
  return strings.concerns.some((concern) => concern.key === value);
}

export interface CatalogFilter {
  category: CategoryKey | null;
  query: string;
  concern: ConcernKey | null;
  verifiedOnly: boolean;
}

/** Every word of the query must appear somewhere in the item's text. */
function matchesQuery(item: CatalogItem, query: string): boolean {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  return words.every((word) => item.searchText.includes(word));
}

/** Items matching everything except the category, so category chips can show counts. */
export function filterIgnoringCategory(filter: CatalogFilter): CatalogItem[] {
  return catalog.filter(
    (item) =>
      (!filter.query || matchesQuery(item, filter.query)) &&
      (!filter.concern || item.concerns.includes(filter.concern)) &&
      // "Verified only" applies to providers; doctors are the providers listed as items.
      (!filter.verifiedOnly || item.kind !== "doctor" || item.verified),
  );
}

export function filterProviders(category: CategoryKey | null, verifiedOnly: boolean): NearbyProvider[] {
  return nearbyProviders.filter(
    (provider) => (!category || provider.serves.includes(category)) && (!verifiedOnly || provider.verified),
  );
}
