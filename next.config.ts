import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // 90 is for full-bleed photography (the welcome splash); everything else uses the default 75.
  images: { qualities: [75, 90] },
};

export default nextConfig;
