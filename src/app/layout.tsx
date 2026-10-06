import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import type { ReactNode } from "react";
import { productConfig } from "@config/product.config";
import { buildThemeCss } from "@/lib/theme";
import { SiteChrome } from "@/features/shell/SiteChrome";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${productConfig.brand.name} — ${productConfig.brand.tagline}`,
    template: `%s · ${productConfig.brand.name}`,
  },
  description: productConfig.brand.description,
};

export const viewport: Viewport = {
  themeColor: productConfig.theme.colors.surface,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang={productConfig.locale.language} className={manrope.variable}>
      <head>
        <style dangerouslySetInnerHTML={{ __html: buildThemeCss("--font-manrope") }} />
      </head>
      <body>
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
