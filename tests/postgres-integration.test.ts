import test from 'node:test';
import assert from 'node:assert/strict';
import { getPostgresPool, checkPostgresConnection, closePostgresPool } from '../server/postgres.ts';
import { PostgresDatabaseRepository } from '../server/postgres-database-repository.ts';
import { PostgresSecurityControlsRepository } from '../server/postgres-security-controls-repository.ts';

const configured = Boolean(process.env.KAPITECH_POSTGRES_URL);

test('PostgreSQL integration harness is fail-closed when not configured', async t => {
  if (configured) return;
  assert.throws(() => getPostgresPool(), /KAPITECH_POSTGRES_URL/);
  await assert.rejects(() => checkPostgresConnection(), /KAPITECH_POSTGRES_URL/);
  await closePostgresPool();
  t.diagnostic('Set KAPITECH_POSTGRES_URL to execute live schema integration checks.');
});

test('PostgreSQL repository can load the complete schema when configured', async t => {
  if (!configured) { t.skip('KAPITECH_POSTGRES_URL is not configured'); return; }
  const connection = await checkPostgresConnection();
  assert.equal(connection.ok, true);
  assert.ok(connection.latencyMs >= 0);
  const db = await new PostgresDatabaseRepository().loadDatabase();
  for (const key of ['users','sessions','leads','crmDeals','clients','projects','proposals','tasks','timeLogs','invoices','expenses','approvals','vendors','documents','notifications','cmsServices','cmsProjects','cmsTestimonials','auditLogs']) {
    assert.ok(Array.isArray((db as any)[key]), key);
  }
  assert.equal(typeof db.cmsSettings, 'object');
  assert.equal(typeof db.notificationSettings, 'object');
  await closePostgresPool();
});


test('PostgreSQL security controls can consume a live rate-limit bucket', async t => {
  if (!configured) { t.skip('KAPITECH_POSTGRES_URL is not configured'); return; }

  const repository = new PostgresSecurityControlsRepository();
  const bucketKey = 'ci-rate-limit-' + Date.now() + '-' + Math.random().toString(16).slice(2);

  try {
    const first = await repository.consumeRateLimit(bucketKey, 2, 60_000);
    const second = await repository.consumeRateLimit(bucketKey, 2, 60_000);
    const third = await repository.consumeRateLimit(bucketKey, 2, 60_000);

    assert.equal(first.count, 1);
    assert.equal(first.allowed, true);
    assert.equal(second.count, 2);
    assert.equal(second.allowed, true);
    assert.equal(third.count, 3);
    assert.equal(third.allowed, false);
  } finally {
    await getPostgresPool().query(
      'DELETE FROM security_rate_limits WHERE bucket_key = $1',
      [bucketKey]
    );
    await closePostgresPool();
  }
});


