import type { Metadata } from "next";
import { Suspense } from "react";
import { productConfig } from "@config/product.config";
import { JourneyGate } from "@/features/journey/JourneyGate";
import { LabTestsScreen } from "@/features/labTests/LabTestsScreen";

export const metadata: Metadata = { title: productConfig.content.labTests.title };

export default function LabTestsPage() {
  // Filters live in the URL, so the list renders on the client.
  return (
    <Suspense>
      <JourneyGate>
        <LabTestsScreen />
      </JourneyGate>
    </Suspense>
  );
}
