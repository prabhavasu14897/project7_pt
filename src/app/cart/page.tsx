import type { Metadata } from "next";
import { productConfig } from "@config/product.config";
import { CartScreen } from "@/features/cart/CartScreen";
import { JourneyGate } from "@/features/journey/JourneyGate";

export const metadata: Metadata = { title: productConfig.content.cart.title };

export default function CartPage() {
  return (
    <JourneyGate>
      <CartScreen />
    </JourneyGate>
  );
}
