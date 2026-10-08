import type { Metadata } from "next";
import { productConfig } from "@config/product.config";
import { ProfileScreen } from "@/features/profile/ProfileScreen";
import { SignedInGate } from "@/features/profile/SignedInGate";

export const metadata: Metadata = { title: productConfig.content.profile.title };

export default function ProfilePage() {
  return (
    <SignedInGate>
      <ProfileScreen />
    </SignedInGate>
  );
}
