"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { productConfig } from "@config/product.config";
import { fillTemplate } from "@/lib/format";
import { routes } from "@/lib/routes";
import { catalogImage } from "@/lib/images";
import { FilterBar } from "@/components/marketplace/FilterBar";
import { ProductCard } from "@/components/marketplace/ProductCard";
import { Tabs } from "@/components/ui/Tabs";
import { healthPackages, packageCategoryLabel } from "@/features/booking/servicesData";

const { content, ui } = productConfig;
const strings = content.healthPackages;

type Category = (typeof strings.categories)[number]["value"];

export function HealthPackagesScreen() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const category: Category = strings.categories.find((item) => item.value === params.get("type"))?.value ?? "all";
  const packages = healthPackages.filter((item) => category === "all" || item.category === category);

  return (
    <div className="container-page flex flex-col gap-6 pb-12 pt-4 sm:pt-6 lg:gap-8 lg:pb-16 lg:pt-8">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-h1 font-extrabold tracking-tight text-text">{strings.title}</h1>
          <p className="text-sm text-text-muted sm:text-body">{strings.subtitle}</p>
        </div>
        <FilterBar
          label={strings.categoryLabel}
          primary={
            <Tabs
              id="package-type"
              variant="chips"
              label={strings.categoryLabel}
              items={strings.categories}
              value={category}
              onChange={(value) => router.replace(value === "all" ? pathname : `${pathname}?type=${value}`, { scroll: false })}
            />
          }
        />
      </div>

      <h2 className="sr-only">{strings.title}</h2>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
        {packages.map((item) => (
          <li key={item.id} className="flex">
            <ProductCard
              className="flex-1"
              title={item.name}
              href={item.href}
              image={catalogImage(item.href)}
              subtitle={`${fillTemplate(strings.testsCount, { count: item.tests })} · ${fillTemplate(strings.reportIn, { time: item.reportTime })}`}
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
    </div>
  );
}
