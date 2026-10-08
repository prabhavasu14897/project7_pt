import { productConfig } from "@config/product.config";
import type { Profile } from "@/features/journey/types";

const { demoData, routes: bases } = productConfig;

export type IdentifierKind = "email" | "phone";

export type IdentifierCheck =
  | { ok: true; kind: IdentifierKind; value: string }
  | { ok: false; reason: "required" | "invalid" };

/** Emails are trimmed and lower-cased; mobile numbers lose spaces, dashes and a leading +91 or 0. */
export function parseIdentifier(raw: string): IdentifierCheck {
  const text = raw.trim();
  if (!text) return { ok: false, reason: "required" };
  if (text.includes("@")) {
    const email = text.toLowerCase();
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? { ok: true, kind: "email", value: email } : { ok: false, reason: "invalid" };
  }
  const digits = text.replace(/[\s()-]/g, "").replace(/^(\+91|0091|0)/, "");
  return /^\d{10}$/.test(digits) ? { ok: true, kind: "phone", value: digits } : { ok: false, reason: "invalid" };
}

export type SignInResult = { ok: true } | { ok: false; reason: "unknown-account" | "wrong-password" };

/**
 * Prototype check against the one demo profile: its email or mobile with the demo password.
 * The two failure reasons are reported separately so the user never has to guess what went wrong.
 */
export function checkCredentials(identifier: Extract<IdentifierCheck, { ok: true }>, password: string, profile: Profile): SignInResult {
  const known = identifier.kind === "email" ? identifier.value === profile.email.toLowerCase() : identifier.value === profile.phone;
  if (!known) return { ok: false, reason: "unknown-account" };
  return password === demoData.demoPassword ? { ok: true } : { ok: false, reason: "wrong-password" };
}

/** Only same-app paths are followed after sign-in; anything else lands on Home. */
export function safeNext(next: string | null): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith(bases.signIn)) return bases.home;
  return next;
}

/** "ananya.raman@example.com" → "an••••••@example.com"; "9876543210" → "+91 ••••••3210". */
export function maskIdentifier(identifier: Extract<IdentifierCheck, { ok: true }>): string {
  if (identifier.kind === "phone") return `+91 ••••••${identifier.value.slice(-4)}`;
  const [name = "", domain = ""] = identifier.value.split("@");
  return `${name.slice(0, 2)}${"•".repeat(Math.max(name.length - 2, 1))}@${domain}`;
}
