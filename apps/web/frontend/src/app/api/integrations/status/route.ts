/**
 * Integrations Status
 * GET /api/integrations/status
 *
 * Returns the status of all configured integrations
 */

import { NextRequest, NextResponse } from 'next/server';
import { getGoogleIntegrationStatus } from '@/lib/google-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Get Google integrations status
    const integrations = await getGoogleIntegrationStatus();

    return NextResponse.json({
      success: true,
      integrations,
    });
  } catch (error: any) {
    console.error('Failed to get integrations status:', error);
    return NextResponse.json(
      {
        error: 'Failed to get integrations status',
        details: error.message
      },
      { status: 500 }
    );
  }
}
