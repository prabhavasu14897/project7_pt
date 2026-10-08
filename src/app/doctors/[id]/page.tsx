import type { Metadata } from "next";
import { getDoctor } from "@/features/booking/servicesData";
import { DoctorDetailScreen } from "@/features/doctors/DoctorDetailScreen";
import { JourneyGate } from "@/features/journey/JourneyGate";

interface DoctorPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: DoctorPageProps): Promise<Metadata> {
  const { id } = await params;
  return { title: getDoctor(id)?.name };
}

export default async function DoctorPage({ params }: DoctorPageProps) {
  const { id } = await params;
  // Slots depend on the current time, so they render on the client.
  return (
    <JourneyGate>
      <DoctorDetailScreen id={id} />
    </JourneyGate>
  );
}
