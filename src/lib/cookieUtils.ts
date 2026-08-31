/**
 * Cookie Management with Secure, SameSite=Lax, and .kapitech.id scope
 */

export interface CookieOptions {
  days?: number;
  domain?: string;
  path?: string;
  secure?: boolean;
  sameSite?: 'Lax' | 'Strict' | 'None';
}

export function setSecureCookie(name: string, value: string, options: CookieOptions = {}) {
  if (typeof document === 'undefined') return;

  const days = options.days ?? 30;
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = `expires=${date.toUTCString()}`;
  
  const isKapitechDomain = window.location.hostname.includes('kapitech.id');
  const domain = options.domain ?? (isKapitechDomain ? '.kapitech.id' : undefined);
  const domainStr = domain ? `; domain=${domain}` : '';
  
  const path = options.path ?? '/';
  const sameSite = options.sameSite ?? 'Lax';
  // Use Secure flag on HTTPS or production
  const secure = options.secure ?? (window.location.protocol === 'https:' || isKapitechDomain);
  const secureStr = secure ? '; Secure' : '';

  document.cookie = `${name}=${encodeURIComponent(value)}; ${expires}; path=${path}${domainStr}; SameSite=${sameSite}${secureStr}`;
}

export function getSecureCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;

  const nameEQ = `${name}=`;
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) {
      return decodeURIComponent(c.substring(nameEQ.length, c.length));
    }
  }
  return null;
}

export function removeSecureCookie(name: string, options: Pick<CookieOptions, 'domain' | 'path'> = {}) {
  if (typeof document === 'undefined') return;

  const isKapitechDomain = window.location.hostname.includes('kapitech.id');
  const domain = options.domain ?? (isKapitechDomain ? '.kapitech.id' : undefined);
  const domainStr = domain ? `; domain=${domain}` : '';
  const path = options.path ?? '/';

  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}${domainStr}; SameSite=Lax`;
}
