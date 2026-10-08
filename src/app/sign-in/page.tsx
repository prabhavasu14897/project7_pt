import type { Metadata } from "next";
import { Suspense } from "react";
import { productConfig } from "@config/product.config";
import { LoadingState } from "@/components/feedback/LoadingState";
import { SignInScreen } from "@/features/auth/SignInScreen";
import { JourneyGate } from "@/features/journey/JourneyGate";

const { content, ui } = productConfig;

export const metadata: Metadata = { title: content.auth.submit };

export default function SignInPage() {
  // `?next=` (where to return after signing in) lives in the URL, which needs a Suspense boundary.
  const fallback = <LoadingState variant="list" count={2} label={ui.loading.default} className="container-page py-8" />;
  return (
    <Suspense fallback={fallback}>
      <JourneyGate>
        <SignInScreen />
      </JourneyGate>
    </Suspense>
  );
}
