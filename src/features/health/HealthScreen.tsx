"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import { productConfig } from "@config/product.config";
import { dayKey, fillTemplate, formatDateTime, formatTime } from "@/lib/format";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/cn";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { ListRow } from "@/components/ui/ListRow";
import { Tabs } from "@/components/ui/Tabs";
import { journey, useJourney } from "@/features/journey/store";
import type { Booking, Prescription, Reminder } from "@/features/journey/types";
import {
  SELF,
  activityFor,
  appointmentsFor,
  bookingIcon,
  insightsFor,
  isDoneOn,
  memberFor,
  relativeDay,
  reportsFor,
  serviceName,
  todayReminders,
} from "./healthData";

const { content, categories } = productConfig;
const strings = content.health;
const exploreHref = "/explore";
const labTestsHref = categories.find((item) => item.key === "lab-tests")?.href ?? exploreHref;
const reminderIcon: Record<Reminder["kind"], string> = { medicine: "medicines", checkup: "checkup", habit: "habit" };
const statusTone = { confirmed: "info", completed: "success", cancelled: "neutral" } as const;
const rxTone = { "under-review": "warning", approved: "success", "needs-clarification": "danger" } as const;

/** Card heading row: title on the left, a quiet link to the full list on the right. */
function CardHeader({ id, title, link }: { id: string; title: string; link?: { label: string; href: string } }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <h2 id={id} className="text-h3 font-bold text-text">
        {title}
      </h2>
      {link && (
        <Link href={link.href} className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-primary-dark hover:underline">
          {link.label}
          <Icon name="chevron-right" size={16} aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}

/** A row's supporting line with its status badge first, so the title keeps the full row width on phones. */
function StatusMeta({ badge, children }: { badge: ReactNode; children: ReactNode }) {
  return (
    <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
      {badge}
      <span>{children}</span>
    </span>
  );
}

function AppointmentRow({ booking }: { booking: Booking }) {
  return (
    <ListRow
      href={routes.booking(booking.id)}
      icon={bookingIcon(booking)}
      tone={bookingIcon(booking)}
      title={serviceName(booking)}
      description={
        <StatusMeta badge={<Badge tone={statusTone[booking.status]}>{strings.appointmentStatus[booking.status]}</Badge>}>
          {fillTemplate(strings.appointmentMeta, { when: formatDateTime(booking.slotAt), provider: booking.providerName })}
        </StatusMeta>
      }
      className="-mx-3 w-auto"
    />
  );
}

function prescriptionTitle(rx: Prescription): string {
  const names = rx.medicineIds.map((id) => productConfig.demoData.medicines.find((item) => item.id === id)?.name ?? id);
  return names.length > 2 ? `${names.slice(0, 2).join(", ")} +${names.length - 2}` : names.join(", ");
}

export function HealthScreen() {
  const state = useJourney();
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const member = memberFor(state, params.get("member"));
  const memberId = member?.id ?? SELF;
  const name = member?.name ?? "";

  const now = new Date();
  const today = dayKey(now);
  const { upcoming, past } = appointmentsFor(state, memberId);
  const next = upcoming[0];
  const reminders = todayReminders(state, memberId, now);
  const reports = reportsFor(state, memberId).slice(0, 3);
  const appointments = [...upcoming.slice(1), ...past].slice(0, 3);
  const activity = activityFor(state, memberId, 6);
  const insights = insightsFor(state, memberId);
  const prescriptions = memberId === SELF ? [...state.prescriptions].reverse().slice(0, 3) : [];

  return (
    <div className="container-page flex flex-col gap-6 pb-12 pt-4 sm:pt-6 lg:gap-8 lg:pb-16 lg:pt-8">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-h1 font-extrabold tracking-tight text-text">{strings.title}</h1>
          <p className="text-sm text-text-muted sm:text-body">{strings.subtitle}</p>
        </div>
        <Tabs
          id="health-member"
          variant="chips"
          label={strings.memberLabel}
          items={state.familyMembers.map((item) => ({ value: item.id, label: item.id === SELF ? `${item.name} · ${item.relation}` : item.name }))}
          value={memberId}
          onChange={(value) => router.replace(value === SELF ? pathname : `${pathname}?member=${value}`, { scroll: false })}
        />
      </div>

      {/* Two columns from lg. Below it the columns dissolve so the order follows what a person asks next. */}
      <div className="grid gap-5 lg:grid-cols-12 lg:items-start lg:gap-6">
        <div className="contents lg:col-span-7 lg:flex lg:min-w-0 lg:flex-col lg:gap-6">
          <Card as="section" aria-labelledby="coming-up" padding="lg" className="order-1 flex flex-col gap-5 lg:order-none">
            <h2 id="coming-up" className="text-h3 font-bold text-text">
              {strings.comingUpTitle}
            </h2>

            {next ? (
              <Link
                href={routes.booking(next.id)}
                className="group flex items-start gap-4 rounded-lg bg-primary-soft p-4 transition-colors duration-150 hover:bg-primary-soft/70 sm:p-5"
              >
                <span
                  aria-hidden="true"
                  className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-surface"
                  style={{ color: `var(--cn-tone-${bookingIcon(next)}-fg)` }}
                >
                  <Icon name={bookingIcon(next)} size={24} />
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="text-xs font-semibold text-primary-deep">{strings.nextAppointment}</span>
                  <span className="text-body font-bold text-text">{serviceName(next)}</span>
                  <span className="text-sm text-text tabular">{fillTemplate(strings.appointmentMeta, { when: formatDateTime(next.slotAt), provider: next.providerName })}</span>
                </span>
                <Icon name="chevron-right" size={20} aria-hidden="true" className="mt-1 shrink-0 text-primary-dark transition-transform duration-150 group-hover:translate-x-0.5" />
              </Link>
            ) : (
              <div className="flex flex-col items-start gap-3 rounded-lg bg-surface-muted p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                <span className="flex flex-col gap-0.5">
                  <span className="text-body font-bold text-text">{strings.noAppointmentTitle}</span>
                  <span className="text-sm text-text-muted">{fillTemplate(strings.noAppointmentBody, { name })}</span>
                </span>
                <Button href={exploreHref} variant="outline" size="sm" rightIcon="chevron-right">
                  {strings.bookSomething}
                </Button>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <CardHeader id="today-reminders" title={strings.todayTitle} link={{ label: strings.allReminders, href: routes.reminders(memberId) }} />
              {reminders.today.length > 0 ? (
                <ul aria-labelledby="today-reminders" className="flex flex-col divide-y divide-border">
                  {reminders.today.map((reminder) => {
                    const done = isDoneOn(reminder, today);
                    return (
                      <li key={reminder.id} className="flex items-center gap-3 py-2.5">
                        <span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-md bg-surface-muted text-primary-dark">
                          <Icon name={reminderIcon[reminder.kind]} size={20} />
                        </span>
                        <span className="flex min-w-0 flex-1 flex-col">
                          <span className={cn("text-sm font-semibold sm:text-body", done ? "text-text-muted line-through" : "text-text")}>{reminder.title}</span>
                          <span className="text-sm text-text-muted tabular">
                            {formatTime(new Date(`${today}T${reminder.time}`).toISOString())}
                            {reminder.detail && ` · ${reminder.detail}`}
                          </span>
                        </span>
                        <Button
                          size="sm"
                          variant={done ? "secondary" : "outline"}
                          leftIcon={done ? "check" : undefined}
                          aria-pressed={done}
                          aria-label={fillTemplate(strings.markDone, { title: reminder.title })}
                          onClick={() => journey.toggleReminderDone(reminder.id, today)}
                        >
                          {done ? strings.done : strings.notDone}
                        </Button>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-sm text-text-muted">{strings.noRemindersToday}</p>
              )}
              {reminders.next && (
                <p className="flex items-center gap-2 text-sm text-text-muted tabular">
                  <Icon name="reminder" size={16} aria-hidden="true" className="shrink-0" />
                  {fillTemplate(strings.upcomingReminder, { title: reminders.next.reminder.title, when: formatDateTime(reminders.next.when.toISOString()) })}
                </p>
              )}
            </div>
          </Card>

          <Card as="section" aria-labelledby="appointments" padding="lg" className="order-3 flex flex-col gap-2 lg:order-none">
            <CardHeader id="appointments" title={strings.appointmentsTitle} link={{ label: strings.allAppointments, href: "/orders" }} />
            {appointments.length > 0 ? (
              <ul className="flex flex-col">
                {appointments.map((booking) => (
                  <li key={booking.id}>
                    <AppointmentRow booking={booking} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-text-muted">{fillTemplate(strings.noAppointments, { name })}</p>
            )}
          </Card>

          <Card as="section" aria-labelledby="activity" padding="lg" className="order-5 flex flex-col gap-3 lg:order-none">
            <CardHeader id="activity" title={strings.activityTitle} />
            {activity.length > 0 ? (
              <ol className="flex flex-col">
                {activity.map((item, index) => {
                  const body = (
                    <>
                      <span className="relative flex flex-col items-center self-stretch">
                        <span aria-hidden="true" className="z-10 flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-text-muted">
                          <Icon name={item.icon} size={15} />
                        </span>
                        {index < activity.length - 1 && <span aria-hidden="true" className="w-px flex-1 bg-border" />}
                      </span>
                      <span className="flex min-w-0 flex-1 flex-col pb-4">
                        <span className="text-sm font-semibold text-text">{item.label}</span>
                        <span className="text-xs text-text-muted tabular">{relativeDay(item.at, now)}</span>
                      </span>
                    </>
                  );
                  return (
                    <li key={item.key}>
                      {item.href ? (
                        <Link href={item.href} className="flex min-h-11 gap-3 rounded-md hover:bg-surface-muted">
                          {body}
                        </Link>
                      ) : (
                        <div className="flex gap-3">{body}</div>
                      )}
                    </li>
                  );
                })}
              </ol>
            ) : (
              <p className="text-sm text-text-muted">{strings.noActivity}</p>
            )}
          </Card>
        </div>

        <div className="contents lg:col-span-5 lg:flex lg:min-w-0 lg:flex-col lg:gap-6">
          <Card as="section" aria-labelledby="reports" padding="lg" className="order-2 flex flex-col gap-2 lg:order-none">
            <CardHeader id="reports" title={strings.reportsTitle} link={reports.length > 0 ? { label: strings.allReports, href: routes.reports(memberId) } : undefined} />
            {reports.length > 0 ? (
              <ul className="flex flex-col">
                {reports.map((report) => (
                  <li key={report.id}>
                    <ListRow
                      href={report.href}
                      icon="lab-tests"
                      tone="lab-tests"
                      title={report.testName}
                      description={`${report.labName} · ${fillTemplate(content.reports.readyOn, { when: relativeDay(report.reportedAt, now).toLowerCase() })}`}
                      className="-mx-3 w-auto"
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-start gap-3">
                <p className="text-sm text-text-muted">{fillTemplate(strings.noReportsBody, { name })}</p>
                <Button href={labTestsHref} variant="outline" size="sm" rightIcon="chevron-right">
                  {strings.bookTest}
                </Button>
              </div>
            )}
          </Card>

          {memberId === SELF && (
            <Card as="section" aria-labelledby="prescriptions" padding="lg" className="order-4 flex flex-col gap-2 lg:order-none">
              <CardHeader id="prescriptions" title={strings.prescriptionsTitle} link={{ label: strings.uploadPrescription, href: "/prescriptions/upload" }} />
              {prescriptions.length > 0 ? (
                <ul className="flex flex-col">
                  {prescriptions.map((rx) => {
                    const uploaded = rx.history[0]?.at ?? "";
                    const when = relativeDay(uploaded, now).toLowerCase();
                    return (
                      <li key={rx.id}>
                        <ListRow
                          href={routes.prescription(rx.id)}
                          icon="prescription"
                          title={prescriptionTitle(rx)}
                          description={
                            <StatusMeta badge={<Badge tone={rxTone[rx.status]}>{strings.prescriptionStatus[rx.status]}</Badge>}>
                              {rx.medicineIds.length === 1 ? fillTemplate(strings.prescriptionMetaOne, { when }) : fillTemplate(strings.prescriptionMeta, { count: rx.medicineIds.length, when })}
                            </StatusMeta>
                          }
                          className="-mx-3 w-auto"
                        />
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-sm text-text-muted">{strings.noPrescriptions}</p>
              )}
            </Card>
          )}

          <section aria-labelledby="insights" className="order-6 flex flex-col gap-2 lg:order-none">
            <div className="flex flex-col gap-0.5">
              <h2 id="insights" className="text-h3 font-bold text-text">
                {strings.insightsTitle}
              </h2>
              <p className="text-xs text-text-muted">{strings.insightsNote}</p>
            </div>
            <ul className="flex flex-col gap-2">
              {insights.map(({ insight, reason }) => (
                <li key={insight.id}>
                  <Link
                    href={routes.insight(insight.id)}
                    className="flex flex-col gap-1 rounded-lg border border-border bg-surface p-4 transition-colors duration-150 hover:border-border-strong"
                  >
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-secondary-text">
                      <Icon name="insight" size={14} aria-hidden="true" />
                      {reason}
                    </span>
                    <span className="text-body font-bold text-text">{insight.title}</span>
                    <span className="text-sm text-text-muted">{insight.summary}</span>
                    <span className="text-xs text-text-muted">{fillTemplate(strings.readMinutes, { minutes: insight.minutes })}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
