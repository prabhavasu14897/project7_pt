import { productConfig } from "@config/product.config";

const { language } = productConfig.locale;

const weekdayFormatter = new Intl.DateTimeFormat(language, { weekday: "short" });
const dateFormatter = new Intl.DateTimeFormat(language, { day: "numeric", month: "short" });
const timeFormatter = new Intl.DateTimeFormat(language, { hour: "numeric", minute: "2-digit" });

export interface Slot {
  /** ISO start time. */
  at: string;
  label: string;
  available: boolean;
}

export interface Day {
  /** yyyy-mm-dd, stable key for the day. */
  key: string;
  /** "Today", "Tomorrow" or "Thu". */
  weekday: string;
  /** "9 Oct". */
  date: string;
  /** True for Today/Tomorrow, whose names already say which day it is. */
  relative: boolean;
  slots: Slot[];
  /** Why a day is closed when a rule, not the calendar, closes it: a short chip label and a sentence. */
  closed?: { short: string; message: string };
}

export interface Schedule {
  slotTimes: readonly string[];
  /** Weekday numbers the provider doesn't work (0 = Sunday). */
  offDays: readonly number[];
}

/** Small stable hash so the same provider shows the same "already booked" slots on every render. */
function hash(text: string): number {
  let value = 0;
  for (const char of text) value = (value * 31 + char.charCodeAt(0)) >>> 0;
  return value;
}

function dayKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

/**
 * The next `count` days of slots for a provider. Past times today, off days and a deterministic
 * share of "already booked" times are unavailable, so the grid looks like a real calendar.
 */
export function buildDays(providerId: string, schedule: Schedule, labels: { today: string; tomorrow: string }, count = 6, now = new Date()): Day[] {
  return Array.from({ length: count }, (_, offset) => {
    const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset);
    const off = schedule.offDays.includes(day.getDay());
    const slots = off
      ? []
      : schedule.slotTimes.map((time) => {
          const [hours = 0, minutes = 0] = time.split(":").map(Number);
          const at = new Date(day.getFullYear(), day.getMonth(), day.getDate(), hours, minutes);
          const booked = hash(`${providerId}|${dayKey(day)}|${time}`) % 4 === 0;
          // Give at least 30 minutes' notice for a slot today.
          const tooSoon = at.getTime() < now.getTime() + 30 * 60_000;
          return { at: at.toISOString(), label: timeFormatter.format(at), available: !booked && !tooSoon };
        });
    return {
      key: dayKey(day),
      weekday: offset === 0 ? labels.today : offset === 1 ? labels.tomorrow : weekdayFormatter.format(day),
      date: dateFormatter.format(day),
      relative: offset < 2,
      slots,
    };
  });
}

/** First open slot across the next days, for "Next: Today, 4:30 pm" summaries. */
export function nextAvailable(days: readonly Day[]): Slot | undefined {
  for (const day of days) {
    const slot = day.slots.find((item) => item.available);
    if (slot) return slot;
  }
  return undefined;
}

/** "Today, 4:30 pm" / "Thu 9 Oct, 4:30 pm" for a slot inside `days`. */
export function slotLabel(days: readonly Day[], at: string): string {
  for (const day of days) {
    const slot = day.slots.find((item) => item.at === at);
    if (slot) return `${day.weekday}${day.relative ? "" : ` ${day.date}`}, ${slot.label}`;
  }
  return "";
}

/**
 * Fasting tests can't be collected today: nobody can promise a 10–12 hour fast they've already broken.
 * Today stays visible but closed, with the reason, so the picker opens on the first workable day.
 */
export function closeToday(days: readonly Day[], closed: { short: string; message: string }): Day[] {
  return days.map((day, index) => (index === 0 ? { ...day, slots: day.slots.map((slot) => ({ ...slot, available: false })), closed } : day));
}
