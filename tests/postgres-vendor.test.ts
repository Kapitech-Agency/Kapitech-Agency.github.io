import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { getPostgresPool, closePostgresPool } from '../server/postgres.ts';
import {
  PostgresVendorRepository,
  VendorVersionConflictError
} from '../server/postgres-vendor-repository.ts';

const configured = Boolean(process.env.KAPITECH_POSTGRES_URL);

function token(prefix: string): string {
  return prefix + '_' + Date.now() + '_' + crypto.randomBytes(3).toString('hex');
}

test('PostgreSQL vendor lifecycle preserves metadata and optimistic concurrency', async t => {
  if (!configured) {
    t.skip('KAPITECH_POSTGRES_URL is not configured');
    return;
  }

  const pool = getPostgresPool();
  const vendors = new PostgresVendorRepository();
  const vendorId = token('vendor');

  try {
    const created = await vendors.create({
      id: vendorId,
      name: 'Integration Vendor',
      companyName: 'Integration Vendor Co',
      category: 'Engineering',
      email: 'vendor@example.test',
      hourlyRate: 250000,
      currency: 'IDR',
      monthlySpend: 1000000,
      rating: 4.5,
      skills: ['TypeScript', 'PostgreSQL'],
      isVetted: true,
      location: 'Jakarta',
      notes: 'Integration test'
    });

    assert.equal(created.id, vendorId);
    assert.equal(created.hourlyRate, 250000);
    assert.equal(created.currency, 'IDR');
    assert.equal(created.rating, 4.5);
    assert.equal(created.version, 1);

    const updated = await vendors.update(vendorId, {
      monthlySpend: 1250000,
      version: created.version
    });
    assert.equal(updated.monthlySpend, 1250000);
    assert.equal(updated.version, 2);

    await assert.rejects(
      () => vendors.update(vendorId, {
        monthlySpend: 1500000,
        version: created.version
      }),
      error => error instanceof VendorVersionConflictError
    );

    assert.equal(
      await vendors.archive(vendorId, updated.version),
      true
    );
    assert.equal(await vendors.list().then(items => items.some(v => v.id === vendorId)), false);
  } finally {
    await pool.query('DELETE FROM vendors WHERE id=$1', [vendorId]);
    await closePostgresPool();
  }
});
