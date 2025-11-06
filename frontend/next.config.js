/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Enable standalone output for Docker
  output: 'standalone',

  // Configurazione per ridurre problemi di cache su Windows
  onDemandEntries: {
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 2,
  },

  // Fix per Railway: Disabilita la raccolta dati statica durante il build
  // Questo previene errori "Failed to collect page data" per le API routes
  staticPageGenerationTimeout: 1000,

  // Disabilita file trace per evitare errori EPERM su Windows
  experimental: {
    outputFileTracingRoot: undefined,
    // Disabilita ISR memory cache per evitare problemi durante il build
    isrMemoryCacheSize: 0,
  },
}

module.exports = nextConfig
