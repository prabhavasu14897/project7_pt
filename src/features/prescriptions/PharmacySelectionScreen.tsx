"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { productConfig } from "@config/product.config";
import { fillTemplate } from "@/lib/format";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Notice } from "@/components/feedback/Notice";
import { ProviderCard } from "@/components/marketplace/ProviderCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Price } from "@/components/ui/Price";
import { journey, useJourney } from "@/features/journey/store";
import { findPrescription, medicineNames } from "@/features/journey/selectors";
import { getMedicine, isOrderable } from "@/features/medicines/medicineData";

const { content, demoData, ui } = productConfig;
const strings = content.pharmacySelection;

interface PharmacyOption {
  id: string;
  name: string;
  verified: boolean;
  rating: number;
  reviews: number;
  eta: string;
  distance: string;
  total: number;
  /** Medicines on the prescription this pharmacy can't supply right now. */
  missing: string[];
  eligible: boolean;
}

/** Pharmacies that can fill the whole prescription come first, cheapest first. */
function pharmacyOptions(medicineIds: readonly string[]): PharmacyOption[] {
  return demoData.pharmacies
    .map((pharmacy) => {
      let total = 0;
      const missing: string[] = [];
      for (const medicineId of medicineIds) {
        const medicine = getMedicine(medicineId);
        const offer = medicine?.offers.find((item) => item.pharmacyId === pharmacy.id);
        if (medicine && offer && isOrderable(offer)) total += offer.price;
        else if (medicine) missing.push(medicine.name);
      }
      return {
        id: pharmacy.id,
        name: pharmacy.name,
        verified: pharmacy.verified,
        rating: pharmacy.rating,
        reviews: pharmacy.reviews,
        eta: pharmacy.eta,
        distance: pharmacy.distance,
        total,
        missing,
        eligible: pharmacy.verified && missing.length === 0,
      };
    })
    .sort((a, b) => Number(b.eligible) - Number(a.eligible) || a.total - b.total);
}

export function PharmacySelectionScreen({ id }: { id: string }) {
  const router = useRouter();
  const state = useJourney();
  const prescription = findPrescription(state, id);
  const options = prescription ? pharmacyOptions(prescription.medicineIds) : [];
  const preferred = options.find((option) => option.eligible && option.id === prescription?.pharmacyId) ?? options.find((option) => option.eligible);
  const [selectedId, setSelectedId] = useState<string | undefined>(preferred?.id);
  const selected = options.find((option) => option.id === selectedId && option.eligible);
  const eligible = options.filter((option) => option.eligible);
  const excludedCount = options.length - eligible.length;

  if (!prescription) {
    return (
      <div className="container-page py-8">
        <EmptyState icon="prescription" title={content.verification.notFoundTitle} description={content.verification.notFoundDescription} />
      </div>
    );
  }

  return (
    <div className="container-page flex flex-col gap-5 pb-12 pt-4 sm:pt-6 lg:pb-16 lg:pt-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-h1 font-extrabold tracking-tight text-text">{strings.title}</h1>
        <p className="text-sm text-text-muted sm:text-body">{strings.subtitle}</p>
      </div>

      {prescription.status !== "approved" ? (
        <Notice tone="warning" icon="clock" title={strings.notApproved}>
          <Button href={`/prescriptions/${prescription.id}`} variant="outline" size="sm" className="mt-3">
            {content.orders.verify}
          </Button>
        </Notice>
      ) : (
        <div className="grid gap-5 lg:grid-cols-12 lg:items-start lg:gap-8">
          <section aria-labelledby="pharmacy-list" className="flex flex-col gap-3 lg:col-span-8">
            <h2 id="pharmacy-list" className="sr-only">
              {strings.listLabel}
            </h2>
            {eligible.length > 0 ? (
              <>
                {/* Only pharmacies that can fill the whole prescription are offered; the rest collapse to one line. */}
                <ul className="flex flex-col gap-3">
                  {eligible.map((option) => {
                    const isSelected = option.id === selected?.id;
                    return (
                      <li key={option.id}>
                        <ProviderCard
                          name={option.name}
                          imageShape="rounded"
                          verifiedLabel={ui.labels.verified}
                          rating={{ value: option.rating, count: option.reviews }}
                          meta={[
                            { icon: "delivery", label: option.eta },
                            { icon: "distance", label: option.distance },
                          ]}
                          price={{ amount: option.total }}
                          selected={isSelected}
                          action={{
                            label: isSelected ? ui.actions.selected : ui.actions.select,
                            ariaLabel: fillTemplate(ui.actions.itemLabel, {
                              action: isSelected ? ui.actions.selected : ui.actions.select,
                              item: option.name,
                            }),
                            variant: isSelected ? undefined : "outline",
                            onClick: () => setSelectedId(option.id),
                          }}
                        />
                      </li>
                    );
                  })}
                </ul>
                {excludedCount > 0 && (
                  <p className="text-sm text-text-muted">
                    {fillTemplate(excludedCount === 1 ? strings.excludedOne : strings.excludedMany, { count: excludedCount })}
                  </p>
                )}
              </>
            ) : (
              <EmptyState size="inline" icon="location" title={strings.noneTitle} description={strings.noneDescription} />
            )}
          </section>

          <Card padding="lg" className="flex flex-col gap-4 lg:sticky lg:top-24 lg:col-span-4">
            <div className="flex flex-wrap gap-2">
              {medicineNames(prescription.medicineIds).map((name) => (
                <Badge key={name} tone="success" icon="verified">
                  {name}
                </Badge>
              ))}
            </div>
            {selected && (
              <div className="flex items-baseline justify-between gap-3 border-t border-border pt-4">
                <span className="text-sm text-text-muted">{strings.total}</span>
                <Price amount={selected.total} size="lg" />
              </div>
            )}
            <Button
              size="lg"
              fullWidth
              leftIcon="cart"
              disabled={!selected}
              onClick={() => {
                if (!selected) return;
                journey.addPrescribed(prescription.id, prescription.medicineIds, selected.id);
                router.push(content.medicineDetail.cartHref);
              }}
            >
              {strings.addToCart}
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
}
