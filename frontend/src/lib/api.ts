export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001/api';

interface FetchOptions extends RequestInit {
  token?: string | null;
}

export async function apiFetch<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { token, headers: customHeaders, ...rest } = options;

  const headers = new Headers(customHeaders);
  headers.set('Content-Type', 'application/json');

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    headers,
    ...rest,
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.error || 'API request failed');
  }

  return data.data as T;
}
