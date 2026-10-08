"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { productConfig } from "@config/product.config";
import type { MetaItem } from "@/types/models";
import { fillTemplate, formatPrice } from "@/lib/format";
import { EmptyState } from "@/components/feedback/EmptyState";
import { FilterBar } from "@/components/marketplace/FilterBar";
import { ProviderCard } from "@/components/marketplace/ProviderCard";
import { SearchBar } from "@/components/ui/SearchBar";
import { Tabs } from "@/components/ui/Tabs";
import { doctors, type Doctor } from "@/features/booking/servicesData";
import { nextAvailable, slotLabel } from "@/features/booking/slots";
import { daysFor } from "@/features/booking/useDays";
import { catalogImage } from "@/lib/images";

const { content, ui } = productConfig;
const strings = content.doctors;
const modeStrings = content.doctorDetail.consultTypes;

type ModeFilter = (typeof strings.modes)[number]["value"];

const specialties = [...new Set(doctors.map((doctor) => doctor.specialty))];

function matches(doctor: Doctor, query: string): boolean {
  const text = `${doctor.name} ${doctor.specialty} ${doctor.languages.join(" ")}`.toLowerCase();
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => text.includes(word));
}

export function DoctorsScreen() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const query = (params.get("q") ?? "").trim();
  const specialty = specialties.find((item) => item === params.get("specialty")) ?? "all";
  const mode: ModeFilter = strings.modes.find((item) => item.value === params.get("mode"))?.value ?? "all";
  const filtered = Boolean(query) || specialty !== "all" || mode !== "all";

  const results = doctors.filter(
    (doctor) =>
      matches(doctor, query) &&
      (specialty === "all" || doctor.specialty === specialty) &&
      (mode === "all" || doctor.modes.some((item) => item.mode === mode)),
  );

  function navigate(next: Partial<{ q: string; specialty: string; mode: ModeFilter }>) {
    const merged = { q: query, specialty, mode, ...next };
    const search = new URLSearchParams();
    if (merged.q) search.set("q", merged.q);
    if (merged.specialty !== "all") search.set("specialty", merged.specialty);
    if (merged.mode !== "all") search.set("mode", merged.mode);
    const qs = search.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  return (
    <div className="container-page flex flex-col gap-6 pb-12 pt-4 sm:pt-6 lg:gap-8 lg:pb-16 lg:pt-8">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-h1 font-extrabold tracking-tight text-text">{strings.title}</h1>
          <p className="text-sm text-text-muted sm:text-body">{strings.subtitle}</p>
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
          label={strings.specialtyLabel}
          primary={
            <Tabs
              id="doctor-specialty"
              variant="chips"
              label={strings.specialtyLabel}
              items={[{ value: "all", label: strings.allSpecialties }, ...specialties.map((item) => ({ value: item, label: item }))]}
              value={specialty}
              onChange={(value) => navigate({ specialty: value })}
            />
          }
          secondary={
            <Tabs
              id="doctor-mode"
              variant="segmented"
              label={strings.modeLabel}
              items={strings.modes}
              value={mode}
              onChange={(value) => navigate({ mode: value })}
              className="w-full sm:w-auto"
            />
          }
          clear={filtered ? { label: strings.clear, onClick: () => router.replace(pathname, { scroll: false }) } : undefined}
        />
        <p aria-live="polite" className="text-sm font-semibold text-text-muted tabular">
          {fillTemplate(strings.resultCount, { count: results.length })}
        </p>
      </div>

      <h2 className="sr-only">{strings.title}</h2>
      {results.length > 0 ? (
        <ul className="grid gap-3 lg:grid-cols-2 lg:gap-4">
          {results.map((doctor) => {
            const days = daysFor(doctor.id, doctor.schedule);
            const next = nextAvailable(days);
            const meta: MetaItem[] = [
              ...doctor.modes.map((item) => ({
                icon: item.mode === "online" ? "video" : "location",
                // Each consult type carries its own fee, so no single "from" price is needed.
                label: `${modeStrings[item.mode].label} ${formatPrice(item.fee)}`,
              })),
              // Unverified doctors can't be booked, so they don't advertise a next slot.
              ...(doctor.verified
                ? [{ icon: "schedule", label: next ? fillTemplate(strings.nextAvailable, { when: slotLabel(days, next.at) }) : strings.noSlots }]
                : []),
            ];
            return (
              <li key={doctor.id} className="flex">
                <ProviderCard
                  className="flex-1"
                  name={doctor.name}
                  href={doctor.href}
                  image={catalogImage(doctor.href)?.src}
                  subtitle={`${doctor.specialty} · ${fillTemplate(strings.experience, { years: doctor.experienceYears })}`}
                  verifiedLabel={doctor.verified ? ui.labels.verified : undefined}
                  pendingLabel={doctor.verified ? undefined : content.explore.notVerified}
                  rating={{ value: doctor.rating, count: doctor.reviews }}
                  meta={meta}
                  action={{
                    label: doctor.verified ? ui.actions.book : ui.actions.view,
                    href: doctor.href,
                    variant: doctor.verified ? "primary" : "outline",
                    ariaLabel: fillTemplate(ui.actions.itemLabel, {
                      action: doctor.verified ? ui.actions.book : ui.actions.view,
                      item: doctor.name,
                    }),
                  }}
                />
              </li>
            );
          })}
        </ul>
      ) : (
        <EmptyState
          icon="doctors"
          title={strings.emptyTitle}
          description={strings.emptyDescription}
          action={{ label: strings.clear, onClick: () => router.replace(pathname, { scroll: false }) }}
        />
      )}
    </div>
  );
}
