"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ComponentType } from "react";
import { productConfig } from "@config/product.config";
import { fillTemplate } from "@/lib/format";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/cn";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { ListRow } from "@/components/ui/ListRow";
import { journey, useJourney } from "@/features/journey/store";
import { AddressesSection, DetailsSection, FamilySection, PaymentsSection } from "./AccountSections";
import { AboutSection, HelpSection, NotificationsSection, PrivacySection } from "./PreferenceSections";

const { content, routes: bases, ui } = productConfig;
const strings = content.profile;

export type ProfileSectionKey = (typeof strings.sections)[number]["key"];

const sectionBodies: Record<ProfileSectionKey, ComponentType> = {
  details: DetailsSection,
  addresses: AddressesSection,
  payments: PaymentsSection,
  family: FamilySection,
  notifications: NotificationsSection,
  privacy: PrivacySection,
  help: HelpSection,
  about: AboutSection,
};

export function isProfileSection(key: string): key is ProfileSectionKey {
  return key in sectionBodies;
}

/** Name, contact and a way into editing them: the top of the menu on every size. */
function IdentityCard() {
  const { profile } = useJourney();
  return (
    <Card padding="lg" className="flex items-center gap-4">
      <Avatar name={profile.name} size="lg" />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="truncate text-h3 font-bold text-text">{profile.name}</p>
        <p className="text-sm text-text-muted tabular">{fillTemplate(strings.signedInAs, { phone: `+91 ${profile.phone.slice(0, 5)} ${profile.phone.slice(5)}` })}</p>
        <p className="truncate text-sm text-text-muted">{profile.email}</p>
      </div>
    </Card>
  );
}

function LogoutControl() {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  if (!confirming) {
    return (
      <Button variant="outline" leftIcon="logout" fullWidth onClick={() => setConfirming(true)}>
        {strings.logout}
      </Button>
    );
  }
  return (
    <div role="group" aria-label={strings.logout} className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4">
      <p className="text-sm font-semibold text-text">{strings.logoutConfirm}</p>
      <div className="flex flex-wrap gap-2">
        <Button
          leftIcon="logout"
          onClick={() => {
            journey.signOut();
            router.push(bases.signedOut);
          }}
        >
          {strings.logoutYes}
        </Button>
        <Button variant="ghost" onClick={() => setConfirming(false)}>
          {strings.logoutNo}
        </Button>
      </div>
    </div>
  );
}

function SectionMenu({ current }: { current?: ProfileSectionKey }) {
  return (
    <nav aria-label={strings.navLabel} className="flex flex-col gap-5">
      {strings.groups.map((group) => {
        const items = strings.sections.filter((item) => item.group === group.key);
        return (
          <div key={group.key} className="flex flex-col gap-1.5">
            <h2 id={`group-${group.key}`} className="px-1 text-sm font-semibold text-text-muted">
              {group.label}
            </h2>
            <Card padding="sm">
              <ul aria-labelledby={`group-${group.key}`} className="flex flex-col">
                {items.map((item) => (
                  <li key={item.key}>
                    <ListRow href={routes.profile(item.key)} icon={item.icon} title={item.label} description={item.description} current={item.key === current} />
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        );
      })}
    </nav>
  );
}

/**
 * Profile and settings. Without a section: the menu (and, from lg, the details form beside it).
 * With a section: that section, with the menu kept beside it from lg and a back link below.
 */
export function ProfileScreen({ section }: { section?: string }) {
  if (section !== undefined && !isProfileSection(section)) {
    return (
      <div className="container-page py-8">
        <EmptyState icon="profile" title={ui.placeholder.title} action={{ label: strings.backToProfile, href: routes.profile() }} />
      </div>
    );
  }

  const active: ProfileSectionKey = section ?? "details";
  const meta = strings.sections.find((item) => item.key === active);
  const Body = sectionBodies[active];
  const onSection = section !== undefined;

  return (
    <div className="container-page grid gap-6 pb-12 pt-4 sm:pt-6 lg:grid-cols-12 lg:items-start lg:gap-8 lg:pb-16 lg:pt-8">
      <aside className={cn("flex-col gap-6 lg:col-span-4 lg:flex", onSection ? "hidden" : "flex")}>
        {!onSection && <h1 className="text-h1 font-extrabold tracking-tight text-text lg:sr-only">{strings.title}</h1>}
        <IdentityCard />
        <SectionMenu current={onSection ? active : undefined} />
        <LogoutControl />
      </aside>

      <div className={cn("min-w-0 flex-col gap-5 lg:col-span-8 lg:flex", onSection ? "flex" : "hidden")}>
        {onSection && (
          <Link href={routes.profile()} className="inline-flex min-h-11 items-center gap-1 self-start text-sm text-text-muted hover:text-text lg:hidden">
            <Icon name="chevron-left" size={16} aria-hidden="true" />
            {strings.backToProfile}
          </Link>
        )}
        <div className="flex flex-col gap-1">
          {onSection ? (
            <h1 className="text-h1 font-extrabold tracking-tight text-text">{meta?.label}</h1>
          ) : (
            <h2 className="text-h1 font-extrabold tracking-tight text-text">{meta?.label}</h2>
          )}
          <p className="text-sm text-text-muted sm:text-body">{meta?.description}</p>
        </div>
        <Body key={active} />
      </div>
    </div>
  );
}
