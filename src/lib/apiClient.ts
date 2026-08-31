/**
 * Kapitech API Client for AMS & Public Ecosystem
 * Provides unified, secured fetching with CORS credentials, domain awareness,
 * and automatic JWT Bearer authentication injection.
 */

import { DOMAIN_CONFIG } from './domainConfig';
import { getAdminSession } from './adminAuth';

export interface ApiFetchOptions extends RequestInit {
  endpoint: string;
}

export async function kapitechApiFetch<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ data: T | null; error: string | null; status: number }> {
  const session = getAdminSession();
  const token = session?.token;

  const url = endpoint.startsWith('http') 
    ? endpoint 
    : `${DOMAIN_CONFIG.API_BASE_URL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Kapitech-Client': 'AMS-WebClient',
    ...(options.headers as Record<string, string> || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include', // Includes .kapitech.id scoped cookies for CORS
      mode: 'cors'
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      return {
        data: null,
        error: `HTTP ${response.status}: ${errText || response.statusText}`,
        status: response.status
      };
    }

    const data = await response.json().catch(() => null);
    return {
      data: data as T,
      error: null,
      status: response.status
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Network request failed';
    return {
      data: null,
      error: msg,
      status: 0
    };
  }
}
