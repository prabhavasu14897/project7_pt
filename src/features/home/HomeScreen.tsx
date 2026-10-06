"use client";

import { useState } from "react";
import { productConfig } from "@config/product.config";
import type { CardAction } from "@/types/models";
import { medicinePrimaryAction } from "@/lib/medicine";
import { fillTemplate } from "@/lib/format";
import { routes } from "@/lib/routes";
import { OrderStatusCard } from "@/components/healthcare/OrderStatusCard";
import { CategoryCard } from "@/components/marketplace/CategoryCard";
import { ProductCard } from "@/components/marketplace/ProductCard";
import { ProviderCard } from "@/components/marketplace/ProviderCard";
import { TrustStrip } from "@/components/marketplace/TrustStrip";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { TabPanel, Tabs } from "@/components/ui/Tabs";
import { useCart } from "@/features/cart/CartProvider";
import { HomeHero } from "./HomeHero";
import { buildActiveOrder, popularItems, quickActions, recommendedProviders, type PopularItem, type ProviderKind } from "./homeData";

const { categories, content, demoData, ui, navigation } = productConfig;
const home = content.home;
const exploreHref = navigation.desktop.find((item) => item.key === "explore")?.href ?? "/";

type ProviderFilter = "all" | ProviderKind;

/** Popular items shown on phones; the rest appear from `sm` up. */
const MOBILE_POPULAR_COUNT = 4;
const ALL_PROVIDERS_COUNT = 4;

const activeOrder = buildActiveOrder();

