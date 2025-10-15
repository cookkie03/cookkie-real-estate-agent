/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    // Durante la migrazione, permetti build anche con errori TS
    ignoreBuildErrors: false,
  },
  eslint: {
    // Durante la migrazione, permetti build anche con warning eslint
    ignoreDuringBuilds: false,
  },
}

module.exports = nextConfig
