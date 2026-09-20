export type FeedbackKind = 'selection' | 'success' | 'warning' | 'error';

export function triggerFeedback(kind: FeedbackKind = 'selection'): void {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return;
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
  if (!('vibrate' in navigator)) return;

  const pattern: Record<FeedbackKind, number | number[]> = {
    selection: 8,
    success: [10, 24, 10],
    warning: [18, 32, 18],
    error: [24, 40, 24]
  };

  try {
    navigator.vibrate(pattern[kind]);
  } catch {
    // Vibration is optional and may be blocked by the browser/device.
  }
}
