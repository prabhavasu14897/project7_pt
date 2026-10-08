"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { productConfig } from "@config/product.config";
import { fillTemplate, formatPrice } from "@/lib/format";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Notice } from "@/components/feedback/Notice";
import { PrototypeControls } from "@/components/feedback/PrototypeControls";
import { SlotPicker } from "@/components/healthcare/SlotPicker";
import { PriceBreakdown, type PriceRow } from "@/components/marketplace/PriceBreakdown";
import { MobileActionBar, PayTotal } from "@/components/navigation/MobileActionBar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { RadioCardGroup } from "@/components/ui/RadioCardGroup";
import { PaymentMethodPicker, paymentReady } from "@/features/checkout/PaymentMethodPicker";
import { journey, useJourney } from "@/features/journey/store";
import { getBookable, type Bookable, type ConsultMode } from "./servicesData";
import { slotLabel } from "./slots";
import { daysFor, slotPickerLabels, useDays } from "./useDays";

const { content, demoData } = productConfig;
const strings = content.booking;
const doctorStrings = content.doctorDetail;

/** Simulated bank round-trip. */
const PROCESSING_MS = 2200;

type Phase = "idle" | "processing" | "failed" | "done";
type Section = "lab" | "time" | "address";

export function BookingScreen({ kind, id }: { kind: string; id: string }) {
  const bookable = getBookable(kind, id);
  if (!bookable || !bookable.bookable || bookable.providers.length === 0) {
    return (
      <div className="container-page py-8">
        <EmptyState icon="explore" title={strings.notFoundTitle} description={strings.notFoundDescription} action={{ label: content.explore.title, href: "/explore" }} />
      </div>
    );
  }
  return <Booking bookable={bookable} />;
}

