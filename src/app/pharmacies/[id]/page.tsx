import type { Metadata } from "next";
import { productConfig } from "@config/product.config";
import { JourneyGate } from "@/features/journey/JourneyGate";
import { PharmacyDetailScreen } from "@/features/providers/PharmacyDetailScreen";

interface PharmacyPageProps {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return productConfig.demoData.pharmacies.map((pharmacy) => ({ id: pharmacy.id }));
}

export async function generateMetadata({ params }: PharmacyPageProps): Promise<Metadata> {
  const { id } = await params;
  return { title: productConfig.demoData.pharmacies.find((pharmacy) => pharmacy.id === id)?.name };
}

export default async function PharmacyPage({ params }: PharmacyPageProps) {
  const { id } = await params;
  // The cart and live order state live in the browser session.
  return (
    <JourneyGate>
      <PharmacyDetailScreen id={id} />
    </JourneyGate>
  );
}
