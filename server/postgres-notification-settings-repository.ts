import { getPostgresPool } from './postgres.ts';

export class PostgresNotificationSettingsRepository {
  async get(): Promise<any> {
    const { rows } = await getPostgresPool().query('SELECT * FROM notification_settings ORDER BY updated_at DESC LIMIT 1');
    const row = rows[0];
    return {
      targetEmail: row?.target_email || '',
      formspreeEndpoint: row?.formspree_endpoint || '',
      telegramBotToken: process.env.KAPITECH_TELEGRAM_BOT_TOKEN || '',
      telegramChatId: row?.telegram_chat_id || '',
      isEmailActive: Boolean(row?.is_email_active),
      isTelegramActive: Boolean(row?.is_telegram_active),
      updatedAt: row?.updated_at instanceof Date ? row.updated_at.toISOString() : row?.updated_at ? new Date(row.updated_at).toISOString() : ''
    };
  }

  async update(input: {
    targetEmail: string;
    formspreeEndpoint: string;
    telegramChatId: string;
    isEmailActive: boolean;
    isTelegramActive: boolean;
    telegramBotToken?: string;
  }): Promise<any> {
    const { rows } = await getPostgresPool().query(
      `INSERT INTO notification_settings
        (id,target_email,formspree_endpoint,telegram_bot_token,telegram_chat_id,is_email_active,is_telegram_active,updated_at)
       VALUES ('default',$1,$2,COALESCE(NULLIF(current_setting('app.telegram_bot_token', true), ''), ''),$3,$4,$5,NOW())
       ON CONFLICT (id) DO UPDATE SET
         target_email=EXCLUDED.target_email,
         formspree_endpoint=EXCLUDED.formspree_endpoint,
         telegram_chat_id=EXCLUDED.telegram_chat_id,
         is_email_active=EXCLUDED.is_email_active,
         is_telegram_active=EXCLUDED.is_telegram_active,
         updated_at=NOW()
       RETURNING *`,
      [input.targetEmail,input.formspreeEndpoint,input.telegramChatId,input.isEmailActive,input.isTelegramActive]
    );
    const row = rows[0];
    return {
      targetEmail: row.target_email || '',
      formspreeEndpoint: row.formspree_endpoint || '',
      telegramBotToken: row.telegram_bot_token || '',
      telegramChatId: row.telegram_chat_id || '',
      isEmailActive: Boolean(row.is_email_active),
      isTelegramActive: Boolean(row.is_telegram_active),
      updatedAt: row.updated_at instanceof Date ? row.updated_at.toISOString() : new Date(row.updated_at).toISOString()
    };
  }
}
export const postgresNotificationSettingsRepository = new PostgresNotificationSettingsRepository();
