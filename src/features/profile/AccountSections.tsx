"use client";

import { useState, type FormEvent } from "react";
import { productConfig } from "@config/product.config";
import { fillTemplate } from "@/lib/format";
import { Notice } from "@/components/feedback/Notice";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { Input } from "@/components/ui/Input";
import { journey, useJourney } from "@/features/journey/store";
import type { Profile } from "@/features/journey/types";
import { SettingsCard, StatusLine } from "./parts";

const { content, demoData } = productConfig;
const strings = content.profile;
const SELF = "self";

/* ---------- details ---------- */

type DetailErrors = Partial<Record<keyof Profile, string>>;

function validateProfile(profile: Profile): DetailErrors {
  const copy = strings.details;
  const errors: DetailErrors = {};
  if (!profile.name.trim()) errors.name = copy.nameError;
  if (!/^\d{10}$/.test(profile.phone)) errors.phone = copy.phoneError;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) errors.email = copy.emailError;
  return errors;
}

export function DetailsSection() {
  const state = useJourney();
  const copy = strings.details;
  const [draft, setDraft] = useState<Profile>(state.profile);
  const [errors, setErrors] = useState<DetailErrors>({});
  const [status, setStatus] = useState("");

  function update(patch: Partial<Profile>) {
    setDraft({ ...draft, ...patch });
    setStatus("");
    const fixed = Object.keys(patch) as Array<keyof Profile>;
    if (fixed.some((key) => errors[key])) setErrors({ ...errors, ...Object.fromEntries(fixed.map((key) => [key, undefined])) });
  }

  function save(event: FormEvent) {
    event.preventDefault();
    const next = { ...draft, name: draft.name.trim(), email: draft.email.trim() };
    const found = validateProfile(next);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    journey.updateProfile(next);
    setStatus(copy.saved);
  }

  return (
    <Card as="form" aria-label={strings.sections[0]?.label} padding="lg" onSubmit={save} className="flex flex-col gap-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label={copy.name} value={draft.name} autoComplete="name" onChange={(event) => update({ name: event.target.value })} error={errors.name} aria-required="true" containerClassName="sm:col-span-2" />
        <Input
          label={copy.phone}
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          maxLength={10}
          value={draft.phone}
          onChange={(event) => update({ phone: event.target.value.replace(/\D/g, "") })}
          error={errors.phone}
          aria-required="true"
        />
        <Input label={copy.email} type="email" autoComplete="email" value={draft.email} onChange={(event) => update({ email: event.target.value })} error={errors.email} aria-required="true" />
        <Input label={copy.dob} type="date" autoComplete="bday" value={draft.dob} onChange={(event) => update({ dob: event.target.value })} />
      </div>
      <p className="text-sm text-text-muted">{copy.hint}</p>
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" leftIcon="check">
          {copy.save}
        </Button>
        <StatusLine message={status} />
      </div>
    </Card>
  );
}

/* ---------- addresses ---------- */

const emptyAddress = { label: "", line1: "", line2: "", phone: "" };

