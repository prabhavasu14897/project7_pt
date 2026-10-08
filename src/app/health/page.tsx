import type { Metadata } from "next";
import { Suspense } from "react";
import { productConfig } from "@config/product.config";
import { LoadingState } from "@/components/feedback/LoadingState";
import { HealthScreen } from "@/features/health/HealthScreen";
import { SignedInGate } from "@/features/profile/SignedInGate";

const { content, ui } = productConfig;

export const metadata: Metadata = { title: content.health.title };

export default function HealthPage() {
  // The member being viewed lives in the URL (?member=), which needs a Suspense boundary.
  return (
    <Suspense fallback={<LoadingState variant="list" count={3} label={ui.loading.default} className="container-page py-8" />}>
      <SignedInGate>
        <HealthScreen />
      </SignedInGate>
    </Suspense>
  );
}
