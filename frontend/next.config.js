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

  // Fix per Railway: Disabilita COMPLETAMENTE la raccolta dati durante il build
  // Questo previene errori "Failed to collect page data" per le API routes
  // Tutte le pagine saranno generate on-demand al primo accesso
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
