// ==============================================
// Logging Middleware for Next.js API Routes
// ==============================================

import { NextRequest, NextResponse } from 'next/server'
import { logger, logRequest } from '@/lib/logger'

export async function loggingMiddleware(
  request: NextRequest,
  handler: (req: NextRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  const startTime = Date.now()
  const { method, url } = request

  try {
    // Execute the handler
    const response = await handler(request)

    // Log successful request
    const duration = Date.now() - startTime
    logRequest(method, url, response.status, duration)

    return response
  } catch (error) {
    // Log error
    const duration = Date.now() - startTime
    logger.error({
      type: 'api_error',
      method,
      url,
      duration,
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
      } : String(error),
    }, `API Error: ${method} ${url}`)

    // Re-throw error
    throw error
  }
}

// Usage example in API routes:
// export async function GET(request: NextRequest) {
//   return loggingMiddleware(request, async (req) => {
//     // Your handler logic here
//     return NextResponse.json({ data: 'example' })
//   })
// }
