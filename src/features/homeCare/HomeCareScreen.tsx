"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { productConfig } from "@config/product.config";
import type { MetaItem } from "@/types/models";
import { fillTemplate } from "@/lib/format";
import { routes } from "@/lib/routes";
import { catalogImage } from "@/lib/images";
import { FilterBar } from "@/components/marketplace/FilterBar";
import { ProductCard } from "@/components/marketplace/ProductCard";
import { ProviderCard } from "@/components/marketplace/ProviderCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Tabs } from "@/components/ui/Tabs";
import { homeCareProviders, homeCareServices, type HomeCareService } from "@/features/booking/servicesData";
import { nextAvailable, slotLabel, type Day } from "@/features/booking/slots";
import { daysFor } from "@/features/booking/useDays";

const { content, ui, demoData } = productConfig;
const strings = content.homeCare;

type Category = (typeof strings.categories)[number]["value"];

/** Earliest open slot across a service's providers. */
function earliest(service: HomeCareService): { days: Day[]; at: string } | undefined {
  let best: { days: Day[]; at: string } | undefined;
  for (const provider of service.providers) {
    const days = daysFor(provider.id, provider.schedule);
    const next = nextAvailable(days);
    if (next && (!best || next.at < best.at)) best = { days, at: next.at };
  }
  return best;
}

export function HomeCareScreen() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const category: Category = strings.categories.find((item) => item.value === params.get("type"))?.value ?? "all";
  const services = homeCareServices.filter((service) => category === "all" || service.category === category);

  return (
    <div className="container-page flex flex-col gap-8 pb-12 pt-4 sm:pt-6 lg:gap-12 lg:pb-16 lg:pt-8">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-h1 font-extrabold tracking-tight text-text">{strings.title}</h1>
          <p className="text-sm text-text-muted sm:text-body">{strings.subtitle}</p>
        </div>
        <FilterBar
          label={strings.categoryLabel}
          primary={
            <Tabs
              id="home-care-type"
              variant="chips"
              label={strings.categoryLabel}
              items={strings.categories}
              value={category}
              onChange={(value) => router.replace(value === "all" ? pathname : `${pathname}?type=${value}`, { scroll: false })}
            />
          }
        />
      </div>

      <section aria-labelledby="home-care-services">
        <SectionHeader id="home-care-services" title={strings.servicesTitle} />
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
          {services.map((service) => {
            const next = earliest(service);
            const meta: MetaItem[] = [
              { icon: "clock", label: service.duration },
              ...(next ? [{ icon: "schedule", label: fillTemplate(strings.nextAvailable, { when: slotLabel(next.days, next.at) }) }] : []),
            ];
            return (
              <li key={service.id} className="flex">
                <ProductCard
                  className="flex-1"
                  title={service.name}
                  image={catalogImage(routes.homeCare(service.id))}
                  subtitle={service.description}
                  icon="home-care"
                  tone="home-care"
                  rating={{ value: service.rating, count: service.reviews }}
                  meta={meta}
                  price={{ amount: service.price, unit: service.unit }}
                  action={{
                    label: ui.actions.book,
                    href: routes.book("home-care", service.id),
                    ariaLabel: fillTemplate(ui.actions.itemLabel, { action: ui.actions.book, item: service.name }),
                  }}
                />
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-labelledby="home-care-providers">
        <SectionHeader id="home-care-providers" title={strings.providersTitle} />
        <ul className="grid gap-3 lg:grid-cols-2 lg:gap-4">
          {homeCareProviders.map((provider) => {
            const record = demoData.homeCareProviders.find((item) => item.id === provider.id);
            const serviceCount = homeCareServices.filter((service) => service.providers.some((item) => item.id === provider.id)).length;
            return (
              <li key={provider.id} className="flex">
                <ProviderCard
                  className="flex-1"
                  name={provider.name}
                  imageShape="rounded"
                  headingLevel="h3"
                  subtitle={record ? fillTemplate(strings.experience, { years: record.experienceYears }) : undefined}
                  verifiedLabel={provider.verified ? ui.labels.verified : undefined}
                  pendingLabel={provider.verified ? undefined : content.explore.notVerified}
                  rating={{ value: provider.rating, count: provider.reviews }}
                  meta={[{ icon: "home-care", label: serviceCount === 1 ? strings.providerServicesOne : fillTemplate(strings.providerServices, { count: serviceCount }) }]}
                />
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
