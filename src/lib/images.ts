import { productConfig } from "@config/product.config";

const images: Record<string, { src: string; alt: string }> = productConfig.demoData.catalogImages;

/** The photo for an item, looked up by its page path; undefined keeps the card's icon tile. */
export function catalogImage(href: string | undefined): { src: string; alt: string } | undefined {
  return href ? images[href.split("?")[0] ?? href] : undefined;
}
