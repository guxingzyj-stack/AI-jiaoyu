import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    localPatterns: [
      {
        pathname: "/assets/**",
        search: "?v=s1e10-2"
      }
    ]
  },
  turbopack: {
    root: __dirname
  }
};

export default nextConfig;
