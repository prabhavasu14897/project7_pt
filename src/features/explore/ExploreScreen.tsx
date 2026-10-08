"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { productConfig } from "@config/product.config";
import type { CardAction, CategoryKey } from "@/types/models";
import { fillTemplate } from "@/lib/format";
import { medicinePrimaryAction } from "@/lib/medicine";
import { routes } from "@/lib/routes";
import { catalogImage } from "@/lib/images";
import { EmptyState } from "@/components/feedback/EmptyState";
import { CategoryCard } from "@/components/marketplace/CategoryCard";
import { ProductCard } from "@/components/marketplace/ProductCard";
import { ProviderCard } from "@/components/marketplace/ProviderCard";
import { Button } from "@/components/ui/Button";
import { SearchBar } from "@/components/ui/SearchBar";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { TabPanel, Tabs, type TabItem } from "@/components/ui/Tabs";
import { useCart } from "@/features/cart/CartProvider";
import { buildActiveOrder } from "@/features/home/homeData";
import {
  filterIgnoringCategory,
  filterProviders,
  isCategoryKey,
  isConcernKey,
  type CatalogItem,
  type DoctorItem,
  type NearbyProvider,
  type ProductItem,
} from "./exploreData";

const { categories, content, ui } = productConfig;
const strings = content.explore;
const orderStrings = content.home.activeOrder;

type CategoryTab = "all" | CategoryKey;

/** Categories whose providers (pharmacies, labs) are listed separately from the items. */
const categoriesWithProviders: readonly CategoryKey[] = ["medicines", "lab-tests", "health-packages"];

const activeOrder = buildActiveOrder();

function itemLabel(action: string, item: string): string {
  return fillTemplate(ui.actions.itemLabel, { action, item });
}

