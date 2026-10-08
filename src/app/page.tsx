import type { Metadata } from "next";
import { productConfig } from "@config/product.config";
import { WelcomeScreen } from "@/features/welcome/WelcomeScreen";

const { brand } = productConfig;

export const metadata: Metadata = { title: { absolute: `${brand.name} · ${brand.tagline}` } };

export default function WelcomePage() {
  return <WelcomeScreen />;
}
