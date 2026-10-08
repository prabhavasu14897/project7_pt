"use client";

import { useState } from "react";
import { productConfig } from "@config/product.config";
import { fillTemplate, formatDateTime, formatPrice } from "@/lib/format";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Notice } from "@/components/feedback/Notice";
import { PrototypeControls } from "@/components/feedback/PrototypeControls";
import { StatusTimeline } from "@/components/healthcare/StatusTimeline";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { journey, useJourney } from "@/features/journey/store";
import type { Address, Booking } from "@/features/journey/types";
import type { TimelineStep } from "@/types/models";
import { getLabTest } from "./servicesData";

const { content, demoData } = productConfig;
const strings = content.bookingConfirmation;
const modeLabels = content.doctorDetail.consultTypes;

/** Sample collection steps for a lab booking; a completed booking has every step done. */
function collectionSteps(booking: Booking, reportTime: string): TimelineStep[] {
  const progress = booking.status === "completed" ? strings.progressSteps.length : (booking.progress ?? 1);
  return strings.progressSteps.map((step, index) => ({
    key: step.key,
    label: step.label,
    description: fillTemplate(step.description, { time: reportTime }),
    state: index < progress ? "complete" : index === progress ? "current" : "upcoming",
  }));
}

/** Where the booking happens, in words. */
function whereText(booking: Booking, addresses: readonly Address[]): string {
  if (booking.mode === "online") return strings.online;
  if (booking.mode === "clinic") {
    const clinic = demoData.doctors.find((doctor) => doctor.id === booking.providerId)?.clinic;
    return clinic ? `${clinic.name}, ${clinic.area}` : modeLabels.clinic.label;
  }
  const address = addresses.find((item) => item.id === booking.addressId);
  return address ? `${address.label} · ${address.line1}, ${address.line2}` : "";
}

