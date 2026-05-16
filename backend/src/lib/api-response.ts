import type { ApiResponse } from '@/types';

/**
 * Return a successful JSON response.
 * @param data    - The response payload
 * @param status  - HTTP status code (default 200)
 */
export function ok<T>(data: T, status = 200): Response {
  const body: ApiResponse<T> = { success: true, data };
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * Return a created JSON response (201).
 */
export function created<T>(data: T): Response {
  return ok(data, 201);
}

/**
 * Return an error JSON response.
 * @param message - Human-readable error description
 * @param status  - HTTP status code (default 400)
 */
export function err(message: string, status = 400): Response {
  const body: ApiResponse<never> = { success: false, error: message };
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

/** 401 Unauthorized */
export const unauthorized = () => err('Unauthorized — valid Bearer token required.', 401);

/** 403 Forbidden */
export const forbidden = () => err('Forbidden — you do not have permission.', 403);

/** 404 Not Found */
export const notFound = (resource = 'Resource') => err(`${resource} not found.`, 404);

/** 500 Internal Server Error */
export const serverError = (detail?: string) =>
  err(detail ?? 'An unexpected server error occurred.', 500);

/**
 * Safely extract the Bearer token from the Authorization header.
 * Returns null if the header is missing or malformed.
 */
export function extractBearerToken(request: Request): string | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  return authHeader.slice(7).trim() || null;
}
