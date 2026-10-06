"use client";

import type { ReactNode } from "react";
import { productConfig } from "@config/product.config";
import { LoadingState } from "@/components/feedback/LoadingState";
import { useHydrated } from "./store";

/** Journey screens read session state that only exists in the browser; show a skeleton until it's available. */
export function JourneyGate({ children }: { children: ReactNode }) {
  const hydrated = useHydrated();
  if (!hydrated) {
    return <LoadingState variant="list" count={3} label={productConfig.ui.loading.default} className="container-page py-8" />;
  }
  return <>{children}</>;
}
