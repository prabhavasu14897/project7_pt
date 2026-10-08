"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { productConfig } from "@config/product.config";
import { AppShell } from "@/components/navigation/AppShell";
import { BottomNav } from "@/components/navigation/BottomNav";
import { Header } from "@/components/navigation/Header";
import { routes } from "@/lib/routes";
import { CartProvider, useCart } from "@/features/cart/CartProvider";

const { brand, navigation, ui, demoData, content } = productConfig;

/** Routes that show the search field under the brand row on mobile. */
const mobileSearchRoutes = [productConfig.routes.home, "/foundation"];
/** Routes with their own page-level search, where the header search would duplicate it. */
const pageSearchRoutes = ["/explore"];
/** Focused entry screens: logo only, no marketplace header, search or bottom nav. */
const focusedRoutes: string[] = [productConfig.routes.welcome, productConfig.routes.signIn];

function resolveActiveKey(pathname: string): string | undefined {
  const all = [...navigation.mobile, ...navigation.headerActions];
  // Whole path segments only, so /home-care never marks Home as active.
  return all.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))?.key;
}

/** Wires config + routing into the shared Header and BottomNav. Page-level orchestration, not a reusable UI part. */
export function SiteChrome({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      <Chrome>{children}</Chrome>
    </CartProvider>
  );
}

function Chrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const cart = useCart();
  const [location, setLocation] = useState<string>(demoData.location);
  const activeKey = resolveActiveKey(pathname);
  const actions = navigation.headerActions.map((action) =>
    action.key === "cart" ? { ...action, count: cart.count } : action,
  );

  if (focusedRoutes.includes(pathname)) {
    return (
      <main id="main" tabIndex={-1} className="min-h-dvh focus:outline-none">
        {children}
      </main>
    );
  }

  return (
    <AppShell
      skipLabel={ui.header.skipToContent}
      header={
        <Header
          brandName={brand.name}
          homeHref={productConfig.routes.home}
          navItems={navigation.desktop}
          navLabel={ui.header.primaryNav}
          activeKey={activeKey}
          actions={actions}
          location={{
            label: `${content.home.locationLabel}: ${ui.header.location}`,
            value: location,
            options: demoData.locations,
            onChange: setLocation,
          }}
          search={
            pageSearchRoutes.includes(pathname)
              ? undefined
              : {
                  placeholder: ui.search.placeholder,
                  label: ui.search.label,
                  onSubmit: (query) => router.push(routes.explore({ q: query })),
                }
          }
          showMobileSearch={mobileSearchRoutes.includes(pathname)}
        />
      }
      bottomNav={<BottomNav items={navigation.mobile} activeKey={activeKey} label={ui.header.mobileNav} />}
    >
      {children}
    </AppShell>
  );
}
