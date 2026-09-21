import assert from 'node:assert/strict';
import test from 'node:test';

process.env.KAPITECH_DATA_ENCRYPTION_KEY = '11'.repeat(32);

const { decryptSecret, encryptSecret, isEncryptedSecret } = await import('../server/secret-crypto.ts');

test('MFA secret encryption is authenticated and reversible', () => {
  const plaintext = 'JBSWY3DPEHPK3PXP';
  const encrypted = encryptSecret(plaintext);

  assert.ok(encrypted);
  assert.notEqual(encrypted, plaintext);
  assert.equal(isEncryptedSecret(encrypted), true);
  assert.equal(decryptSecret(encrypted), plaintext);
});

test('Secret encryption does not double-encrypt already protected values', () => {
  const encrypted = encryptSecret('another-mfa-secret');
  assert.equal(encryptSecret(encrypted), encrypted);
});

test('Invalid encrypted secret payload is rejected', () => {
  assert.throws(() => decryptSecret('KAPI-SECRET-V1:broken'));
});
