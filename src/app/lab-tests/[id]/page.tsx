import type { Metadata } from "next";
import { getLabTest } from "@/features/booking/servicesData";
import { JourneyGate } from "@/features/journey/JourneyGate";
import { LabTestDetailScreen } from "@/features/labTests/LabTestDetailScreen";

interface LabTestPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ lab?: string }>;
}

export async function generateMetadata({ params }: LabTestPageProps): Promise<Metadata> {
  const { id } = await params;
  return { title: getLabTest(id)?.name };
}

export default async function LabTestPage({ params, searchParams }: LabTestPageProps) {
  const { id } = await params;
  const { lab } = await searchParams;
  // Slots depend on the current time, so they render on the client.
  return (
    <JourneyGate>
      <LabTestDetailScreen id={id} labId={lab} />
    </JourneyGate>
  );
}
