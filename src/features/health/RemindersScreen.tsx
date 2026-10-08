"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { productConfig } from "@config/product.config";
import { dayKey, fillTemplate } from "@/lib/format";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/cn";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { IconButton } from "@/components/ui/IconButton";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Switch } from "@/components/ui/Switch";
import { journey, useJourney } from "@/features/journey/store";
import type { Reminder, ReminderKind, ReminderRepeat } from "@/features/journey/types";
import { SELF, memberFor, nextOccurrence, remindersFor, scheduleLabel } from "./healthData";
import { MemberTabs } from "./MemberTabs";

const strings = productConfig.content.reminders;
const reminderIcon: Record<ReminderKind, string> = { medicine: "medicines", checkup: "checkup", habit: "habit" };

interface Draft {
  patientId: string;
  kind: ReminderKind;
  title: string;
  detail: string;
  time: string;
  repeat: ReminderRepeat;
  weekday: string;
  date: string;
}

function emptyDraft(patientId: string): Draft {
  const now = new Date();
  return { patientId, kind: "medicine", title: "", detail: "", time: "09:00", repeat: "daily", weekday: String(now.getDay()), date: dayKey(now) };
}

/** Enabled reminders by the next time they fire; paused ones after, by name. */
function byNext(a: Reminder, b: Reminder): number {
  const na = nextOccurrence(a)?.getTime() ?? Number.POSITIVE_INFINITY;
  const nb = nextOccurrence(b)?.getTime() ?? Number.POSITIVE_INFINITY;
  return na === nb ? a.title.localeCompare(b.title) : na - nb;
}

