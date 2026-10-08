"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { productConfig } from "@config/product.config";
import { fillTemplate } from "@/lib/format";
import { routes } from "@/lib/routes";
import { catalogImage } from "@/lib/images";
import { EmptyState } from "@/components/feedback/EmptyState";
import { FilterBar } from "@/components/marketplace/FilterBar";
import { ProductCard } from "@/components/marketplace/ProductCard";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { SearchBar } from "@/components/ui/SearchBar";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Select } from "@/components/ui/Select";
import { Tabs } from "@/components/ui/Tabs";
import { healthPackages, labCategoryLabel, labTests, packageCategoryLabel, type LabTest } from "@/features/booking/servicesData";

const { content, ui, categories } = productConfig;
const strings = content.labTests;
const packagesHref = categories.find((item) => item.key === "health-packages")?.href ?? "/";

type Category = (typeof strings.categories)[number]["value"];
type Prep = (typeof strings.prepFilters)[number]["value"];
type Sort = (typeof strings.sortOptions)[number]["value"];

function pick<T extends string>(value: string | null, options: readonly { value: T }[], fallback: T): T {
  return options.find((option) => option.value === value)?.value ?? fallback;
}

function matches(test: LabTest, query: string): boolean {
  const text = `${test.name} ${test.description} ${test.includes.join(" ")} ${labCategoryLabel(test.category)}`.toLowerCase();
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => text.includes(word));
}

/** Cheapest bookable price and the lab offering it; tests with no verified lab show the list price. */
function listing(test: LabTest) {
  const offer = test.bookableOffers[0];
  return { price: offer?.price ?? test.mrp, lab: offer?.lab.name };
}

function TestCard({ test }: { test: LabTest }) {
  const { price, lab } = listing(test);
  return (
    <ProductCard
      className="flex-1"
      title={test.name}
      href={test.href}
      image={catalogImage(test.href)}
      subtitle={`${test.parameters === 1 ? strings.parameterOne : fillTemplate(strings.parameters, { count: test.parameters })} · ${fillTemplate(strings.reportIn, { time: test.reportTime })}`}
      icon="lab-tests"
      tone="lab-tests"
      badge={test.fasting ? { label: strings.fasting, tone: "info", icon: "clock" } : { label: strings.noFasting, tone: "neutral", icon: "check" }}
      rating={{ value: test.rating, count: test.reviews }}
      meta={[
        { icon: "home", label: content.booking.collection },
        ...(lab ? [{ icon: "location", label: lab }] : []),
      ]}
      price={{ amount: price, mrp: test.mrp }}
      action={{
        label: ui.actions.book,
        // Booking starts on the detail page, where the lab, time and address are chosen.
        href: `${test.href}#book`,
        ariaLabel: fillTemplate(ui.actions.itemLabel, { action: ui.actions.book, item: test.name }),
      }}
    />
  );
}

export function LabTestsScreen() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const query = (params.get("q") ?? "").trim();
  const category = pick<Category>(params.get("category"), strings.categories, "all");
  const prep = pick<Prep>(params.get("prep"), strings.prepFilters, "all");
  const sort = pick<Sort>(params.get("sort"), strings.sortOptions, "popular");
  const filtering = Boolean(query) || category !== "all" || prep !== "all";

  const results = labTests
    .filter(
      (test) =>
        matches(test, query) &&
        (category === "all" || test.category === category) &&
        (prep === "all" || (prep === "fasting" ? test.fasting : !test.fasting)),
    )
    .sort((a, b) => {
      if (sort === "price-asc") return listing(a).price - listing(b).price;
      if (sort === "rating") return b.rating - a.rating;
      return Number(b.popular) - Number(a.popular) || b.reviews - a.reviews;
    });
  const popular = results.filter((test) => test.popular);
  const more = results.filter((test) => !test.popular);
  const packages = healthPackages.filter((item) => item.category !== "chronic").slice(0, 3);

  function navigate(next: Partial<{ q: string; category: Category; prep: Prep; sort: Sort }>) {
    const merged = { q: query, category, prep, sort, ...next };
    const search = new URLSearchParams();
    if (merged.q) search.set("q", merged.q);
    if (merged.category !== "all") search.set("category", merged.category);
    if (merged.prep !== "all") search.set("prep", merged.prep);
    if (merged.sort !== "popular") search.set("sort", merged.sort);
    const qs = search.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  const grid = "grid gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4";

  return (
    <div className="container-page flex flex-col gap-8 pb-12 pt-4 sm:pt-6 lg:gap-10 lg:pb-16 lg:pt-8">
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
          label={strings.categoryLabel}
          primary={
            <Tabs
              id="lab-category"
              variant="chips"
              label={strings.categoryLabel}
              items={strings.categories}
              value={category}
              onChange={(value) => navigate({ category: value })}
            />
          }
          secondary={
            <>
              <Tabs
                id="lab-prep"
                variant="segmented"
                label={strings.prepLabel}
                items={strings.prepFilters}
                value={prep}
                onChange={(value) => navigate({ prep: value })}
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
          clear={filtering ? { label: strings.clear, onClick: () => router.replace(pathname, { scroll: false }) } : undefined}
        />
      </div>

      <Card variant="muted" padding="md" className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-surface text-primary-dark">
          <Icon name="home" size={20} />
        </span>
        <span className="flex flex-col gap-0.5">
          <span className="text-sm font-bold text-text">{strings.collectionTitle}</span>
          <span className="text-sm text-text-muted">{strings.collectionBody}</span>
        </span>
      </Card>

      {results.length === 0 ? (
        <EmptyState
          icon="lab-tests"
          title={strings.emptyTitle}
          description={strings.emptyDescription}
          action={{ label: strings.clear, onClick: () => router.replace(pathname, { scroll: false }) }}
        />
      ) : (
        <>
          {popular.length > 0 && (
            <section aria-labelledby="lab-popular">
              <SectionHeader id="lab-popular" title={strings.popularTitle} />
              <ul className={grid}>
                {popular.map((test) => (
                  <li key={test.id} className="flex">
                    <TestCard test={test} />
                  </li>
                ))}
              </ul>
            </section>
          )}
          {more.length > 0 && (
            <section aria-labelledby="lab-more">
              <SectionHeader id="lab-more" title={popular.length > 0 ? strings.moreTitle : strings.allTitle} />
              <ul className={grid}>
                {more.map((test) => (
                  <li key={test.id} className="flex">
                    <TestCard test={test} />
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}

      {!filtering && (
        <section aria-labelledby="lab-packages">
          <SectionHeader id="lab-packages" title={strings.packagesTitle} action={{ label: strings.packagesSeeAll, href: packagesHref }} />
          <ul className={grid}>
            {packages.map((item) => (
              <li key={item.id} className="flex">
                <ProductCard
                  className="flex-1"
                  title={item.name}
                  href={item.href}
                  image={catalogImage(item.href)}
                  subtitle={`${fillTemplate(content.healthPackages.testsCount, { count: item.tests })} · ${fillTemplate(content.healthPackages.reportIn, { time: item.reportTime })}`}
                  icon="health-packages"
                  tone="health-packages"
                  badge={{ label: packageCategoryLabel(item.category), tone: "neutral" }}
                  rating={{ value: item.rating, count: item.reviews }}
                  meta={[{ icon: "home", label: content.booking.collection }]}
                  price={{ amount: item.price, mrp: item.mrp }}
                  action={{
                    label: ui.actions.book,
                    href: routes.book("package", item.id),
                    ariaLabel: fillTemplate(ui.actions.itemLabel, { action: ui.actions.book, item: item.name }),
                  }}
                />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
