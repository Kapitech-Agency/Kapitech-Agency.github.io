import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('PostgreSQL importer includes CMS and notification configuration', async () => {
  const source = await fs.readFile(path.join(root, 'scripts/postgres-import.ts'), 'utf8');

  for (const table of ['cms_services', 'cms_projects', 'cms_testimonials', 'cms_settings', 'notification_settings']) {
    assert.match(source, new RegExp(table));
  }

  assert.match(source, /telegram_bot_token/);
  assert.match(source, /telegramChatId/);
});

test('reconciliation checks CMS and notification configuration without exposing token values', async () => {
  const source = await fs.readFile(path.join(root, 'scripts/postgres-reconcile.ts'), 'utf8');

  assert.match(source, /cmsSettingsParity/);
  assert.match(source, /notificationSettingsParity/);
  assert.match(source, /hasTelegramToken/);
  assert.match(source, /delete sourceCmsSettings\.updatedAt/);
  assert.doesNotMatch(source, /console\.log\([^\n]*telegramBotToken/);
});
