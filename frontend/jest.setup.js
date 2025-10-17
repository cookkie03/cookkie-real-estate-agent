// ==============================================
// Jest Setup - Frontend
// ==============================================

// Add React Testing Library matchers
import '@testing-library/jest-dom'

// Mock environment variables
process.env.NODE_ENV = 'test'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      pathname: '/',
      query: {},
      asPath: '/',
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

// Global test setup
beforeAll(() => {
  // Setup before all tests
})

afterAll(() => {
  // Cleanup after all tests
})
