import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { GoogleGenAI } from '@google/genai';
import { 
  getDatabase, 
  saveDatabase, 
  recordAuditLog, 
  hashPassword, 
  generateSalt, 
  StoredUser 
} from './db';
import { 
  authenticate, 
  requireAuth, 
  requirePermission, 
  createSession, 
  revokeSession, 
  checkLockout, 
  recordFailedLogin, 
  clearLockout, 
  AuthenticatedRequest, 
  rateLimitPublic 
} from './auth';

export const apiRouter = Router();

// Apply auth header checking on all API requests
apiRouter.use(authenticate);

// ----------------------------------------------------
// 1. AUTHENTICATION & SESSION MANAGEMENT
// ----------------------------------------------------

apiRouter.post('/auth/login', (req: Request, res: Response): void => {
  const { identifier, password, rememberMe } = req.body;
  const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
  const userAgent = req.headers['user-agent'] || 'unknown';

  if (!identifier || !password) {
    res.status(400).json({ success: false, error: 'Username/email and password are required.' });
    return;
  }

  const cleanIdentifier = String(identifier).trim().toLowerCase();
  const lockout = checkLockout(cleanIdentifier);
  if (lockout.isLocked) {
    res.status(429).json({
      success: false,
      error: `Security Lockout: Too many failed login attempts. Please try again in ${lockout.remainingSeconds}s.`
    });
    return;
  }

  const db = getDatabase();
  const user = db.users.find(
    u => u.username.toLowerCase() === cleanIdentifier || u.email.toLowerCase() === cleanIdentifier
  );

  if (!user || user.status === 'suspended') {
    recordFailedLogin(cleanIdentifier);
    recordAuditLog({
      action: 'LOGIN_FAILED',
      actor: cleanIdentifier,
      actorRole: 'anonymous',
      ip,
      userAgent,
      details: 'Failed login attempt: Account not found or suspended.',
      severity: 'warning'
    });
    res.status(401).json({ success: false, error: 'Invalid username/email or password.' });
    return;
  }

  // Password verification: PBKDF2 with user's unique salt
  const computedHash = hashPassword(password, user.salt);
  if (computedHash !== user.passwordHash) {
    recordFailedLogin(cleanIdentifier);
    recordAuditLog({
      action: 'LOGIN_FAILED',
      actor: user.username,
      actorRole: user.role,
      ip,
      userAgent,
      details: 'Failed login attempt: Incorrect password.',
      severity: 'warning'
    });
    res.status(401).json({ success: false, error: 'Invalid username/email or password.' });
    return;
  }

  // Success
  clearLockout(cleanIdentifier);
  const nowIso = new Date().toISOString();
  user.lastLogin = nowIso;
  const session = createSession(user, ip, userAgent, Boolean(rememberMe));

  recordAuditLog({
    action: 'LOGIN_SUCCESS',
    actor: user.username,
    actorRole: user.role,
    ip,
    userAgent,
    details: `User ${user.username} authenticated successfully.`,
    severity: 'info'
  });

  res.json({
    success: true,
    token: session.token,
    user: {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
      stakeholderType: user.stakeholderType,
      permissions: user.permissions,
      division: user.division,
      mfaEnabled: user.mfaEnabled,
      lastLogin: user.lastLogin
    }
  });
});

apiRouter.post('/auth/logout', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  if (req.sessionToken) {
    revokeSession(req.sessionToken);
  }
  if (req.user) {
    recordAuditLog({
      action: 'LOGOUT',
      actor: req.user.username,
      actorRole: req.user.role,
      ip: req.ip,
      userAgent: req.headers['user-agent'] as string,
      details: `User ${req.user.username} logged out.`,
      severity: 'info'
    });
  }
  res.json({ success: true, message: 'Logged out successfully.' });
});

apiRouter.get('/auth/me', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  const user = req.user!;
  res.json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
      stakeholderType: user.stakeholderType,
      permissions: user.permissions,
      division: user.division,
      mfaEnabled: user.mfaEnabled,
      lastLogin: user.lastLogin
    }
  });
});

apiRouter.post('/auth/change-password', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  const { currentPassword, newPassword } = req.body;
  const user = req.user!;

  if (!currentPassword || !newPassword) {
    res.status(400).json({ success: false, error: 'Current password and new password are required.' });
    return;
  }

  if (newPassword.length < 8) {
    res.status(400).json({ success: false, error: 'New password must be at least 8 characters.' });
    return;
  }

  const currentHash = hashPassword(currentPassword, user.salt);
  if (currentHash !== user.passwordHash) {
    res.status(400).json({ success: false, error: 'Current password is incorrect.' });
    return;
  }

  const db = getDatabase();
  const dbUser = db.users.find(u => u.id === user.id);
  if (dbUser) {
    const newSalt = generateSalt();
    dbUser.salt = newSalt;
    dbUser.passwordHash = hashPassword(newPassword, newSalt);
    saveDatabase(db);

    recordAuditLog({
      action: 'PASSWORD_CHANGED',
      actor: user.username,
      actorRole: user.role,
      ip: req.ip,
      userAgent: req.headers['user-agent'] as string,
      details: `User ${user.username} changed their password.`,
      severity: 'info'
    });
  }

  res.json({ success: true, message: 'Password updated successfully.' });
});

// Admin Account Management (Requires Master or canManageAdminAccounts permission)
apiRouter.get('/auth/users', requireAuth, requirePermission('canManageAdminAccounts'), (req: AuthenticatedRequest, res: Response): void => {
  const db = getDatabase();
  const sanitizedUsers = db.users.map(u => ({
    id: u.id,
    name: u.name,
    username: u.username,
    email: u.email,
    role: u.role,
    stakeholderType: u.stakeholderType,
    permissions: u.permissions,
    division: u.division,
    mfaEnabled: u.mfaEnabled,
    status: u.status,
    lastLogin: u.lastLogin,
    createdAt: u.createdAt
  }));
  res.json({ success: true, users: sanitizedUsers });
});

