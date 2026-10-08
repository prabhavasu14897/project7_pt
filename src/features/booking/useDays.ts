"use client";

import { useMemo } from "react";
import { productConfig } from "@config/product.config";
import { buildDays, closeToday, type Day, type Schedule } from "./slots";

/** Today is closed for fasting tests; this is why, in the picker's words. */
const fastingClosure = { short: productConfig.content.labTestDetail.fastingDay, message: productConfig.content.labTestDetail.fastingToday };

/**
 * Upcoming days and slots for one provider. Time-dependent, so only call it under JourneyGate (client render).
 * `fasting` closes today for tests that need an overnight fast.
 */
export function useDays(providerId: string, schedule: Schedule, fasting = false): Day[] {
  return useMemo(() => {
    const days = buildDays(providerId, schedule, { today: productConfig.ui.time.today, tomorrow: productConfig.ui.time.tomorrow });
    return fasting ? closeToday(days, fastingClosure) : days;
  }, [providerId, schedule, fasting]);
}

/** Same as useDays, for lists where a hook per row isn't possible. */
export function daysFor(providerId: string, schedule: Schedule): Day[] {
  return buildDays(providerId, schedule, { today: productConfig.ui.time.today, tomorrow: productConfig.ui.time.tomorrow });
}

const pickerStrings = productConfig.content.doctorDetail;

/** SlotPicker copy from config, shared by doctor details and the booking page. */
export const slotPickerLabels = {
  day: pickerStrings.dayLabel,
  slots: (day: string) => pickerStrings.slotsLabel.replace("{day}", day),
  empty: pickerStrings.noSlotsDay,
  full: pickerStrings.closedDay,
  off: pickerStrings.offDay,
  closedDay: (day: string) => pickerStrings.closedDayLabel.replace("{day}", day),
  morning: pickerStrings.morning,
  later: pickerStrings.later,
};
