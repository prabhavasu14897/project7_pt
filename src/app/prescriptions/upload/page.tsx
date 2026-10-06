import type { Metadata } from "next";
import { Suspense } from "react";
import { productConfig } from "@config/product.config";
import { JourneyGate } from "@/features/journey/JourneyGate";
import { PrescriptionUploadScreen } from "@/features/prescriptions/PrescriptionUploadScreen";

export const metadata: Metadata = { title: productConfig.content.prescriptionUpload.title };

export default function PrescriptionUploadPage() {
  // The medicine comes from the URL, which needs a Suspense boundary.
  return (
    <Suspense>
      <JourneyGate>
        <PrescriptionUploadScreen />
      </JourneyGate>
    </Suspense>
  );
}
