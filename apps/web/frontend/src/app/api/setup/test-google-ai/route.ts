/**
 * API Route: Test Google AI Connection
 * POST /api/setup/test-google-ai
 *
 * Testa la connessione a Google AI API con una API key fornita.
 */

import { NextRequest, NextResponse } from 'next/server';
import { testGoogleAIConnection } from '@/lib/config';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { apiKey } = body;

    if (!apiKey) {
      return NextResponse.json(
        { success: false, message: 'API key mancante' },
        { status: 400 }
      );
    }

    // Test connection
    const result = await testGoogleAIConnection(apiKey);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[API Test Google AI] Error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Errore durante il test',
    });
  }
}
