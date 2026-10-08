import type { Metadata } from "next";
import { productConfig } from "@config/product.config";
import { SignedOutScreen } from "@/features/profile/SignedOutScreen";

export const metadata: Metadata = { title: productConfig.content.signedOut.title };

export default function SignedOutPage() {
  return <SignedOutScreen />;
}
