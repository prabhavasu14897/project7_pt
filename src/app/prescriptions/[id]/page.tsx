import type { Metadata } from "next";
import { productConfig } from "@config/product.config";
import { JourneyGate } from "@/features/journey/JourneyGate";
import { PrescriptionStatusScreen } from "@/features/prescriptions/PrescriptionStatusScreen";

export const metadata: Metadata = { title: productConfig.content.verification.title };

export default async function PrescriptionStatusPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <JourneyGate>
      <PrescriptionStatusScreen id={id} />
    </JourneyGate>
  );
}