export function BookingConfirmationScreen({ id }: { id: string }) {
  const state = useJourney();
  const booking = state.bookings.find((item) => item.id === id);
  const [confirmingCancel, setConfirmingCancel] = useState(false);

  if (!booking) {
    return (
      <div className="container-page py-8">
        <EmptyState icon="orders" title={strings.notFoundTitle} description={strings.notFoundDescription} action={{ label: strings.viewAll, href: "/orders" }} />
      </div>
    );
  }

  const when = formatDateTime(booking.slotAt);
  const labTest = booking.kind === "lab-test" ? getLabTest(booking.serviceId) : undefined;
  const confirmedBody = labTest ? (labTest.fasting ? strings.collectionBodyFasting : strings.collectionBody) : strings.confirmedBody;
  const method = demoData.paymentMethods.find((item) => item.id === booking.paymentMethod)?.label;
  const service =
    booking.kind === "doctor"
      ? `${content.booking.kinds.doctor} · ${booking.mode === "online" ? modeLabels.online.label : modeLabels.clinic.label}`
      : `${content.booking.kinds[booking.kind]} · ${booking.title}`;

  return (
    <div className="container-page flex flex-col gap-5 pb-12 pt-4 sm:pt-6 lg:pb-16 lg:pt-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-h1 font-extrabold tracking-tight text-text">{booking.title}</h1>
        <p className="text-sm text-text-muted tabular">{fillTemplate(strings.reference, { id: booking.id })}</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-12 lg:items-start lg:gap-8">
        <div className="flex min-w-0 flex-col gap-5 lg:col-span-7">
          {booking.status === "confirmed" && (
            <Notice tone="success" icon="check" title={strings.confirmedTitle}>
              {fillTemplate(confirmedBody, { provider: booking.providerName, when })}
            </Notice>
          )}
          {booking.status === "completed" && <Notice tone="success" icon="verified" title={strings.completedTitle} />}
          {booking.status === "cancelled" && (
            <Notice tone="neutral" icon="close" title={strings.cancelledTitle}>
              {strings.cancelledBody}
            </Notice>
          )}
          <p role="status" className="sr-only">
            {booking.status === "confirmed" ? strings.confirmedTitle : booking.status === "completed" ? strings.completedTitle : strings.cancelledTitle}
          </p>
          {labTest && booking.status !== "cancelled" && (
            <Card padding="lg" className="flex flex-col gap-4">
              <h2 className="text-h3 font-bold text-text">{strings.progressTitle}</h2>
              <StatusTimeline label={strings.progressTitle} steps={collectionSteps(booking, labTest.reportTime)} />
            </Card>
          )}
          {labTest && booking.status === "confirmed" && (
            // The same instruction as at booking, where it's needed: the evening and morning before collection.
            <Notice tone="info" icon="clock" title={strings.prepTitle}>
              {labTest.preparation}
            </Notice>
          )}

          <Card padding="lg" className="flex flex-col gap-4">
            <h2 className="text-h3 font-bold text-text">{strings.detailsTitle}</h2>
            <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 text-sm">
              <dt className="text-text-muted">{strings.patient}</dt>
              <dd className="font-semibold text-text">{booking.patientName}</dd>
              <dt className="text-text-muted">{strings.service}</dt>
              <dd className="font-semibold text-text">{service}</dd>
              <dt className="text-text-muted">{strings.provider}</dt>
              <dd className="font-semibold text-text">{booking.providerName}</dd>
              <dt className="text-text-muted">{strings.when}</dt>
              <dd className="font-semibold text-text tabular">{when}</dd>
              <dt className="text-text-muted">{strings.where}</dt>
              <dd className="text-text">{whereText(booking, state.addresses)}</dd>
              {/* Cash bookings are paid at the visit, so they never read as "Paid". */}
              <dt className="text-text-muted">{booking.paymentMethod === "cod" ? (booking.kind === "lab-test" || booking.kind === "package" ? strings.toPayAtCollection : strings.toPay) : strings.paid}</dt>
              <dd className="text-text tabular">
                {formatPrice(booking.fee)}
                {booking.paymentMethod !== "cod" && method && ` · ${method}`}
              </dd>
            </dl>

            {booking.status === "confirmed" && booking.mode === "online" && (
              // The call opens shortly before the slot; until then the action is visible but unavailable.
              <div className="flex flex-col gap-1.5">
                <Button leftIcon="video" disabled size="lg" fullWidth aria-describedby="join-note">
                  {strings.join}
                </Button>
                <p id="join-note" className="text-center text-xs text-text-muted">
                  {strings.joinNote}
                </p>
              </div>
            )}

            {booking.status === "confirmed" &&
              (confirmingCancel ? (
                <div className="flex flex-col gap-3 rounded-md bg-surface-muted p-4">
                  <p className="text-sm text-text">{strings.cancelConfirm}</p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="danger"
                      onClick={() => {
                        journey.cancelBooking(booking.id);
                        setConfirmingCancel(false);
                      }}
                    >
                      {strings.cancelYes}
                    </Button>
                    <Button variant="ghost" onClick={() => setConfirmingCancel(false)}>
                      {strings.cancelNo}
                    </Button>
                  </div>
                </div>
              ) : (
                <Button variant="ghost" leftIcon="close" className="self-start text-text-muted" onClick={() => setConfirmingCancel(true)}>
                  {strings.cancel}
                </Button>
              ))}
          </Card>
        </div>

        <div className="flex min-w-0 flex-col gap-5 lg:col-span-5">
          <Button href="/orders" variant="outline" rightIcon="chevron-right" className="self-start">
            {strings.viewAll}
          </Button>
          {booking.status === "confirmed" && (
            <PrototypeControls title={content.prototype.title} description={content.prototype.description}>
              {labTest ? (
                <Button size="sm" variant="outline" leftIcon="chevron-right" onClick={() => journey.advanceBooking(booking.id, strings.progressSteps.length)}>
                  {strings.advance}
                </Button>
              ) : (
                <Button size="sm" variant="outline" leftIcon="check" onClick={() => journey.completeBooking(booking.id)}>
                  {strings.complete}
                </Button>
              )}
            </PrototypeControls>
          )}
        </div>
      </div>
    </div>
  );
}
