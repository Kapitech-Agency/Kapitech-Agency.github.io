/**
 * Security & Input Sanitization Utilities for Kapitech Agency
 * Mitigates XSS, HTML Injection, Prototype Pollution, and spam bot attacks.
 */

// Strip HTML tags, dangerous scripts, control chars, and null bytes
export function sanitizeInput(input: string | null | undefined): string {
  if (!input || typeof input !== 'string') return '';
  
  return input
    // Remove null bytes and control characters
    .replace(/\0/g, '')
    .replace(/[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Strip HTML/XML tags
    .replace(/<[^>]*>?/gm, '')
    // Strip javascript: or data: URIs
    .replace(/(?:javascript|vbscript|data):/gi, '')
    // Strip on* event handlers if any slipped through
    .replace(/on\w+\s*=/gi, '')
    .trim();
}

// Validate email address format strictly
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  // RFC 5322 compliant regex simplified for web safe validation
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return emailRegex.test(email.trim()) && email.length <= 254;
}

// Validate phone number format (allows +, numbers, dashes, spaces, brackets)
export function isValidPhone(phone: string): boolean {
  if (!phone || typeof phone !== 'string') return false;
  const cleaned = phone.replace(/[\s\-\(\)\.]/g, '');
  return /^\+?[0-9]{7,16}$/.test(cleaned);
}

// Clamp string length to prevent memory buffer exhaustion / payload inflation
export function clampLength(str: string, maxLength: number = 2000): string {
  if (!str) return '';
  return str.slice(0, maxLength);
}

// Validate uploaded file MIME type and max size for careers/resumes
export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export function validateResumeFile(file: File | null): FileValidationResult {
  if (!file) {
    return { isValid: true };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      isValid: false,
      error: 'File size exceeds 5MB limit. Please upload a smaller PDF or Word document.'
    };
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    // Check file extension as fallback
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['pdf', 'doc', 'docx'].includes(ext || '')) {
      return {
        isValid: false,
        error: 'Invalid file format. Only PDF, DOC, and DOCX files are allowed.'
      };
    }
  }

  return { isValid: true };
}
