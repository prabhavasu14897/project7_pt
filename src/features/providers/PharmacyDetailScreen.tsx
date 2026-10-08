"use client";

import { productConfig } from "@config/product.config";
import type { MetaItem } from "@/types/models";
import { fillTemplate } from "@/lib/format";
import { catalogImage } from "@/lib/images";
import { routes } from "@/lib/routes";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ProductCard } from "@/components/marketplace/ProductCard";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { useCart } from "@/features/cart/CartProvider";
import { medicineBadge, medicineCardAction, medicineStatusBadge, orderContaining } from "@/features/medicines/medicineActions";
import { medicines, type MedicineOffer } from "@/features/medicines/medicineData";
import { ProviderHeader } from "./ProviderHeader";

const { content, demoData, medicineRules } = productConfig;
const strings = content.providerDetail;
const pharmacyStrings = strings.pharmacy;
const orderStrings = content.home.activeOrder;

export function PharmacyDetailScreen({ id }: { id: string }) {
  const cart = useCart();
  const pharmacy = demoData.pharmacies.find((item) => item.id === id);

  if (!pharmacy) {
    return (
      <div className="container-page py-8">
        <EmptyState icon="medicines" title={content.booking.notFoundTitle} description={content.booking.notFoundDescription} action={{ label: strings.backToExplore, href: routes.explore() }} />
      </div>
    );
  }

  // Every medicine this pharmacy lists, with its own price and stock; the card's action is pinned to this pharmacy.
  const stocked = medicines.flatMap((medicine) => {
    const offer = medicine.offers.find((item): item is MedicineOffer => item.pharmacyId === pharmacy.id);
    return offer ? [{ medicine, offer }] : [];
  });

  const meta: MetaItem[] = [
    { icon: "delivery", label: pharmacy.eta },
    { icon: "distance", label: pharmacy.distance },
  ];

  return (
    <div className="container-page flex flex-col gap-5 pb-12 pt-4 sm:pt-6 lg:gap-6 lg:pb-16 lg:pt-8">
      <ProviderHeader
        name={pharmacy.name}
        verified={pharmacy.verified}
        rating={pharmacy.rating}
        reviews={pharmacy.reviews}
        meta={meta}
        back={{ label: strings.backToExplore, href: routes.explore() }}
        verifiedHref={routes.explore({ category: "medicines", verified: "1" })}
      >
        {pharmacy.verified && (
          <p className="flex items-start gap-2 text-sm text-text-muted">
            <Icon name="prescription" size={16} className="mt-0.5 shrink-0 text-primary-dark" />
            {pharmacyStrings.rxNote}
          </p>
        )}
      </ProviderHeader>

      {pharmacy.verified && (
        <Card padding="lg" className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary-dark">
              <Icon name="upload" size={20} />
            </span>
            <div className="flex flex-col gap-0.5">
              <h2 className="text-body font-bold text-text">{pharmacyStrings.uploadTitle}</h2>
              <p className="text-sm text-text-muted">{pharmacyStrings.uploadBody}</p>
            </div>
          </div>
          <Button href={routes.prescriptionUpload(undefined, pharmacy.id)} variant="outline" leftIcon="upload" className="shrink-0 self-start sm:self-center">
            {pharmacyStrings.uploadAction}
          </Button>
        </Card>
      )}

      <section aria-labelledby="pharmacy-medicines" className="flex flex-col gap-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="pharmacy-medicines" className="text-h2 font-bold text-text">
            {pharmacyStrings.medicinesTitle}
          </h2>
          <p className="text-sm text-text-muted tabular">{fillTemplate(pharmacyStrings.medicinesCount, { count: stocked.length })}</p>
        </div>
        {stocked.length > 0 ? (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
            {stocked.map(({ medicine, offer }) => {
              const order = orderContaining(medicine);
              return (
                <li key={medicine.id} className="flex">
                  <ProductCard
                    className="flex-1"
                    title={medicine.name}
                    href={medicine.href}
                    image={catalogImage(medicine.href)}
                    subtitle={order ? fillTemplate(orderStrings.inOrderNote, { id: order.id }) : medicine.pack}
                    icon={medicine.form}
                    tone="medicines"
                    badge={medicineBadge(medicine)}
                    statusBadge={medicineStatusBadge(medicine)}
                    rating={medicine.reviews > 0 ? { value: medicine.rating, count: medicine.reviews } : undefined}
                    price={medicine.rule === "restricted" ? undefined : { amount: offer.price, mrp: medicine.mrp }}
                    meta={medicine.rule === "restricted" ? [] : [{ icon: "package", label: content.medicines.availability[offer.stock] }]}
                    note={medicine.rule === "restricted" ? medicineRules.restricted.description : undefined}
                    action={medicineCardAction(medicine, cart, offer)}
                  />
                </li>
              );
            })}
          </ul>
        ) : (
          <EmptyState size="inline" icon="medicines" title={pharmacyStrings.empty} />
        )}
      </section>
    </div>
  );
}
