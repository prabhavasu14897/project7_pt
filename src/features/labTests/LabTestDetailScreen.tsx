"use client";

import Link from "next/link";
import { useState } from "react";
import { productConfig } from "@config/product.config";
import { fillTemplate, formatPrice } from "@/lib/format";
import { routes } from "@/lib/routes";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Notice } from "@/components/feedback/Notice";
import { SlotPicker } from "@/components/healthcare/SlotPicker";
import { MobileActionBar, PayTotal } from "@/components/navigation/MobileActionBar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { Price } from "@/components/ui/Price";
import { RadioCardGroup } from "@/components/ui/RadioCardGroup";
import { Rating } from "@/components/ui/Rating";
import { getLabTest, labCategoryLabel, type LabTest } from "@/features/booking/servicesData";
import { daysFor, slotPickerLabels, useDays } from "@/features/booking/useDays";
import { journey, useJourney } from "@/features/journey/store";

const { content, categories, demoData } = productConfig;
const strings = content.labTestDetail;
const listStrings = content.labTests;
const listHref = categories.find((item) => item.key === "lab-tests")?.href ?? "/";

/** `labId` preselects a lab, e.g. when booking from that lab's page; ignored unless the lab can be booked for this test. */
export function LabTestDetailScreen({ id, labId }: { id: string; labId?: string }) {
  const test = getLabTest(id);
  if (!test) {
    return (
      <div className="container-page py-8">
        <EmptyState icon="lab-tests" title={content.booking.notFoundTitle} description={content.booking.notFoundDescription} action={{ label: listStrings.title, href: listHref }} />
      </div>
    );
  }
  return <Detail test={test} preferredLabId={labId} />;
}

