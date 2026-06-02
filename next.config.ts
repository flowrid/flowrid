import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/account/orders",
        destination: "/saas/orders",
      },
      {
        source: "/account/orders/:path*",
        destination: "/saas/orders/:path*",
      },
      {
        source: "/account/products",
        destination: "/saas/products",
      },
      {
        source: "/account/products/:path*",
        destination: "/saas/products/:path*",
      },
      {
        source: "/account/inventory",
        destination: "/saas/inventory",
      },
      {
        source: "/account/receiving",
        destination: "/saas/receiving",
      },
      {
        source: "/account/returns",
        destination: "/saas/returns",
      },
      {
        source: "/account/shipping",
        destination: "/saas/shipping",
      },
      {
        source: "/account/analytics",
        destination: "/saas/analytics",
      },
      {
        source: "/account/reports",
        destination: "/saas/reports",
      },
      {
        source: "/account/billing",
        destination: "/saas/billing",
      },
    ];
  },
};

export default nextConfig;