export function HomeScreen() {
  const cart = useCart();
  const [providerFilter, setProviderFilter] = useState<ProviderFilter>("all");

  const providers =
    providerFilter === "all"
      ? recommendedProviders.slice(0, ALL_PROVIDERS_COUNT)
      : recommendedProviders.filter((provider) => provider.kind === providerFilter);

  /** True when the user's own active order already contains this medicine. */
  function inActiveOrder(item: PopularItem): boolean {
    return item.kind === "medicine" && Boolean(activeOrder?.medicineIds.has(item.id));
  }

  function popularAction(item: PopularItem): CardAction {
    if (activeOrder && inActiveOrder(item)) {
      // Never ask for a second upload of a prescription that's already with the pharmacist.
      return { label: home.activeOrder.track, href: activeOrder.href, variant: "outline" };
    }
    if (item.kind !== "medicine" || !item.rule) {
      return { label: ui.actions.book, href: item.href };
    }
    const primary = medicinePrimaryAction(item.rule);
    if (primary.kind === "upload") {
      // Prescription medicines route to upload and pharmacist review; they are never added to the cart from here.
      return { label: primary.label, href: routes.prescriptionUpload(item.id), variant: "outline" };
    }
    const added = cart.has(item.id);
    return {
      label: added ? ui.actions.added : primary.label,
      variant: added ? "secondary" : "primary",
      onClick: () => (added ? cart.remove(item.id) : cart.add(item.id)),
    };
  }

  return (
    <div className="container-page flex flex-col gap-8 pb-12 pt-4 sm:gap-10 sm:pt-6 lg:gap-14 lg:pb-16 lg:pt-8">
      {/* Lead block: who this is for, then their live order. The brand panel supports it rather than competing. */}
      <div className="flex flex-col gap-3 sm:gap-4">
        <h1 className="text-h1 font-extrabold tracking-tight text-text">
          {home.greeting}, {demoData.user.firstName}
        </h1>
        <div className="grid gap-3 sm:gap-4 lg:grid-cols-12 lg:gap-6">
          {activeOrder && (
            <OrderStatusCard
              layout="split"
              className="lg:col-span-8"
              heading={home.activeOrder.title}
              context={`${home.activeOrder.orderPrefix} #${activeOrder.id}`}
              status={activeOrder.status}
              items={activeOrder.items}
              description={activeOrder.description}
              steps={activeOrder.steps}
              progressLabel={activeOrder.progressLabel}
              note={activeOrder.note}
              action={{ label: home.activeOrder.track, href: activeOrder.href }}
            />
          )}
          <HomeHero
            id="home-hero"
            variant={activeOrder ? "compact" : "full"}
            title={home.heroTitle}
            subtitle={home.heroSubtitle}
            subtitleShort={home.heroSubtitleShort}
            uploadPrompt={home.heroUploadPrompt}
            cta={home.heroCta}
            secondaryCta={home.heroSecondaryCta}
            image={home.heroImage}
            className={activeOrder ? "lg:col-span-4" : "lg:col-span-12"}
          />
        </div>
      </div>

      <section aria-labelledby="home-categories">
        <SectionHeader id="home-categories" title={home.sections.categories} />
        <ul className="grid grid-cols-5 gap-2 sm:gap-4">
          {categories.map((category) => (
            <li key={category.key} className="flex">
              <CategoryCard
                label={category.label}
                href={category.href}
                icon={category.icon}
                tone={category.key}
                className="flex-1"
              />
            </li>
          ))}
        </ul>
      </section>

      {/* Quick actions follow categories on phones (mobile board)... */}
      <QuickActionsSection placement="mobile" className="lg:hidden" />

      <section aria-labelledby="home-popular">
        <SectionHeader
          id="home-popular"
          title={home.sections.popular}
          action={{ label: ui.actions.viewAll, href: exploreHref }}
        />
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
          {popularItems.map((item, index) => {
            // Items already in the active order show its live status instead of their medicine rule.
            const order = activeOrder && inActiveOrder(item) ? activeOrder : null;
            return (
              <li key={item.key} className={index >= MOBILE_POPULAR_COUNT ? "hidden sm:flex" : "flex"}>
                <ProductCard
                  className="flex-1"
                  title={item.title}
                  href={item.href}
                  subtitle={order ? fillTemplate(home.activeOrder.inOrderNote, { id: order.id }) : item.subtitle}
                  icon={item.icon}
                  tone={item.tone}
                  badge={order ? order.status : item.badge}
                  rating={item.rating}
                  price={item.price}
                  meta={item.meta}
                  action={popularAction(item)}
                />
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-labelledby="home-providers">
        <SectionHeader
          id="home-providers"
          title={home.sections.providers}
          action={{ label: ui.actions.viewAll, href: exploreHref }}
        />
        <Tabs
          id="home-provider-filter"
          variant="chips"
          label={home.sections.providerFilterLabel}
          items={home.providerFilters}
          value={providerFilter}
          onChange={setProviderFilter}
          hasPanels
          className="mb-4"
        />
        <TabPanel id="home-provider-filter" value={providerFilter} className="rounded-lg focus-visible:outline-offset-4">
          <ul className="grid gap-3 lg:grid-cols-2 lg:gap-4">
            {providers.map((provider) => (
              <li key={provider.key} className="flex">
                <ProviderCard
                  className="flex-1"
                  name={provider.name}
                  href={provider.href}
                  subtitle={provider.subtitle}
                  imageShape={provider.imageShape}
                  verifiedLabel={provider.verified ? ui.labels.verified : undefined}
                  rating={provider.rating}
                  meta={provider.meta}
                  price={provider.price}
                  action={{ label: provider.actionLabel, href: provider.href, variant: provider.actionVariant }}
                />
              </li>
            ))}
          </ul>
        </TabPanel>
      </section>

      {/* ...and providers on desktop (brief order). Two real positions keep focus order equal to visual order. */}
      <QuickActionsSection placement="desktop" className="hidden lg:block" />

      <section aria-labelledby="home-trust">
        <SectionHeader id="home-trust" title={home.sections.trust} />
        <TrustStrip items={content.trust} />
        <p className="mt-4 text-xs text-text-muted">{home.sections.demoNotice}</p>
      </section>
    </div>
  );
}

/** Rendered at the position each breakpoint shows it; the other copy is display:none, so it's skipped by focus and screen readers. */
function QuickActionsSection({ placement, className }: { placement: "mobile" | "desktop"; className: string }) {
  const headingId = `home-quick-actions-${placement}`;
  return (
    <section aria-labelledby={headingId} className={className}>
      <SectionHeader id={headingId} title={home.sections.quickActions} />
      <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {quickActions.map((action) => (
          <li key={action.key} className="flex">
            <CategoryCard
              variant="row"
              chevron="sm"
              label={action.label}
              description={action.description}
              href={action.href}
              icon={action.icon}
              tone={action.tone}
              className="flex-1"
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