apiRouter.post('/auth/users', requireAuth, requirePermission('canManageAdminAccounts'), (req: AuthenticatedRequest, res: Response): void => {
  const { name, username, email, password, role, stakeholderType, division, permissions } = req.body;
  if (!name || !username || !email || !password) {
    res.status(400).json({ success: false, error: 'Name, username, email, and password are required.' });
    return;
  }

  const cleanUsername = String(username).trim().toLowerCase();
  const cleanEmail = String(email).trim().toLowerCase();

  const db = getDatabase();
  if (db.users.some(u => u.username.toLowerCase() === cleanUsername || u.email.toLowerCase() === cleanEmail)) {
    res.status(400).json({ success: false, error: 'Username or email already exists.' });
    return;
  }

  const salt = generateSalt();
  const newUser: StoredUser = {
    id: `usr_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
    name,
    username: cleanUsername,
    email: cleanEmail,
    passwordHash: hashPassword(password, salt),
    salt,
    role: role || 'Tier 3: Operational Staff',
    stakeholderType: stakeholderType || 'Operations',
    permissions: permissions || {
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
    division: division || 'Operations',
    status: 'active',
    lastLogin: new Date().toISOString(),
    createdAt: new Date().toISOString()
  };

  db.users.push(newUser);
  saveDatabase(db);

  recordAuditLog({
    action: 'ACCOUNT_CREATED',
    actor: req.user!.username,
    actorRole: req.user!.role,
    ip: req.ip,
    userAgent: req.headers['user-agent'] as string,
    details: `Created admin user "${newUser.username}" (${newUser.role}).`,
    severity: 'info'
  });

  res.json({ success: true, user: { id: newUser.id, username: newUser.username } });
});

apiRouter.delete('/auth/users/:id', requireAuth, requirePermission('canManageAdminAccounts'), (req: AuthenticatedRequest, res: Response): void => {
  const { id } = req.params;
  const db = getDatabase();
  const target = db.users.find(u => u.id === id);

  if (!target) {
    res.status(404).json({ success: false, error: 'User not found.' });
    return;
  }

  if (target.stakeholderType === 'Master' || target.username === 'admin') {
    res.status(403).json({ success: false, error: 'Cannot delete the Root Master Admin account.' });
    return;
  }

  db.users = db.users.filter(u => u.id !== id);
  db.sessions = db.sessions.filter(s => s.userId !== id);
  saveDatabase(db);

  recordAuditLog({
    action: 'ACCOUNT_DELETED',
    actor: req.user!.username,
    actorRole: req.user!.role,
    ip: req.ip,
    userAgent: req.headers['user-agent'] as string,
    details: `Deleted user "${target.username}".`,
    severity: 'warning'
  });

  res.json({ success: true, message: 'User deleted.' });
});

apiRouter.put('/auth/users/:id', requireAuth, requirePermission('canManageAdminAccounts'), (req: AuthenticatedRequest, res: Response): void => {
  const { id } = req.params;
  const updates = req.body;
  const db = getDatabase();
  const target = db.users.find(u => u.id === id);

  if (!target) {
    res.status(404).json({ success: false, error: 'User not found.' });
    return;
  }

  if (updates.permissions) {
    target.permissions = { ...target.permissions, ...updates.permissions };
  }
  if (updates.role) target.role = updates.role;
  if (updates.division) target.division = updates.division;
  if (updates.status) target.status = updates.status;
  if (updates.name) target.name = updates.name;

  saveDatabase(db);

  recordAuditLog({
    action: 'ACCOUNT_UPDATED',
    actor: req.user!.username,
    actorRole: req.user!.role,
    ip: req.ip,
    userAgent: req.headers['user-agent'] as string,
    details: `Updated attributes/permissions for user "${target.username}".`,
    severity: 'info'
  });

  res.json({ success: true, user: { id: target.id, username: target.username } });
});

// ----------------------------------------------------
// 2. LEADS & CONTACT SUBMISSIONS
// ----------------------------------------------------

// Public submission form (Rate-limited, validated, and dispatches notification via server)
apiRouter.post('/leads/submit', rateLimitPublic(10, 60 * 1000), async (req: Request, res: Response): Promise<void> => {
  const { fullName, email, company, phone, services, budget, message, source, type, portfolioUrl, rateCard, specialty } = req.body;

  if (!fullName || !email || !message) {
    res.status(400).json({ success: false, error: 'Name, email, and message are required fields.' });
    return;
  }

  const cleanEmail = String(email).trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    res.status(400).json({ success: false, error: 'Invalid email address.' });
    return;
  }

  const db = getDatabase();
  const newLead = {
    id: `lead_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
    fullName: String(fullName).trim(),
    email: cleanEmail,
    company: company ? String(company).trim() : '',
    phone: phone ? String(phone).trim() : '',
    services: Array.isArray(services) ? services : [],
    budget: budget || '',
    message: String(message).trim(),
    status: 'new',
    source: source || 'Website Form',
    type: type || 'inquiry',
    portfolioUrl: portfolioUrl || '',
    rateCard: rateCard || '',
    specialty: specialty || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.leads.unshift(newLead);
  saveDatabase(db);

  recordAuditLog({
    action: 'LEAD_SUBMISSION',
    actor: cleanEmail,
    actorRole: 'public_lead',
    ip: req.ip,
    userAgent: req.headers['user-agent'] as string,
    details: `New inbound lead received from ${newLead.fullName} (${cleanEmail}).`,
    severity: 'info'
  });

  // Server-side automated notification dispatch (Telegram / Formspree) without exposing secrets to client!
  const notif = db.notificationSettings;
  if (notif.isTelegramActive && notif.telegramBotToken && notif.telegramChatId) {
    try {
      const text = `🔔 *New Kapitech Lead Received*\n\n` +
        `👤 *Name:* ${newLead.fullName}\n` +
        `🏢 *Company:* ${newLead.company || '-'}\n` +
        `✉️ *Email:* ${newLead.email}\n` +
        `📞 *Phone:* ${newLead.phone || '-'}\n` +
        `🛠️ *Services:* ${newLead.services.join(', ') || '-'}\n` +
        `💰 *Budget:* ${newLead.budget || '-'}\n\n` +
        `💬 *Message:*\n_${newLead.message.slice(0, 300)}_`;

      fetch(`https://api.telegram.org/bot${notif.telegramBotToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: notif.telegramChatId,
          text,
          parse_mode: 'Markdown'
        })
      }).catch(err => console.debug('Telegram notification dispatch failed:', err));
    } catch (err) {
      console.debug('Telegram dispatch error:', err);
    }
  }

  res.json({ success: true, message: 'Inquiry submitted successfully.', id: newLead.id });
});

apiRouter.get('/leads', requireAuth, requirePermission('canManageCrm'), (req: AuthenticatedRequest, res: Response): void => {
  const db = getDatabase();
  res.json({ success: true, leads: db.leads });
});

apiRouter.put('/leads/:id', requireAuth, requirePermission('canManageCrm'), (req: AuthenticatedRequest, res: Response): void => {
  const { id } = req.params;
  const updates = req.body;
  const db = getDatabase();
  const idx = db.leads.findIndex(l => l.id === id);

  if (idx === -1) {
    res.status(404).json({ success: false, error: 'Lead not found.' });
    return;
  }

  db.leads[idx] = { ...db.leads[idx], ...updates, updatedAt: new Date().toISOString() };
  saveDatabase(db);

  recordAuditLog({
    action: 'LEAD_UPDATED',
    actor: req.user!.username,
    actorRole: req.user!.role,
    ip: req.ip,
    userAgent: req.headers['user-agent'] as string,
    details: `Updated lead ${db.leads[idx].fullName} (status: ${db.leads[idx].status}).`,
    severity: 'info'
  });

  res.json({ success: true, lead: db.leads[idx] });
});

apiRouter.delete('/leads/:id', requireAuth, requirePermission('canManageCrm'), (req: AuthenticatedRequest, res: Response): void => {
  const { id } = req.params;
  const db = getDatabase();
  const lead = db.leads.find(l => l.id === id);
  if (!lead) {
    res.status(404).json({ success: false, error: 'Lead not found.' });
    return;
  }

  db.leads = db.leads.filter(l => l.id !== id);
  saveDatabase(db);

  recordAuditLog({
    action: 'LEAD_DELETED',
    actor: req.user!.username,
    actorRole: req.user!.role,
    ip: req.ip,
    userAgent: req.headers['user-agent'] as string,
    details: `Deleted lead ${lead.fullName} (${lead.email}).`,
    severity: 'warning'
  });

  res.json({ success: true, message: 'Lead removed.' });
});

// Convert Lead to Client & CRM Deal
apiRouter.post('/leads/:id/convert', requireAuth, requirePermission('canManageCrm'), (req: AuthenticatedRequest, res: Response): void => {
  const { id } = req.params;
  const db = getDatabase();
  const lead = db.leads.find(l => l.id === id);
  if (!lead) {
    res.status(404).json({ success: false, error: 'Lead not found.' });
    return;
  }

  // Create Client if not already existing
  let client = db.clients.find(c => c.email.toLowerCase() === lead.email.toLowerCase());
  if (!client) {
    client = {
      id: `cli_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
      companyName: lead.company || lead.fullName,
      clientName: lead.fullName,
      email: lead.email,
      phone: lead.phone || '',
      address: '',
      status: 'active',
      tier: 'Standard',
      totalProjects: 1,
      totalInvoiced: 0,
      activeRetainer: false,
      notes: `Converted from inbound lead on ${new Date().toLocaleDateString('id-ID')}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.clients.push(client);
  }

  // Create CRM Deal
  const deal = {
    id: `deal_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
    title: `${lead.company || lead.fullName} - ${lead.services?.join(', ') || 'Digital Project'}`,
    clientName: lead.fullName,
    company: lead.company || lead.fullName,
    value: 50000000,
    stage: 'qualified',
    probability: 60,
    owner: req.user!.name || req.user!.username,
    expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: lead.message,
    priority: 'high',
    source: lead.source || 'Website',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  db.crmDeals.push(deal);

  lead.status = 'closed';
  lead.updatedAt = new Date().toISOString();
  saveDatabase(db);

  recordAuditLog({
    action: 'LEAD_CONVERTED',
    actor: req.user!.username,
    actorRole: req.user!.role,
    ip: req.ip,
    userAgent: req.headers['user-agent'] as string,
    details: `Converted lead "${lead.fullName}" into Client & CRM Deal.`,
    severity: 'info'
  });

  res.json({ success: true, client, deal });
});

// ----------------------------------------------------
// 3. CRM PIPELINE & DEALS
// ----------------------------------------------------

apiRouter.get('/crm/deals', requireAuth, requirePermission('canManageCrm'), (req: AuthenticatedRequest, res: Response): void => {
  const db = getDatabase();
  res.json({ success: true, deals: db.crmDeals });
});

apiRouter.post('/crm/deals', requireAuth, requirePermission('canManageCrm'), (req: AuthenticatedRequest, res: Response): void => {
  const dealData = req.body;
  const db = getDatabase();
  const newDeal = {
    id: `deal_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
    ...dealData,
    value: Number(dealData.value) || 0,
    probability: Number(dealData.probability) || 50,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  db.crmDeals.unshift(newDeal);
  saveDatabase(db);

  res.json({ success: true, deal: newDeal });
});

apiRouter.put('/crm/deals/:id', requireAuth, requirePermission('canManageCrm'), (req: AuthenticatedRequest, res: Response): void => {
  const { id } = req.params;
  const updates = req.body;
  const db = getDatabase();
  const idx = db.crmDeals.findIndex(d => d.id === id);
  if (idx === -1) {
    res.status(404).json({ success: false, error: 'Deal not found.' });
    return;
  }
  db.crmDeals[idx] = { ...db.crmDeals[idx], ...updates, updatedAt: new Date().toISOString() };
  saveDatabase(db);
  res.json({ success: true, deal: db.crmDeals[idx] });
});

apiRouter.delete('/crm/deals/:id', requireAuth, requirePermission('canManageCrm'), (req: AuthenticatedRequest, res: Response): void => {
  const { id } = req.params;
  const db = getDatabase();
  db.crmDeals = db.crmDeals.filter(d => d.id !== id);
  saveDatabase(db);
  res.json({ success: true, message: 'Deal deleted.' });
});

// ----------------------------------------------------
// 4. CLIENTS MANAGEMENT
// ----------------------------------------------------

apiRouter.get('/clients', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  const db = getDatabase();
  res.json({ success: true, clients: db.clients });
});

apiRouter.post('/clients', requireAuth, requirePermission('canManageClients'), (req: AuthenticatedRequest, res: Response): void => {
  const clientData = req.body;
  const db = getDatabase();
  const newClient = {
    id: `cli_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
    ...clientData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  db.clients.unshift(newClient);
  saveDatabase(db);

  recordAuditLog({
    action: 'CLIENT_CREATED',
    actor: req.user!.username,
    actorRole: req.user!.role,
    ip: req.ip,
    userAgent: req.headers['user-agent'] as string,
    details: `Created client "${newClient.companyName || newClient.clientName}".`,
    severity: 'info'
  });

  res.json({ success: true, client: newClient });
});

apiRouter.put('/clients/:id', requireAuth, requirePermission('canManageClients'), (req: AuthenticatedRequest, res: Response): void => {
  const { id } = req.params;
  const updates = req.body;
  const db = getDatabase();
  const idx = db.clients.findIndex(c => c.id === id);
  if (idx === -1) {
    res.status(404).json({ success: false, error: 'Client not found.' });
    return;
  }
  db.clients[idx] = { ...db.clients[idx], ...updates, updatedAt: new Date().toISOString() };
  saveDatabase(db);
  res.json({ success: true, client: db.clients[idx] });
});

apiRouter.delete('/clients/:id', requireAuth, requirePermission('canManageClients'), (req: AuthenticatedRequest, res: Response): void => {
  const { id } = req.params;
  const db = getDatabase();
  db.clients = db.clients.filter(c => c.id !== id);
  saveDatabase(db);
  res.json({ success: true, message: 'Client deleted.' });
});

// ----------------------------------------------------
// 5. PROJECTS MANAGEMENT
// ----------------------------------------------------

apiRouter.get('/projects', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  const db = getDatabase();
  res.json({ success: true, projects: db.projects });
});

apiRouter.post('/projects', requireAuth, requirePermission('canManageProjects'), (req: AuthenticatedRequest, res: Response): void => {
  const projectData = req.body;
  const db = getDatabase();
  const newProject = {
    id: `proj_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
    ...projectData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  db.projects.unshift(newProject);
  saveDatabase(db);
  res.json({ success: true, project: newProject });
});

apiRouter.put('/projects/:id', requireAuth, requirePermission('canManageProjects'), (req: AuthenticatedRequest, res: Response): void => {
  const { id } = req.params;
  const updates = req.body;
  const db = getDatabase();
  const idx = db.projects.findIndex(p => p.id === id);
  if (idx === -1) {
    res.status(404).json({ success: false, error: 'Project not found.' });
    return;
  }
  db.projects[idx] = { ...db.projects[idx], ...updates, updatedAt: new Date().toISOString() };
  saveDatabase(db);
  res.json({ success: true, project: db.projects[idx] });
});

apiRouter.delete('/projects/:id', requireAuth, requirePermission('canManageProjects'), (req: AuthenticatedRequest, res: Response): void => {
  const { id } = req.params;
  const db = getDatabase();
  db.projects = db.projects.filter(p => p.id !== id);
  saveDatabase(db);
  res.json({ success: true, message: 'Project removed.' });
});

// ----------------------------------------------------
// 6. FINANCE, INVOICING & PAYMENTS (Server-Authoritative Calculations)
// ----------------------------------------------------

apiRouter.get('/finance/invoices', requireAuth, requirePermission('canViewFinancials'), (req: AuthenticatedRequest, res: Response): void => {
  const db = getDatabase();
  res.json({ success: true, invoices: db.invoices });
});

apiRouter.post('/finance/invoices', requireAuth, requirePermission('canManageInvoices'), (req: AuthenticatedRequest, res: Response): void => {
  const inv = req.body;
  const db = getDatabase();

  // Authoritative server-side calculations
  const items = Array.isArray(inv.items) ? inv.items : [];
  const computedSubtotal = items.reduce((acc: number, it: any) => acc + (Number(it.quantity || 1) * Number(it.unitPrice || 0)), 0);
  const taxPercent = Number(inv.taxPercent) || 11;
  const taxAmount = Math.round(computedSubtotal * (taxPercent / 100));
  const total = computedSubtotal + taxAmount;
  const payments = Array.isArray(inv.payments) ? inv.payments : [];
  const amountPaid = payments.reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0);
  const balanceDue = Math.max(0, total - amountPaid);

  let status = inv.status || 'draft';
  if (amountPaid >= total && total > 0) {
    status = 'paid';
  } else if (amountPaid > 0) {
    status = 'partially_paid';
  }

  const newInvoice = {
    id: inv.id || `inv_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
    invoiceNumber: inv.invoiceNumber || `INV-KAPI-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    clientName: inv.clientName || 'Client',
    clientCompany: inv.clientCompany || '',
    clientEmail: inv.clientEmail || '',
    issueDate: inv.issueDate || new Date().toISOString().split('T')[0],
    dueDate: inv.dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status,
    items,
    subtotal: computedSubtotal,
    taxPercent,
    taxAmount,
    total,
    amountPaid,
    balanceDue,
    payments,
    notes: inv.notes || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.invoices.unshift(newInvoice);
  saveDatabase(db);

  recordAuditLog({
    action: 'INVOICE_CREATED',
    actor: req.user!.username,
    actorRole: req.user!.role,
    ip: req.ip,
    userAgent: req.headers['user-agent'] as string,
    details: `Created invoice ${newInvoice.invoiceNumber} for ${newInvoice.clientName} (Total: ${newInvoice.total}).`,
    severity: 'info'
  });

  res.json({ success: true, invoice: newInvoice });
});

apiRouter.put('/finance/invoices/:id', requireAuth, requirePermission('canManageInvoices'), (req: AuthenticatedRequest, res: Response): void => {
  const { id } = req.params;
  const inv = req.body;
  const db = getDatabase();
  const idx = db.invoices.findIndex(i => i.id === id);

  if (idx === -1) {
    res.status(404).json({ success: false, error: 'Invoice not found.' });
    return;
  }

  const existing = db.invoices[idx];
  const items = Array.isArray(inv.items) ? inv.items : existing.items;
  const computedSubtotal = items.reduce((acc: number, it: any) => acc + (Number(it.quantity || 1) * Number(it.unitPrice || 0)), 0);
  const taxPercent = inv.taxPercent !== undefined ? Number(inv.taxPercent) : existing.taxPercent;
  const taxAmount = Math.round(computedSubtotal * (taxPercent / 100));
  const total = computedSubtotal + taxAmount;
  const payments = Array.isArray(inv.payments) ? inv.payments : existing.payments || [];
  const amountPaid = payments.reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0);
  const balanceDue = Math.max(0, total - amountPaid);

  let status = inv.status || existing.status;
  if (amountPaid >= total && total > 0) {
    status = 'paid';
  } else if (amountPaid > 0 && status !== 'cancelled') {
    status = 'partially_paid';
  }

  db.invoices[idx] = {
    ...existing,
    ...inv,
    items,
    subtotal: computedSubtotal,
    taxPercent,
    taxAmount,
    total,
    amountPaid,
    balanceDue,
    payments,
    status,
    updatedAt: new Date().toISOString()
  };

  saveDatabase(db);

  recordAuditLog({
    action: 'INVOICE_UPDATED',
    actor: req.user!.username,
    actorRole: req.user!.role,
    ip: req.ip,
    userAgent: req.headers['user-agent'] as string,
    details: `Updated invoice ${db.invoices[idx].invoiceNumber} (Status: ${status}).`,
    severity: 'info'
  });

  res.json({ success: true, invoice: db.invoices[idx] });
});

// Record Invoice Payment (Partial or Full)
apiRouter.post('/finance/invoices/:id/pay', requireAuth, requirePermission('canManageInvoices'), (req: AuthenticatedRequest, res: Response): void => {
  const { id } = req.params;
  const { amount, date, method, reference, notes } = req.body;
  const payAmount = Number(amount);

  if (!payAmount || payAmount <= 0) {
    res.status(400).json({ success: false, error: 'Valid payment amount is required.' });
    return;
  }

  const db = getDatabase();
  const invoice = db.invoices.find(i => i.id === id);
  if (!invoice) {
    res.status(404).json({ success: false, error: 'Invoice not found.' });
    return;
  }

  const paymentRecord = {
    id: `pay_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
    amount: payAmount,
    date: date || new Date().toISOString().split('T')[0],
    method: method || 'bank_transfer',
    reference: reference || '',
    recordedBy: req.user!.name || req.user!.username,
    notes: notes || ''
  };

  if (!Array.isArray(invoice.payments)) {
    invoice.payments = [];
  }
  invoice.payments.push(paymentRecord);

  const totalPaid = invoice.payments.reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0);
  invoice.amountPaid = totalPaid;
  invoice.balanceDue = Math.max(0, invoice.total - totalPaid);

  if (invoice.balanceDue <= 0) {
    invoice.status = 'paid';
  } else {
    invoice.status = 'partially_paid';
  }
  invoice.updatedAt = new Date().toISOString();

  saveDatabase(db);

  recordAuditLog({
    action: 'PAYMENT_RECORDED',
    actor: req.user!.username,
    actorRole: req.user!.role,
    ip: req.ip,
    userAgent: req.headers['user-agent'] as string,
    details: `Recorded payment of ${payAmount} for invoice ${invoice.invoiceNumber}. New status: ${invoice.status}.`,
    severity: 'info'
  });

  res.json({ success: true, invoice, payment: paymentRecord });
});

apiRouter.delete('/finance/invoices/:id', requireAuth, requirePermission('canManageInvoices'), (req: AuthenticatedRequest, res: Response): void => {
  const { id } = req.params;
  const db = getDatabase();
  const inv = db.invoices.find(i => i.id === id);
  if (!inv) {
    res.status(404).json({ success: false, error: 'Invoice not found.' });
    return;
  }

  db.invoices = db.invoices.filter(i => i.id !== id);
  saveDatabase(db);

  recordAuditLog({
    action: 'INVOICE_DELETED',
    actor: req.user!.username,
    actorRole: req.user!.role,
    ip: req.ip,
    userAgent: req.headers['user-agent'] as string,
    details: `Deleted invoice ${inv.invoiceNumber}.`,
    severity: 'warning'
  });

  res.json({ success: true, message: 'Invoice deleted.' });
});

// Expenses
apiRouter.get('/finance/expenses', requireAuth, requirePermission('canViewFinancials'), (req: AuthenticatedRequest, res: Response): void => {
  const db = getDatabase();
  res.json({ success: true, expenses: db.expenses });
});

apiRouter.post('/finance/expenses', requireAuth, requirePermission('canManageInvoices'), (req: AuthenticatedRequest, res: Response): void => {
  const exp = req.body;
  const db = getDatabase();
  const newExpense = {
    id: `exp_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
    ...exp,
    amount: Number(exp.amount) || 0,
    recordedBy: req.user!.name || req.user!.username,
    createdAt: new Date().toISOString()
  };
  db.expenses.unshift(newExpense);
  saveDatabase(db);
  res.json({ success: true, expense: newExpense });
});

apiRouter.delete('/finance/expenses/:id', requireAuth, requirePermission('canManageInvoices'), (req: AuthenticatedRequest, res: Response): void => {
  const { id } = req.params;
  const db = getDatabase();
  db.expenses = db.expenses.filter(e => e.id !== id);
  saveDatabase(db);
  res.json({ success: true, message: 'Expense deleted.' });
});

// Financial Metrics (Authoritative server-calculated metrics)
apiRouter.get('/finance/metrics', requireAuth, requirePermission('canViewFinancials'), (req: AuthenticatedRequest, res: Response): void => {
  const db = getDatabase();
  const invoices = db.invoices;
  const expenses = db.expenses;

  let totalRevenueCollected = 0;
  let totalBilled = 0;
  let totalOutstanding = 0;
  let paidCount = 0;
  let partiallyPaidCount = 0;
  let overdueCount = 0;
  let draftCount = 0;

  for (const inv of invoices) {
    totalBilled += inv.total || 0;
    const paid = inv.amountPaid || 0;
    totalRevenueCollected += paid;
    const due = inv.balanceDue !== undefined ? inv.balanceDue : Math.max(0, (inv.total || 0) - paid);
    if (inv.status !== 'paid' && inv.status !== 'cancelled') {
      totalOutstanding += due;
    }

    if (inv.status === 'paid') paidCount++;
    else if (inv.status === 'partially_paid') partiallyPaidCount++;
    else if (inv.status === 'overdue') overdueCount++;
    else if (inv.status === 'draft') draftCount++;
  }

  const totalExpense = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const netProfit = totalRevenueCollected - totalExpense;
  const profitMargin = totalRevenueCollected > 0 ? ((netProfit / totalRevenueCollected) * 100).toFixed(1) : '0';

  res.json({
    success: true,
    metrics: {
      totalRevenueCollected,
      totalBilled,
      totalOutstanding,
      totalExpense,
      netProfit,
      profitMargin,
      totalInvoicesCount: invoices.length,
      paidCount,
      partiallyPaidCount,
      overdueCount,
      draftCount
    }
  });
});

// ----------------------------------------------------
// 7. VENDORS MANAGEMENT
// ----------------------------------------------------

apiRouter.get('/vendors', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  const db = getDatabase();
  res.json({ success: true, vendors: db.vendors });
});

apiRouter.post('/vendors', requireAuth, requirePermission('canManageVendors'), (req: AuthenticatedRequest, res: Response): void => {
  const vendorData = req.body;
  const db = getDatabase();
  const newVendor = {
    id: `ven_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
    ...vendorData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  db.vendors.unshift(newVendor);
  saveDatabase(db);
  res.json({ success: true, vendor: newVendor });
});

apiRouter.put('/vendors/:id', requireAuth, requirePermission('canManageVendors'), (req: AuthenticatedRequest, res: Response): void => {
  const { id } = req.params;
  const updates = req.body;
  const db = getDatabase();
  const idx = db.vendors.findIndex(v => v.id === id);
  if (idx === -1) {
    res.status(404).json({ success: false, error: 'Vendor not found.' });
    return;
  }
  db.vendors[idx] = { ...db.vendors[idx], ...updates, updatedAt: new Date().toISOString() };
  saveDatabase(db);
  res.json({ success: true, vendor: db.vendors[idx] });
});

apiRouter.delete('/vendors/:id', requireAuth, requirePermission('canManageVendors'), (req: AuthenticatedRequest, res: Response): void => {
  const { id } = req.params;
  const db = getDatabase();
  db.vendors = db.vendors.filter(v => v.id !== id);
  saveDatabase(db);
  res.json({ success: true, message: 'Vendor deleted.' });
});

// ----------------------------------------------------
// 8. CMS (Services, Projects, Testimonials, Settings)
// ----------------------------------------------------

// CMS Services (Public GET for published services, protected mutations)
apiRouter.get('/cms/services', (req: Request, res: Response): void => {
  const db = getDatabase();
  // If user is authenticated admin, return all; otherwise return only published
  const authHeader = req.headers.authorization;
  const isAdmin = authHeader && authHeader.startsWith('Bearer ');
  const services = isAdmin ? db.cmsServices : db.cmsServices.filter(s => s.isPublished !== false);
  res.json({ success: true, services });
});

apiRouter.post('/cms/services', requireAuth, requirePermission('canManageCmsContent'), (req: AuthenticatedRequest, res: Response): void => {
  const item = req.body;
  const db = getDatabase();
  const newService = {
    id: item.id || `srv_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
    ...item,
    isPublished: item.isPublished !== undefined ? item.isPublished : true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  db.cmsServices.unshift(newService);
  saveDatabase(db);
  res.json({ success: true, service: newService });
});

apiRouter.put('/cms/services/:id', requireAuth, requirePermission('canManageCmsContent'), (req: AuthenticatedRequest, res: Response): void => {
  const { id } = req.params;
  const updates = req.body;
  const db = getDatabase();
  const idx = db.cmsServices.findIndex(s => s.id === id);
  if (idx === -1) {
    res.status(404).json({ success: false, error: 'Service not found.' });
    return;
  }
  db.cmsServices[idx] = { ...db.cmsServices[idx], ...updates, updatedAt: new Date().toISOString() };
  saveDatabase(db);
  res.json({ success: true, service: db.cmsServices[idx] });
});

apiRouter.delete('/cms/services/:id', requireAuth, requirePermission('canManageCmsContent'), (req: AuthenticatedRequest, res: Response): void => {
  const { id } = req.params;
  const db = getDatabase();
  db.cmsServices = db.cmsServices.filter(s => s.id !== id);
  saveDatabase(db);
  res.json({ success: true, message: 'Service deleted.' });
});

// CMS Projects
apiRouter.get('/cms/projects', (req: Request, res: Response): void => {
  const db = getDatabase();
  const authHeader = req.headers.authorization;
  const isAdmin = authHeader && authHeader.startsWith('Bearer ');
  const projects = isAdmin ? db.cmsProjects : db.cmsProjects.filter(p => p.isPublished !== false);
  res.json({ success: true, projects });
});

apiRouter.post('/cms/projects', requireAuth, requirePermission('canManageCmsContent'), (req: AuthenticatedRequest, res: Response): void => {
  const item = req.body;
  const db = getDatabase();
  const newProj = {
    id: item.id || `proj_cms_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
    ...item,
    isPublished: item.isPublished !== undefined ? item.isPublished : true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  db.cmsProjects.unshift(newProj);
  saveDatabase(db);
  res.json({ success: true, project: newProj });
});

apiRouter.put('/cms/projects/:id', requireAuth, requirePermission('canManageCmsContent'), (req: AuthenticatedRequest, res: Response): void => {
  const { id } = req.params;
  const updates = req.body;
  const db = getDatabase();
  const idx = db.cmsProjects.findIndex(p => p.id === id);
  if (idx === -1) {
    res.status(404).json({ success: false, error: 'Project not found.' });
    return;
  }
  db.cmsProjects[idx] = { ...db.cmsProjects[idx], ...updates, updatedAt: new Date().toISOString() };
  saveDatabase(db);
  res.json({ success: true, project: db.cmsProjects[idx] });
});

apiRouter.delete('/cms/projects/:id', requireAuth, requirePermission('canManageCmsContent'), (req: AuthenticatedRequest, res: Response): void => {
  const { id } = req.params;
  const db = getDatabase();
  db.cmsProjects = db.cmsProjects.filter(p => p.id !== id);
  saveDatabase(db);
  res.json({ success: true, message: 'Project deleted.' });
});

// CMS Testimonials
apiRouter.get('/cms/testimonials', (req: Request, res: Response): void => {
  const db = getDatabase();
  const authHeader = req.headers.authorization;
  const isAdmin = authHeader && authHeader.startsWith('Bearer ');
  const testimonials = isAdmin ? db.cmsTestimonials : db.cmsTestimonials.filter(t => t.isPublished !== false);
  res.json({ success: true, testimonials });
});

apiRouter.post('/cms/testimonials', requireAuth, requirePermission('canManageCmsContent'), (req: AuthenticatedRequest, res: Response): void => {
  const item = req.body;
  const db = getDatabase();
  const newTestimonial = {
    id: item.id || `test_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
    ...item,
    isPublished: item.isPublished !== undefined ? item.isPublished : true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  db.cmsTestimonials.unshift(newTestimonial);
  saveDatabase(db);
  res.json({ success: true, testimonial: newTestimonial });
});

apiRouter.put('/cms/testimonials/:id', requireAuth, requirePermission('canManageCmsContent'), (req: AuthenticatedRequest, res: Response): void => {
  const { id } = req.params;
  const updates = req.body;
  const db = getDatabase();
  const idx = db.cmsTestimonials.findIndex(t => t.id === id);
  if (idx === -1) {
    res.status(404).json({ success: false, error: 'Testimonial not found.' });
    return;
  }
  db.cmsTestimonials[idx] = { ...db.cmsTestimonials[idx], ...updates, updatedAt: new Date().toISOString() };
  saveDatabase(db);
  res.json({ success: true, testimonial: db.cmsTestimonials[idx] });
});

apiRouter.delete('/cms/testimonials/:id', requireAuth, requirePermission('canManageCmsContent'), (req: AuthenticatedRequest, res: Response): void => {
  const { id } = req.params;
  const db = getDatabase();
  db.cmsTestimonials = db.cmsTestimonials.filter(t => t.id !== id);
  saveDatabase(db);
  res.json({ success: true, message: 'Testimonial deleted.' });
});

// CMS Settings
apiRouter.get('/cms/settings', (req: Request, res: Response): void => {
  const db = getDatabase();
  res.json({ success: true, settings: db.cmsSettings });
});

apiRouter.put('/cms/settings', requireAuth, requirePermission('canManageCmsContent'), (req: AuthenticatedRequest, res: Response): void => {
  const db = getDatabase();
  db.cmsSettings = { ...db.cmsSettings, ...req.body, updatedAt: new Date().toISOString() };
  saveDatabase(db);
  res.json({ success: true, settings: db.cmsSettings });
});

// ----------------------------------------------------
// 9. AUDIT LOGS (Server-Side, Tamper-Resistant)
// ----------------------------------------------------

apiRouter.get('/audit-logs', requireAuth, requirePermission('canViewSecurityAuditLogs'), (req: AuthenticatedRequest, res: Response): void => {
  const db = getDatabase();
  res.json({ success: true, logs: db.auditLogs });
});

// ----------------------------------------------------
// 10. NOTIFICATION SETTINGS (Secrets kept strictly on server)
// ----------------------------------------------------

apiRouter.get('/notifications/settings', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  const db = getDatabase();
  const s = db.notificationSettings;
  res.json({
    success: true,
    settings: {
      targetEmail: s.targetEmail,
      formspreeEndpoint: s.formspreeEndpoint,
      telegramChatId: s.telegramChatId,
      isEmailActive: s.isEmailActive,
      isTelegramActive: s.isTelegramActive,
      hasTelegramToken: Boolean(s.telegramBotToken && s.telegramBotToken.length > 5)
    }
  });
});

apiRouter.put('/notifications/settings', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  const { targetEmail, formspreeEndpoint, telegramBotToken, telegramChatId, isEmailActive, isTelegramActive } = req.body;
  const db = getDatabase();
  const current = db.notificationSettings;

  db.notificationSettings = {
    targetEmail: targetEmail || current.targetEmail,
    formspreeEndpoint: formspreeEndpoint !== undefined ? formspreeEndpoint : current.formspreeEndpoint,
    telegramBotToken: telegramBotToken ? String(telegramBotToken).trim() : current.telegramBotToken,
    telegramChatId: telegramChatId !== undefined ? String(telegramChatId).trim() : current.telegramChatId,
    isEmailActive: isEmailActive !== undefined ? Boolean(isEmailActive) : current.isEmailActive,
    isTelegramActive: isTelegramActive !== undefined ? Boolean(isTelegramActive) : current.isTelegramActive,
    updatedAt: new Date().toISOString()
  };

  saveDatabase(db);

  recordAuditLog({
    action: 'SETTINGS_UPDATED',
    actor: req.user!.username,
    actorRole: req.user!.role,
    ip: req.ip,
    userAgent: req.headers['user-agent'] as string,
    details: 'Updated notification and dispatch channel settings.',
    severity: 'info'
  });

  res.json({ success: true, message: 'Notification settings saved.' });
});

// ----------------------------------------------------
// 11. SERVER-SIDE GEMINI INTEGRATION (Key never exposed to browser)
// ----------------------------------------------------

apiRouter.post('/ai/generate', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { prompt, context } = req.body;
  if (!prompt) {
    res.status(400).json({ success: false, error: 'Prompt is required.' });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(503).json({
      success: false,
      error: 'Gemini AI service is not configured on server. Please set GEMINI_API_KEY.'
    });
    return;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `You are the executive AI copilot for Kapitech Agency Management System. Context: ${context || 'General Agency Operations'}. Request: ${prompt}`
            }
          ]
        }
      ]
    });

    const outputText = response.text || '';
    res.json({ success: true, result: outputText });
  } catch (err: any) {
    console.error('Server Gemini API call failed:', err);
    res.status(500).json({ success: false, error: err.message || 'Gemini AI execution failed.' });
  }
});

// ----------------------------------------------------
// 12. DATA MIGRATION: IMPORT FROM LEGACY LOCALSTORAGE
// ----------------------------------------------------

apiRouter.post('/migration/import-local', requireAuth, requirePermission('canRunDataMigration'), (req: AuthenticatedRequest, res: Response): void => {
  const { leads, clients, projects, invoices, expenses, vendors, cmsServices, cmsProjects, cmsTestimonials } = req.body;
  const db = getDatabase();
  let importedCount = 0;

  if (Array.isArray(leads) && leads.length > 0) {
    for (const lead of leads) {
      if (!db.leads.some(l => l.id === lead.id || l.email === lead.email)) {
        db.leads.push(lead);
        importedCount++;
      }
    }
  }

  if (Array.isArray(clients) && clients.length > 0) {
    for (const client of clients) {
      if (!db.clients.some(c => c.id === client.id)) {
        db.clients.push(client);
        importedCount++;
      }
    }
  }

  if (Array.isArray(projects) && projects.length > 0) {
    for (const project of projects) {
      if (!db.projects.some(p => p.id === project.id)) {
        db.projects.push(project);
        importedCount++;
      }
    }
  }

  if (Array.isArray(invoices) && invoices.length > 0) {
    for (const invoice of invoices) {
      if (!db.invoices.some(i => i.id === invoice.id || i.invoiceNumber === invoice.invoiceNumber)) {
        db.invoices.push(invoice);
        importedCount++;
      }
    }
  }

  if (Array.isArray(expenses) && expenses.length > 0) {
    for (const expense of expenses) {
      if (!db.expenses.some(e => e.id === expense.id)) {
        db.expenses.push(expense);
        importedCount++;
      }
    }
  }

  if (Array.isArray(vendors) && vendors.length > 0) {
    for (const vendor of vendors) {
      if (!db.vendors.some(v => v.id === vendor.id)) {
        db.vendors.push(vendor);
        importedCount++;
      }
    }
  }

  if (Array.isArray(cmsServices) && cmsServices.length > 0) {
    for (const srv of cmsServices) {
      if (!db.cmsServices.some(s => s.id === srv.id || s.slug === srv.slug)) {
        db.cmsServices.push(srv);
        importedCount++;
      }
    }
  }

  if (Array.isArray(cmsProjects) && cmsProjects.length > 0) {
    for (const proj of cmsProjects) {
      if (!db.cmsProjects.some(p => p.id === proj.id || p.slug === proj.slug)) {
        db.cmsProjects.push(proj);
        importedCount++;
      }
    }
  }

  if (Array.isArray(cmsTestimonials) && cmsTestimonials.length > 0) {
    for (const t of cmsTestimonials) {
      if (!db.cmsTestimonials.some(existing => existing.id === t.id)) {
        db.cmsTestimonials.push(t);
        importedCount++;
      }
    }
  }

  saveDatabase(db);

  recordAuditLog({
    action: 'DATA_MIGRATION',
    actor: req.user!.username,
    actorRole: req.user!.role,
    ip: req.ip,
    userAgent: req.headers['user-agent'] as string,
    details: `Imported and synchronized ${importedCount} records from legacy client storage into persistent database.`,
    severity: 'info'
  });

  res.json({
    success: true,
    importedCount,
    message: `Successfully migrated ${importedCount} records into the server database.`
  });
});
