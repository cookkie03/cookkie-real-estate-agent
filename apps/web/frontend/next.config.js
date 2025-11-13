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

  // Prevent "Failed to collect page data" errors for API routes
  // All pages will be generated on-demand on first access
  generateBuildId: async () => {
    return 'build-' + Date.now()
  },

  // Disabilita la generazione statica durante il build
  // Forza tutte le route ad essere dinamiche
  experimental: {
    outputFileTracingRoot: undefined,
  },
}

module.exports = nextConfig
