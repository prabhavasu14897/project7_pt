"use client";

import Link from "next/link";
import { useState } from "react";
import { productConfig } from "@config/product.config";
import { fillTemplate, formatPrice } from "@/lib/format";
import { catalogImage } from "@/lib/images";
import { routes } from "@/lib/routes";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Notice } from "@/components/feedback/Notice";
import { SlotPicker } from "@/components/healthcare/SlotPicker";
import { MobileActionBar, PayTotal } from "@/components/navigation/MobileActionBar";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { RadioCardGroup } from "@/components/ui/RadioCardGroup";
import { Rating } from "@/components/ui/Rating";
import { getDoctor, type ConsultMode, type Doctor } from "@/features/booking/servicesData";
import { slotPickerLabels, useDays } from "@/features/booking/useDays";

const { content, ui, categories } = productConfig;
const strings = content.doctorDetail;
const listHref = categories.find((item) => item.key === "doctors")?.href ?? "/";

export function DoctorDetailScreen({ id }: { id: string }) {
  const doctor = getDoctor(id);
  if (!doctor) {
    return (
      <div className="container-page py-8">
        <EmptyState icon="doctors" title={content.booking.notFoundTitle} description={content.booking.notFoundDescription} action={{ label: strings.backToList, href: listHref }} />
      </div>
    );
  }
  return <Detail doctor={doctor} />;
}

function Detail({ doctor }: { doctor: Doctor }) {
  const days = useDays(doctor.id, doctor.schedule);
  const [mode, setMode] = useState<ConsultMode>(doctor.modes[0]?.mode ?? "clinic");
  const [slot, setSlot] = useState<string | undefined>();
  const fee = doctor.modes.find((item) => item.mode === mode)?.fee ?? 0;
  const bookHref = slot ? routes.book("doctor", doctor.id, { mode, slot }) : undefined;

  return (
    <div className="container-page flex flex-col gap-5 pb-12 pt-4 sm:pt-6 lg:pb-16 lg:pt-8">
      <nav aria-label={strings.breadcrumbLabel}>
        <ol className="flex flex-wrap items-center gap-1.5 text-sm text-text-muted">
          <li>
            <Link href={listHref} className="inline-flex min-h-11 items-center rounded-sm hover:text-text">
              {strings.backToList}
            </Link>
          </li>
          <li aria-hidden="true">
            <Icon name="chevron-right" size={14} />
          </li>
          <li aria-current="page" className="font-semibold text-text">
            {doctor.name}
          </li>
        </ol>
      </nav>

      <div className="grid gap-5 lg:grid-cols-12 lg:items-start lg:gap-8">
        <div className="flex min-w-0 flex-col gap-5 lg:col-span-7">
          <Card padding="lg" className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <Avatar name={doctor.name} src={catalogImage(routes.doctor(doctor.id))?.src} size="lg" />
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <div className="flex flex-col gap-0.5">
                <h1 className="text-h1 font-extrabold tracking-tight text-text">{doctor.name}</h1>
                <p className="text-body text-text-muted">{doctor.specialty}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {doctor.verified ? (
                  <Badge tone="success" icon="verified">
                    {ui.labels.verified}
                  </Badge>
                ) : (
                  <Badge tone="neutral" icon="clock">
                    {content.explore.notVerified}
                  </Badge>
                )}
                <Rating value={doctor.rating} count={doctor.reviews} size="md" />
              </div>
              <ul className="flex flex-col gap-1 text-sm text-text">
                <li className="flex items-center gap-2">
                  <Icon name="verified" size={16} className="shrink-0 text-text-muted" />
                  {fillTemplate(strings.experience, { years: doctor.experienceYears })}
                </li>
                <li className="flex items-center gap-2">
                  <Icon name="message" size={16} className="shrink-0 text-text-muted" />
                  {fillTemplate(strings.languages, { languages: doctor.languages.join(", ") })}
                </li>
              </ul>
            </div>
          </Card>

          <Card padding="lg" className="flex flex-col gap-3">
            <h2 className="text-h3 font-bold text-text">{strings.aboutTitle}</h2>
            <p className="max-w-[65ch] text-body text-text">{doctor.about}</p>
          </Card>

          <div className="grid gap-5 sm:grid-cols-2">
            <Card padding="lg" className="flex flex-col gap-3">
              <h2 className="text-h3 font-bold text-text">{strings.educationTitle}</h2>
              <ul className="flex flex-col gap-1.5 text-sm text-text">
                {doctor.education.map((line) => (
                  <li key={line} className="flex items-start gap-2">
                    <Icon name="check" size={16} className="mt-0.5 shrink-0 text-success" />
                    {line}
                  </li>
                ))}
              </ul>
            </Card>
            <Card padding="lg" className="flex flex-col gap-3">
              <h2 className="text-h3 font-bold text-text">{strings.clinicTitle}</h2>
              <p className="flex items-start gap-2 text-sm text-text">
                <Icon name="location" size={16} className="mt-0.5 shrink-0 text-primary-dark" />
                <span>
                  <span className="font-semibold">{doctor.clinic.name}</span>
                  <br />
                  {doctor.clinic.area}
                </span>
              </p>
            </Card>
          </div>
        </div>

        <section id="book" aria-label={strings.slotsTitle} className="flex min-w-0 flex-col gap-5 lg:sticky lg:top-24 lg:col-span-5">
          {doctor.verified ? (
            <Card padding="lg" className="flex flex-col gap-6">
              <RadioCardGroup
                legend={strings.consultTitle}
                value={mode}
                onChange={setMode}
                options={doctor.modes.map((item) => ({
                  value: item.mode,
                  label: strings.consultTypes[item.mode].label,
                  description: fillTemplate(strings.consultTypes[item.mode].description, { clinic: doctor.clinic.name, area: doctor.clinic.area }),
                  icon: item.mode === "online" ? "video" : "location",
                  aside: formatPrice(item.fee),
                }))}
              />
              <div className="flex flex-col gap-3">
                <h2 className="text-h3 font-bold text-text">{strings.slotsTitle}</h2>
                <SlotPicker
                  days={days}
                  value={slot}
                  onChange={setSlot}
                  labels={slotPickerLabels}
                />
              </div>
              <div className="hidden flex-col gap-3 border-t border-border pt-4 lg:flex">
                <p className="flex items-baseline justify-between text-sm text-text-muted">
                  {strings.fee}
                  <span className="text-h3 font-extrabold text-text tabular">{formatPrice(fee)}</span>
                </p>
                <Button href={bookHref} size="lg" fullWidth disabled={!bookHref} rightIcon="chevron-right">
                  {bookHref ? strings.continue : strings.pickSlot}
                </Button>
              </div>
            </Card>
          ) : (
            <Notice tone="neutral" icon="clock" title={content.explore.notVerified}>
              {strings.notVerifiedNote}
            </Notice>
          )}
        </section>
      </div>

      {doctor.verified && (
        <MobileActionBar summary={<PayTotal label={strings.fee} amount={fee} />}>
          {/* With no time picked, the bar jumps to the picker instead of sitting disabled. */}
          <Button href={bookHref ?? "#book"} rightIcon={bookHref ? "chevron-right" : "chevron-down"}>
            {bookHref ? strings.continue : strings.pickSlot}
          </Button>
        </MobileActionBar>
      )}
    </div>
  );
}
