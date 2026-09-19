/**
 * Email & Notification Management Module
 * Synchronizes notification channels with the server-side notification worker.
 * Privileged Telegram bot tokens and secrets are processed on the server and NEVER exposed to the browser.
 */

import { api } from './apiClient';

export interface NotificationSettings {
  targetEmail: string;
  formspreeEndpoint: string;
  telegramBotToken?: string;
  telegramChatId: string;
  isEmailActive: boolean;
  isTelegramActive: boolean;
  hasTelegramToken?: boolean;
}

const SETTINGS_KEY = 'kapitech_notification_settings';

export const getDefaultNotificationSettings = (): NotificationSettings => ({
  targetEmail: 'kapitechagency@gmail.com',
  formspreeEndpoint: '',
  telegramChatId: '',
  isEmailActive: true,
  isTelegramActive: false,
  hasTelegramToken: false
});

export const getNotificationSettings = (): NotificationSettings => {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return getDefaultNotificationSettings();
    const parsed = JSON.parse(raw);
    return { ...getDefaultNotificationSettings(), ...parsed };
  } catch {
    return getDefaultNotificationSettings();
  }
};

export const fetchServerNotificationSettings = async (): Promise<NotificationSettings> => {
  try {
    const res = await api.notifications.getSettings();
    if (res.success && res.data?.settings) {
      const s = res.data.settings;
      const combined: NotificationSettings = {
        targetEmail: s.targetEmail || 'kapitechagency@gmail.com',
        formspreeEndpoint: s.formspreeEndpoint || '',
        telegramChatId: s.telegramChatId || '',
        isEmailActive: s.isEmailActive ?? true,
        isTelegramActive: s.isTelegramActive ?? false,
        hasTelegramToken: Boolean(s.hasTelegramToken)
      };
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(combined));
      return combined;
    }
  } catch (err) {
    console.debug('Failed to fetch server notification settings:', err);
  }
  return getNotificationSettings();
};

export const saveNotificationSettings = async (settings: NotificationSettings): Promise<void> => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    window.dispatchEvent(new CustomEvent('kapitech_settings_updated', { detail: settings }));
    // Persist to server
    await api.notifications.updateSettings(settings);
  } catch (err) {
    console.debug('Failed to save notification settings:', err);
  }
};

/**
 * Client-side notification dispatch helper.
 * Note: Telegram dispatch is executed server-side via /api/leads/submit to protect bot tokens.
 */
export const dispatchAdminNotification = async (payload: {
  fullName: string;
  email: string;
  company?: string;
  phone?: string;
  services?: string[];
  budget?: string;
  message: string;
  source?: string;
  type?: string;
  rateCard?: string;
  specialty?: string;
  portfolioUrl?: string;
}) => {
  const settings = getNotificationSettings();
  const results = {
    emailSent: false,
    telegramSent: true, // Handled server-side by /api/leads/submit
    errors: [] as string[]
  };

  // Optional Formspree Webhook if agency configured a public form endpoint
  if (settings.formspreeEndpoint && settings.isEmailActive) {
    let endpoint = settings.formspreeEndpoint.trim();
    if (!endpoint.startsWith('http')) {
      endpoint = `https://formspree.io/f/${endpoint}`;
    }

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          _subject: `[Kapitech Lead] ${payload.fullName} - ${payload.company || payload.type || 'Pesan Baru'}`,
          name: payload.fullName,
          email: payload.email,
          phone: payload.phone || '-',
          company: payload.company || '-',
          services: payload.services?.join(', ') || payload.specialty || '-',
          budget: payload.budget || payload.rateCard || '-',
          portfolio: payload.portfolioUrl || '-',
          message: payload.message,
          source_page: payload.source || 'Website Form',
          submitted_at: new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })
        })
      });

      if (response.ok) {
        results.emailSent = true;
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      results.errors.push(message);
    }
  }

  return results;
};
