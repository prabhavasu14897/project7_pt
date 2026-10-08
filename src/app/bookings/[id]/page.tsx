import type { Metadata } from "next";
import { productConfig } from "@config/product.config";
import { BookingConfirmationScreen } from "@/features/booking/BookingConfirmationScreen";
import { JourneyGate } from "@/features/journey/JourneyGate";

export const metadata: Metadata = { title: productConfig.content.bookingConfirmation.confirmedTitle };

export default async function BookingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <JourneyGate>
      <BookingConfirmationScreen id={id} />
    </JourneyGate>
  );
}
