"use client";

import { usePathname, useRouter } from "next/navigation";
import { productConfig } from "@config/product.config";
import { Tabs } from "@/components/ui/Tabs";
import type { FamilyMember } from "@/features/journey/types";
import { SELF } from "./healthData";

/** Whose health a page shows. Kept in the URL (?member=) so links and the back button keep the person. */
export function MemberTabs({ members, value }: { members: readonly FamilyMember[]; value: string }) {
  const router = useRouter();
  const pathname = usePathname();
  return (
    <Tabs
      id="health-member"
      variant="chips"
      label={productConfig.content.health.memberLabel}
      items={members.map((item) => ({ value: item.id, label: item.id === SELF ? `${item.name} · ${item.relation}` : item.name }))}
      value={value}
      onChange={(next) => router.replace(next === SELF ? pathname : `${pathname}?member=${next}`, { scroll: false })}
    />
  );
}
