import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1", "192.168.0.57"],
  images: {
    localPatterns: [
      {
        pathname: "/assets/**"
      }
    ]
  },
  turbopack: {
    root: __dirname
  }
};

export default nextConfig;
