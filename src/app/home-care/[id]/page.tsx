import { redirect } from "next/navigation";
import { routes } from "@/lib/routes";

/** Home-care services have no separate detail page: links from Home and Explore open their booking. */
export default async function HomeCareServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(routes.book("home-care", id));
}
