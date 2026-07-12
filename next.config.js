/** @type {import('next').NextConfig} */
const nextConfig = {
  reactComiler: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: { unoptimized: true },
  experimental: {
    serverActions: true,
    turbopackFileSystemCacheForDev: true,
  },

};

module.exports = nextConfig;
