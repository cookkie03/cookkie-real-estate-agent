// ==============================================
// Frontend Unit Test - React Components
// ==============================================

import { render, screen } from '@testing-library/react'
import { Button } from '@/components/ui/button'

describe('UI Components', () => {
  describe('Button Component', () => {
    it('should render button with text', () => {
      render(<Button>Click me</Button>)
      expect(screen.getByText('Click me')).toBeInTheDocument()
    })

    it('should handle click events', () => {
      const handleClick = jest.fn()
      render(<Button onClick={handleClick}>Click me</Button>)

      const button = screen.getByText('Click me')
      button.click()

      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('should be disabled when disabled prop is true', () => {
      render(<Button disabled>Disabled Button</Button>)

      const button = screen.getByText('Disabled Button')
      expect(button).toBeDisabled()
    })
  })
})
