import type { Metadata } from "next";
import { productConfig } from "@config/product.config";
import { ReportDetailScreen } from "@/features/health/ReportDetailScreen";
import { SignedInGate } from "@/features/profile/SignedInGate";

export const metadata: Metadata = { title: productConfig.content.reports.title };

export default async function ReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <SignedInGate>
      <ReportDetailScreen id={id} />
    </SignedInGate>
  );
}
