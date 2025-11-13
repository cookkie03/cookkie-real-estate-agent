/**
 * API Route: AI Chat
 * Proxy to FastAPI backend chatbot endpoint
 *
 * POST /api/ai/chat
 * Body: { messages: [...], context?: {...} }
 */

import { NextRequest, NextResponse } from 'next/server';

const AI_BACKEND_URL = process.env.AI_BACKEND_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request
    if (!body.messages || !Array.isArray(body.messages)) {
      return NextResponse.json(
        { success: false, error: 'messages array is required' },
        { status: 400 }
      );
    }

    // Call FastAPI backend
    const response = await fetch(`${AI_BACKEND_URL}/ai/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(60000), // 60 seconds for AI
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[API Chat] Backend error: ${response.status} - ${errorText}`);

      return NextResponse.json(
        {
          success: false,
          error: `AI Backend error: ${response.statusText}`,
          details: errorText
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error: any) {
    console.error('[API Chat] Error:', error);

    if (error.name === 'AbortError' || error.code === 'ECONNREFUSED') {
      return NextResponse.json(
        {
          success: false,
          error: 'AI Backend non raggiungibile. Assicurati che il servizio AI sia in esecuzione.',
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

// GET endpoint for status check
export async function GET() {
  try {
    const response = await fetch(`${AI_BACKEND_URL}/ai/chat/status`, {
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      return NextResponse.json(
        { status: 'unavailable', error: 'Backend not responding' },
        { status: 503 }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    return NextResponse.json(
      { status: 'unavailable', error: 'AI Backend non raggiungibile' },
      { status: 503 }
    );
  }
}
