import type { Metadata } from "next";
import { FoundationShowcase } from "@/features/foundation/FoundationShowcase";

export const metadata: Metadata = {
  title: "Foundation",
  robots: { index: false },
};

export default function FoundationPage() {
  return <FoundationShowcase />;
}
