// Self-healing URL sanitizer to handle Vercel env variable variations automatically
const getSanitizedApiUrl = (): string => {
  let url = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001/api';
  
  // 1. Trim whitespace
  url = url.trim();
  
  // 2. Strip trailing slashes
  while (url.endsWith('/')) {
    url = url.slice(0, -1);
  }
  
  // 3. Ensure it ends with /api for production routes
  if (url && !url.endsWith('/api') && (url.startsWith('http://') || url.startsWith('https://'))) {
    url = `${url}/api`;
  }
  
  return url;
};

export const API_URL = getSanitizedApiUrl();

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
