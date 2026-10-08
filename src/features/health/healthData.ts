import { productConfig } from "@config/product.config";
import { dayKey, fillTemplate, formatDay, formatTime } from "@/lib/format";
import { routes } from "@/lib/routes";
import type { Booking, JourneyState, LabReport, Reminder } from "@/features/journey/types";

const { demoData, content } = productConfig;
const strings = content.health;
const DAY = 24 * 60 * 60_000;

/* ---------- people ---------- */

export const SELF = "self";

/** The member a Health view is about; falls back to the account holder. */
export function memberFor(state: JourneyState, id: string | null) {
  return state.familyMembers.find((member) => member.id === id) ?? state.familyMembers[0];
}

/* ---------- dates ---------- */

/** "Today", "Yesterday", "3 days ago", then "6 Sept". */
export function relativeDay(iso: string, now = new Date()): string {
  const days = Math.round((new Date(dayKey(now)).getTime() - new Date(dayKey(new Date(iso))).getTime()) / DAY);
  if (days === 0) return strings.relativeDays.today;
  if (days === 1) return strings.relativeDays.yesterday;
  if (days > 1 && days < 7) return fillTemplate(strings.relativeDays.daysAgo, { count: days });
  return formatDay(iso);
}

/* ---------- reports ---------- */

export interface ReportView extends LabReport {
  testName: string;
  labName: string;
  results: ReadonlyArray<{ name: string; value: string; unit: string; range: string }>;
  href: string;
}

const results: Record<string, ReadonlyArray<{ name: string; value: string; unit: string; range: string }>> = demoData.reportResults;

function toReportView(report: LabReport): ReportView {
  return {
    ...report,
    testName: demoData.labTests.find((test) => test.id === report.testId)?.name ?? report.testId,
    labName: demoData.labs.find((lab) => lab.id === report.labId)?.name ?? report.labId,
    results: results[report.testId] ?? [],
    href: routes.report(report.id),
  };
}

/** Newest first. */
export function reportsFor(state: JourneyState, memberId: string): ReportView[] {
  return state.reports
    .filter((report) => report.patientId === memberId)
    .sort((a, b) => b.reportedAt.localeCompare(a.reportedAt))
    .map(toReportView);
}

export function getReport(state: JourneyState, id: string): ReportView | undefined {
  const report = state.reports.find((item) => item.id === id);
  return report ? toReportView(report) : undefined;
}

/* ---------- reminders ---------- */

const weekdayNames = content.reminders.weekdays;

function at(day: Date, time: string): Date {
  const [hours = 0, minutes = 0] = time.split(":").map(Number);
  return new Date(day.getFullYear(), day.getMonth(), day.getDate(), hours, minutes);
}

export function dueOn(reminder: Reminder, day: Date): boolean {
  if (!reminder.enabled) return false;
  if (reminder.repeat === "daily") return true;
  if (reminder.repeat === "weekly") return reminder.weekday === day.getDay();
  return reminder.date === dayKey(day);
}

/** The next time the reminder fires, from now. */
export function nextOccurrence(reminder: Reminder, now = new Date()): Date | undefined {
  if (!reminder.enabled) return undefined;
  if (reminder.repeat === "once") {
    if (!reminder.date) return undefined;
    const [y = 0, m = 1, d = 1] = reminder.date.split("-").map(Number);
    const when = at(new Date(y, m - 1, d), reminder.time);
    return when.getTime() >= now.getTime() - DAY ? when : undefined;
  }
  for (let offset = 0; offset < 8; offset++) {
    const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset);
    if (dueOn(reminder, day)) return at(day, reminder.time);
  }
  return undefined;
}

/** "Every day, 6:30 pm" / "Every Sunday, 9:00 am" / "31 Oct, 8:00 am". */
export function scheduleLabel(reminder: Reminder): string {
  const time = formatTime(at(new Date(), reminder.time).toISOString());
  const copy = content.reminders;
  if (reminder.repeat === "daily") return fillTemplate(copy.everyDay, { time });
  if (reminder.repeat === "weekly") {
    const day = weekdayNames.find((item) => item.value === String(reminder.weekday))?.label ?? "";
    return fillTemplate(copy.everyWeek, { day, time });
  }
  const [y = 0, m = 1, d = 1] = (reminder.date ?? "").split("-").map(Number);
  return fillTemplate(copy.onceOn, { date: formatDay(new Date(y, m - 1, d).toISOString()), time });
}

export function remindersFor(state: JourneyState, memberId: string): Reminder[] {
  return state.reminders.filter((item) => item.patientId === memberId);
}

/** Reminders due today, earliest first, plus the next one coming after today. */
export function todayReminders(state: JourneyState, memberId: string, now = new Date()) {
  const own = remindersFor(state, memberId);
  const today = own.filter((item) => dueOn(item, now)).sort((a, b) => a.time.localeCompare(b.time));
  const next = own
    .filter((item) => !dueOn(item, now))
    .map((item) => ({ reminder: item, when: nextOccurrence(item, now) }))
    .filter((item): item is { reminder: Reminder; when: Date } => item.when !== undefined && item.when.getTime() > now.getTime())
    .sort((a, b) => a.when.getTime() - b.when.getTime())[0];
  return { today, next };
}

