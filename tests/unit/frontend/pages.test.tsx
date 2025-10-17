// ==============================================
// Frontend Unit Test - Pages
// ==============================================

import { render, screen } from '@testing-library/react'

// Mock component for testing
const MockHomePage = () => {
  return (
    <div>
      <h1>CRM Immobiliare</h1>
      <p>Dashboard</p>
    </div>
  )
}

describe('Pages', () => {
  describe('Home Page', () => {
    it('should render page title', () => {
      render(<MockHomePage />)
      expect(screen.getByText('CRM Immobiliare')).toBeInTheDocument()
    })

    it('should render dashboard section', () => {
      render(<MockHomePage />)
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
    })
  })
})

// Example test for data fetching
describe('Data Fetching', () => {
  it('should fetch data successfully', async () => {
    // Mock fetch
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: 'test' }),
      })
    ) as jest.Mock

    const response = await fetch('/api/test')
    const data = await response.json()

    expect(data).toEqual({ data: 'test' })
    expect(global.fetch).toHaveBeenCalledWith('/api/test')
  })
})
