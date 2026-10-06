import type { Metadata } from "next";
import { productConfig } from "@config/product.config";
import { JourneyGate } from "@/features/journey/JourneyGate";
import { OrderTrackingScreen } from "@/features/orders/OrderTrackingScreen";

export const metadata: Metadata = { title: productConfig.content.tracking.title };

export default async function OrderTrackingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <JourneyGate>
      <OrderTrackingScreen id={id} />
    </JourneyGate>
  );
}