test('PostgreSQL commercial workflow converts proposal to invoice and returns the persisted line items', async t => {
  if (!configured) { t.skip('KAPITECH_POSTGRES_URL is not configured'); return; }

  const { PostgresClientRepository } = await import('../server/postgres-client-repository.ts');
  const { PostgresProposalRepository } = await import('../server/postgres-proposal-repository.ts');
  const { PostgresInvoiceRepository } = await import('../server/postgres-invoice-repository.ts');

  const clientRepository = new PostgresClientRepository();
  const proposalRepository = new PostgresProposalRepository();
  const invoiceRepository = new PostgresInvoiceRepository();

  const suffix = Date.now() + '-' + Math.random().toString(16).slice(2);
  const clientId = 'ci-client-' + suffix;
  const proposalId = 'ci-proposal-' + suffix;
  const itemId = 'ci-proposal-item-' + suffix;
  const now = new Date().toISOString();
  let invoiceId: string | undefined;

  try {
    await clientRepository.create({
      id: clientId,
      name: 'CI Commercial Client',
      company: 'CI Commercial Company',
      email: 'ci-' + suffix + '@example.test',
      phone: '',
      location: 'Jakarta, Indonesia',
      industry: 'Technology',
      status: 'active',
      totalSpend: 0,
      projectsCount: 0,
      contactPersonRole: 'Project Lead',
      notes: 'PostgreSQL workflow integration test',
      createdAt: now,
      updatedAt: now
    });

    await proposalRepository.create({
      id: proposalId,
      proposalNumber: 'CI-PROP-' + suffix,
      title: 'CI Commercial Proposal',
      clientId,
      subtotal: 2_000_000,
      discount: 0,
      taxPercent: 0,
      tax: 0,
      total: 2_000_000,
      currency: 'IDR',
      validityPeriod: '14 days',
      paymentTerms: '50% upfront',
      owner: 'ci',
      status: 'Approved',
      notes: 'Workflow integration test',
      createdDate: now.slice(0, 10),
      items: [{
        id: itemId,
        description: 'Website implementation',
        quantity: 1,
        unitPrice: 2_000_000
      }],
      createdAt: now,
      updatedAt: now
    });

    const responseInvoice = await proposalRepository.convertToInvoice(proposalId);
    assert.ok(responseInvoice);
    invoiceId = responseInvoice?.id;
    assert.equal(responseInvoice?.clientId, clientId);
    assert.equal(responseInvoice?.total, 2_000_000);
    assert.equal(responseInvoice?.items.length, 1);
    assert.equal(responseInvoice?.items[0].description, 'Website implementation');

    const persistedInvoice = await invoiceRepository.findById(responseInvoice!.id);
    assert.ok(persistedInvoice);
    assert.equal(persistedInvoice?.items.length, 1);
    assert.equal(persistedInvoice?.items[0].id, 'ii_' + itemId);
    assert.equal(persistedInvoice?.items[0].amount, 2_000_000);

    const proposal = await proposalRepository.findById(proposalId);
    assert.equal(proposal?.status, 'Accepted');

    const paid = await invoiceRepository.recordPayment(responseInvoice!.id, {
      id: 'ci-payment-' + suffix,
      amount: 1_000_000,
      date: now.slice(0, 10),
      method: 'bank_transfer',
      reference: 'CI-WORKFLOW-PAYMENT',
      recordedBy: 'ci',
      userId: null
    });

    assert.equal(paid?.amountPaid, 1_000_000);
    assert.equal(paid?.balanceDue, 1_000_000);
    assert.equal(paid?.status, 'partially_paid');
    assert.equal(paid?.payments.length, 1);
  } finally {
    const db = getPostgresPool();
    if (invoiceId) {
      await db.query('DELETE FROM invoice_payments WHERE invoice_id = $1', [invoiceId]);
      await db.query('DELETE FROM invoice_items WHERE invoice_id = $1', [invoiceId]);
      await db.query('DELETE FROM invoices WHERE id = $1', [invoiceId]);
    }
    await db.query('DELETE FROM proposal_items WHERE proposal_id = $1', [proposalId]);
    await db.query('DELETE FROM proposals WHERE id = $1', [proposalId]);
    await db.query('DELETE FROM clients WHERE id = $1', [clientId]);
    await closePostgresPool();
  }
});


