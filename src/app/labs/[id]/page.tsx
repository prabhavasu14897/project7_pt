import type { Metadata } from "next";
import { productConfig } from "@config/product.config";
import { LabDetailScreen } from "@/features/providers/LabDetailScreen";

interface LabPageProps {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return productConfig.demoData.labs.map((lab) => ({ id: lab.id }));
}

export async function generateMetadata({ params }: LabPageProps): Promise<Metadata> {
  const { id } = await params;
  return { title: productConfig.demoData.labs.find((lab) => lab.id === id)?.name };
}

export default async function LabPage({ params }: LabPageProps) {
  const { id } = await params;
  return <LabDetailScreen id={id} />;
}
