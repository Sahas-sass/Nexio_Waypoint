import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "localhost:3000",
    "127.0.0.1:3000",
    "172.20.10.6:3000",
    "172.20.10.6",
  ],
};

export default nextConfig;
