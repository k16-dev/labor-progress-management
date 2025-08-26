import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  assetPrefix: process.env.NODE_ENV === 'production' ? '/labor-progress-management/' : '',
  basePath: process.env.NODE_ENV === 'production' ? '/labor-progress-management' : '',
};

export default nextConfig;
