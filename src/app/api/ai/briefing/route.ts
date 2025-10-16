/**
 * AI Briefing API Route
 * Proxy to Python FastAPI backend for daily briefing
 */

import { NextRequest } from 'next/server';
import { jsonResponse, errorResponse } from '@/lib/api/helpers';

const PYTHON_AI_URL = process.env.PYTHON_AI_URL || 'http://localhost:8000';

export async function GET(request: NextRequest) {
  try {
    // Forward request to Python backend
    const response = await fetch(`${PYTHON_AI_URL}/ai/briefing/daily`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
      return errorResponse(
        errorData.detail || 'Errore nella generazione del briefing',
        response.status
      );
    }

    const data = await response.json();

    return jsonResponse(data);

  } catch (error) {
    console.error('Errore nella chiamata AI Briefing:', error);
    return errorResponse(
      'Errore interno del server durante la comunicazione con l\'AI.',
      500
    );
  }
}
