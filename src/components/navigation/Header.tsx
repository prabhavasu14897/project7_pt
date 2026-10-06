"use client";

import type { NavItem } from "@/types/models";
import { cn } from "@/lib/cn";
import { IconButton } from "@/components/ui/IconButton";
import { SearchBar } from "@/components/ui/SearchBar";
import { DesktopNav } from "./DesktopNav";
import { LocationPicker } from "./LocationPicker";
import { Logo } from "./Logo";

export interface HeaderAction extends NavItem {
  count?: number;
  showOnMobile?: boolean;
}

interface HeaderProps {
  brandName: string;
  navItems: readonly NavItem[];
  navLabel: string;
  activeKey?: string;
  actions: readonly HeaderAction[];
  location?: {
    label: string;
    value: string;
    options: readonly string[];
    onChange: (value: string) => void;
  };
  search?: {
    placeholder: string;
    label: string;
    onSubmit: (query: string) => void;
  };
  /** Mobile pages like Home show search under the brand row; detail pages hide it. */
  showMobileSearch?: boolean;
}

/**
 * One header for every page.
 * lg+: logo · primary nav · search · location · actions on a single 72px row.
 * < lg: logo · location · cart, with optional full-width search below. Primary nav moves to BottomNav.
 */
export function Header({
  brandName,
  navItems,
  navLabel,
  activeKey,
  actions,
  location,
  search,
  showMobileSearch = true,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur-sm">
      <div className="container-page">
        <div className="flex h-16 items-center gap-3 lg:h-[72px] lg:gap-6">
          <Logo name={brandName} />

          <DesktopNav items={navItems} activeKey={activeKey} label={navLabel} className="hidden lg:block" />

          {search && (
            <SearchBar
              appearance="filled"
              placeholder={search.placeholder}
              label={search.label}
              onSubmit={search.onSubmit}
              className="hidden max-w-md flex-1 lg:block"
            />
          )}

          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            {location && (
              <>
                <LocationPicker {...location} display="compact" className="xl:hidden" />
                <span className="hidden xl:contents">
                  <LocationPicker {...location} display="full" />
                </span>
              </>
            )}
            {/* Wrappers own visibility: a `hidden` class on IconButton would lose to its own `inline-flex`. */}
            {actions.map((action) => (
              <span key={action.key} className={cn(action.showOnMobile ? "contents" : "hidden lg:contents")}>
                <IconButton
                  href={action.href}
                  icon={action.icon}
                  label={action.label}
                  count={action.count}
                  active={action.key === activeKey}
                />
              </span>
            ))}
          </div>
        </div>

        {search && showMobileSearch && (
          <div className="pb-3 lg:hidden">
            <SearchBar appearance="filled" placeholder={search.placeholder} label={search.label} onSubmit={search.onSubmit} />
          </div>
        )}
      </div>
    </header>
  );
}