test('PostgreSQL delivery workflow preserves client relation across project, task, and time log', async t => {
  if (!configured) { t.skip('KAPITECH_POSTGRES_URL is not configured'); return; }

  const { PostgresClientRepository } = await import('../server/postgres-client-repository.ts');
  const { PostgresProjectRepository } = await import('../server/postgres-project-repository.ts');
  const { PostgresTimeLogRepository } = await import('../server/postgres-time-log-repository.ts');
  const { PostgresTaskRepository } = await import('../server/postgres-task-repository.ts');
  const { PostgresAuthRepository } = await import('../server/postgres-repository.ts');

  const clientRepository = new PostgresClientRepository();
  const projectRepository = new PostgresProjectRepository();
  const timeLogRepository = new PostgresTimeLogRepository();
  const taskRepository = new PostgresTaskRepository();
  const authRepository = new PostgresAuthRepository();

  const suffix = Date.now() + '-' + Math.random().toString(16).slice(2);
  const clientId = 'ci-delivery-client-' + suffix;
  const projectId = 'ci-delivery-project-' + suffix;
  const taskId = 'ci-delivery-task-' + suffix;
  const timeLogId = 'ci-delivery-log-' + suffix;
  const directTaskId = 'ci-delivery-direct-task-' + suffix;
  const assigneeUserId = 'ci-delivery-assignee-' + suffix;
  const assigneeUsername = 'ci-delivery-assignee-' + suffix;
  const now = new Date().toISOString();

  try {
    await clientRepository.create({
      id: clientId,
      name: 'CI Delivery Client',
      company: 'CI Delivery Company',
      email: 'delivery-' + suffix + '@example.test',
      phone: '',
      location: 'Jakarta, Indonesia',
      industry: 'Technology',
      status: 'active',
      totalSpend: 0,
      projectsCount: 0,
      contactPersonRole: 'Project Lead',
      notes: 'Delivery workflow integration test',
      createdAt: now,
      updatedAt: now
    });

    await authRepository.createUser({
      id: assigneeUserId,
      name: 'CI Delivery Assignee',
      username: assigneeUsername,
      email: assigneeUsername + '@example.test',
      passwordHash: 'ci-test',
      salt: 'ci-test',
      passwordAlgorithm: 'scrypt-v1',
      role: 'Tier 3: Operational Staff',
      stakeholderType: 'Operations',
      permissions: {
        canViewFinancials: false,
        canManageInvoices: false,
        canApproveBudgets: false,
        canManageCrm: false,
        canManageProjects: true,
        canManageKanbanTasks: true,
        canManageClients: false,
        canManageVendors: false,
        canManageCmsContent: false,
        canAccessServerAndApi: false,
        canRunDataMigration: false,
        canViewSecurityAuditLogs: false,
        canManageAdminAccounts: false
      },
      mfaEnabled: false,
      mfaSecret: null,
      mfaPendingSecret: null,
      mfaRecoveryCodeHashes: [],
      division: 'Operations',
      status: 'active',
      lastLogin: '',
      createdAt: now
    });

    const project = await projectRepository.create({
      id: projectId,
      name: 'CI Delivery Project',
      clientId,
      clientName: 'CI Delivery Client',
      clientCompany: 'CI Delivery Company',
      clientEmail: 'delivery-' + suffix + '@example.test',
      serviceCategory: 'Website Development',
      status: 'in_progress',
      budget: 5_000_000,
      progressPercent: 20,
      startDate: now.slice(0, 10),
      targetEndDate: now.slice(0, 10),
      teamLead: 'CI',
      teamMembers: ['CI'],
      techStack: ['React'],
      milestones: [],
      tasks: [{
        id: taskId,
        title: 'Build landing page',
        description: 'Integration test task',
        status: 'todo',
        priority: 'high',
        assignedTo: assigneeUsername,
        dueDate: now.slice(0, 10),
        createdAt: now
      }],
      notes: 'Delivery workflow integration test',
      createdAt: now,
      updatedAt: now
    });

    assert.equal(project.clientId, clientId);
    assert.equal(project.tasks.length, 1);
    assert.equal(project.tasks[0].id, taskId);

    const foundProject = await projectRepository.findById(projectId);
    assert.equal(foundProject?.clientId, clientId);
    assert.equal(foundProject?.tasks[0]?.id, taskId);

    const persistedTask = await getPostgresPool().query(
      'SELECT assignee_user_id FROM tasks WHERE id = $1',
      [taskId]
    );
    assert.equal(persistedTask.rows[0]?.assignee_user_id, assigneeUserId);

    const directTask = await taskRepository.create({
      id: directTaskId,
      projectId,
      title: 'Direct task assignment check',
      description: 'Integration test task assignment',
      status: 'todo',
      priority: 'medium',
      assignee: 'CI Delivery Assignee',
      dueDate: now.slice(0, 10),
      createdAt: now
    });
    assert.equal((directTask as any).assignee, assigneeUserId);

    const persistedDirectTask = await getPostgresPool().query(
      'SELECT assignee_user_id FROM tasks WHERE id = $1',
      [directTaskId]
    );
    assert.equal(persistedDirectTask.rows[0]?.assignee_user_id, assigneeUserId);

    const timeLog = await timeLogRepository.create({
      id: timeLogId,
      projectId,
      taskId,
      userId: null,
      user: 'CI',
      durationMinutes: 150,
      date: now.slice(0, 10),
      notes: 'Implementation work',
      billable: true,
      createdAt: now
    });

    assert.equal(timeLog.projectId, projectId);
    assert.equal(timeLog.taskId, taskId);
    assert.equal(timeLog.durationMinutes, 150);
    assert.equal(timeLog.hours, 2.5);
  } finally {
    const db = getPostgresPool();
    await db.query('DELETE FROM time_logs WHERE id = $1', [timeLogId]);
    await db.query('DELETE FROM tasks WHERE id IN ($1, $2)', [taskId, directTaskId]);
    await db.query('DELETE FROM projects WHERE id = $1', [projectId]);
    await db.query('DELETE FROM clients WHERE id = $1', [clientId]);
    await db.query('DELETE FROM users WHERE id = $1', [assigneeUserId]);
    await closePostgresPool();
  }
});


