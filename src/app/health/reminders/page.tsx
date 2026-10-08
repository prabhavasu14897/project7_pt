import type { Metadata } from "next";
import { Suspense } from "react";
import { productConfig } from "@config/product.config";
import { LoadingState } from "@/components/feedback/LoadingState";
import { RemindersScreen } from "@/features/health/RemindersScreen";
import { SignedInGate } from "@/features/profile/SignedInGate";

const { content, ui } = productConfig;

export const metadata: Metadata = { title: content.reminders.title };

export default function RemindersPage() {
  return (
    <Suspense fallback={<LoadingState variant="list" count={3} label={ui.loading.default} className="container-page py-8" />}>
      <SignedInGate>
        <RemindersScreen />
      </SignedInGate>
    </Suspense>
  );
}
