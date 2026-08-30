// Email & Telegram Automated Dispatch Engine

export interface NotificationSettings {
  targetEmail: string;
  formspreeEndpoint: string; // e.g., 'https://formspree.io/f/xyzqwert' or Form ID
  telegramBotToken: string;
  telegramChatId: string;
  isEmailActive: boolean;
  isTelegramActive: boolean;
}

const SETTINGS_KEY = 'kapitech_notification_settings';

export const getDefaultNotificationSettings = (): NotificationSettings => ({
  targetEmail: 'kapitechagency@gmail.com',
  formspreeEndpoint: '',
  telegramBotToken: '',
  telegramChatId: '',
  isEmailActive: true,
  isTelegramActive: false,
});

export const getNotificationSettings = (): NotificationSettings => {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return getDefaultNotificationSettings();
    const parsed = JSON.parse(raw);
    return { ...getDefaultNotificationSettings(), ...parsed };
  } catch (err) {
    console.debug('Failed to load notification settings:', err);
    return getDefaultNotificationSettings();
  }
};

export const saveNotificationSettings = (settings: NotificationSettings) => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    window.dispatchEvent(new CustomEvent('kapitech_settings_updated', { detail: settings }));
  } catch (err) {
    console.debug('Failed to save notification settings:', err);
  }
};

/**
 * Dispatch automated email & message notifications to admin
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
    telegramSent: false,
    errors: [] as string[]
  };

  // 1. Forward to Formspree Webhook if configured
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
      } else {
        results.errors.push('Formspree status: ' + response.statusText);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      results.errors.push(message);
    }
  }

  // 2. Forward to Telegram Bot if configured
  if (settings.telegramBotToken && settings.telegramChatId && settings.isTelegramActive) {
    try {
      const tgText = `🔔 *KAPITECH - PESAN FORMULIR BARU*\n\n` +
        `👤 *Nama:* ${payload.fullName}\n` +
        `📧 *Email:* ${payload.email}\n` +
        `📱 *Tel/WA:* ${payload.phone || '-'}\n` +
        `🏢 *Perusahaan:* ${payload.company || '-'}\n` +
        `💼 *Layanan:* ${payload.services?.join(', ') || payload.specialty || '-'}\n` +
        `💰 *Budget:* ${payload.budget || payload.rateCard || '-'}\n` +
        `📍 *Sumber:* ${payload.source || 'Website'}\n\n` +
        `📝 *Pesan / Brief:*\n${payload.message}`;

      const tgUrl = `https://api.telegram.org/bot${settings.telegramBotToken.trim()}/sendMessage`;
      const tgRes = await fetch(tgUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: settings.telegramChatId.trim(),
          text: tgText,
          parse_mode: 'Markdown'
        })
      });

      if (tgRes.ok) {
        results.telegramSent = true;
      }
    } catch (tgErr: unknown) {
      const message = tgErr instanceof Error ? tgErr.message : String(tgErr);
      results.errors.push(message);
    }
  }

  return results;
};
