/**
 * Utility Functions
 */

import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

/**
 * Standard API response
 */
export function apiResponse<T>(
  data: T,
  status: number = 200
): NextResponse<{ success: boolean; data: T }> {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status }
  );
}

/**
 * Standard API error response
 */
export function apiError(
  error: string | Error | ZodError,
  status: number = 500
): NextResponse<{ success: boolean; error: string; details?: any }> {
  let errorMessage: string;
  let errorDetails: any = undefined;

  if (error instanceof ZodError) {
    errorMessage = 'Validation error';
    errorDetails = error.errors;
    status = 400;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  } else {
    errorMessage = error;
  }

  console.error('[API Error]', errorMessage, errorDetails);

  return NextResponse.json(
    {
      success: false,
      error: errorMessage,
      ...(errorDetails && { details: errorDetails }),
    },
    { status }
  );
}

/**
 * Extract pagination params from URL
 */
export function getPaginationParams(searchParams: URLSearchParams) {
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  const skip = (page - 1) * limit;

  return {
    page,
    limit,
    skip,
    take: limit,
  };
}

/**
 * Extract filters from URL search params
 */
export function getFiltersFromParams(searchParams: URLSearchParams): Record<string, any> {
  const filters: Record<string, any> = {};

  searchParams.forEach((value, key) => {
    if (key === 'page' || key === 'limit') return;

    // Handle JSON arrays
    if (value.startsWith('[') && value.endsWith(']')) {
      try {
        filters[key] = JSON.parse(value);
      } catch {
        filters[key] = value;
      }
    }
    // Handle numbers
    else if (!isNaN(Number(value))) {
      filters[key] = Number(value);
    }
    // Handle booleans
    else if (value === 'true' || value === 'false') {
      filters[key] = value === 'true';
    }
    // Handle strings
    else {
      filters[key] = value;
    }
  });

  return filters;
}

/**
 * Generate unique code for entities
 */
export function generateCode(prefix: string, count: number): string {
  const year = new Date().getFullYear();
  const sequence = String(count + 1).padStart(4, '0');
  return `${prefix}-${year}-${sequence}`;
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 * Returns distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Parse JSON field safely
 */
export function parseJsonField<T = any>(value: any, fallback: T): T {
  if (!value) return fallback;
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

/**
 * Sanitize input to prevent injection
 */
export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}
