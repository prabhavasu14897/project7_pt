import type { Metadata } from "next";
import { Suspense } from "react";
import { productConfig } from "@config/product.config";
import { HealthPackagesScreen } from "@/features/healthPackages/HealthPackagesScreen";

export const metadata: Metadata = { title: productConfig.content.healthPackages.title };

export default function HealthPackagesPage() {
  // The filter lives in the URL, which needs a Suspense boundary.
  return (
    <Suspense>
      <HealthPackagesScreen />
    </Suspense>
  );
}
