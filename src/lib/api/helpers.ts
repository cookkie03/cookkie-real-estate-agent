/**
 * Helper functions for creating standardized API responses
 */

import { NextResponse } from 'next/server';
import type { ApiResponse, ApiError, PaginatedResponse } from './types';

/**
 * Creates a successful API response
 */
export function successResponse<T>(data: T, status = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status }
  );
}

/**
 * Creates an error API response
 */
export function errorResponse(
  message: string,
  status = 400,
  code?: string,
  details?: unknown
): NextResponse<ApiError> {
  return NextResponse.json(
    {
      success: false,
      error: {
        message,
        code,
        details,
      },
    },
    { status }
  );
}

/**
 * Creates a paginated API response
 */
export function paginatedResponse<T>(
  data: T[],
  page: number,
  limit: number,
  total: number,
  status = 200
): NextResponse<PaginatedResponse<T>> {
  const totalPages = Math.ceil(total / limit);

  return NextResponse.json(
    {
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    },
    { status }
  );
}

/**
 * Creates a not found error response
 */
export function notFoundResponse(resource: string): NextResponse<ApiError> {
  return errorResponse(`${resource} non trovato`, 404, 'NOT_FOUND');
}

/**
 * Creates a validation error response
 */
export function validationErrorResponse(details: unknown): NextResponse<ApiError> {
  return errorResponse('Errore di validazione', 400, 'VALIDATION_ERROR', details);
}

/**
 * Creates an internal server error response
 */
export function serverErrorResponse(error?: unknown): NextResponse<ApiError> {
  console.error('Server error:', error);
  return errorResponse(
    'Errore interno del server',
    500,
    'INTERNAL_SERVER_ERROR',
    process.env.NODE_ENV === 'development' ? error : undefined
  );
}
