"use client";

import { useState } from "react";
import { productConfig } from "@config/product.config";
import { Notice } from "@/components/feedback/Notice";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { ListRow } from "@/components/ui/ListRow";
import { Switch } from "@/components/ui/Switch";
import { journey, useJourney } from "@/features/journey/store";
import { SettingsCard, StatusLine, saveFile } from "./parts";

const { brand, content, demoData } = productConfig;
const strings = content.profile;

/* ---------- notifications ---------- */

export function NotificationsSection() {
  const state = useJourney();
  const copy = strings.notifications;
  return (
    <div className="flex flex-col gap-4">
      <SettingsCard id="notify-topics" title={copy.topicsTitle}>
        <div className="flex flex-col divide-y divide-border">
          {copy.topics.map((topic) => {
            const locked = "locked" in topic && topic.locked;
            return (
              <Switch
                key={topic.key}
                label={topic.label}
                description={topic.description}
                lockedNote={locked ? `${topic.description} ${copy.required}` : undefined}
                checked={locked || state.settings.notifications[topic.key] === true}
                disabled={locked}
                onChange={(value) => journey.setSetting("notifications", topic.key, value)}
              />
            );
          })}
        </div>
      </SettingsCard>
      <SettingsCard id="notify-channels" title={copy.channelsTitle}>
        <div className="flex flex-col divide-y divide-border">
          {copy.channels.map((channel) => (
            <Switch
              key={channel.key}
              label={channel.label}
              checked={state.settings.channels[channel.key] === true}
              onChange={(value) => journey.setSetting("channels", channel.key, value)}
            />
          ))}
        </div>
      </SettingsCard>
    </div>
  );
}

/* ---------- privacy & security ---------- */

export function PrivacySection() {
  const state = useJourney();
  const copy = strings.privacy;
  const [confirming, setConfirming] = useState(false);
  const [status, setStatus] = useState("");

  function download() {
    const { profile, familyMembers, addresses, reminders, reports, orders, bookings } = state;
    const data = { note: copy.fileHeading, exportedAt: new Date().toISOString(), profile, familyMembers, addresses, reminders, reports, orders, bookings };
    saveFile("carenow-my-data.json", JSON.stringify(data, null, 2), "application/json");
    setStatus(copy.downloaded);
  }

  return (
    <div className="flex flex-col gap-4">
      <SettingsCard id="privacy-controls" title={copy.controlsTitle}>
        <div className="flex flex-col divide-y divide-border">
          {copy.controls.map((control) => (
            <Switch
              key={control.key}
              label={control.label}
              description={control.description}
              checked={state.settings.privacy[control.key] === true}
              onChange={(value) => journey.setSetting("privacy", control.key, value)}
            />
          ))}
        </div>
      </SettingsCard>

      <SettingsCard id="privacy-data" title={copy.dataTitle}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-text-muted">{copy.downloadHint}</p>
          <Button variant="outline" leftIcon="download" onClick={download} className="shrink-0 self-start">
            {copy.download}
          </Button>
        </div>
        <StatusLine message={status} />
        <div className="border-t border-border pt-4">
          {confirming ? (
            <div className="flex flex-col gap-3 rounded-md bg-danger-soft p-4">
              <p className="flex items-start gap-2 text-sm text-text">
                <Icon name="alert" size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-danger-text" />
                {copy.deleteConfirm}
              </p>
              <div className="flex flex-wrap gap-2">
                <Button variant="danger" onClick={() => { setConfirming(false); setStatus(copy.deleteRequested); }}>
                  {copy.deleteYes}
                </Button>
                <Button variant="ghost" onClick={() => setConfirming(false)}>
                  {copy.deleteNo}
                </Button>
              </div>
            </div>
          ) : (
            <Button variant="ghost" leftIcon="trash" className="text-danger-text! hover:bg-danger-soft" onClick={() => { setConfirming(true); setStatus(""); }}>
              {copy.deleteAccount}
            </Button>
          )}
        </div>
      </SettingsCard>
    </div>
  );
}

/* ---------- help & support ---------- */

export function HelpSection() {
  const copy = strings.help;
  return (
    <div className="flex flex-col gap-4">
      <Notice tone="info" icon="orders" title={copy.orderIssue}>
        <Button href={productConfig.routes.orders} variant="link" size="sm" rightIcon="chevron-right" className="-ml-3.5">
          {copy.orderIssueAction}
        </Button>
      </Notice>

      <SettingsCard id="help-contact" title={copy.contactTitle}>
        <ul className="-mx-3 flex flex-col">
          {demoData.support.map((channel) => (
            <li key={channel.key}>
              <ListRow href={channel.href} icon={channel.icon} title={channel.label} description={channel.detail} />
            </li>
          ))}
        </ul>
      </SettingsCard>

      <SettingsCard id="help-faq" title={copy.faqTitle}>
        <div className="flex flex-col divide-y divide-border">
          {demoData.faqs.map((faq) => (
            <details key={faq.q} className="group">
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-3 text-sm font-semibold text-text sm:text-body [&::-webkit-details-marker]:hidden">
                {faq.q}
                <Icon name="chevron-down" size={18} aria-hidden="true" className="shrink-0 text-text-muted transition-transform duration-150 group-open:rotate-180 motion-reduce:transition-none" />
              </summary>
              <p className="max-w-[65ch] pb-4 text-sm text-text-muted">{faq.a}</p>
            </details>
          ))}
        </div>
      </SettingsCard>
    </div>
  );
}

/* ---------- about ---------- */

export function AboutSection() {
  const copy = strings.about;
  return (
    <div className="flex flex-col gap-4">
      <SettingsCard id="about-app" title={brand.name}>
        <p className="text-body text-text">{brand.tagline}</p>
        <dl className="flex items-center justify-between border-t border-border pt-3 text-sm">
          <dt className="text-text-muted">{copy.version}</dt>
          <dd className="font-semibold text-text tabular">{demoData.about.version}</dd>
        </dl>
      </SettingsCard>
      <Notice tone="neutral" icon="info" title={copy.demoNote} />
      <SettingsCard id="about-legal" title={copy.legalTitle}>
        <div className="flex flex-col divide-y divide-border">
          {demoData.about.legal.map((doc) => (
            <details key={doc.title} className="group">
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-3 text-sm font-semibold text-text sm:text-body [&::-webkit-details-marker]:hidden">
                {doc.title}
                <Icon name="chevron-down" size={18} aria-hidden="true" className="shrink-0 text-text-muted transition-transform duration-150 group-open:rotate-180 motion-reduce:transition-none" />
              </summary>
              <p className="max-w-[65ch] pb-4 text-sm text-text-muted">{doc.body}</p>
            </details>
          ))}
        </div>
      </SettingsCard>
    </div>
  );
}