export function ExploreScreen() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const cart = useCart();

  // URL is the source of truth, so results survive refresh, back/forward and sharing.
  const rawCategory = params.get("category");
  const category = isCategoryKey(rawCategory) ? rawCategory : null;
  const rawConcern = params.get("concern");
  const concern = isConcernKey(rawConcern) ? rawConcern : null;
  const query = (params.get("q") ?? "").trim();
  const verifiedOnly = params.get("verified") === "1";

  const filtering = Boolean(query || concern);
  const browsing = !category && !filtering;
  const concernInfo = strings.concerns.find((item) => item.key === concern);

  const matching = filterIgnoringCategory({ category, query, concern, verifiedOnly });
  const results = category ? matching.filter((item) => item.category === category) : matching;
  const providers = filterProviders(category, verifiedOnly);
  const showProviders = browsing || (category !== null && !filtering && categoriesWithProviders.includes(category));

  function navigate(next: { category?: CategoryKey | null; q?: string; concern?: string | null; verified?: boolean }) {
    const merged = {
      category: next.category === undefined ? category : next.category,
      q: next.q === undefined ? query : next.q,
      concern: next.concern === undefined ? concern : next.concern,
      verified: (next.verified === undefined ? verifiedOnly : next.verified) ? "1" : undefined,
    };
    router.replace(
      routes.explore({
        category: merged.category ?? undefined,
        q: merged.q || undefined,
        concern: merged.concern ?? undefined,
        verified: merged.verified,
      }),
      { scroll: false },
    );
  }

  const tabItems: TabItem<CategoryTab>[] = [
    { value: "all", label: strings.allLabel, count: filtering ? matching.length : undefined },
    ...categories.map((item) => ({
      value: item.key,
      label: item.label,
      count: filtering ? matching.filter((result) => result.category === item.key).length : undefined,
    })),
  ];

  function productAction(item: ProductItem): CardAction {
    if (item.kind !== "medicine" || !item.rule) {
      return { label: ui.actions.book, href: item.href, ariaLabel: itemLabel(ui.actions.book, item.title) };
    }
    if (activeOrder?.medicineIds.has(item.id)) {
      // Never ask for a second upload of a prescription that's already with the pharmacist.
      return {
        label: orderStrings.track,
        href: activeOrder.href,
        variant: "outline",
        ariaLabel: itemLabel(orderStrings.track, item.title),
      };
    }
    const primary = medicinePrimaryAction(item.rule);
    if (primary.kind === "upload") {
      return {
        label: primary.label,
        href: routes.prescriptionUpload(item.id),
        variant: "outline",
        ariaLabel: itemLabel(primary.label, item.title),
      };
    }
    if (primary.kind === "unavailable") {
      return { label: primary.label, disabled: true, variant: "outline", ariaLabel: itemLabel(primary.label, item.title) };
    }
    const added = cart.has(item.id);
    return {
      label: added ? ui.actions.added : primary.label,
      variant: added ? "secondary" : "primary",
      pressed: added,
      ariaLabel: itemLabel(primary.label, item.title),
      onClick: () => (added ? cart.remove(item.id) : cart.add(item.id)),
    };
  }

  function renderProduct(item: ProductItem) {
    const inOrder = item.kind === "medicine" && activeOrder?.medicineIds.has(item.id) ? activeOrder : null;
    const primary = item.rule ? medicinePrimaryAction(item.rule) : null;
    return (
      <li key={item.key} className="flex">
        <ProductCard
          className="flex-1"
          title={item.title}
          href={item.href}
          image={catalogImage(item.href)}
          subtitle={inOrder ? fillTemplate(orderStrings.inOrderNote, { id: inOrder.id }) : item.subtitle}
          icon={item.icon}
          tone={item.category}
          badge={inOrder ? inOrder.status : item.badge}
          rating={item.rating}
          price={item.price}
          meta={item.meta}
          note={primary?.kind === "unavailable" ? primary.note : undefined}
          action={productAction(item)}
        />
      </li>
    );
  }

  function renderDoctor(item: DoctorItem) {
    return (
      <li key={item.key} className="flex">
        <ProviderCard
          className="flex-1"
          name={item.title}
          href={item.href}
          image={catalogImage(item.href)?.src}
          subtitle={item.specialty}
          verifiedLabel={item.verified ? ui.labels.verified : undefined}
          pendingLabel={item.verified ? undefined : strings.notVerified}
          rating={item.rating}
          meta={item.meta}
          price={item.price}
          action={{ label: ui.actions.book, href: item.href, ariaLabel: itemLabel(ui.actions.book, item.title) }}
        />
      </li>
    );
  }

  function renderProvider(provider: NearbyProvider) {
    return (
      <li key={provider.key} className="flex">
        <ProviderCard
          className="flex-1"
          name={provider.name}
          href={provider.href}
          imageShape="rounded"
          // The whole card opens the provider; a separate View button only repeated the name link.
          linkCoversCard
          verifiedLabel={provider.verified ? ui.labels.verified : undefined}
          pendingLabel={provider.verified ? undefined : strings.notVerified}
          rating={provider.rating}
          meta={provider.meta}
        />
      </li>
    );
  }

  /**
   * Doctors list as provider rows (two columns). Products use three columns when browsing a category,
   * and two while searching, so a short result set reads as one comparable list instead of a sparse grid.
   */
  function renderGroup(key: CategoryKey, items: readonly CatalogItem[]) {
    const columns =
      key === "doctors" || filtering
        ? "grid gap-3 lg:grid-cols-2 lg:gap-4"
        : "grid gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4";
    return (
      <ul className={columns}>
        {items.map((item) => (item.kind === "doctor" ? renderDoctor(item) : renderProduct(item)))}
      </ul>
    );
  }

  return (
    <div className="container-page flex flex-col gap-8 pb-12 pt-4 sm:pt-6 lg:gap-12 lg:pb-16 lg:pt-8">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h1 className="text-h1 font-extrabold tracking-tight text-balance text-text">
            {query
              ? fillTemplate(strings.resultsTitle, { query })
              : (categories.find((item) => item.key === category)?.label ?? strings.title)}
          </h1>
          {filtering && (
            <p aria-live="polite" className="text-sm font-semibold text-text-muted tabular">
              {fillTemplate(strings.resultCount, { count: results.length })}
            </p>
          )}
        </div>

        {/* Keyed on the URL query so the field resets when the query changes from elsewhere. */}
        <SearchBar
          key={query}
          size="lg"
          defaultValue={query}
          placeholder={ui.search.placeholder}
          label={ui.search.label}
          onSubmit={(value) => navigate({ q: value })}
          onValueChange={(value) => {
            if (!value && query) navigate({ q: "" });
          }}
        />

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
          <Tabs
            id="explore-category"
            variant="chips"
            label={strings.categoryNavLabel}
            items={tabItems}
            value={category ?? "all"}
            onChange={(value) => navigate({ category: value === "all" ? null : value })}
            hasPanels
          />
          <div className="flex flex-wrap items-center gap-2">
            {concernInfo && (
              <Button
                size="sm"
                variant="secondary"
                rightIcon="close"
                aria-label={`${strings.clearConcern} ${concernInfo.label}`}
                onClick={() => navigate({ concern: null })}
              >
                {concernInfo.label}
              </Button>
            )}
            <Button
              size="sm"
              variant={verifiedOnly ? "secondary" : "outline"}
              leftIcon={verifiedOnly ? "check" : "verified"}
              aria-pressed={verifiedOnly}
              onClick={() => navigate({ verified: !verifiedOnly })}
            >
              {strings.verifiedOnly}
            </Button>
          </div>
        </div>
      </div>

      <TabPanel id="explore-category" value={category ?? "all"} className="flex flex-col gap-10 focus-visible:outline-offset-4 lg:gap-14">
        {browsing ? (
          <>
            <section aria-labelledby="explore-services">
              <SectionHeader id="explore-services" title={strings.sections.services} />
              {/* Six-column track: three cards then two wider ones, so both rows fill the width evenly. */}
              <ul className="grid gap-3 lg:grid-cols-6 lg:gap-4">
                {categories.map((item, index) => (
                  <li key={item.key} className={index < 3 ? "flex lg:col-span-2" : "flex lg:col-span-3"}>
                    <CategoryCard
                      variant="row"
                      label={item.label}
                      description={item.description}
                      href={routes.explore({ category: item.key, verified: verifiedOnly ? "1" : undefined })}
                      icon={item.icon}
                      tone={item.key}
                      className="flex-1"
                    />
                  </li>
                ))}
              </ul>
            </section>

            <section aria-labelledby="explore-concerns">
              <SectionHeader id="explore-concerns" title={strings.sections.concerns} />
              <ul className="grid grid-cols-4 gap-2 sm:gap-4 lg:grid-cols-8">
                {strings.concerns.map((item) => (
                  <li key={item.key} className="flex">
                    <CategoryCard
                      label={item.label}
                      href={routes.explore({ concern: item.key, verified: verifiedOnly ? "1" : undefined })}
                      icon={item.icon}
                      tone={item.tone}
                      className="flex-1"
                    />
                  </li>
                ))}
              </ul>
            </section>
          </>
        ) : results.length === 0 ? (
          <EmptyState
            title={ui.states.emptySearchTitle}
            description={ui.states.emptySearchDescription}
            action={{ label: strings.clearAll, onClick: () => router.replace(pathname, { scroll: false }) }}
          />
        ) : category ? (
          <section aria-label={categories.find((item) => item.key === category)?.label} className="flex flex-col gap-4">
            {category === "medicines" && (
              <CategoryCard
                variant="row"
                label={strings.uploadEntry.label}
                description={strings.uploadEntry.description}
                href={routes.prescriptionUpload()}
                icon="upload"
                tone="medicines"
              />
            )}
            {renderGroup(category, results)}
          </section>
        ) : (
          // One comparable list in category order. Per-category counts live on the chips, so one-item groups
          // don't each need a heading.
          <section aria-labelledby="explore-results">
            <h2 id="explore-results" className="sr-only">
              {strings.resultsHeading}
            </h2>
            <ul className="grid gap-3 lg:grid-cols-2 lg:gap-4">
              {results.map((item) => (item.kind === "doctor" ? renderDoctor(item) : renderProduct(item)))}
            </ul>
          </section>
        )}

        {showProviders && (
          <section aria-labelledby="explore-providers">
            <SectionHeader id="explore-providers" title={strings.sections.providers} />
            <p className="-mt-2 mb-4 text-sm text-text-muted sm:-mt-3">{strings.sections.providersNote}</p>
            {providers.length > 0 ? (
              <ul className="grid gap-3 lg:grid-cols-2 lg:gap-4">{providers.map(renderProvider)}</ul>
            ) : (
              <EmptyState
                size="inline"
                icon="verified"
                title={strings.noProvidersTitle}
                description={strings.noProvidersDescription}
              />
            )}
          </section>
        )}
      </TabPanel>
    </div>
  );
}
