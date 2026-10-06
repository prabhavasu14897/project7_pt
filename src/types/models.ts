import type { ProductConfig } from "@config/product.config";

export type CategoryKey = ProductConfig["categories"][number]["key"];
export type MedicineRule = keyof ProductConfig["medicineRules"];
export type NavKey = ProductConfig["navigation"]["mobile"][number]["key"];

export type Tone = "neutral" | "primary" | "info" | "success" | "warning" | "danger";

export interface NavItem {
  key: string;
  label: string;
  href: string;
  icon: string;
}

export interface MetaItem {
  icon?: string;
  label: string;
}

export interface CardAction {
  label: string;
  /** Fuller accessible name when the visible label repeats across cards, e.g. "Book Vitamin D Test". */
  ariaLabel?: string;
  /** Set for toggle actions (e.g. Add/Added) so assistive tech announces the state. */
  pressed?: boolean;
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
  loading?: boolean;
  variant?: "primary" | "secondary" | "outline";
}

export type TimelineState = "complete" | "current" | "upcoming" | "attention" | "failed";

export interface TimelineStep {
  key: string;
  label: string;
  description?: string;
  timestamp?: string;
  state: TimelineState;
}
