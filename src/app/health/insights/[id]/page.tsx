import type { Metadata } from "next";
import { productConfig } from "@config/product.config";
import { InsightScreen } from "@/features/health/InsightScreen";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const insight = productConfig.demoData.insights.find((item) => item.id === id);
  return { title: insight?.title ?? productConfig.content.health.insightsTitle };
}

export default async function InsightPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <InsightScreen id={id} />;
}
