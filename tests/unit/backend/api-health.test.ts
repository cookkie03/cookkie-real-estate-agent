// ==============================================
// Backend Unit Test - API Health Check
// ==============================================

import { GET } from '@/app/api/health/route'

describe('API Health Check', () => {
  it('should return 200 status', async () => {
    const response = await GET()
    expect(response.status).toBe(200)
  })

  it('should return valid JSON with status ok', async () => {
    const response = await GET()
    const data = await response.json()

    expect(data).toHaveProperty('status')
    expect(data.status).toBe('ok')
  })

  it('should include timestamp in response', async () => {
    const response = await GET()
    const data = await response.json()

    expect(data).toHaveProperty('timestamp')
    expect(typeof data.timestamp).toBe('string')
  })
})
