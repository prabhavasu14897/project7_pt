import type { Metadata } from "next";
import { productConfig } from "@config/product.config";
import { ProfileScreen } from "@/features/profile/ProfileScreen";
import { SignedInGate } from "@/features/profile/SignedInGate";

const strings = productConfig.content.profile;

export function generateStaticParams() {
  return strings.sections.map((item) => ({ section: item.key }));
}

export async function generateMetadata({ params }: { params: Promise<{ section: string }> }): Promise<Metadata> {
  const { section } = await params;
  return { title: strings.sections.find((item) => item.key === section)?.label ?? strings.title };
}

export default async function ProfileSectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  return (
    <SignedInGate>
      <ProfileScreen section={section} />
    </SignedInGate>
  );
}
