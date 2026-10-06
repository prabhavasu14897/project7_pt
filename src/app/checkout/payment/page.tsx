import type { Metadata } from "next";
import { productConfig } from "@config/product.config";
import { PaymentScreen } from "@/features/checkout/PaymentScreen";
import { JourneyGate } from "@/features/journey/JourneyGate";

export const metadata: Metadata = { title: productConfig.content.payment.title };

export default function PaymentPage() {
  return (
    <JourneyGate>
      <PaymentScreen />
    </JourneyGate>
  );
}
