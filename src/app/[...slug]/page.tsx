import { redirect } from "next/navigation";
import { productConfig } from "@config/product.config";
import { EmptyState } from "@/components/feedback/EmptyState";
import { routes } from "@/lib/routes";

const strings = productConfig.ui.placeholder;

interface PlaceholderPageProps {
  params: Promise<{ slug: string[] }>;
}

/**
 * Catch-all for journey screens that later implementation steps will build.
 * Category landing URLs (e.g. /medicines) open Explore filtered to that category.
 * Real routes take precedence automatically once they exist.
 */
export default async function PlaceholderPage({ params }: PlaceholderPageProps) {
  const { slug } = await params;
  const path = `/${slug.join("/")}`;
  const category = productConfig.categories.find((item) => item.href === path);
  if (category) redirect(routes.explore({ category: category.key }));

  return (
    <div className="container-page py-8">
      <EmptyState
        icon="explore"
        title={strings.title}
        description={strings.description}
        action={{ label: strings.backHome, href: "/" }}
      />
    </div>
  );
}
