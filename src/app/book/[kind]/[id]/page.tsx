import type { Metadata } from "next";
import { Suspense } from "react";
import { productConfig } from "@config/product.config";
import { BookingScreen } from "@/features/booking/BookingScreen";
import { JourneyGate } from "@/features/journey/JourneyGate";

export const metadata: Metadata = { title: productConfig.content.booking.title };

export default async function BookPage({ params }: { params: Promise<{ kind: string; id: string }> }) {
  const { kind, id } = await params;
  // Preselected mode and slot come from the URL; slots depend on the current time.
  return (
    <Suspense>
      <JourneyGate>
        <BookingScreen kind={kind} id={id} />
      </JourneyGate>
    </Suspense>
  );
}