test('PostgreSQL CRM workflow converts a lead into a linked client and deal using required deal columns', async t => {
  if (!configured) { t.skip('KAPITECH_POSTGRES_URL is not configured'); return; }

  const { PostgresLeadRepository } = await import('../server/postgres-lead-repository.ts');
  const { PostgresClientRepository } = await import('../server/postgres-client-repository.ts');
  const { PostgresCrmDealRepository } = await import('../server/postgres-crm-deal-repository.ts');

  const leadRepository = new PostgresLeadRepository();
  const clientRepository = new PostgresClientRepository();
  const dealRepository = new PostgresCrmDealRepository();

  const suffix = Date.now() + '-' + Math.random().toString(16).slice(2);
  const leadId = 'ci-crm-lead-' + suffix;
  const clientId = 'ci-crm-client-' + suffix;
  const dealId = 'ci-crm-deal-' + suffix;
  const email = 'crm-' + suffix + '@example.test';
  const now = new Date().toISOString();

  try {
    const lead = await leadRepository.create({
      id: leadId,
      fullName: 'CI CRM Lead',
      email,
      company: 'CI CRM Company',
      phone: '',
      message: 'CRM conversion integration test',
      status: 'new',
      source: 'CI',
      services: ['Website Development'],
      budget: 'IDR 20.000.000',
      createdAt: now,
      updatedAt: now
    });

    const conversion = await dealRepository.convertLead(
      lead,
      {
        id: clientId,
        name: lead.fullName,
        company: lead.company,
        email: lead.email,
        phone: lead.phone,
        industry: 'Technology',
        status: 'active',
        notes: 'Converted from CI lead',
        createdAt: now,
        updatedAt: now
      },
      {
        id: dealId,
        title: 'CI CRM Website Project',
        clientName: lead.fullName,
        company: lead.company,
        email,
        phone: '',
        clientId,
        servicePillar: 'Website Development',
        value: 20_000_000,
        stage: 'new',
        probability: 0.25,
        owner: 'ci',
        expectedCloseDate: now.slice(0, 10),
        notes: 'CRM conversion integration test',
        priority: 'medium',
        source: 'CI',
        createdAt: now,
        updatedAt: now
      }
    );

    assert.equal(conversion.client.id, clientId);
    assert.equal(conversion.deal.id, dealId);
    assert.equal(conversion.deal.clientId, clientId);
    assert.equal(conversion.deal.title, 'CI CRM Website Project');
    assert.equal(conversion.deal.stage, 'new');
    assert.equal(conversion.deal.value, 20_000_000);

    const persistedLead = await leadRepository.findById(leadId);
    assert.equal(persistedLead?.status, 'closed');

    const persistedClient = await clientRepository.findById(clientId);
    assert.equal(persistedClient?.id, clientId);
    assert.equal(persistedClient?.company, 'CI CRM Company');

    const persistedDeal = await dealRepository.findById(dealId);
    assert.equal(persistedDeal?.clientId, clientId);
    assert.equal(persistedDeal?.title, 'CI CRM Website Project');
    assert.equal(persistedDeal?.stage, 'new');
    assert.equal(persistedDeal?.value, 20_000_000);
  } finally {
    const db = getPostgresPool();
    await db.query('DELETE FROM crm_deals WHERE id = $1', [dealId]);
    await db.query('DELETE FROM clients WHERE id = $1', [clientId]);
    await db.query('DELETE FROM leads WHERE id = $1', [leadId]);
    await closePostgresPool();
  }
});