export function isDoneOn(reminder: Reminder, day: string): boolean {
  return reminder.done.some((entry) => entry.day === day);
}

/* ---------- appointments ---------- */

export function appointmentsFor(state: JourneyState, memberId: string) {
  const own = state.bookings.filter((booking) => booking.patientId === memberId);
  const upcoming = own.filter((booking) => booking.status === "confirmed").sort((a, b) => a.slotAt.localeCompare(b.slotAt));
  const past = own.filter((booking) => booking.status !== "confirmed").sort((a, b) => b.slotAt.localeCompare(a.slotAt));
  return { upcoming, past };
}

/** "Consultation · Video consult" style service name for timelines. */
export function serviceName(booking: Booking): string {
  return booking.kind === "doctor" ? `${content.booking.kinds.doctor} · ${booking.providerName}` : booking.title;
}

export function bookingIcon(booking: Booking): string {
  return { doctor: "doctors", "home-care": "home-care", package: "health-packages", "lab-test": "lab-tests" }[booking.kind];
}

/* ---------- activity ---------- */

export interface ActivityItem {
  key: string;
  icon: string;
  label: string;
  at: string;
  href?: string;
}

/** Everything that happened for a member, newest first. Orders and prescriptions belong to the account holder. */
export function activityFor(state: JourneyState, memberId: string, limit = 8): ActivityItem[] {
  const copy = strings.activity;
  const items: ActivityItem[] = [];

  for (const report of reportsFor(state, memberId)) {
    items.push({ key: `r-${report.id}`, icon: "lab-tests", label: fillTemplate(copy.reportReady, { test: report.testName }), at: report.reportedAt, href: report.href });
  }
  for (const booking of state.bookings.filter((item) => item.patientId === memberId)) {
    const service = serviceName(booking);
    const href = routes.booking(booking.id);
    items.push({ key: `b-${booking.id}`, icon: bookingIcon(booking), label: fillTemplate(copy.bookingBooked, { service }), at: booking.createdAt, href });
    if (booking.status === "completed")
      items.push({ key: `bc-${booking.id}`, icon: "check", label: fillTemplate(copy.bookingCompleted, { service }), at: booking.slotAt, href });
    if (booking.status === "cancelled")
      items.push({ key: `bx-${booking.id}`, icon: "close", label: fillTemplate(copy.bookingCancelled, { service }), at: booking.createdAt, href });
  }
  for (const reminder of remindersFor(state, memberId)) {
    for (const entry of reminder.done) {
      items.push({ key: `d-${reminder.id}-${entry.day}`, icon: "check", label: fillTemplate(copy.reminderDone, { title: reminder.title }), at: entry.at });
    }
  }
  if (memberId === SELF) {
    for (const order of state.orders) {
      const delivered = order.history.find((step) => step.status === "delivered");
      const href = routes.order(order.id);
      if (delivered) items.push({ key: `od-${order.id}`, icon: "delivery", label: fillTemplate(copy.orderDelivered, { id: order.id }), at: delivered.at, href });
      else if (order.status !== "cancelled" && order.status !== "payment-failed")
        items.push({ key: `o-${order.id}`, icon: "medicines", label: fillTemplate(copy.orderPlaced, { id: order.id }), at: order.placedAt, href });
    }
    for (const rx of state.prescriptions) {
      const href = routes.prescription(rx.id);
      for (const event of rx.history) {
        const label = event.status === "uploaded" ? copy.rxUploaded : event.status === "approved" ? copy.rxApproved : event.status === "needs-clarification" ? copy.rxClarify : undefined;
        if (label) items.push({ key: `rx-${rx.id}-${event.status}-${event.at}`, icon: "prescription", label, at: event.at, href });
      }
    }
  }
  const now = Date.now();
  return items
    .filter((item) => new Date(item.at).getTime() <= now)
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, limit);
}

/* ---------- insights ---------- */

export type Insight = (typeof demoData.insights)[number];

export function getInsight(id: string): Insight | undefined {
  return demoData.insights.find((item) => item.id === id);
}

/**
 * Reads that match the member's own tests come first, each saying which test linked it.
 * With personalisation off in Privacy, only the general reads show.
 */
export function insightsFor(state: JourneyState, memberId: string, limit = 3): Array<{ insight: Insight; reason: string }> {
  const personalised = state.settings.privacy.personalised !== false;
  const ownTests = new Map<string, string>();
  if (personalised) {
    for (const report of reportsFor(state, memberId)) ownTests.set(report.testId, report.testName);
    for (const booking of state.bookings) {
      if (booking.patientId === memberId && booking.kind === "lab-test" && booking.status !== "cancelled") ownTests.set(booking.serviceId, booking.title);
    }
  }
  const linked = demoData.insights.flatMap((insight) => {
    const tests: readonly string[] = insight.tests;
    const match = tests.find((test) => ownTests.has(test));
    return match ? [{ insight, reason: fillTemplate(strings.insightBecause, { test: ownTests.get(match) ?? "" }) }] : [];
  });
  const general = demoData.insights
    .filter((insight) => insight.tests.length === 0)
    .map((insight) => ({ insight, reason: strings.insightGeneral }));
  return [...linked, ...general].slice(0, limit);
}
