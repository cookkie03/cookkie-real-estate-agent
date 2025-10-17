// ==============================================
// Jest Configuration - Frontend
// ==============================================

const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  // Add more setup options before each test is run
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  // Test environment for React components
  testEnvironment: 'jsdom',

  // Module paths
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },

  // Coverage settings
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    '!app/**/*.d.ts',
    '!app/**/layout.tsx',
    '!app/**/not-found.tsx',
    '!app/**/_*.{js,jsx,ts,tsx}',
    '!components/ui/**/*.{js,jsx,ts,tsx}', // Exclude shadcn/ui components
  ],

  // Test match patterns
  testMatch: [
    '<rootDir>/**/*.test.{js,jsx,ts,tsx}',
    '<rootDir>/../tests/unit/frontend/**/*.test.{js,jsx,ts,tsx}',
  ],

  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60,
    },
  },

  // Ignore patterns
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],

  // Transform
  transform: {
    '^.+\\.(ts|tsx)$': ['@swc/jest', {
      jsc: {
        parser: {
          syntax: 'typescript',
          tsx: true,
        },
        transform: {
          react: {
            runtime: 'automatic',
          },
        },
      },
    }],
  },
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)
