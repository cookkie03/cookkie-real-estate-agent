/**
 * Health Check API
 * Used by Docker healthcheck and monitoring
 */

import { NextRequest } from 'next/server';
import { jsonResponse } from '@/lib/api/helpers';

export async function GET(request: NextRequest) {
  try {
    return jsonResponse({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'crm-immobiliare-nextjs',
      version: '1.0.0',
    });
  } catch (error) {
    return jsonResponse(
      {
        status: 'unhealthy',
        error: 'Service unavailable',
      },
      503
    );
  }
}
