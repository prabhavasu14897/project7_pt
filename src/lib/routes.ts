import { productConfig } from "@config/product.config";
import type { CategoryKey } from "@/types/models";

const { categories, routes: bases } = productConfig;

function categoryHref(key: CategoryKey): string {
  return categories.find((category) => category.key === key)?.href ?? "/";
}

/** Detail-page URLs built from config bases, so screens never hand-write paths. */
export const routes = {
  medicine: (id: string) => `${categoryHref("medicines")}/${id}`,
  labTest: (id: string) => `${categoryHref("lab-tests")}/${id}`,
  doctor: (id: string) => `${categoryHref("doctors")}/${id}`,
  homeCare: (id: string) => `${categoryHref("home-care")}/${id}`,
  healthPackage: (id: string) => `${categoryHref("health-packages")}/${id}`,
  pharmacy: (id: string) => `${bases.pharmacy}/${id}`,
  lab: (id: string) => `${bases.lab}/${id}`,
  order: (id: string) => `${bases.orders}/${id}`,
  /** Explore with optional category, concern and search query. Empty values are left out. */
  explore: (params: { category?: string; concern?: string; q?: string; verified?: string } = {}) => {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) if (value) query.set(key, value);
    const search = query.toString();
    return search ? `${bases.explore}?${search}` : bases.explore;
  },
  /** Shared booking page for consults, home visits and packages. Optional preselection travels in the query. */
  book: (kind: "doctor" | "home-care" | "package" | "lab-test", id: string, params: { mode?: string; slot?: string; provider?: string } = {}) => {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) if (value) query.set(key, value);
    const search = query.toString();
    return `${bases.book}/${kind}/${id}${search ? `?${search}` : ""}`;
  },
  home: () => bases.home,
  booking: (id: string) => `${bases.bookings}/${id}`,
  health: (member?: string) => (member && member !== "self" ? `${bases.health}?member=${member}` : bases.health),
  reports: (member?: string) => (member && member !== "self" ? `${bases.reports}?member=${member}` : bases.reports),
  report: (id: string) => `${bases.reports}/${id}`,
  reminders: (member?: string) => (member && member !== "self" ? `${bases.reminders}?member=${member}` : bases.reminders),
  insight: (id: string) => `${bases.insights}/${id}`,
  profile: (section?: string) => (section ? `${bases.profile}/${section}` : bases.profile),
  /** Sign in, returning to `next` (an in-app path) afterwards. */
  signIn: (next?: string) => (next && next !== bases.home ? `${bases.signIn}?next=${encodeURIComponent(next)}` : bases.signIn),
  signUp: () => bases.signUp,
  prescription: (id: string) => `/prescriptions/${id}`,
  prescriptionUpload: (medicineId?: string, pharmacyId?: string) => {
    const query = new URLSearchParams();
    if (medicineId) query.set("medicine", medicineId);
    if (pharmacyId) query.set("pharmacy", pharmacyId);
    const search = query.toString();
    return search ? `${bases.prescriptionUpload}?${search}` : bases.prescriptionUpload;
  },
};
