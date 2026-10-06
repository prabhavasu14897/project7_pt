import type { Metadata } from "next";
import { productConfig } from "@config/product.config";
import { JourneyGate } from "@/features/journey/JourneyGate";
import { PharmacySelectionScreen } from "@/features/prescriptions/PharmacySelectionScreen";

export const metadata: Metadata = { title: productConfig.content.pharmacySelection.title };

export default async function PharmacySelectionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <JourneyGate>
      <PharmacySelectionScreen id={id} />
    </JourneyGate>
  );
}
