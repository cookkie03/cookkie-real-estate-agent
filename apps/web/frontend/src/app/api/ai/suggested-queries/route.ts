/**
 * API Route: Suggested Queries
 * GET /api/ai/suggested-queries?current_page=/requests
 */

import { NextRequest, NextResponse } from 'next/server';

const AI_BACKEND_URL = process.env.AI_BACKEND_URL || 'http://localhost:8000';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const currentPage = searchParams.get('current_page');

    const params = new URLSearchParams();
    if (currentPage) params.set('current_page', currentPage);

    const response = await fetch(
      `${AI_BACKEND_URL}/ai/chat/suggested-queries?${params.toString()}`,
      { signal: AbortSignal.timeout(5000) }
    );

    if (!response.ok) {
      // Fallback queries if backend unavailable
      return NextResponse.json({
        success: true,
        queries: [
          "Come sta andando il mio portfolio?",
          "Quali sono le opportunità di oggi?",
          "Mostrami i migliori match disponibili"
        ],
        fallback: true
      });
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    // Fallback queries on error
    return NextResponse.json({
      success: true,
      queries: [
        "Come sta andando il mio portfolio?",
        "Quali sono le opportunità di oggi?",
        "Mostrami i migliori match disponibili"
      ],
      fallback: true
    });
  }
}
