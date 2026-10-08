"use client";

import { useState } from "react";
import { productConfig } from "@config/product.config";
import { fillTemplate, formatWhen } from "@/lib/format";
import { ruleBadge } from "@/lib/medicine";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Notice } from "@/components/feedback/Notice";
import { PrototypeControls } from "@/components/feedback/PrototypeControls";
import { StatusTimeline } from "@/components/healthcare/StatusTimeline";
import { UploadBox } from "@/components/healthcare/UploadBox";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { journey, useJourney } from "@/features/journey/store";
import { pharmacyName } from "@/features/journey/pricing";
import { findPrescription, prescriptionTimeline } from "@/features/journey/selectors";
import { getMedicine } from "@/features/medicines/medicineData";

const { content, ui } = productConfig;
const strings = content.verification;

function fileSize(kb: number): string {
  return kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`;
}

export function PrescriptionStatusScreen({ id }: { id: string }) {
  const state = useJourney();
  const prescription = findPrescription(state, id);
  const [file, setFile] = useState<File | null>(null);

  if (!prescription) {
    return (
      <div className="container-page py-8">
        <EmptyState
          icon="prescription"
          title={strings.notFoundTitle}
          description={strings.notFoundDescription}
          action={{ label: ui.actions.uploadPrescription, href: "/prescriptions/upload" }}
        />
      </div>
    );
  }

  const current = prescription;
  const pharmacy = pharmacyName(current.pharmacyId) || pharmacyName(productConfig.demoData.pharmacies[0]?.id);
  const approvedAt = [...current.history].reverse().find((event) => event.status === "approved")?.at;

  function resubmit() {
    if (!file) return;
    journey.reuploadPrescription(current.id, { fileName: file.name, fileSizeKb: Math.max(1, Math.round(file.size / 1024)) });
    setFile(null);
  }

  return (
    <div className="container-page flex flex-col gap-5 pb-12 pt-4 sm:pt-6 lg:pb-16 lg:pt-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-h1 font-extrabold tracking-tight text-text">{strings.title}</h1>
        <p className="text-sm text-text-muted tabular">
          {fillTemplate(strings.reference, { id: current.id })}
          {current.orderRef && ` · ${content.home.activeOrder.orderPrefix} #${current.orderRef}`}
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-12 lg:items-start lg:gap-8">
        {/* Primary column: the status, its next action, then the timeline. The status is stated once, in the notice. */}
        <div className="flex min-w-0 flex-col gap-5 lg:col-span-7">
          {/* Always mounted, so a change of status is announced reliably. */}
          <p role="status" className="sr-only">
            {current.status === "approved"
              ? strings.approved.title
              : current.status === "needs-clarification"
                ? strings.clarification.title
                : strings.underReview.title}
          </p>
          <Card padding="lg" className="flex flex-col gap-5">
            {current.status === "under-review" && (
              <Notice tone="warning" icon="clock" title={strings.underReview.title}>
                {fillTemplate(strings.underReview.body, { pharmacy })}
              </Notice>
            )}
            {current.status === "approved" && (
              <>
                <Notice tone="success" icon="verified" title={strings.approved.title}>
                  {fillTemplate(strings.approved.body, { when: approvedAt ? formatWhen(approvedAt, ui.time) : "" })}
                </Notice>
                <Button href={`/prescriptions/${current.id}/pharmacy`} size="lg" fullWidth rightIcon="chevron-right">
                  {strings.approved.action}
                </Button>
              </>
            )}
            {current.status === "needs-clarification" && (
              <>
                <Notice tone="warning" icon="alert" title={strings.clarification.title}>
                  <p>{strings.clarification.body}</p>
                  {current.note && (
                    <p className="mt-2">
                      <span className="font-semibold">{strings.clarification.noteLabel}: </span>
                      {current.note}
                    </p>
                  )}
                </Notice>
                <UploadBox file={file} onFileChange={setFile} title={strings.clarification.reupload} />
                <Button size="lg" fullWidth leftIcon="upload" disabled={!file} onClick={resubmit}>
                  {strings.clarification.submit}
                </Button>
              </>
            )}

            <div className="border-t border-border pt-2">
              <StatusTimeline steps={prescriptionTimeline(current)} label={strings.timelineLabel} />
            </div>

            <Button href={strings.helpHref} variant="link" leftIcon="help" className="min-h-11 self-start">
              {strings.help}
            </Button>
          </Card>
        </div>

        <div className="flex min-w-0 flex-col gap-5 lg:col-span-5">
          <Card padding="lg" className="flex flex-col gap-4">
            <h2 className="text-h3 font-bold text-text">{strings.medicines}</h2>
            <ul className="flex flex-col divide-y divide-border">
              {current.medicineIds.map((medicineId) => {
                const medicine = getMedicine(medicineId);
                if (!medicine) return null;
                // Once approved, the line says so; before that it shows the dispensing rule.
                const rule =
                  current.status === "approved"
                    ? { label: content.cart.prescriptionApproved, tone: "success" as const, icon: "verified" as const }
                    : ruleBadge(medicine.rule);
                return (
                  <li key={medicineId} className="flex flex-wrap items-center justify-between gap-2 py-3 first:pt-0 last:pb-0">
                    <span className="flex flex-col">
                      <span className="text-body font-semibold text-text">{medicine.name}</span>
                      <span className="text-xs text-text-muted">{medicine.pack}</span>
                    </span>
                    <Badge tone={rule.tone} icon={rule.icon}>
                      {rule.label}
                    </Badge>
                  </li>
                );
              })}
            </ul>
            <div className="flex items-center gap-3 rounded-md bg-surface-muted p-3">
              <Icon name="prescription" size={20} className="shrink-0 text-primary-dark" />
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-semibold text-text">{current.fileName}</span>
                <span className="text-xs text-text-muted tabular">
                  {strings.file} · {fileSize(current.fileSizeKb)}
                </span>
              </div>
            </div>
          </Card>

          {current.status === "under-review" && (
            <PrototypeControls title={content.prototype.title} description={content.prototype.description}>
              <Button size="sm" variant="outline" leftIcon="verified" onClick={() => journey.decidePrescription(current.id, "approved")}>
                {content.prototype.approve}
              </Button>
              <Button
                size="sm"
                variant="outline"
                leftIcon="alert"
                onClick={() => journey.decidePrescription(current.id, "needs-clarification", content.prototype.clarifyNote)}
              >
                {content.prototype.clarify}
              </Button>
            </PrototypeControls>
          )}
        </div>
      </div>
    </div>
  );
}
