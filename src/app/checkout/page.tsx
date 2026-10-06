import type { Metadata } from "next";
import { productConfig } from "@config/product.config";
import { CheckoutScreen } from "@/features/checkout/CheckoutScreen";
import { JourneyGate } from "@/features/journey/JourneyGate";

export const metadata: Metadata = { title: productConfig.content.checkout.title };

export default function CheckoutPage() {
  return (
    <JourneyGate>
      <CheckoutScreen />
    </JourneyGate>
  );
}
