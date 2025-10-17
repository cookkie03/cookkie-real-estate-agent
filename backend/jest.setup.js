// ==============================================
// Jest Setup - Backend
// ==============================================

// Add custom matchers if needed
// import '@testing-library/jest-dom'

// Mock environment variables
process.env.NODE_ENV = 'test'
process.env.DATABASE_URL = 'file:./test.db'

// Global test setup
beforeAll(() => {
  // Setup before all tests
})

afterAll(() => {
  // Cleanup after all tests
})
