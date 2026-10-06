import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MedicineDetailScreen } from "@/features/medicines/MedicineDetailScreen";
import { getMedicine, medicines } from "@/features/medicines/medicineData";

interface MedicinePageProps {
  params: Promise<{ id: string }>;
}

/** One static page per medicine in config; unknown ids reach the page and 404 there. */
export function generateStaticParams() {
  return medicines.map((medicine) => ({ id: medicine.id }));
}

export async function generateMetadata({ params }: MedicinePageProps): Promise<Metadata> {
  const { id } = await params;
  return { title: getMedicine(id)?.name };
}

export default async function MedicinePage({ params }: MedicinePageProps) {
  const { id } = await params;
  if (!getMedicine(id)) notFound();
  return <MedicineDetailScreen id={id} />;
}
