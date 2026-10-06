import { productConfig } from "@config/product.config";
import type { MedicineRule, Tone } from "@/types/models";
import type { IconName } from "@/components/ui/Icon";

const rules = productConfig.medicineRules;
const actions = productConfig.ui.actions;

export function ruleBadge(rule: MedicineRule): { label: string; tone: Tone; icon: IconName } {
  const config = rules[rule];
  return { label: config.shortLabel, tone: config.tone, icon: config.icon };
}

/**
 * What the primary action on a medicine should be, given its rule.
 * Prescription items never offer "Add" directly: they route to upload and verification first.
 */
export function medicinePrimaryAction(rule: MedicineRule, verified = false) {
  switch (rule) {
    case "otc":
      return { kind: "add", label: actions.add } as const;
    case "prescription":
      return verified
        ? ({ kind: "add", label: actions.add } as const)
        : ({ kind: "upload", label: actions.uploadPrescription } as const);
    case "restricted":
      return { kind: "unavailable", label: actions.notAvailable, note: rules.restricted.description } as const;
  }
}
