import type { Metadata } from "next";
import { Suspense } from "react";
import { productConfig } from "@config/product.config";
import { DoctorsScreen } from "@/features/doctors/DoctorsScreen";
import { JourneyGate } from "@/features/journey/JourneyGate";

export const metadata: Metadata = { title: productConfig.content.doctors.title };

export default function DoctorsPage() {
  // Filters live in the URL; availability depends on the current time, so render on the client.
  return (
    <Suspense>
      <JourneyGate>
        <DoctorsScreen />
      </JourneyGate>
    </Suspense>
  );
}