export function AddressesSection() {
  const state = useJourney();
  const copy = strings.addresses;
  const defaultId = state.checkout.addressId;
  const [draft, setDraft] = useState<typeof emptyAddress | null>(null);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  // Default first, then the order they were added.
  const addresses = [...state.addresses].sort((a, b) => Number(b.id === defaultId) - Number(a.id === defaultId));

  function save(event: FormEvent) {
    event.preventDefault();
    if (!draft) return;
    const clean = { label: draft.label.trim(), line1: draft.line1.trim(), line2: draft.line2.trim(), phone: draft.phone.trim() };
    if (!clean.label || !clean.line1 || !clean.line2 || !clean.phone) {
      setError(copy.required);
      return;
    }
    journey.addAddress(clean);
    setDraft(null);
    setError("");
    setStatus(copy.added);
  }

  return (
    <div className="flex flex-col gap-4">
      <SettingsCard
        id="saved-addresses"
        title={copy.listTitle}
        action={
          !draft && (
            <Button size="sm" variant="outline" leftIcon="plus" onClick={() => { setDraft(emptyAddress); setStatus(""); }}>
              {copy.add}
            </Button>
          )
        }
      >
        <StatusLine message={status} />
        {addresses.length > 0 ? (
          <ul className="flex flex-col divide-y divide-border">
            {addresses.map((address) => {
              const isDefault = address.id === defaultId;
              return (
                <li key={address.id} className="flex flex-wrap items-start gap-3 py-4 first:pt-1 last:pb-0">
                  <span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-md bg-surface-muted text-primary-dark">
                    <Icon name="location" size={20} />
                  </span>
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <p className="flex flex-wrap items-center gap-2">
                      <span className="text-body font-bold text-text">{address.label}</span>
                      {isDefault && <Badge tone="primary" icon="check">{copy.defaultBadge}</Badge>}
                    </p>
                    <p className="text-sm text-text">{address.line1}</p>
                    <p className="text-sm text-text">{address.line2}</p>
                    <p className="text-sm text-text-muted tabular">{address.phone}</p>
                    {isDefault && <p className="mt-1 text-xs text-text-muted">{copy.defaultNote}</p>}
                  </div>
                  {!isDefault && (
                    <div className="flex basis-full flex-wrap gap-2 pl-13 sm:basis-auto sm:pl-0">
                      <Button
                        size="sm"
                        variant="outline"
                        aria-label={fillTemplate(copy.makeDefaultLabel, { label: address.label })}
                        onClick={() => { journey.updateCheckout({ addressId: address.id }); setStatus(""); }}
                      >
                        {copy.makeDefault}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        leftIcon="trash"
                        aria-label={fillTemplate(copy.removeLabel, { label: address.label })}
                        onClick={() => { journey.removeAddress(address.id); setStatus(copy.removed); }}
                      >
                        {copy.remove}
                      </Button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-sm text-text-muted">{copy.empty}</p>
        )}
      </SettingsCard>

      {draft && (
        <Card as="form" aria-labelledby="new-address" padding="lg" onSubmit={save} className="flex flex-col gap-5">
          <h2 id="new-address" className="text-h3 font-bold text-text">
            {copy.addTitle}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label={copy.label} placeholder={copy.labelPlaceholder} value={draft.label} onChange={(event) => setDraft({ ...draft, label: event.target.value })} aria-required="true" />
            <Input label={copy.phone} type="tel" autoComplete="tel" value={draft.phone} onChange={(event) => setDraft({ ...draft, phone: event.target.value })} aria-required="true" />
            <Input label={copy.line1} autoComplete="address-line1" value={draft.line1} onChange={(event) => setDraft({ ...draft, line1: event.target.value })} aria-required="true" containerClassName="sm:col-span-2" />
            <Input label={copy.line2} autoComplete="address-level2" value={draft.line2} onChange={(event) => setDraft({ ...draft, line2: event.target.value })} aria-required="true" containerClassName="sm:col-span-2" />
          </div>
          {error && (
            <p role="alert" className="flex items-start gap-1.5 text-sm text-danger-text">
              <Icon name="alert" size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
              {error}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            <Button type="submit" leftIcon="check">{copy.save}</Button>
            <Button type="button" variant="ghost" onClick={() => { setDraft(null); setError(""); }}>{copy.cancel}</Button>
          </div>
        </Card>
      )}
    </div>
  );
}

/* ---------- payment methods ---------- */

export function PaymentsSection() {
  const state = useJourney();
  const copy = strings.payments;
  const [upi, setUpi] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const iconFor = (kind: string) => demoData.paymentMethods.find((method) => method.id === kind)?.icon ?? "card";

  function save(event: FormEvent) {
    event.preventDefault();
    const value = (upi ?? "").trim();
    if (!/^[\w.-]{2,}@[a-zA-Z]{2,}$/.test(value)) {
      setError(copy.upiError);
      return;
    }
    journey.addUpi(value);
    setUpi(null);
    setError("");
    setStatus(copy.added);
  }

  return (
    <div className="flex flex-col gap-4">
      <SettingsCard
        id="saved-payments"
        title={copy.listTitle}
        action={
          upi === null && (
            <Button size="sm" variant="outline" leftIcon="plus" onClick={() => { setUpi(""); setStatus(""); }}>
              {copy.addUpi}
            </Button>
          )
        }
      >
        <StatusLine message={status} />
        {upi !== null && (
          <form onSubmit={save} className="flex flex-col gap-3 rounded-md bg-surface-muted p-4 sm:flex-row sm:items-start">
            <Input
              label={copy.upiLabel}
              placeholder={copy.upiPlaceholder}
              value={upi}
              autoCapitalize="none"
              spellCheck={false}
              onChange={(event) => { setUpi(event.target.value); setError(""); }}
              error={error || undefined}
              aria-required="true"
              containerClassName="flex-1"
            />
            <div className="flex gap-2 sm:pt-7">
              <Button type="submit">{copy.save}</Button>
              <Button type="button" variant="ghost" onClick={() => { setUpi(null); setError(""); }}>{copy.cancel}</Button>
            </div>
          </form>
        )}
        {state.savedPayments.length > 0 ? (
          <ul className="flex flex-col divide-y divide-border">
            {state.savedPayments.map((method, index) => (
              <li key={method.id} className="flex flex-wrap items-center gap-3 py-3 first:pt-1 last:pb-0">
                <span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-md bg-surface-muted text-primary-dark">
                  <Icon name={iconFor(method.kind)} size={20} />
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <p className="flex flex-wrap items-center gap-2">
                    <span className="text-body font-bold text-text tabular">{method.label}</span>
                    {index === 0 && <Badge tone="primary" icon="check">{copy.defaultBadge}</Badge>}
                  </p>
                  <p className="text-sm text-text-muted">{method.detail}</p>
                </div>
                <div className="flex gap-2">
                  {index > 0 && (
                    <Button size="sm" variant="outline" aria-label={fillTemplate(copy.makeDefaultLabel, { label: method.label })} onClick={() => { journey.setDefaultPayment(method.id); setStatus(""); }}>
                      {copy.makeDefault}
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    leftIcon="trash"
                    aria-label={fillTemplate(copy.removeLabel, { label: method.label })}
                    onClick={() => { journey.removePayment(method.id); setStatus(copy.removed); }}
                  >
                    {copy.remove}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-text-muted">{copy.empty}</p>
        )}
      </SettingsCard>
      <p className="flex items-start gap-2 text-sm text-text-muted">
        <Icon name="lock" size={16} aria-hidden="true" className="mt-0.5 shrink-0" />
        {copy.secure}
      </p>
    </div>
  );
}

/* ---------- family ---------- */

const emptyMember = { name: "", relation: "", age: "" };

export function FamilySection() {
  const state = useJourney();
  const copy = strings.family;
  const [draft, setDraft] = useState<typeof emptyMember | null>(null);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  function save(event: FormEvent) {
    event.preventDefault();
    if (!draft) return;
    const name = draft.name.trim();
    const relation = draft.relation.trim();
    if (!name || !relation) {
      setError(copy.required);
      return;
    }
    const age = draft.age.trim();
    if (age && (!/^\d{1,3}$/.test(age) || Number(age) > 120)) {
      setError(copy.ageError);
      return;
    }
    journey.addFamilyMember({ name, relation: age ? fillTemplate(copy.relationWithAge, { relation, age }) : relation });
    setDraft(null);
    setError("");
    setStatus(copy.added);
  }

  return (
    <div className="flex flex-col gap-4">
      <SettingsCard
        id="family-members"
        title={copy.listTitle}
        action={
          !draft && (
            <Button size="sm" variant="outline" leftIcon="plus" onClick={() => { setDraft(emptyMember); setStatus(""); }}>
              {copy.add}
            </Button>
          )
        }
      >
        <StatusLine message={status} />
        <ul className="flex flex-col divide-y divide-border">
          {state.familyMembers.map((member) => (
            <li key={member.id} className="flex items-center gap-3 py-3 first:pt-1 last:pb-0">
              <Avatar name={member.name} size="sm" />
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="text-body font-bold text-text">{member.name}</span>
                <span className="text-sm text-text-muted">{member.id === SELF ? copy.accountHolder : member.relation}</span>
              </div>
              {member.id !== SELF && (
                <Button
                  size="sm"
                  variant="ghost"
                  leftIcon="trash"
                  aria-label={fillTemplate(copy.removeLabel, { name: member.name })}
                  onClick={() => { journey.removeFamilyMember(member.id); setStatus(copy.removed); }}
                >
                  {copy.remove}
                </Button>
              )}
            </li>
          ))}
        </ul>
      </SettingsCard>

      {draft && (
        <Card as="form" aria-labelledby="new-member" padding="lg" onSubmit={save} className="flex flex-col gap-5">
          <h2 id="new-member" className="text-h3 font-bold text-text">
            {copy.addTitle}
          </h2>
          <div className="grid gap-4 sm:grid-cols-[2fr_2fr_1fr]">
            <Input label={copy.name} value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} aria-required="true" />
            <Input label={copy.relation} placeholder={copy.relationPlaceholder} value={draft.relation} onChange={(event) => setDraft({ ...draft, relation: event.target.value })} aria-required="true" />
            <Input label={copy.age} optionalLabel={copy.optional} inputMode="numeric" maxLength={3} value={draft.age} onChange={(event) => setDraft({ ...draft, age: event.target.value.replace(/\D/g, "") })} />
          </div>
          {error && (
            <p role="alert" className="flex items-start gap-1.5 text-sm text-danger-text">
              <Icon name="alert" size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
              {error}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            <Button type="submit" leftIcon="check">{copy.save}</Button>
            <Button type="button" variant="ghost" onClick={() => { setDraft(null); setError(""); }}>{copy.cancel}</Button>
          </div>
        </Card>
      )}

      <Notice tone="neutral" icon="info" title={copy.note} />
    </div>
  );
}
