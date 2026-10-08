import { productConfig } from "@config/product.config";
import type { MetaItem } from "@/types/models";
import { fillTemplate } from "@/lib/format";
import { catalogImage } from "@/lib/images";
import { routes } from "@/lib/routes";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ProductCard } from "@/components/marketplace/ProductCard";
import { labTests } from "@/features/booking/servicesData";
import { ProviderHeader } from "./ProviderHeader";

const { content, demoData, categories, ui } = productConfig;
const strings = content.providerDetail;
const labStrings = strings.lab;
const testStrings = content.labTests;
const labTestsHref = categories.find((item) => item.key === "lab-tests")?.href ?? routes.explore();

export function LabDetailScreen({ id }: { id: string }) {
  const lab = demoData.labs.find((item) => item.id === id);

  if (!lab) {
    return (
      <div className="container-page py-8">
        <EmptyState icon="lab-tests" title={content.booking.notFoundTitle} description={content.booking.notFoundDescription} action={{ label: testStrings.title, href: labTestsHref }} />
      </div>
    );
  }

  const offered = labTests.flatMap((test) => {
    const offer = test.offers.find((item) => item.lab.id === lab.id);
    return offer ? [{ test, price: offer.price }] : [];
  });

  const meta: MetaItem[] = [
    { icon: "home", label: lab.mode },
    { icon: "clock", label: lab.turnaround },
    { icon: "distance", label: lab.distance },
  ];

  return (
    <div className="container-page flex flex-col gap-5 pb-12 pt-4 sm:pt-6 lg:gap-6 lg:pb-16 lg:pt-8">
      <ProviderHeader
        name={lab.name}
        verified={lab.verified}
        rating={lab.rating}
        reviews={lab.reviews}
        meta={meta}
        back={{ label: testStrings.title, href: labTestsHref }}
        verifiedHref={labTestsHref}
      />

      <section aria-labelledby="lab-tests" className="flex flex-col gap-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="lab-tests" className="text-h2 font-bold text-text">
            {labStrings.testsTitle}
          </h2>
          <p className="text-sm text-text-muted tabular">{fillTemplate(labStrings.testsCount, { count: offered.length })}</p>
        </div>
        {offered.length > 0 ? (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
            {offered.map(({ test, price }) => (
              <li key={test.id} className="flex">
                <ProductCard
                  className="flex-1"
                  title={test.name}
                  href={test.href}
                  image={catalogImage(test.href)}
                  subtitle={`${test.parameters === 1 ? testStrings.parameterOne : fillTemplate(testStrings.parameters, { count: test.parameters })} · ${fillTemplate(testStrings.reportIn, { time: test.reportTime })}`}
                  icon="lab-tests"
                  tone="lab-tests"
                  badge={test.fasting ? { label: testStrings.fasting, tone: "info", icon: "clock" } : { label: testStrings.noFasting, tone: "neutral", icon: "check" }}
                  rating={{ value: test.rating, count: test.reviews }}
                  price={{ amount: price, mrp: test.mrp }}
                  // Booking happens on the test page with this lab preselected; an unverified lab can't be booked.
                  action={
                    lab.verified
                      ? { label: labStrings.bookTest, href: `${test.href}?lab=${lab.id}#book`, ariaLabel: fillTemplate(ui.actions.itemLabel, { action: labStrings.bookTest, item: test.name }) }
                      : { label: content.explore.notVerified, disabled: true, variant: "outline", ariaLabel: fillTemplate(ui.actions.itemLabel, { action: content.explore.notVerified, item: test.name }) }
                  }
                />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState size="inline" icon="lab-tests" title={labStrings.empty} />
        )}
      </section>
    </div>
  );
}
