/**
 * API Route: Calculate Property-Request Matches
 * Proxy to FastAPI backend scoring endpoint
 *
 * GET /api/scoring/calculate?request_id=xxx&min_score=60&limit=10
 */

import { NextRequest, NextResponse } from 'next/server';

const AI_BACKEND_URL = process.env.AI_BACKEND_URL || 'http://localhost:8000';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const requestId = searchParams.get('request_id');
    const minScore = searchParams.get('min_score') || '60';
    const limit = searchParams.get('limit') || '10';

    if (!requestId) {
      return NextResponse.json(
        { success: false, error: 'request_id parameter is required' },
        { status: 400 }
      );
    }

    // Call FastAPI backend
    const backendUrl = `${AI_BACKEND_URL}/api/scoring/calculate?request_id=${requestId}&min_score=${minScore}&limit=${limit}`;

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Add timeout
      signal: AbortSignal.timeout(30000), // 30 seconds
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[API Scoring] Backend error: ${response.status} - ${errorText}`);

      return NextResponse.json(
        {
          success: false,
          error: `Backend error: ${response.statusText}`,
          details: errorText
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(data);

  } catch (error: any) {
    console.error('[API Scoring] Error:', error);

    // Check if backend is unreachable
    if (error.name === 'AbortError' || error.code === 'ECONNREFUSED') {
      return NextResponse.json(
        {
          success: false,
          error: 'AI Backend non raggiungibile. Assicurati che il servizio sia in esecuzione su porta 8000.',
          hint: 'Esegui: cd ai_tools && python main.py'
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Call FastAPI backend
    const response = await fetch(`${AI_BACKEND_URL}/api/scoring/calculate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[API Scoring POST] Backend error: ${response.status} - ${errorText}`);

      return NextResponse.json(
        { success: false, error: `Backend error: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error: any) {
    console.error('[API Scoring POST] Error:', error);

    if (error.name === 'AbortError' || error.code === 'ECONNREFUSED') {
      return NextResponse.json(
        {
          success: false,
          error: 'AI Backend non raggiungibile',
          hint: 'Esegui: cd ai_tools && python main.py'
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
