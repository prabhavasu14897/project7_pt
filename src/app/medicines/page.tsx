import type { Metadata } from "next";
import { Suspense } from "react";
import { productConfig } from "@config/product.config";
import { LoadingState } from "@/components/feedback/LoadingState";
import { MedicineListingScreen } from "@/features/medicines/MedicineListingScreen";

const { content, ui } = productConfig;

export const metadata: Metadata = { title: content.medicines.title };

export default function MedicinesPage() {
  // Filters live in the URL, which needs a Suspense boundary.
  return (
    <Suspense fallback={<LoadingState variant="list" count={6} label={ui.loading.results} className="container-page py-8" />}>
      <MedicineListingScreen />
    </Suspense>
  );
}
