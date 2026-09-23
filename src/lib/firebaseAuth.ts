const FIREBASE_API_KEY = String(import.meta.env.VITE_FIREBASE_API_KEY || '').trim();
const FIREBASE_PROJECT_ID = String(import.meta.env.VITE_FIREBASE_PROJECT_ID || '').trim();

export function isFirebaseAuthConfigured(): boolean {
  return Boolean(FIREBASE_API_KEY && FIREBASE_PROJECT_ID);
}

export async function signInWithFirebasePassword(email: string, password: string): Promise<string> {
  if (!isFirebaseAuthConfigured()) {
    throw new Error('Firebase Authentication is not configured for this deployment.');
  }

  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${encodeURIComponent(FIREBASE_API_KEY)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.trim(),
        password,
        returnSecureToken: true
      })
    }
  );

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload.idToken) {
    const code = String(payload?.error?.message || '').trim();
    const messages: Record<string, string> = {
      EMAIL_NOT_FOUND: 'Firebase account not found.',
      INVALID_PASSWORD: 'Firebase password is incorrect.',
      USER_DISABLED: 'Firebase account is disabled.',
      OPERATION_NOT_ALLOWED: 'Firebase Email/Password authentication is not enabled.'
    };
    throw new Error(messages[code] || 'Firebase authentication failed.');
  }

  return String(payload.idToken);
}
