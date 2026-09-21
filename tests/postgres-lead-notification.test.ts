import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('lead submissions dispatch Telegram notifications in both datasource modes', async () => {
  const source = await fs.readFile(path.join(root, 'server/routes.ts'), 'utf8');

  assert.match(source, /dispatchLeadTelegramNotification/);
  assert.match(source, /postgresLeadRepository\.create\(newLead\)/);
  assert.match(source, /postgresNotificationSettingsRepository\.get\(\)/);
  assert.match(source, /void dispatchLeadTelegramNotification\(newLead, notificationSettings\)/);
  assert.match(source, /KAPITECH_TELEGRAM_BOT_TOKEN/);
  assert.match(source, /KAPITECH_TELEGRAM_CHAT_ID/);
  assert.match(source, /jsonNotificationSettings\\?\\.telegramBotToken/);
  assert.doesNotMatch(source, /const hasTelegramToken = postgresMode[\\s\\S]{0,220}s\\.telegramBotToken/);
});

test('production readiness checks runtime notification credentials when channels are enabled', async () => {
  const source = await fs.readFile(path.join(root, 'server/routes.ts'), 'utf8');

  assert.match(source, /notificationSettings\\.isTelegramActive/);
  assert.match(source, /KAPITECH_TELEGRAM_BOT_TOKEN/);
  assert.match(source, /notificationSettings\\.isEmailActive/);
  assert.match(source, /const notificationsReady = telegramConfigured && emailNotificationConfigured/);
  assert.match(source, /notifications: notificationsReady/);
});

test('PostgreSQL notification settings remain secret-safe during lead dispatch', async () => {
  const source = await fs.readFile(path.join(root, 'server/postgres-notification-settings-repository.ts'), 'utf8');

  assert.doesNotMatch(source, /telegram_bot_token/);
  assert.doesNotMatch(source, /telegramBotToken/);
});
