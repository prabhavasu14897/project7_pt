"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { productConfig } from "@config/product.config";
import type { MetaItem } from "@/types/models";
import { fillTemplate } from "@/lib/format";
import { routes } from "@/lib/routes";
import { catalogImage } from "@/lib/images";
import { EmptyState } from "@/components/feedback/EmptyState";
import { CategoryCard } from "@/components/marketplace/CategoryCard";
import { FilterBar } from "@/components/marketplace/FilterBar";
import { ProductCard } from "@/components/marketplace/ProductCard";
import { SearchBar } from "@/components/ui/SearchBar";
import { Select } from "@/components/ui/Select";
import { Tabs } from "@/components/ui/Tabs";
import { useCart } from "@/features/cart/CartProvider";
import { medicineBadge, medicineCardAction, medicineStatusBadge, orderContaining } from "./medicineActions";
import {
  filterMedicines,
  listingPrice,
  type CategoryFilter,
  type Medicine,
  type MedicineSort,
  type RuleFilter,
} from "./medicineData";

const { content, medicineRules, ui } = productConfig;
const strings = content.medicines;
const orderStrings = content.home.activeOrder;

function pick<T extends string>(value: string | null, options: readonly { value: T }[], fallback: T): T {
  return options.find((option) => option.value === value)?.value ?? fallback;
}

/** Where to buy it and whether it's there: the pharmacy that fulfils by default, plus stock in words. */
function availabilityMeta(medicine: Medicine): MetaItem[] {
  if (medicine.rule === "restricted") return [];
  const offer = medicine.defaultOffer;
  if (!offer) return [{ icon: "alert", label: strings.unavailableEverywhere }];
  return [
    { icon: "location", label: offer.pharmacyName },
    { icon: "package", label: strings.availability[offer.stock] },
  ];
}

export function MedicineListingScreen() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const cart = useCart();

  // URL holds every filter, so listings survive refresh and can be shared.
  const query = (params.get("q") ?? "").trim();
  const category = pick<CategoryFilter>(params.get("category"), strings.categoryFilters, "all");
  const rule = pick<RuleFilter>(params.get("rule"), strings.ruleFilters, "all");
  const sort = pick<MedicineSort>(params.get("sort"), strings.sortOptions, "relevance");
  const filtered = query !== "" || category !== "all" || rule !== "all";

  const results = filterMedicines({ query, category, rule, sort });

  function navigate(next: Partial<{ q: string; category: CategoryFilter; rule: RuleFilter; sort: MedicineSort }>) {
    const merged = { q: query, category, rule, sort, ...next };
    const search = new URLSearchParams();
    if (merged.q) search.set("q", merged.q);
    if (merged.category !== "all") search.set("category", merged.category);
    if (merged.rule !== "all") search.set("rule", merged.rule);
    if (merged.sort !== "relevance") search.set("sort", merged.sort);
    const qs = search.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  return (
    <div className="container-page flex flex-col gap-6 pb-12 pt-4 sm:pt-6 lg:gap-8 lg:pb-16 lg:pt-8">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
          <div className="flex flex-col gap-1">
            <h1 className="text-h1 font-extrabold tracking-tight text-text">{strings.title}</h1>
            <p className="text-sm text-text-muted sm:text-body">{strings.subtitle}</p>
          </div>
          <p aria-live="polite" className="text-sm font-semibold text-text-muted tabular">
            {fillTemplate(strings.resultCount, { count: results.length })}
          </p>
        </div>

        {/* Keyed on the URL query so the field resets when it changes from elsewhere. */}
        <SearchBar
          key={query}
          size="lg"
          defaultValue={query}
          placeholder={strings.searchPlaceholder}
          label={ui.search.label}
          onSubmit={(value) => navigate({ q: value })}
          onValueChange={(value) => {
            if (!value && query) navigate({ q: "" });
          }}
        />

        <FilterBar
          label={strings.filtersLabel}
          primary={
            <Tabs
              id="medicine-category"
              variant="chips"
              label={strings.categoryFilterLabel}
              items={strings.categoryFilters}
              value={category}
              onChange={(value) => navigate({ category: value })}
            />
          }
          secondary={
            <>
              <Tabs
                id="medicine-rule"
                variant="segmented"
                label={strings.ruleFilterLabel}
                items={strings.ruleFilters}
                value={rule}
                onChange={(value) => navigate({ rule: value })}
                className="w-full sm:w-auto"
              />
              <Select
                label={strings.sortLabel}
                value={sort}
                options={strings.sortOptions}
                onChange={(value) => navigate({ sort: value })}
                className="w-full sm:ml-auto sm:w-72"
              />
            </>
          }
          clear={filtered ? { label: strings.clearFilters, onClick: () => router.replace(pathname, { scroll: false }) } : undefined}
        />
      </div>

      <h2 className="sr-only">{strings.resultsHeading}</h2>
      {results.length > 0 ? (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
          {results.map((medicine) => {
            const order = orderContaining(medicine);
            const price = listingPrice(medicine);
            return (
              <li key={medicine.id} className="flex">
                <ProductCard
                  className="flex-1"
                  title={medicine.name}
                  href={medicine.href}
                  image={catalogImage(medicine.href)}
                  subtitle={order ? fillTemplate(orderStrings.inOrderNote, { id: order.id }) : medicine.pack}
                  icon={medicine.form}
                  tone="medicines"
                  badge={medicineBadge(medicine)}
                  statusBadge={medicineStatusBadge(medicine)}
                  rating={medicine.reviews > 0 ? { value: medicine.rating, count: medicine.reviews } : undefined}
                  price={price === null ? undefined : { amount: price, mrp: medicine.mrp }}
                  meta={availabilityMeta(medicine)}
                  note={medicine.rule === "restricted" ? medicineRules.restricted.description : undefined}
                  action={medicineCardAction(medicine, cart)}
                />
              </li>
            );
          })}
        </ul>
      ) : (
        <EmptyState
          icon="medicines"
          title={strings.emptyTitle}
          description={strings.emptyDescription}
          action={{ label: strings.clearFilters, onClick: () => router.replace(pathname, { scroll: false }) }}
        />
      )}

      {/* After the results, as on the desktop board: cards start higher on phones, and Rx cards carry their own Upload. */}
      {rule !== "otc" && (
        <CategoryCard
          variant="row"
          label={content.explore.uploadEntry.label}
          description={content.explore.uploadEntry.description}
          href={routes.prescriptionUpload()}
          icon="upload"
          tone="medicines"
        />
      )}
    </div>
  );
}
