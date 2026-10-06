"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { productConfig } from "@config/product.config";
import { fillTemplate } from "@/lib/format";
import { ruleBadge } from "@/lib/medicine";
import { Notice } from "@/components/feedback/Notice";
import { UploadBox } from "@/components/healthcare/UploadBox";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { Select } from "@/components/ui/Select";
import { journey, useJourney } from "@/features/journey/store";
import { pharmacyName } from "@/features/journey/pricing";
import { prescriptionBadge } from "@/features/journey/selectors";
import { getMedicine, medicines } from "@/features/medicines/medicineData";

const { content } = productConfig;
const strings = content.prescriptionUpload;

const prescriptionMedicines = medicines.filter((item) => item.rule === "prescription");

export function PrescriptionUploadScreen() {
  const params = useSearchParams();
  const router = useRouter();
  const state = useJourney();

  const fromUrl = getMedicine(params.get("medicine") ?? "");
  const presetMedicine = fromUrl?.rule === "prescription" ? fromUrl : undefined;
  const pharmacyId = params.get("pharmacy") ?? presetMedicine?.defaultOffer?.pharmacyId;

  const [chosenId, setChosenId] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);

  const medicine = presetMedicine ?? getMedicine(chosenId);
  // A medicine already in an open request shouldn't be uploaded twice.
  const existing = medicine
    ? state.prescriptions.find((item) => item.medicineIds.includes(medicine.id) && item.status !== "approved")
    : undefined;

  function submit() {
    if (!medicine) return setError(strings.needMedicine);
    if (!file) return setError(strings.needFile);
    setSubmitting(true);
    const id = journey.uploadPrescription({
      medicineIds: [medicine.id],
      pharmacyId,
      fileName: file.name,
      fileSizeKb: Math.max(1, Math.round(file.size / 1024)),
    });
    router.push(`/prescriptions/${id}`);
  }

  return (
    <div className="container-page flex flex-col gap-5 pb-12 pt-4 sm:pt-6 lg:pb-16 lg:pt-8">
      <h1 className="text-h1 font-extrabold tracking-tight text-text">{strings.title}</h1>

      <div className="grid gap-5 lg:grid-cols-12 lg:items-start lg:gap-8">
        <Card padding="lg" className="flex flex-col gap-5 lg:col-span-7">
          {presetMedicine ? (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <span className="text-sm font-semibold text-text-muted">{strings.forMedicines}</span>
              <span className="text-body font-bold text-text">{presetMedicine.name}</span>
              <Badge {...pick(ruleBadge(presetMedicine.rule))}>{ruleBadge(presetMedicine.rule).label}</Badge>
              {pharmacyId && (
                <span className="flex items-center gap-1 text-sm text-text-muted">
                  <Icon name="location" size={14} />
                  {pharmacyName(pharmacyId)}
                </span>
              )}
            </div>
          ) : (
            <Select
              label={strings.chooseMedicine}
              value={chosenId}
              options={[
                { value: "", label: strings.choosePlaceholder },
                ...prescriptionMedicines.map((item) => ({ value: item.id, label: item.name })),
              ]}
              onChange={(value) => {
                setChosenId(value);
                setError(undefined);
              }}
              layout="stacked"
            />
          )}

          {existing ? (
            <Notice tone="warning" icon="clock" title={prescriptionBadge(existing).label}>
              <p>{fillTemplate(content.verification.reference, { id: existing.id })}</p>
              <Button href={`/prescriptions/${existing.id}`} variant="outline" size="sm" className="mt-3">
                {content.orders.verify}
              </Button>
            </Notice>
          ) : (
            <>
              <UploadBox
                file={file}
                onFileChange={(next) => {
                  setFile(next);
                  setError(undefined);
                }}
                error={error === strings.needFile ? error : undefined}
              />
              {error && error !== strings.needFile && (
                <p role="alert" className="flex items-center gap-1.5 text-sm text-danger-text">
                  <Icon name="alert" size={16} />
                  {error}
                </p>
              )}
              <Button size="lg" fullWidth leftIcon="upload" loading={submitting} onClick={submit}>
                {submitting ? strings.submitting : strings.submit}
              </Button>
            </>
          )}
        </Card>

        <Card padding="lg" variant="muted" className="flex flex-col gap-4 lg:col-span-5">
          <h2 className="text-h3 font-bold text-text">{strings.howTitle}</h2>
          <ol className="flex flex-col gap-3">
            {strings.how.map((step, index) => (
              <li key={step} className="flex gap-3 text-sm text-text">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-surface text-xs font-bold text-primary-deep tabular">
                  {index + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
          <p className="flex items-center gap-2 border-t border-border pt-4 text-xs text-text-muted">
            <Icon name="lock" size={14} className="shrink-0" />
            {strings.privacy}
          </p>
        </Card>
      </div>
    </div>
  );
}

/** Badge props without the label (passed as children). */
function pick(badge: ReturnType<typeof ruleBadge>) {
  return { tone: badge.tone, icon: badge.icon };
}
