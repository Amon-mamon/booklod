import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    // Book covers from Open Library are rendered with plain <img> (user data URLs
    // / third-party thumbnails). Add `remotePatterns` here if you move them to next/image.
  },
};

export default nextConfig;
