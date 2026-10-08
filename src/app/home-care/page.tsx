import type { Metadata } from "next";
import { Suspense } from "react";
import { productConfig } from "@config/product.config";
import { HomeCareScreen } from "@/features/homeCare/HomeCareScreen";
import { JourneyGate } from "@/features/journey/JourneyGate";

export const metadata: Metadata = { title: productConfig.content.homeCare.title };

export default function HomeCarePage() {
  // The filter lives in the URL; availability depends on the current time, so render on the client.
  return (
    <Suspense>
      <JourneyGate>
        <HomeCareScreen />
      </JourneyGate>
    </Suspense>
  );
}
