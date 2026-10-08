"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import type { Day, Slot } from "@/features/booking/slots";

interface SlotPickerProps {
  days: readonly Day[];
  /** Selected slot start (ISO), if any. */
  value?: string;
  onChange: (at: string) => void;
  labels: {
    day: string;
    /** Accessible name for a day's times, e.g. "Available times on Today". */
    slots: (day: string) => string;
    empty: string;
    /** Short status on days without open times. */
    full: string;
    off: string;
    /** Accessible name for a closed day, e.g. "Sun 11 Oct, no times available". */
    closedDay: (day: string) => string;
    morning: string;
    later: string;
  };
  className?: string;
}

const NOON = 12;

/**
 * Day strip plus start times grouped into morning and later. Days and times are toggle buttons
 * (aria-pressed), so Tab, Enter and Space work as everywhere else. Closed days and taken times say so
 * in text, never by colour alone.
 */
export function SlotPicker({ days, value, onChange, labels, className }: SlotPickerProps) {
  const initialDay =
    days.find((day) => day.slots.some((slot) => slot.at === value)) ??
    days.find((day) => day.slots.some((slot) => slot.available)) ??
    days[0];
  const [dayKey, setDayKey] = useState(initialDay?.key);
  const day = days.find((item) => item.key === dayKey) ?? days[0];

  const groups: Array<{ label: string; slots: Slot[] }> = day
    ? [
        { label: labels.morning, slots: day.slots.filter((slot) => new Date(slot.at).getHours() < NOON) },
        { label: labels.later, slots: day.slots.filter((slot) => new Date(slot.at).getHours() >= NOON) },
      ].filter((group) => group.slots.length > 0)
    : [];

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div role="group" aria-label={labels.day} className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 scrollbar-none sm:flex-wrap sm:overflow-visible">
        {days.map((item) => {
          const selected = item.key === day?.key;
          const open = item.slots.some((slot) => slot.available);
          const name = `${item.weekday} ${item.date}`;
          return (
            <button
              key={item.key}
              type="button"
              aria-pressed={selected}
              aria-label={open ? name : labels.closedDay(name)}
              onClick={() => setDayKey(item.key)}
              className={cn(
                "flex min-h-14 min-w-16 shrink-0 flex-col items-center justify-center rounded-md border px-3 py-2 text-center transition-colors duration-150",
                selected ? "border-primary-dark bg-primary-dark text-white" : "border-border bg-surface text-text hover:border-border-strong",
              )}
            >
              <span className="text-xs font-semibold">{item.weekday}</span>
              <span className="text-sm font-bold tabular">{item.date}</span>
              {!open && (
                <span className={cn("text-[0.6875rem] font-semibold", selected ? "text-white/85" : "text-text-muted")}>
                  {item.closed?.short ?? (item.slots.length === 0 ? labels.off : labels.full)}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {day && day.slots.some((slot) => slot.available) ? (
        <div role="group" aria-label={labels.slots(day.weekday)} className="flex flex-col gap-3">
          {groups.map((group) => (
            <div key={group.label} className="flex flex-col gap-2">
              <p className="text-xs font-semibold text-text-muted">{group.label}</p>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {group.slots.map((slot) => {
                  const selected = slot.at === value;
                  return (
                    <button
                      key={slot.at}
                      type="button"
                      aria-pressed={selected}
                      disabled={!slot.available}
                      onClick={() => onChange(slot.at)}
                      className={cn(
                        "h-11 rounded-md border text-sm font-semibold tabular transition-colors duration-150",
                        selected && "border-primary-dark bg-primary-soft text-primary-deep ring-1 ring-primary-dark",
                        !selected && slot.available && "border-border bg-surface text-text hover:border-primary-dark",
                        !slot.available && "cursor-not-allowed border-border bg-surface-muted text-text-muted line-through",
                      )}
                    >
                      {slot.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="rounded-md bg-surface-muted p-4 text-sm text-text-muted">{day?.closed?.message ?? labels.empty}</p>
      )}
    </div>
  );
}
