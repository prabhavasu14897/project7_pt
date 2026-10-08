import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getHealthPackage, healthPackages } from "@/features/booking/servicesData";
import { HealthPackageDetailScreen } from "@/features/healthPackages/HealthPackageDetailScreen";

interface PackagePageProps {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return healthPackages.map((item) => ({ id: item.id }));
}

export async function generateMetadata({ params }: PackagePageProps): Promise<Metadata> {
  const { id } = await params;
  return { title: getHealthPackage(id)?.name };
}

export default async function HealthPackagePage({ params }: PackagePageProps) {
  const { id } = await params;
  if (!getHealthPackage(id)) notFound();
  return <HealthPackageDetailScreen id={id} />;
}
