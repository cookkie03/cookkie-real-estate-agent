/**
 * Standard API response types for consistent API responses
 */

export type ApiResponse<T> = {
  success: true;
  data: T;
};

export type ApiError = {
  success: false;
  error: {
    message: string;
    code?: string;
    details?: unknown;
  };
};

export type PaginatedResponse<T> = {
  success: true;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type ApiResult<T> = ApiResponse<T> | ApiError;
export type PaginatedResult<T> = PaginatedResponse<T> | ApiError;
