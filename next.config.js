/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Configurazione per ridurre problemi di cache su Windows
  onDemandEntries: {
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 2,
  },
  // Disabilita file trace per evitare errori EPERM su Windows
  experimental: {
    outputFileTracingRoot: undefined,
  },
}

module.exports = nextConfig