function Detail({ test, preferredLabId }: { test: LabTest; preferredLabId?: string }) {
  const state = useJourney();
  const [labId, setLabId] = useState<string | undefined>(
    test.bookableOffers.find((item) => item.lab.id === preferredLabId)?.lab.id ?? test.bookableOffers[0]?.lab.id,
  );
  const offer = test.bookableOffers.find((item) => item.lab.id === labId) ?? test.bookableOffers[0];
  const days = useDays(offer?.lab.id ?? test.id, offer?.lab.schedule ?? { slotTimes: demoData.collectionSlotTimes, offDays: [] }, test.fasting);
  const [slot, setSlot] = useState<string | undefined>();
  const [slotMoved, setSlotMoved] = useState<string | undefined>();

  /** Keep the chosen time when the new lab has it free; otherwise clear it and say why. */
  function chooseLab(value: string) {
    const next = test.bookableOffers.find((item) => item.lab.id === value);
    setLabId(value);
    if (!slot || !next) return;
    const free = daysFor(next.lab.id, next.lab.schedule).some((day) => day.slots.some((item) => item.at === slot && item.available));
    if (free) return;
    setSlot(undefined);
    setSlotMoved(fillTemplate(strings.slotMoved, { lab: next.lab.name }));
  }
  const price = offer?.price ?? test.mrp;
  const bookHref = slot && offer ? routes.book("lab-test", test.id, { slot, provider: offer.lab.id }) : undefined;
  const parameters = test.parameters === 1 ? listStrings.parameterOne : fillTemplate(listStrings.parameters, { count: test.parameters });

  return (
    <div className="container-page flex flex-col gap-5 pb-12 pt-4 sm:pt-6 lg:pb-16 lg:pt-8">
      <nav aria-label={strings.breadcrumbLabel}>
        <ol className="flex flex-wrap items-center gap-1.5 text-sm text-text-muted">
          <li>
            <Link href={listHref} className="inline-flex min-h-11 items-center rounded-sm hover:text-text">
              {listStrings.title}
            </Link>
          </li>
          <li aria-hidden="true">
            <Icon name="chevron-right" size={14} />
          </li>
          <li aria-current="page" className="font-semibold text-text">
            {test.name}
          </li>
        </ol>
      </nav>

      <div className="grid gap-5 lg:grid-cols-12 lg:items-start lg:gap-8">
        {/* Below lg the column dissolves so booking follows the summary: the task first, the reading after. Nothing in the reading cards is focusable, so tab order still matches. */}
        <div className="contents lg:col-span-7 lg:flex lg:min-w-0 lg:flex-col lg:gap-5">
          <Card padding="lg" className="order-1 flex flex-col gap-4 sm:flex-row sm:items-start lg:order-none">
            <span
              aria-hidden="true"
              className="flex size-16 shrink-0 items-center justify-center rounded-lg"
              style={{ color: "var(--cn-tone-lab-tests-fg, var(--color-primary-dark))", backgroundColor: "var(--cn-tone-lab-tests-bg, var(--color-primary-soft))" }}
            >
              <Icon name="lab-tests" size={28} />
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <div className="flex flex-col gap-0.5">
                <h1 className="text-h1 font-extrabold tracking-tight text-text">{test.name}</h1>
                <p className="text-body text-text-muted">
                  {parameters} · {fillTemplate(listStrings.reportIn, { time: test.reportTime })}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="neutral">{labCategoryLabel(test.category)}</Badge>
                <Rating value={test.rating} count={test.reviews} size="md" />
              </div>
              <Price amount={price} mrp={test.mrp} size="lg" showDiscount />
              <ul className="flex flex-col gap-1 text-sm text-text">
                <li className="flex items-center gap-2">
                  <Icon name="lab-tests" size={16} className="shrink-0 text-text-muted" />
                  {strings.sampleType}: {test.sampleType}
                </li>
                <li className="flex items-center gap-2">
                  <Icon name="home" size={16} className="shrink-0 text-text-muted" />
                  {content.booking.collection} · {content.cart.free}
                </li>
                <li className="flex items-center gap-2">
                  <Icon name="clock" size={16} className="shrink-0 text-text-muted" />
                  {test.fasting ? listStrings.fasting : listStrings.noFasting}
                </li>
              </ul>
            </div>
          </Card>

          <Card padding="lg" className="order-3 flex flex-col gap-3 lg:order-none">
            <h2 className="text-h3 font-bold text-text">{strings.aboutTitle}</h2>
            <p className="max-w-[65ch] text-body text-text">{test.description}</p>
          </Card>

          {/* Side by side only where each card gets a readable measure; the lg column is too narrow for two. */}
          <div className="order-3 grid gap-5 sm:grid-cols-2 lg:order-none lg:grid-cols-1 xl:grid-cols-2">
            <Card padding="lg" className="flex flex-col gap-3">
              <div className="flex flex-wrap items-baseline justify-between gap-x-2">
                <h2 className="text-h3 font-bold text-text">{strings.includedTitle}</h2>
                <span className="text-sm font-semibold text-text-muted">{parameters}</span>
              </div>
              <ul className="flex flex-col gap-1.5 text-sm text-text">
                {test.includes.map((line) => (
                  <li key={line} className="flex items-start gap-2">
                    <Icon name="check" size={16} className="mt-0.5 shrink-0 text-success" />
                    {line}
                  </li>
                ))}
              </ul>
            </Card>
            <Card padding="lg" className="flex flex-col gap-3">
              <h2 className="text-h3 font-bold text-text">{strings.reportTitle}</h2>
              <ol className="flex flex-col gap-3">
                {strings.reportSteps.map((step, index) => (
                  <li key={step.key} className="flex items-start gap-3">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary-soft text-xs font-bold text-primary-dark tabular">
                      {index + 1}
                    </span>
                    <span className="flex flex-col gap-0.5">
                      <span className="text-sm font-semibold text-text">{step.label}</span>
                      <span className="text-sm text-text-muted">{fillTemplate(step.description, { time: test.reportTime })}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </Card>
          </div>
        </div>

        <section id="book" aria-label={strings.slotsTitle} className="order-2 flex min-w-0 scroll-mt-20 flex-col gap-5 lg:sticky lg:top-24 lg:order-none lg:col-span-5">
          <Notice tone="info" icon="clock" title={strings.preparationTitle}>
            {test.preparation}
          </Notice>
          {offer ? (
            <Card padding="lg" className="flex flex-col gap-6">
              <RadioCardGroup
                legend={strings.labTitle}
                value={offer.lab.id}
                onChange={chooseLab}
                options={test.bookableOffers.map((item) => ({
                  value: item.lab.id,
                  label: item.lab.name,
                  description: fillTemplate(strings.labRating, { rating: item.lab.rating.toFixed(1), count: item.lab.reviews.toLocaleString("en-IN") }),
                  icon: "verified",
                  aside: formatPrice(item.price),
                }))}
              />
              <div className="flex flex-col gap-3">
                <h2 className="text-h3 font-bold text-text">{strings.slotsTitle}</h2>
                <SlotPicker
                  days={days}
                  value={slot}
                  onChange={(at) => {
                    setSlot(at);
                    setSlotMoved(undefined);
                  }}
                  labels={slotPickerLabels}
                />
                <p role="status" className={slotMoved ? "flex items-center gap-1.5 text-sm text-warning-text" : "sr-only"}>
                  {slotMoved && <Icon name="alert" size={16} className="shrink-0" />}
                  {slotMoved}
                </p>
              </div>
              <RadioCardGroup
                legend={strings.addressTitle}
                value={state.checkout.addressId}
                onChange={(addressId) => journey.updateCheckout({ addressId })}
                options={state.addresses.map((item) => ({
                  value: item.id,
                  label: item.label,
                  description: `${item.line1}, ${item.line2}`,
                  icon: item.id === "home" ? "home" : "location",
                }))}
              />
              <div className="hidden flex-col gap-3 border-t border-border pt-4 lg:flex">
                <p className="flex items-baseline justify-between text-sm text-text-muted">
                  {strings.fee}
                  <span className="text-h3 font-extrabold text-text tabular">{formatPrice(price)}</span>
                </p>
                <Button href={bookHref} size="lg" fullWidth disabled={!bookHref} rightIcon="chevron-right">
                  {bookHref ? strings.bookNow : strings.pickSlot}
                </Button>
              </div>
            </Card>
          ) : (
            <Notice tone="neutral" icon="clock" title={content.explore.notVerified}>
              {content.doctorDetail.notVerifiedNote}
            </Notice>
          )}
        </section>
      </div>

      {offer && (
        <MobileActionBar summary={<PayTotal label={strings.fee} amount={price} />}>
          {/* With no time picked, the bar jumps to the picker instead of sitting disabled. */}
          <Button href={bookHref ?? "#book"} rightIcon={bookHref ? "chevron-right" : "chevron-down"}>
            {bookHref ? strings.bookNow : strings.pickSlot}
          </Button>
        </MobileActionBar>
      )}
    </div>
  );
}
