// ==============================================
// Backend Unit Test - Utility Functions
// ==============================================

describe('Utility Functions', () => {
  describe('String utilities', () => {
    it('should format currency correctly', () => {
      const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('it-IT', {
          style: 'currency',
          currency: 'EUR',
        }).format(amount)
      }

      expect(formatCurrency(150000)).toBe('150.000,00 €')
      expect(formatCurrency(1500.5)).toBe('1.500,50 €')
    })

    it('should format area correctly', () => {
      const formatArea = (sqm: number) => `${sqm} m²`

      expect(formatArea(80)).toBe('80 m²')
      expect(formatArea(120)).toBe('120 m²')
    })
  })

  describe('Date utilities', () => {
    it('should format date correctly', () => {
      const date = new Date('2025-10-17')
      const formatted = date.toLocaleDateString('it-IT')

      expect(formatted).toBe('17/10/2025')
    })
  })

  describe('Validation utilities', () => {
    it('should validate email format', () => {
      const isValidEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      }

      expect(isValidEmail('test@example.com')).toBe(true)
      expect(isValidEmail('invalid-email')).toBe(false)
      expect(isValidEmail('test@')).toBe(false)
    })

    it('should validate phone number format', () => {
      const isValidPhone = (phone: string) => {
        return /^\+?[0-9\s-]{10,}$/.test(phone)
      }

      expect(isValidPhone('+39 123 456 7890')).toBe(true)
      expect(isValidPhone('1234567890')).toBe(true)
      expect(isValidPhone('123')).toBe(false)
    })
  })
})