function ReminderForm({ draft, onChange, onCancel, onSave, error }: {
  draft: Draft;
  onChange: (patch: Partial<Draft>) => void;
  onCancel: () => void;
  onSave: (event: FormEvent) => void;
  error?: string;
}) {
  const state = useJourney();
  return (
    <Card as="form" aria-labelledby="add-reminder" padding="lg" onSubmit={onSave} className="flex flex-col gap-5">
      <h2 id="add-reminder" className="text-h3 font-bold text-text">
        {strings.addTitle}
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          layout="stacked"
          label={strings.forLabel}
          value={draft.patientId}
          options={state.familyMembers.map((member) => ({ value: member.id, label: member.id === SELF ? `${member.name} · ${member.relation}` : member.name }))}
          onChange={(patientId) => onChange({ patientId })}
        />
        <Select layout="stacked" label={strings.kindLabel} value={draft.kind} options={strings.kinds} onChange={(kind) => onChange({ kind })} />
        <Input
          label={strings.titleLabel}
          placeholder={strings.titlePlaceholder}
          value={draft.title}
          onChange={(event) => onChange({ title: event.target.value })}
          error={error}
          aria-required="true"
          containerClassName="sm:col-span-2"
        />
        <Input
          label={strings.detailLabel}
          placeholder={strings.detailPlaceholder}
          value={draft.detail}
          onChange={(event) => onChange({ detail: event.target.value })}
          containerClassName="sm:col-span-2"
        />
        <Select layout="stacked" label={strings.repeatLabel} value={draft.repeat} options={strings.repeats} onChange={(repeat) => onChange({ repeat })} />
        <Input label={strings.timeLabel} type="time" value={draft.time} onChange={(event) => onChange({ time: event.target.value || "09:00" })} required />
        {draft.repeat === "weekly" && (
          <Select layout="stacked" label={strings.weekdayLabel} value={draft.weekday} options={strings.weekdays} onChange={(weekday) => onChange({ weekday })} />
        )}
        {draft.repeat === "once" && (
          <Input label={strings.dateLabel} type="date" value={draft.date} min={dayKey(new Date())} onChange={(event) => onChange({ date: event.target.value })} required />
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="submit" leftIcon="check">
          {strings.save}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          {strings.cancel}
        </Button>
      </div>
    </Card>
  );
}

export function RemindersScreen() {
  const state = useJourney();
  const params = useSearchParams();
  const member = memberFor(state, params.get("member"));
  const memberId = member?.id ?? SELF;
  const reminders = [...remindersFor(state, memberId)].sort(byNext);

  const [draft, setDraft] = useState<Draft | null>(null);
  const [error, setError] = useState<string>();
  const [status, setStatus] = useState("");

  function save(event: FormEvent) {
    event.preventDefault();
    if (!draft) return;
    if (!draft.title.trim()) {
      setError(strings.titleError);
      return;
    }
    journey.addReminder({
      patientId: draft.patientId,
      kind: draft.kind,
      title: draft.title.trim(),
      detail: draft.detail.trim(),
      time: draft.time,
      repeat: draft.repeat,
      weekday: draft.repeat === "weekly" ? Number(draft.weekday) : undefined,
      date: draft.repeat === "once" ? draft.date : undefined,
    });
    setDraft(null);
    setError(undefined);
    setStatus(strings.saved);
  }

  return (
    <div className="container-page flex max-w-3xl flex-col gap-5 pb-12 pt-4 sm:pt-6 lg:pb-16 lg:pt-8">
      <Link href={routes.health(memberId)} className="inline-flex min-h-11 items-center gap-1 self-start text-sm text-text-muted hover:text-text">
        <Icon name="chevron-left" size={16} aria-hidden="true" />
        {strings.backToHealth}
      </Link>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-h1 font-extrabold tracking-tight text-text">{strings.title}</h1>
          <p className="text-sm text-text-muted sm:text-body">{strings.subtitle}</p>
        </div>
        {!draft && (
          <Button
            leftIcon="plus"
            className="self-start sm:self-auto"
            onClick={() => {
              setDraft(emptyDraft(memberId));
              setStatus("");
            }}
          >
            {strings.add}
          </Button>
        )}
      </div>
      <MemberTabs members={state.familyMembers} value={memberId} />

      <p role="status" className={status ? "flex items-center gap-1.5 text-sm font-semibold text-success-text" : "sr-only"}>
        {status && <Icon name="check" size={16} aria-hidden="true" />}
        {status}
      </p>

      {draft && (
        <ReminderForm
          draft={draft}
          error={error}
          onChange={(patch) => {
            setDraft({ ...draft, ...patch });
            if (patch.title) setError(undefined);
          }}
          onCancel={() => {
            setDraft(null);
            setError(undefined);
          }}
          onSave={save}
        />
      )}

      {reminders.length > 0 ? (
        <Card padding="sm">
          <ul className="flex flex-col divide-y divide-border">
            {reminders.map((reminder) => (
              <li key={reminder.id} className="flex items-center gap-3 px-2">
                <span
                  aria-hidden="true"
                  className={cn(
                    "flex size-10 shrink-0 items-center justify-center rounded-md bg-surface-muted",
                    reminder.enabled ? "text-primary-dark" : "text-text-muted",
                  )}
                >
                  <Icon name={reminderIcon[reminder.kind]} size={20} />
                </span>
                <Switch
                  className="min-w-0 flex-1"
                  label={reminder.title}
                  description={[reminder.enabled ? scheduleLabel(reminder) : `${strings.paused} · ${scheduleLabel(reminder)}`, reminder.detail].filter(Boolean).join(" · ")}
                  checked={reminder.enabled}
                  onChange={(enabled) => journey.setReminderEnabled(reminder.id, enabled)}
                />
                <IconButton
                  icon="trash"
                  label={fillTemplate(strings.removeLabel, { title: reminder.title })}
                  onClick={() => {
                    journey.removeReminder(reminder.id);
                    setStatus(strings.removed);
                  }}
                />
              </li>
            ))}
          </ul>
        </Card>
      ) : (
        !draft && (
          <EmptyState
            icon="reminder"
            title={fillTemplate(strings.emptyTitle, { name: member?.name ?? "" })}
            description={strings.emptyBody}
            action={{ label: strings.add, onClick: () => setDraft(emptyDraft(memberId)) }}
          />
        )
      )}

      <p className="flex items-start gap-2 text-xs text-text-muted">
        <Icon name="info" size={14} aria-hidden="true" className="mt-0.5 shrink-0" />
        {strings.note}
      </p>
    </div>
  );
}
