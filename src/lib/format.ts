import { productConfig } from "@config/product.config";

const { language, currency } = productConfig.locale;

const priceFormatter = new Intl.NumberFormat(language, {
  style: "currency",
  currency,
  maximumFractionDigits: 0,
});

const compactFormatter = new Intl.NumberFormat(language, {
  notation: "compact",
  maximumFractionDigits: 1,
});

export function formatPrice(amount: number): string {
  return priceFormatter.format(amount);
}

export function formatCompact(value: number): string {
  return compactFormatter.format(value);
}

export function discountPercent(price: number, mrp: number): number {
  if (mrp <= 0 || price >= mrp) return 0;
  return Math.round(((mrp - price) / mrp) * 100);
}

/** Fills `{name}` placeholders in config copy, e.g. "Step {current} of {total}". */
export function fillTemplate(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match));
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const timeFormatter = new Intl.DateTimeFormat(language, { hour: "numeric", minute: "2-digit" });
const dayFormatter = new Intl.DateTimeFormat(language, { day: "numeric", month: "short" });

/** "Today, 10:24 am" for today, otherwise "6 Oct, 10:24 am". */
export function formatDateTime(iso: string, todayLabel = "Today"): string {
  const date = new Date(iso);
  const sameDay = date.toDateString() === new Date().toDateString();
  return `${sameDay ? todayLabel : dayFormatter.format(date)}, ${timeFormatter.format(date)}`;
}

/** Local calendar day as yyyy-mm-dd, a stable key for "today". */
export function dayKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function formatDay(iso: string): string {
  return dayFormatter.format(new Date(iso));
}

/** Mid-sentence form: "today at 9:39 pm" / "on 6 Oct at 9:39 pm". */
export function formatWhen(iso: string, templates: { todayAt: string; onDayAt: string }): string {
  const date = new Date(iso);
  const time = timeFormatter.format(date);
  return date.toDateString() === new Date().toDateString()
    ? fillTemplate(templates.todayAt, { time })
    : fillTemplate(templates.onDayAt, { day: dayFormatter.format(date), time });
}

export function formatTime(iso: string): string {
  return timeFormatter.format(new Date(iso));
}
