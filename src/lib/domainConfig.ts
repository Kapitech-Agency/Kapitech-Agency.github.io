/**
 * Domain & Routing Configuration for Kapitech Agency Ecosystem
 * Supports multi-domain separation between:
 * - Public Agency Website: https://kapitech.id
 * - Agency Management System (AMS): https://ams.kapitech.id
 */

export const DOMAIN_CONFIG = {
  PUBLIC_SITE_URL: import.meta.env.VITE_PUBLIC_SITE_URL || 'https://kapitech.id',
  AMS_APP_URL: import.meta.env.VITE_APP_URL || import.meta.env.NEXT_PUBLIC_APP_URL || 'https://ams.kapitech.id',
  API_BASE_URL: import.meta.env.VITE_API_URL || import.meta.env.NEXT_PUBLIC_API_URL || 'https://ams.kapitech.id/api',
  COOKIE_DOMAIN: typeof window !== 'undefined' && window.location.hostname.includes('kapitech.id')
    ? '.kapitech.id'
    : undefined,
  ALLOWED_ORIGINS: [
    'https://ams.kapitech.id',
    'https://kapitech.id',
    'https://staging.kapitech.id',
    'http://localhost:3000',
    'http://localhost:5173'
  ]
};

/**
 * Checks if the current runtime window host corresponds to the AMS subdomain
 */
export function isAmsSubdomain(): boolean {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname.toLowerCase();
  return host === 'ams.kapitech.id' || host.startsWith('ams.');
}

/**
 * Returns the target login redirect target URL
 */
export function getAmsDashboardUrl(): string {
  if (typeof window !== 'undefined') {
    // If already running directly on the AMS host, stay on the local path
    if (isAmsSubdomain()) {
      return '/admin/dashboard';
    }
  }
  return `${DOMAIN_CONFIG.AMS_APP_URL}/admin/dashboard`;
}

/**
 * Helper to get CORS headers for API calls or proxy middleware
 */
export function getSecurityCorsHeaders(requestOrigin?: string) {
  const origin = requestOrigin && DOMAIN_CONFIG.ALLOWED_ORIGINS.includes(requestOrigin)
    ? requestOrigin
    : DOMAIN_CONFIG.AMS_APP_URL;

  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, X-Kapitech-Client',
    'Access-Control-Allow-Credentials': 'true',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN'
  };
}
