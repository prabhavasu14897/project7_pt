import { productConfig } from "@config/product.config";
import type { TimelineStep } from "@/types/models";

const { prescription: stages, prescriptionClarification } = productConfig.statuses;

export type PrescriptionStageKey = (typeof stages)[number]["key"];

export const prescriptionStageCount = stages.length;

/**
 * Builds timeline steps for a prescription order.
 * `stage` is the index of the step in progress; earlier steps are complete.
 * With `needsClarification`, the review step becomes an "action needed" step and later steps stay upcoming.
 */
export function buildPrescriptionSteps(stage: number, needsClarification = false): TimelineStep[] {
  const reviewIndex = stages.findIndex((step) => step.key === "under-review");

  return stages.map((step, index) => {
    if (needsClarification && index === reviewIndex) {
      return { ...prescriptionClarification, state: "attention" };
    }
    const effectiveStage = needsClarification ? reviewIndex : stage;
    const state = index < effectiveStage ? "complete" : index === effectiveStage ? "current" : "upcoming";
    // The final step is complete, not "in progress", once reached.
    const finalState = index === stages.length - 1 && index === effectiveStage ? "complete" : state;
    return { key: step.key, label: step.label, description: step.description, state: finalState };
  });
}
