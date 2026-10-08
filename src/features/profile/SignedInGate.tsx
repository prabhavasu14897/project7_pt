"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { JourneyGate } from "@/features/journey/JourneyGate";
import { useJourney } from "@/features/journey/store";
import { SignedOutScreen } from "./SignedOutScreen";

function SessionCheck({ children }: { children: ReactNode }) {
  const state = useJourney();
  const pathname = usePathname();
  if (state.session.signedOut) return <SignedOutScreen next={pathname} />;
  return <>{children}</>;
}

/** Personal pages (Health, Profile) need session state and a signed-in user; otherwise they show the signed-out screen. */
export function SignedInGate({ children }: { children: ReactNode }) {
  return (
    <JourneyGate>
      <SessionCheck>{children}</SessionCheck>
    </JourneyGate>
  );
}
