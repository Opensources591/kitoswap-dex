/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ["www.manamix.space", "tokens.pancakeswap.finance"],
    unoptimized: true,
  },
}

module.exports = nextConfig
