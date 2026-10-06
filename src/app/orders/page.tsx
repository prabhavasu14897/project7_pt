import type { Metadata } from "next";
import { productConfig } from "@config/product.config";
import { JourneyGate } from "@/features/journey/JourneyGate";
import { OrdersScreen } from "@/features/orders/OrdersScreen";

export const metadata: Metadata = { title: productConfig.content.orders.title };

export default function OrdersPage() {
  return (
    <JourneyGate>
      <OrdersScreen />
    </JourneyGate>
  );
}
