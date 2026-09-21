import { getPostgresPool } from './postgres.ts';

export type NotificationSettings = {
  targetEmail: string;
  formspreeEndpoint: string;
  telegramChatId: string;
  isEmailActive: boolean;
  isTelegramActive: boolean;
  updatedAt: string;
};

function mapNotificationSettings(row: Record<string, any> | undefined): NotificationSettings {
  return {
    targetEmail: row?.target_email || '',
    formspreeEndpoint: row?.formspree_endpoint || '',
    telegramChatId: row?.telegram_chat_id || '',
    isEmailActive: Boolean(row?.is_email_active),
    isTelegramActive: Boolean(row?.is_telegram_active),
    updatedAt: row?.updated_at instanceof Date
      ? row.updated_at.toISOString()
      : row?.updated_at ? new Date(row.updated_at).toISOString() : ''
  };
}

export class PostgresNotificationSettingsRepository {
  async get(): Promise<NotificationSettings> {
    const { rows } = await getPostgresPool().query(
      `SELECT target_email, formspree_endpoint, telegram_chat_id, is_email_active, is_telegram_active, updated_at
         FROM notification_settings
        WHERE id = 1`
    );
    return mapNotificationSettings(rows[0]);
  }

  async update(input: {
    targetEmail: string;
    formspreeEndpoint: string;
    telegramChatId: string;
    isEmailActive: boolean;
    isTelegramActive: boolean;
  }): Promise<NotificationSettings> {
    const { rows } = await getPostgresPool().query(
      `INSERT INTO notification_settings
        (id, target_email, formspree_endpoint, telegram_chat_id, is_email_active, is_telegram_active, updated_at)
       VALUES (1, $1, $2, $3, $4, $5, NOW())
       ON CONFLICT (id) DO UPDATE SET
         target_email = EXCLUDED.target_email,
         formspree_endpoint = EXCLUDED.formspree_endpoint,
         telegram_chat_id = EXCLUDED.telegram_chat_id,
         is_email_active = EXCLUDED.is_email_active,
         is_telegram_active = EXCLUDED.is_telegram_active,
         updated_at = NOW()
       RETURNING target_email, formspree_endpoint, telegram_chat_id, is_email_active, is_telegram_active, updated_at`,
      [input.targetEmail, input.formspreeEndpoint, input.telegramChatId, input.isEmailActive, input.isTelegramActive]
    );
    return mapNotificationSettings(rows[0]);
  }
}

export const postgresNotificationSettingsRepository = new PostgresNotificationSettingsRepository();
