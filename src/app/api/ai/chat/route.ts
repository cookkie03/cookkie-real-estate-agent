/**
 * AI Chat API Route
 * Proxy to Python FastAPI backend for RAG Assistant
 */

import { NextRequest } from 'next/server';
import { jsonResponse, errorResponse } from '@/lib/api/helpers';

const PYTHON_AI_URL = process.env.PYTHON_AI_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages } = body;

    if (!messages || messages.length === 0) {
      return errorResponse('Nessun messaggio fornito', 400);
    }

    // Forward request to Python backend
    const response = await fetch(`${PYTHON_AI_URL}/ai/chat/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
      return errorResponse(
        errorData.detail || 'Errore nel backend AI',
        response.status
      );
    }

    const data = await response.json();

    return jsonResponse({
      content: data.content,
      role: data.role || 'assistant',
      metadata: data.metadata,
    });

  } catch (error) {
    console.error('Errore nella chiamata AI Chat:', error);
    return errorResponse(
      'Errore interno del server durante la comunicazione con l\'AI.',
      500
    );
  }
}

export async function GET() {
  try {
    // Check Python backend status
    const response = await fetch(`${PYTHON_AI_URL}/ai/chat/status`);

    if (!response.ok) {
      return errorResponse('Backend AI non raggiungibile', 503);
    }

    const data = await response.json();
    return jsonResponse(data);

  } catch (error) {
    return errorResponse('Backend AI offline', 503);
  }
}
