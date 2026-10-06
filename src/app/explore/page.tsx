import type { Metadata } from "next";
import { Suspense } from "react";
import { productConfig } from "@config/product.config";
import { LoadingState } from "@/components/feedback/LoadingState";
import { ExploreScreen } from "@/features/explore/ExploreScreen";

const { content, ui } = productConfig;

export const metadata: Metadata = { title: content.explore.title };

export default function ExplorePage() {
  // ExploreScreen reads its filters from the URL, which needs a Suspense boundary.
  return (
    <Suspense fallback={<LoadingState variant="list" count={4} label={ui.loading.results} className="container-page py-8" />}>
      <ExploreScreen />
    </Suspense>
  );
}
