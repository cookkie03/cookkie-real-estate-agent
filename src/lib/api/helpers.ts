// src/lib/api/helpers.ts
import { NextResponse } from 'next/server';

/**
 * Creates a standardized JSON success response.
 * @param data The payload to send.
 * @param status The HTTP status code.
 * @returns A NextResponse object.
 */
export function jsonResponse<T>(data: T, status: number = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

/**
 * Creates a standardized JSON error response.
 * @param message The error message.
 * @param status The HTTP status code.
 * @returns A NextResponse object.
 */
export function errorResponse(message: string, status: number = 500) {
  return NextResponse.json({ success: false, error: message }, { status });
}

/**
 * Handles Zod validation errors.
 * @param error A Zod error object.
 * @returns A 400 Bad Request error response.
 */
export function validationErrorResponse(_error: any) {
    // In a real app, you might want to format the error messages
    return errorResponse('Dati non validi', 400);
}