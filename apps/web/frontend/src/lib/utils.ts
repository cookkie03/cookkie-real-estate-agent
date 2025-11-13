import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

// ============================================================================
// UI UTILITIES (Frontend)
// ============================================================================

/**
 * Utility function to merge Tailwind CSS classes
 * Used throughout the app for conditional class names
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency in EUR
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format date in Italian format
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}

/**
 * Format datetime in Italian format
 */
export function formatDateTime(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

/**
 * Format relative time (e.g., "2 ore fa")
 */
export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Ora";
  if (diffMins < 60) return `${diffMins} min fa`;
  if (diffHours < 24) return `${diffHours} ore fa`;
  if (diffDays < 7) return `${diffDays} giorni fa`;
  return formatDate(d);
}

/**
 * Format square meters
 */
export function formatSquareMeters(sqm: number): string {
  return `${sqm} m²`;
}

/**
 * Format phone number
 */
export function formatPhone(phone: string): string {
  // Simple formatting for Italian phone numbers
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("39")) {
    return `+39 ${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
  }
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  }
  return phone;
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
}

/**
 * Get initials from name
 */
export function getInitials(name: string): string {
  const parts = name.split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

/**
 * Sleep utility for delays
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// ============================================================================
// API UTILITIES (Backend)
// ============================================================================

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