function Booking({ bookable }: { bookable: Bookable }) {
  const router = useRouter();
  const params = useSearchParams();
  const state = useJourney();

  const [patientId, setPatientId] = useState<string>(state.familyMembers[0]?.id ?? "");
  const patient = state.familyMembers.find((member) => member.id === patientId) ?? state.familyMembers[0];
  const [providerId, setProviderId] = useState(
    bookable.providers.find((provider) => provider.id === params.get("provider"))?.id ?? bookable.providers[0]?.id ?? "",
  );
  const provider = bookable.providers.find((item) => item.id === providerId) ?? bookable.providers[0]!;
  const [mode, setMode] = useState<ConsultMode | undefined>(
    bookable.modes?.find((item) => item.mode === params.get("mode"))?.mode ?? bookable.modes?.[0]?.mode,
  );
  const days = useDays(provider.id, provider.schedule, bookable.fasting);
  const preselected = params.get("slot");
  const [slot, setSlot] = useState<string | undefined>(
    days.some((day) => day.slots.some((item) => item.at === preselected && item.available)) ? (preselected ?? undefined) : undefined,
  );
  // A lab test arriving with its lab and time already chosen is reviewed here, not chosen a second time.
  const [review] = useState(bookable.kind === "lab-test" && slot !== undefined && provider.id === params.get("provider"));
  const [open, setOpen] = useState<Record<Section, boolean>>({ lab: !review, time: !review, address: !review });
  const toggle = (section: Section) => setOpen((current) => ({ ...current, [section]: !current[section] }));
  const [phase, setPhase] = useState<Phase>("idle");
  const [upiError, setUpiError] = useState<string | undefined>();
  const [slotError, setSlotError] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const fee = bookable.price(mode, provider.id);
  const needsAddress = bookable.needsAddress(mode);
  const busy = phase === "processing" || phase === "done";
  const method = state.checkout.paymentMethod;
  // Cash isn't offered for consults: the doctor's time is reserved up front.
  const excludeMethods = bookable.kind === "doctor" ? ["cod"] : [];
  // Services are paid to the visiting staff, not "on delivery".
  const collecting = bookable.kind === "package" || bookable.kind === "lab-test";
  const relabel = { cod: collecting ? strings.payAtCollection : strings.payAtVisit };
  const address = state.addresses.find((item) => item.id === state.checkout.addressId);
  const when = slot ? slotLabel(days, slot) : undefined;
  const where =
    bookable.kind === "doctor"
      ? mode === "online"
        ? doctorStrings.consultTypes.online.label
        : doctorStrings.consultTypes.clinic.label
      : address
        ? `${address.label} · ${address.line1}`
        : "";

  function pay() {
    if (!slot) {
      setSlotError(true);
      setOpen((current) => ({ ...current, time: true }));
      return;
    }
    if (!paymentReady(method, state.checkout.upiId)) {
      setUpiError(content.payment.upiError);
      return;
    }
    setPhase("processing");
    timer.current = setTimeout(() => {
      const result = journey.placeBooking({
        kind: bookable.kind,
        serviceId: bookable.id,
        title: bookable.title,
        providerId: provider.id,
        providerName: provider.name,
        patientId: patient?.id ?? "",
        patientName: patient?.name ?? "",
        mode: bookable.kind === "doctor" ? (mode ?? "clinic") : "home",
        slotAt: slot,
        addressId: needsAddress ? state.checkout.addressId : undefined,
        fee,
        paymentMethod: excludeMethods.includes(method) ? (demoData.paymentMethods[0]?.id ?? method) : method,
      });
      if (result.ok) {
        setPhase("done");
        router.push(`/bookings/${result.bookingId}`);
      } else setPhase("failed");
    }, PROCESSING_MS);
  }

  const payLabel = phase === "failed" ? strings.retry : fillTemplate(strings.pay, { amount: formatPrice(fee) });
  const saving = bookable.mrp && bookable.mrp > fee ? bookable.mrp - fee : 0;
  const reviewRows: Array<{ section: Section; term: string; value: string }> = [
    ...(bookable.providers.length > 1 ? [{ section: "lab" as const, term: strings.reviewLab, value: `${provider.name} · ${formatPrice(fee)}` }] : []),
    { section: "time", term: strings.summaryWhen, value: when ?? strings.pickTime },
    ...(needsAddress ? [{ section: "address" as const, term: strings.summaryWhere, value: where }] : []),
  ];
  const rows: PriceRow[] = [
    { label: `${strings.fee} · ${provider.name}`, amount: saving ? (bookable.mrp ?? fee) : fee },
    ...(saving ? [{ label: strings.saving, amount: saving, kind: "discount" as const }] : []),
    ...(collecting ? [{ label: strings.collection, amount: 0, kind: "free" as const }] : []),
  ];

  return (
    <div className="container-page flex flex-col gap-5 pb-12 pt-4 sm:pt-6 lg:pb-16 lg:pt-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-h1 font-extrabold tracking-tight text-text">{bookable.title}</h1>
        <p className="text-sm text-text-muted">{strings.kinds[bookable.kind]}</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-12 lg:items-start lg:gap-8">
        <div className="flex min-w-0 flex-col gap-5 lg:col-span-7">
          {phase === "failed" && (
            <Notice tone="danger" icon="alert" title={strings.failedTitle}>
              {strings.failedBody}
            </Notice>
          )}

          {review ? (
            <Card padding="lg" className="flex flex-col gap-4">
              <div className="flex items-start gap-4">
                <span
                  aria-hidden="true"
                  className="flex size-12 shrink-0 items-center justify-center rounded-lg"
                  style={{ color: `var(--cn-tone-${bookable.tone}-fg)`, backgroundColor: `var(--cn-tone-${bookable.tone}-bg)` }}
                >
                  <Icon name={bookable.icon} size={22} />
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <h2 className="text-h3 font-bold text-text">{strings.reviewTitle}</h2>
                  <p className="text-sm text-text-muted">{bookable.subtitle}</p>
                </div>
                <Button href={bookable.backHref} variant="link" className="min-h-11 min-w-11 shrink-0">
                  {strings.details}
                </Button>
              </div>
              {/* Each choice made on the details page, with a way to reopen just that one. */}
              <dl className="flex flex-col divide-y divide-border border-t border-border text-sm">
                {reviewRows.map((row) => (
                  <div key={row.section} className="flex items-center gap-4 py-1">
                    <dt className="w-14 shrink-0 text-text-muted">{row.term}</dt>
                    <dd className="min-w-0 flex-1 font-semibold text-text tabular">{row.value}</dd>
                    <dd className="shrink-0">
                      <Button
                        variant="link"
                        className="min-h-11 min-w-11"
                        aria-expanded={open[row.section]}
                        aria-controls={`edit-${row.section}`}
                        aria-label={open[row.section] ? undefined : fillTemplate(strings.changeLabel, { item: row.term.toLowerCase() })}
                        disabled={busy}
                        onClick={() => toggle(row.section)}
                      >
                        {open[row.section] ? strings.done : strings.change}
                      </Button>
                    </dd>
                  </div>
                ))}
              </dl>
            </Card>
          ) : (
            <Card padding="lg" className="flex items-start gap-4">
              <span
                className="flex size-14 shrink-0 items-center justify-center rounded-lg"
                style={{ color: `var(--cn-tone-${bookable.tone}-fg)`, backgroundColor: `var(--cn-tone-${bookable.tone}-bg)` }}
              >
                <Icon name={bookable.icon} size={26} />
              </span>
              <p className="min-w-0 flex-1 text-sm text-text-muted">{bookable.subtitle}</p>
              <Button href={bookable.backHref} variant="link" className="min-h-11 min-w-11 shrink-0">
                {strings.details}
              </Button>
            </Card>
          )}

          <Card padding="lg">
            <RadioCardGroup
              legend={strings.patientTitle}
              columns={3}
              value={patient?.id ?? ""}
              onChange={setPatientId}
              options={state.familyMembers.map((member) => ({
                value: member.id,
                label: member.name,
                description: member.relation,
                disabled: busy,
              }))}
            />
          </Card>

          {bookable.providers.length > 1 && open.lab && (
            <Card padding="lg" id="edit-lab">
              <RadioCardGroup
                legend={strings.providerTitle}
                value={provider.id}
                onChange={(next) => {
                  setProviderId(next);
                  // Keep the time when the new provider has it free.
                  const target = bookable.providers.find((item) => item.id === next);
                  const free = target && daysFor(target.id, target.schedule).some((day) => day.slots.some((item) => item.at === slot && item.available));
                  if (!free) setSlot(undefined);
                }}
                options={bookable.providers.map((item) => ({
                  value: item.id,
                  label: item.name,
                  description: fillTemplate(strings.rated, { rating: item.rating.toFixed(1) }),
                  aside: bookable.kind === "lab-test" ? formatPrice(bookable.price(mode, item.id)) : undefined,
                  icon: "verified",
                  disabled: busy,
                }))}
              />
            </Card>
          )}

          {bookable.modes && bookable.modes.length > 1 && (
            <Card padding="lg">
              <RadioCardGroup
                legend={strings.consultTitle}
                value={mode ?? bookable.modes[0]!.mode}
                onChange={setMode}
                options={bookable.modes.map((item) => ({
                  value: item.mode,
                  label: doctorStrings.consultTypes[item.mode].label,
                  description: item.mode === "online" ? doctorStrings.consultTypes.online.description : strings.clinicMode,
                  icon: item.mode === "online" ? "video" : "location",
                  aside: formatPrice(item.fee),
                  disabled: busy,
                }))}
              />
            </Card>
          )}

          {open.time && (
            <Card padding="lg" id="edit-time" className="flex flex-col gap-3">
              <h2 className="text-h3 font-bold text-text">{strings.whenTitle}</h2>
              {bookable.preparation && (
                // Fasting rules belong next to the early-morning slots they constrain.
                <Notice tone="info" icon="alert" title={content.healthPackages.preparationTitle}>
                  {bookable.preparation}
                </Notice>
              )}
              <SlotPicker
                key={provider.id}
                days={days}
                value={slot}
                onChange={(at) => {
                  setSlot(at);
                  setSlotError(false);
                }}
                labels={slotPickerLabels}
              />
              {slotError && (
                <p role="alert" className="flex items-center gap-1.5 text-sm text-danger-text">
                  <Icon name="alert" size={16} />
                  {strings.needSlot}
                </p>
              )}
            </Card>
          )}

          {needsAddress && open.address && (
            <Card padding="lg" id="edit-address">
              <RadioCardGroup
                legend={collecting ? strings.collectionTitle : strings.addressTitle}
                columns={2}
                value={state.checkout.addressId}
                onChange={(addressId) => journey.updateCheckout({ addressId })}
                options={state.addresses.map((item) => ({
                  value: item.id,
                  label: item.label,
                  description: `${item.line1}, ${item.line2}`,
                  icon: item.id === "home" ? "home" : "location",
                  disabled: busy,
                }))}
              />
            </Card>
          )}

          <Card padding="lg">
            <PaymentMethodPicker
              upiError={upiError}
              onEdit={() => setUpiError(undefined)}
              disabled={busy}
              exclude={excludeMethods}
              relabel={relabel}
            />
          </Card>
        </div>

        <div className="flex min-w-0 flex-col gap-5 lg:sticky lg:top-24 lg:col-span-5">
          <Card padding="lg" className="flex flex-col gap-5">
            <h2 className="text-h3 font-bold text-text">{strings.summaryTitle}</h2>
            {/* What is being bought, restated at the moment of paying. */}
            <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
              <dt className="text-text-muted">{strings.summaryFor}</dt>
              <dd className="font-semibold text-text">{patient ? `${patient.name} · ${patient.relation}` : ""}</dd>
              <dt className="text-text-muted">{strings.summaryWhen}</dt>
              <dd className={when ? "font-semibold text-text tabular" : "text-text-muted"}>{when ?? strings.pickTime}</dd>
              <dt className="text-text-muted">{strings.summaryWhere}</dt>
              <dd className="text-text">{where}</dd>
            </dl>
            <PriceBreakdown
              rows={rows}
              total={{ label: content.cart.total, amount: fee }}
              freeLabel={content.cart.free}
              className="border-t border-border pt-4"
            />
            {busy && (
              <Notice tone="info" icon="clock" title={strings.processingTitle}>
                {strings.processingBody}
              </Notice>
            )}
            <span className="hidden lg:contents">
              <Button size="lg" fullWidth leftIcon="lock" loading={busy} onClick={pay}>
                {payLabel}
              </Button>
            </span>
            <p className="flex items-start gap-2 text-xs text-text-muted">
              <Icon name="verified" size={14} className="mt-px shrink-0" />
              {content.payment.secure}
            </p>
          </Card>
          <PrototypeControls title={content.prototype.title} description={content.prototype.description}>
            <Button
              size="sm"
              variant={state.prototype.failNextPayment ? "secondary" : "outline"}
              leftIcon={state.prototype.failNextPayment ? "check" : "alert"}
              aria-pressed={state.prototype.failNextPayment}
              onClick={() => journey.setFailNextPayment(!state.prototype.failNextPayment)}
            >
              {content.prototype.failNextPayment}
            </Button>
          </PrototypeControls>
        </div>
      </div>

      {/* Always mounted, so processing and failure are announced reliably. */}
      <p role="status" className="sr-only">
        {busy ? strings.processingTitle : phase === "failed" ? strings.failedTitle : ""}
      </p>

      {/* The chosen time rides along on phones, where the summary card is far below. */}
      <MobileActionBar summary={<PayTotal label={when ?? content.cart.total} amount={fee} />}>
        <Button leftIcon="lock" loading={busy} onClick={pay}>
          {phase === "failed" ? strings.retry : strings.payShort}
        </Button>
      </MobileActionBar>
    </div>
  );
}
