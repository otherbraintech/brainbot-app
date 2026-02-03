// Triggering reload for new Prisma enum
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  distDir: process.env.NODE_ENV === 'development' ? '.next_dev' : '.next',
};

export default nextConfig;
