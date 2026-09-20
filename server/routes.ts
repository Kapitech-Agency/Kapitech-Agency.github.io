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

apiRouter.post('/auth/login', rateLimitPublic(10, 15 * 60 * 1000), (req: Request, res: Response): void => {
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
    const lockoutState = checkLockout(cleanIdentifier);
    recordAuditLog({
      action: 'LOGIN_FAILED',
      actor: cleanIdentifier,
      actorRole: 'anonymous',
      ip,
      userAgent,
      details: 'Failed login attempt: Account not found or suspended.',
      severity: 'warning'
    });
    if (lockoutState.isLocked) {
      res.status(429).json({
        success: false,
        error: `Security Lockout: Too many failed login attempts. Please try again in ${lockoutState.remainingSeconds}s.`,
        remainingSeconds: lockoutState.remainingSeconds
      });
      return;
    }
    res.status(401).json({ success: false, error: 'Invalid username/email or password.' });
    return;
  }

  // Password verification: PBKDF2 with user's unique salt
  const computedHash = hashPassword(password, user.salt);
  if (computedHash !== user.passwordHash) {
    recordFailedLogin(cleanIdentifier);
    const lockoutState = checkLockout(cleanIdentifier);
    recordAuditLog({
      action: 'LOGIN_FAILED',
      actor: user.username,
      actorRole: user.role,
      ip,
      userAgent,
      details: 'Failed login attempt: Incorrect password.',
      severity: 'warning'
    });
    if (lockoutState.isLocked) {
      res.status(429).json({
        success: false,
        error: `Security Lockout: Too many failed login attempts. Please try again in ${lockoutState.remainingSeconds}s.`,
        remainingSeconds: lockoutState.remainingSeconds
      });
      return;
    }
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

  // Set secure HttpOnly session cookie
  const cookieMaxAge = rememberMe ? 30 * 24 * 3600 : 24 * 3600;
  res.setHeader(
    'Set-Cookie',
    `kapi_session=${session.token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${cookieMaxAge}; ${process.env.NODE_ENV === 'production' ? 'Secure;' : ''}`
  );

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
  res.setHeader('Set-Cookie', 'kapi_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0;');
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
apiRouter.post('/auth/verify-password', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  const { password } = req.body;
  const user = req.user!;
  if (!password || typeof password !== 'string') {
    res.status(400).json({ success: false, error: 'Password is required.' });
    return;
  }

  const computedHash = hashPassword(password, user.salt);
  if (computedHash !== user.passwordHash) {
    res.status(401).json({ success: false, error: 'Current password is incorrect.' });
    return;
  }

  res.json({ success: true });
});

apiRouter.get('/auth/users', requireAuth, requireMaster, (req: AuthenticatedRequest, res: Response): void => {
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

apiRouter.post('/auth/users', requireAuth, requireMaster, (req: AuthenticatedRequest, res: Response): void => {
  const { name, username, email, password, role, division } = req.body;
  const allowedRoles = new Set([
    'Stakeholder Executive',
    'Teknisi IT / Systems Engineer',
    'Tier 2: Project Manager (PM)',
    'Tier 3: Operational Staff',
    'Financial Officer'
  ]);
  const requestedRole = String(role || 'Tier 3: Operational Staff').trim();
  if (!allowedRoles.has(requestedRole)) {
    res.status(400).json({ success: false, error: 'Unsupported account role.' });
    return;
  }

  const rolePermissions: Record<string, StoredUser['permissions']> = {
    'Stakeholder Executive': {
      canViewFinancials: true, canManageInvoices: true, canApproveBudgets: true, canManageCrm: true,
      canManageProjects: true, canManageKanbanTasks: false, canManageClients: true, canManageVendors: true,
      canManageCmsContent: false, canAccessServerAndApi: false, canRunDataMigration: false,
      canViewSecurityAuditLogs: true, canManageAdminAccounts: false
    },
    'Financial Officer': {
      canViewFinancials: true, canManageInvoices: true, canApproveBudgets: true, canManageCrm: false,
      canManageProjects: false, canManageKanbanTasks: false, canManageClients: true, canManageVendors: true,
      canManageCmsContent: false, canAccessServerAndApi: false, canRunDataMigration: false,
      canViewSecurityAuditLogs: false, canManageAdminAccounts: false
    },
    'Tier 2: Project Manager (PM)': {
      canViewFinancials: false, canManageInvoices: false, canApproveBudgets: false, canManageCrm: true,
      canManageProjects: true, canManageKanbanTasks: true, canManageClients: true, canManageVendors: true,
      canManageCmsContent: false, canAccessServerAndApi: false, canRunDataMigration: false,
      canViewSecurityAuditLogs: false, canManageAdminAccounts: false
    },
    'Tier 3: Operational Staff': {
      canViewFinancials: false, canManageInvoices: false, canApproveBudgets: false, canManageCrm: false,
      canManageProjects: true, canManageKanbanTasks: true, canManageClients: false, canManageVendors: false,
      canManageCmsContent: false, canAccessServerAndApi: false, canRunDataMigration: false,
      canViewSecurityAuditLogs: false, canManageAdminAccounts: false
    },
    'Teknisi IT / Systems Engineer': {
      canViewFinancials: false, canManageInvoices: false, canApproveBudgets: false, canManageCrm: false,
      canManageProjects: false, canManageKanbanTasks: false, canManageClients: false, canManageVendors: false,
      canManageCmsContent: false, canAccessServerAndApi: true, canRunDataMigration: true,
      canViewSecurityAuditLogs: true, canManageAdminAccounts: false
    }
  };

  const resolvedStakeholderType =
    requestedRole === 'Stakeholder Executive' ? 'Executive' :
    requestedRole === 'Financial Officer' ? 'Operations' :
    requestedRole === 'Tier 2: Project Manager (PM)' ? 'Project_Manager' :
    requestedRole === 'Teknisi IT / Systems Engineer' ? 'IT_Technical' : 'Operations';

  const resolvedDivision =
    requestedRole === 'Financial Officer' ? 'Finance' :
    requestedRole === 'Teknisi IT / Systems Engineer' ? 'Engineering' :
    requestedRole === 'Stakeholder Executive' ? 'Management' :
    division === 'Design' ? 'Design' : 'Operations';
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
    role: requestedRole,
    stakeholderType: resolvedStakeholderType,
    permissions: rolePermissions[requestedRole],

    mfaEnabled: false,
    division: resolvedDivision,
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

apiRouter.delete('/auth/users/:id', requireAuth, requireMaster, (req: AuthenticatedRequest, res: Response): void => {
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

apiRouter.put('/auth/users/:id', requireAuth, requireMaster, (req: AuthenticatedRequest, res: Response): void => {
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

apiRouter.get('/clients', requireAuth, requireAnyPermission('canManageClients', 'canManageCrm'), (req: AuthenticatedRequest, res: Response): void => {
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

apiRouter.get('/projects', requireAuth, requireAnyPermission('canManageProjects', 'canManageKanbanTasks'), (req: AuthenticatedRequest, res: Response): void => {
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

apiRouter.get('/vendors', requireAuth, requireAnyPermission('canManageVendors', 'canViewFinancials'), (req: AuthenticatedRequest, res: Response): void => {
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

// CMS Services (Public GET for published services, protected for drafts)
apiRouter.get('/cms/services', (req: Request, res: Response): void => {
  const db = getDatabase();
  const user = (req as AuthenticatedRequest).user;
  const canManage = Boolean(user && (user.stakeholderType === 'Master' || user.permissions?.canManageCmsContent));
  const services = canManage ? db.cmsServices : db.cmsServices.filter(s => s.isPublished !== false);
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
  const user = (req as AuthenticatedRequest).user;
  const canManage = Boolean(user && (user.stakeholderType === 'Master' || user.permissions?.canManageCmsContent));
  const projects = canManage ? db.cmsProjects : db.cmsProjects.filter(p => p.isPublished !== false);
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
  const user = (req as AuthenticatedRequest).user;
  const canManage = Boolean(user && (user.stakeholderType === 'Master' || user.permissions?.canManageCmsContent));
  const testimonials = canManage ? db.cmsTestimonials : db.cmsTestimonials.filter(t => t.isPublished !== false);
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
apiRouter.get('/cms/settings', requireAuth, requirePermission('canManageCmsContent'), (req: AuthenticatedRequest, res: Response): void => {
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

apiRouter.get('/notifications/settings', requireAuth, requirePermission('canAccessServerAndApi'), (req: AuthenticatedRequest, res: Response): void => {
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

apiRouter.put('/notifications/settings', requireAuth, requirePermission('canAccessServerAndApi'), (req: AuthenticatedRequest, res: Response): void => {
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

apiRouter.post('/ai/generate', requireAuth, requirePermission('canAccessServerAndApi'), rateLimitAuthenticated(10, 60 * 1000), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { prompt, context } = req.body;
  if (!prompt || typeof prompt !== 'string' || prompt.length > 4000) {
    res.status(400).json({ success: false, error: 'Prompt is required and must be 4000 characters or fewer.' });
    return;
  }
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
              text: `You are the executive AI copilot for Kapitech Agency Management System. Context: ${typeof context === 'string' ? context.slice(0, 4000) : 'General Agency Operations'}. Request: ${prompt}`
            }
          ]
        }
      ]
    });

    const outputText = response.text || '';
    res.json({ success: true, result: outputText });
  } catch (err: any) {
    console.error('Server Gemini API call failed:', err);
    res.status(502).json({ success: false, error: 'AI service request failed. Please try again later.' });
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

// ----------------------------------------------------
// 13. PROPOSALS & QUOTATIONS (PART 12)
// ----------------------------------------------------

apiRouter.get('/crm/proposals', requireAuth, requirePermission('canManageCrm'), (req: AuthenticatedRequest, res: Response): void => {
  const db = getDatabase();
  res.json({ success: true, proposals: db.proposals || [] });
});

apiRouter.post('/crm/proposals', requireAuth, requirePermission('canManageCrm'), (req: AuthenticatedRequest, res: Response): void => {
  const data = req.body;
  const db = getDatabase();

  const items = Array.isArray(data.items) ? data.items : [];
  const subtotal = items.reduce((sum: number, it: any) => sum + (Number(it.quantity || 1) * Number(it.unitPrice || 0)), 0);
  const discount = Number(data.discount) || 0;
  const taxPercent = data.taxPercent !== undefined ? Number(data.taxPercent) : 11;
  const taxableAmount = Math.max(0, subtotal - discount);
  const tax = Math.round(taxableAmount * (taxPercent / 100));
  const total = taxableAmount + tax;

  const newProposal = {
    id: `prop_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
    proposalNumber: data.proposalNumber || `PROP-KAPI-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    title: data.title || 'Digital Engineering Proposal',
    clientName: data.clientName || 'Prospective Client',
    company: data.company || '',
    dealId: data.dealId || '',
    projectId: data.projectId || '',
    items,
    subtotal,
    discount,
    taxPercent,
    tax,
    total,
    currency: data.currency || 'IDR',
    validityPeriod: data.validityPeriod || '30 Days',
    paymentTerms: data.paymentTerms || '50% Upfront, 50% on Delivery',
    owner: req.user!.name || req.user!.username,
    status: data.status || 'Draft',
    notes: data.notes || '',
    createdDate: new Date().toISOString().split('T')[0],
    sentDate: data.sentDate || null,
    approvedDate: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  if (!db.proposals) db.proposals = [];
  db.proposals.unshift(newProposal);
  saveDatabase(db);

  recordAuditLog({
    action: 'PROPOSAL_CREATED',
    actor: req.user!.username,
    actorRole: req.user!.role,
    ip: req.ip,
    userAgent: req.headers['user-agent'] as string,
    details: `Created proposal ${newProposal.proposalNumber} for ${newProposal.clientName} (Total: ${newProposal.total}).`,
    severity: 'info'
  });

  res.json({ success: true, proposal: newProposal });
});

apiRouter.put('/crm/proposals/:id', requireAuth, requirePermission('canManageCrm'), (req: AuthenticatedRequest, res: Response): void => {
  const { id } = req.params;
  const updates = req.body;
  const db = getDatabase();
  const idx = (db.proposals || []).findIndex(p => p.id === id);

  if (idx === -1) {
    res.status(404).json({ success: false, error: 'Proposal not found.' });
    return;
  }

  const existing = db.proposals[idx];
  const items = Array.isArray(updates.items) ? updates.items : existing.items;
  const subtotal = items.reduce((sum: number, it: any) => sum + (Number(it.quantity || 1) * Number(it.unitPrice || 0)), 0);
  const discount = updates.discount !== undefined ? Number(updates.discount) : (existing.discount || 0);
  const taxPercent = updates.taxPercent !== undefined ? Number(updates.taxPercent) : (existing.taxPercent || 11);
  const taxableAmount = Math.max(0, subtotal - discount);
  const tax = Math.round(taxableAmount * (taxPercent / 100));
  const total = taxableAmount + tax;

  db.proposals[idx] = {
    ...existing,
    ...updates,
    items,
    subtotal,
    discount,
    taxPercent,
    tax,
    total,
    updatedAt: new Date().toISOString()
  };

  saveDatabase(db);
  res.json({ success: true, proposal: db.proposals[idx] });
});

apiRouter.post('/crm/proposals/:id/approve', requireAuth, requirePermission('canApproveBudgets'), (req: AuthenticatedRequest, res: Response): void => {
  const { id } = req.params;
  const db = getDatabase();
  const prop = (db.proposals || []).find(p => p.id === id);

  if (!prop) {
    res.status(404).json({ success: false, error: 'Proposal not found.' });
    return;
  }

  prop.status = 'Approved';
  prop.approvedDate = new Date().toISOString().split('T')[0];
  prop.updatedAt = new Date().toISOString();
  saveDatabase(db);

  recordAuditLog({
    action: 'PROPOSAL_APPROVED',
    actor: req.user!.username,
    actorRole: req.user!.role,
    ip: req.ip,
    userAgent: req.headers['user-agent'] as string,
    details: `Approved proposal ${prop.proposalNumber}.`,
    severity: 'info'
  });

  res.json({ success: true, proposal: prop });
});

apiRouter.post('/crm/proposals/:id/convert-to-invoice', requireAuth, requirePermission('canManageInvoices'), (req: AuthenticatedRequest, res: Response): void => {
  const { id } = req.params;
  const db = getDatabase();
  const prop = (db.proposals || []).find(p => p.id === id);

  if (!prop) {
    res.status(404).json({ success: false, error: 'Proposal not found.' });
    return;
  }

  const invoiceNumber = `INV-KAPI-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const newInvoice = {
    id: `inv_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
    invoiceNumber,
    clientName: prop.clientName,
    clientCompany: prop.company || prop.clientName,
    clientEmail: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'draft',
    items: prop.items,
    subtotal: prop.subtotal,
    taxPercent: prop.taxPercent,
    taxAmount: prop.tax,
    total: prop.total,
    amountPaid: 0,
    balanceDue: prop.total,
    payments: [],
    notes: `Generated from Proposal ${prop.proposalNumber}. Terms: ${prop.paymentTerms}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.invoices.unshift(newInvoice);
  prop.status = 'Accepted';
  prop.updatedAt = new Date().toISOString();
  saveDatabase(db);

  recordAuditLog({
    action: 'PROPOSAL_CONVERTED_TO_INVOICE',
    actor: req.user!.username,
    actorRole: req.user!.role,
    ip: req.ip,
    userAgent: req.headers['user-agent'] as string,
    details: `Converted proposal ${prop.proposalNumber} to invoice ${newInvoice.invoiceNumber}.`,
    severity: 'info'
  });

  res.json({ success: true, invoice: newInvoice, proposal: prop });
});

apiRouter.delete('/crm/proposals/:id', requireAuth, requirePermission('canManageCrm'), (req: AuthenticatedRequest, res: Response): void => {
  const { id } = req.params;
  const db = getDatabase();
  db.proposals = (db.proposals || []).filter(p => p.id !== id);
  saveDatabase(db);
  res.json({ success: true, message: 'Proposal deleted.' });
});

// ----------------------------------------------------
// 14. PROJECT TASKS & TIME TRACKING (PARTS 16, 17, 18)
// ----------------------------------------------------

apiRouter.get('/projects/tasks', requireAuth, requireAnyPermission('canManageKanbanTasks', 'canManageProjects'), (req: AuthenticatedRequest, res: Response): void => {
  const db = getDatabase();
  res.json({ success: true, tasks: db.tasks || [] });
});

apiRouter.post('/projects/tasks', requireAuth, requirePermission('canManageKanbanTasks'), (req: AuthenticatedRequest, res: Response): void => {
  const taskData = req.body;
  const db = getDatabase();
  const newTask = {
    id: `task_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
    title: taskData.title || 'Untitled Task',
    projectId: taskData.projectId || '',
    projectName: taskData.projectName || 'General Delivery',
    assignee: taskData.assignee || req.user!.name || req.user!.username,
    reporter: req.user!.name || req.user!.username,
    priority: taskData.priority || 'medium',
    status: taskData.status || 'todo',
    dueDate: taskData.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    estimatedHours: Number(taskData.estimatedHours) || 8,
    actualHours: Number(taskData.actualHours) || 0,
    tags: Array.isArray(taskData.tags) ? taskData.tags : ['Sprint'],
    subtasks: Array.isArray(taskData.subtasks) ? taskData.subtasks : [],
    description: taskData.description || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  if (!db.tasks) db.tasks = [];
  db.tasks.unshift(newTask);
  saveDatabase(db);
  res.json({ success: true, task: newTask });
});

apiRouter.put('/projects/tasks/:id', requireAuth, requirePermission('canManageKanbanTasks'), (req: AuthenticatedRequest, res: Response): void => {
  const { id } = req.params;
  const updates = req.body;
  const db = getDatabase();
  const idx = (db.tasks || []).findIndex(t => t.id === id);

  if (idx === -1) {
    res.status(404).json({ success: false, error: 'Task not found.' });
    return;
  }

  db.tasks[idx] = { ...db.tasks[idx], ...updates, updatedAt: new Date().toISOString() };
  saveDatabase(db);
  res.json({ success: true, task: db.tasks[idx] });
});

apiRouter.delete('/projects/tasks/:id', requireAuth, requirePermission('canManageKanbanTasks'), (req: AuthenticatedRequest, res: Response): void => {
  const { id } = req.params;
  const db = getDatabase();
  db.tasks = (db.tasks || []).filter(t => t.id !== id);
  saveDatabase(db);
  res.json({ success: true, message: 'Task deleted.' });
});

// Time Tracking
apiRouter.get('/projects/timelogs', requireAuth, requireAnyPermission('canManageKanbanTasks', 'canManageProjects'), (req: AuthenticatedRequest, res: Response): void => {
  const db = getDatabase();
  res.json({ success: true, timeLogs: db.timeLogs || [] });
});

apiRouter.post('/projects/timelogs', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  const logData = req.body;
  const db = getDatabase();
  const newLog = {
    id: `tim_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
    projectId: logData.projectId || '',
    projectName: logData.projectName || 'General',
    taskId: logData.taskId || '',
    taskTitle: logData.taskTitle || '',
    user: req.user!.name || req.user!.username,
    durationMinutes: Number(logData.durationMinutes) || 60,
    billable: logData.billable !== undefined ? Boolean(logData.billable) : true,
    date: logData.date || new Date().toISOString().split('T')[0],
    notes: logData.notes || '',
    createdAt: new Date().toISOString()
  };

  if (!db.timeLogs) db.timeLogs = [];
  db.timeLogs.unshift(newLog);
  saveDatabase(db);
  res.json({ success: true, timeLog: newLog });
});

apiRouter.delete('/projects/timelogs/:id', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  const { id } = req.params;
  const db = getDatabase();
  db.timeLogs = (db.timeLogs || []).filter(t => t.id !== id);
  saveDatabase(db);
  res.json({ success: true, message: 'Time entry deleted.' });
});

// ----------------------------------------------------
// 15. APPROVALS CENTER (PART 24)
// ----------------------------------------------------

apiRouter.get('/approvals', requireAuth, requireAnyPermission('canApproveBudgets', 'canManageProjects', 'canViewFinancials'), (req: AuthenticatedRequest, res: Response): void => {
  const db = getDatabase();
  res.json({ success: true, approvals: db.approvals || [] });
});

apiRouter.post('/approvals', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  const data = req.body;
  const db = getDatabase();
  const newApproval = {
    id: `appr_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
    type: data.type || 'Invoice',
    referenceId: data.referenceId || '',
    title: data.title || 'Approval Request',
    requester: req.user!.name || req.user!.username,
    requesterRole: req.user!.role,
    value: data.value || 0,
    date: new Date().toISOString().split('T')[0],
    reason: data.reason || 'Standard operational review',
    riskLevel: data.riskLevel || 'Low',
    status: 'Pending',
    createdAt: new Date().toISOString()
  };

  if (!db.approvals) db.approvals = [];
  db.approvals.unshift(newApproval);
  saveDatabase(db);
  res.json({ success: true, approval: newApproval });
});

apiRouter.post('/approvals/:id/action', requireAuth, requirePermission('canApproveBudgets'), (req: AuthenticatedRequest, res: Response): void => {
  const { id } = req.params;
  const { action, notes } = req.body; // 'Approve' | 'Reject' | 'Request Changes'
  const db = getDatabase();
  const item = (db.approvals || []).find(a => a.id === id);

  if (!item) {
    res.status(404).json({ success: false, error: 'Approval item not found.' });
    return;
  }

  item.status = action === 'Approve' ? 'Approved' : action === 'Reject' ? 'Rejected' : 'Changes Requested';
  item.reviewedBy = req.user!.name || req.user!.username;
  item.reviewedAt = new Date().toISOString();
  item.reviewNotes = notes || '';
  saveDatabase(db);

  recordAuditLog({
    action: `APPROVAL_${action.toUpperCase()}`,
    actor: req.user!.username,
    actorRole: req.user!.role,
    ip: req.ip,
    userAgent: req.headers['user-agent'] as string,
    details: `${action} decision executed for approval item "${item.title}".`,
    severity: 'info'
  });

  res.json({ success: true, approval: item });
});

// ----------------------------------------------------
// 16. DOCUMENTS & ASSET VAULT (PART 26)
// ----------------------------------------------------

apiRouter.get('/documents', requireAuth, requireAnyPermission('canManageProjects', 'canManageCrm', 'canViewFinancials', 'canViewSecurityAuditLogs'), (req: AuthenticatedRequest, res: Response): void => {
  const db = getDatabase();
  res.json({ success: true, documents: db.documents || [] });
});

apiRouter.post('/documents', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  const data = req.body;
  const db = getDatabase();
  const newDoc = {
    id: `doc_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
    name: data.name || 'Document',
    type: data.type || 'PDF',
    size: data.size || '1.2 MB',
    category: data.category || 'Contract',
    relatedEntity: data.relatedEntity || 'General',
    relatedId: data.relatedId || '',
    owner: req.user!.name || req.user!.username,
    url: data.url || '#',
    uploadedDate: new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString()
  };

  if (!db.documents) db.documents = [];
  db.documents.unshift(newDoc);
  saveDatabase(db);
  res.json({ success: true, document: newDoc });
});

apiRouter.delete('/documents/:id', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  const { id } = req.params;
  const db = getDatabase();
  db.documents = (db.documents || []).filter(d => d.id !== id);
  saveDatabase(db);
  res.json({ success: true, message: 'Document removed.' });
});

// ----------------------------------------------------
// 17. UNIFIED NOTIFICATIONS CENTER (PART 28)
// ----------------------------------------------------

apiRouter.get('/notifications', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  const db = getDatabase();
  res.json({ success: true, notifications: db.notifications || [] });
});

apiRouter.post('/notifications/:id/read', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  const { id } = req.params;
  const db = getDatabase();
  const notif = (db.notifications || []).find(n => n.id === id);
  if (notif) {
    notif.read = true;
    saveDatabase(db);
  }
  res.json({ success: true });
});

apiRouter.post('/notifications/mark-all-read', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  const db = getDatabase();
  (db.notifications || []).forEach(n => { n.read = true; });
  saveDatabase(db);
  res.json({ success: true });
});

// ----------------------------------------------------
// 18. UNIFIED GLOBAL SEARCH (PART 6)
// ----------------------------------------------------

apiRouter.get('/search', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  const q = String(req.query.q || '').trim().toLowerCase();
  if (!q) {
    res.json({ success: true, results: [] });
    return;
  }

  const db = getDatabase();
  const results: any[] = [];

  // Leads
  if (req.user!.permissions.canManageCrm || req.user!.stakeholderType === 'Master') {
    for (const lead of db.leads || []) {
      if (
        (lead.fullName && lead.fullName.toLowerCase().includes(q)) ||
        (lead.company && lead.company.toLowerCase().includes(q)) ||
        (lead.email && lead.email.toLowerCase().includes(q))
      ) {
        results.push({
          type: 'Lead',
          id: lead.id,
          name: `${lead.fullName} (${lead.company || 'Inquiry'})`,
          status: lead.status,
          owner: lead.email,
          lastUpdated: lead.updatedAt || lead.createdAt,
          url: '/admin/inbox'
        });
      }
    }
  }

  // Deals
  if (req.user!.permissions.canManageCrm || req.user!.stakeholderType === 'Master') {
    for (const deal of db.crmDeals || []) {
      if (
        (deal.title && deal.title.toLowerCase().includes(q)) ||
        (deal.company && deal.company.toLowerCase().includes(q)) ||
        (deal.clientName && deal.clientName.toLowerCase().includes(q))
      ) {
        results.push({
          type: 'Deal',
          id: deal.id,
          name: deal.title || deal.company,
          status: deal.stage,
          owner: deal.owner || 'Unassigned',
          lastUpdated: deal.updatedAt || deal.createdAt,
          url: '/admin/crm'
        });
      }
    }
  }

  // Clients
  if (req.user!.permissions.canManageClients || req.user!.stakeholderType === 'Master') {
    for (const cli of db.clients || []) {
      if (
        (cli.companyName && cli.companyName.toLowerCase().includes(q)) ||
        (cli.clientName && cli.clientName.toLowerCase().includes(q)) ||
        (cli.email && cli.email.toLowerCase().includes(q))
      ) {
        results.push({
          type: 'Client',
          id: cli.id,
          name: cli.companyName || cli.clientName,
          status: cli.status,
          owner: cli.email,
          lastUpdated: cli.updatedAt || cli.createdAt,
          url: '/admin/clients'
        });
      }
    }
  }

  // Projects
  if (req.user!.permissions.canManageProjects || req.user!.stakeholderType === 'Master') {
    for (const proj of db.projects || []) {
      if (
        (proj.title && proj.title.toLowerCase().includes(q)) ||
        (proj.client && proj.client.toLowerCase().includes(q))
      ) {
        results.push({
          type: 'Project',
          id: proj.id,
          name: proj.title,
          status: proj.status || proj.health || 'Active',
          owner: proj.client,
          lastUpdated: proj.updatedAt || proj.createdAt,
          url: '/admin/projects'
        });
      }
    }
  }

  // Invoices
  if (req.user!.permissions.canViewFinancials || req.user!.stakeholderType === 'Master') {
    for (const inv of db.invoices || []) {
      if (
        (inv.invoiceNumber && inv.invoiceNumber.toLowerCase().includes(q)) ||
        (inv.clientName && inv.clientName.toLowerCase().includes(q)) ||
        (inv.clientCompany && inv.clientCompany.toLowerCase().includes(q))
      ) {
        results.push({
          type: 'Invoice',
          id: inv.id,
          name: `${inv.invoiceNumber} - ${inv.clientCompany || inv.clientName}`,
          status: inv.status,
          owner: `IDR ${(inv.total || 0).toLocaleString()}`,
          lastUpdated: inv.updatedAt || inv.createdAt,
          url: '/admin/invoicing'
        });
      }
    }
  }

  // Proposals
  const canSearchProposals = req.user!.stakeholderType === 'Master' ||
    Boolean(req.user!.permissions.canManageCrm || req.user!.permissions.canManageInvoices || req.user!.permissions.canApproveBudgets);

  if (canSearchProposals) {
    for (const prop of db.proposals || []) {
      if (
        (prop.proposalNumber && prop.proposalNumber.toLowerCase().includes(q)) ||
        (prop.clientName && prop.clientName.toLowerCase().includes(q)) ||
        (prop.title && prop.title.toLowerCase().includes(q))
      ) {
        results.push({
          type: 'Proposal',
          id: prop.id,
          name: `${prop.proposalNumber} - `${prop.title}`,
          status: prop.status,
          owner: prop.owner,
          lastUpdated: prop.updatedAt || prop.createdAt,
          url: '/admin/proposals'
        });
      }
    }
  }

  res.json({ success: true, results: results.slice(0, 20) });
});
// ----------------------------------------------------
// 19. EXECUTIVE DASHBOARD & TODAY AT KAPITECH ENGINE (PARTS 7, 30, 68)
// ----------------------------------------------------

const handleOverview = (req: AuthenticatedRequest, res: Response): void => {
  const db = getDatabase();
  const canViewFinancials = req.user?.stakeholderType === 'Master' || Boolean(req.user?.permissions?.canViewFinancials);

  const leads = db.leads || [];
  const deals = db.crmDeals || [];
  const proposals = db.proposals || [];
  const projects = db.projects || [];
  const invoices = db.invoices || [];
  const expenses = db.expenses || [];
  const tasks = db.tasks || [];
  const approvals = db.approvals || [];

  // 1. Authoritative Core Metrics
  const openLeadsCount = leads.filter(l => l.status === 'new' || l.status === 'in_review').length;
  const activeDeals = deals.filter(d => d.stage !== 'won' && d.stage !== 'lost');
  const dealsInPipelineCount = activeDeals.length;
  const activePipelineValue = activeDeals.reduce((sum, d) => sum + (Number(d.value) || 0), 0);

  const proposalsAwaitingCount = proposals.filter(p => p.status === 'Draft' || p.status === 'Internal Review' || p.status === 'Sent').length;
  const activeProjectsList = projects.filter(p => p.status !== 'Completed' && p.status !== 'Archived');
  const activeProjectsCount = activeProjectsList.length;
  const projectsAtRiskCount = projects.filter(p => p.health === 'At Risk' || p.health === 'Delayed' || p.health === 'Blocked').length;

  const now = new Date();
  const overdueInvoices = invoices.filter(inv => {
    if (inv.status === 'paid' || inv.status === 'cancelled') return false;
    if (!inv.dueDate) return false;
    return new Date(inv.dueDate) < now;
  });
  const overdueInvoicesCount = overdueInvoices.length;
  const overdueReceivables = overdueInvoices.reduce(
    (sum, i) => sum + (i.balanceDue !== undefined ? i.balanceDue : Math.max(0, (i.total || 0) - (i.amountPaid || 0))),
    0
  );

  const totalOutstanding = invoices
    .filter(i => i.status !== 'paid' && i.status !== 'cancelled')
    .reduce((sum, i) => sum + (i.balanceDue !== undefined ? i.balanceDue : Math.max(0, (i.total || 0) - (i.amountPaid || 0))), 0);

  const totalBilled = invoices.reduce((sum, i) => sum + (Number(i.total) || 0), 0);
  const revenueCollected = invoices.reduce((sum, i) => sum + (Number(i.amountPaid) || 0), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const netOperatingProfit = revenueCollected - totalExpenses;
  const pendingApprovalsCount = approvals.filter(a => a.status === 'Pending').length;
  const overdueTasksCount = tasks.filter(t => t.status !== 'done' && t.dueDate && new Date(t.dueDate) < now).length;

  // Pipeline by Stage
  const stages = ['lead', 'contacted', 'discovery', 'proposal', 'negotiation', 'won', 'lost'];
  const pipelineByStage = stages.map(st => {
    const stageDeals = deals.filter(d => d.stage === st);
    return {
      stage: st,
      count: stageDeals.length,
      value: stageDeals.reduce((sum, d) => sum + (Number(d.value) || 0), 0)
    };
  });

  // Needs Attention Engine
  const attentionItems: Array<{
    id: string;
    title: string;
    description: string;
    severity: 'danger' | 'warning' | 'info';
    category: string;
    linkUrl: string;
  }> = [];

  if (overdueInvoicesCount > 0) {
    attentionItems.push({
      id: 'att_invoices_overdue',
      title: `${overdueInvoicesCount} Invoices Overdue`,
      description: `Immediate follow-up required on unpaid accounts totaling IDR ${overdueReceivables.toLocaleString()}.`,
      severity: 'danger',
      category: 'Finance',
      linkUrl: '/admin/invoicing'
    });
  }

  if (pendingApprovalsCount > 0) {
    attentionItems.push({
      id: 'att_pending_approvals',
      title: `${pendingApprovalsCount} Executive Approvals Awaiting Review`,
      description: `Includes budget and financial approvals submitted by team leads.`,
      severity: 'warning',
      category: 'Operations',
      linkUrl: '/admin/approvals'
    });
  }

  if (projectsAtRiskCount > 0) {
    attentionItems.push({
      id: 'att_projects_risk',
      title: `${projectsAtRiskCount} Projects Flagged At Risk`,
      description: `Delivery timeline or resource constraints require PM intervention.`,
      severity: 'danger',
      category: 'Delivery',
      linkUrl: '/admin/projects'
    });
  }

  if (overdueTasksCount > 0) {
    attentionItems.push({
      id: 'att_tasks_overdue',
      title: `${overdueTasksCount} Tasks Overdue in Active Sprints`,
      description: `Tasks passed deadline requiring rescheduling or re-assignment.`,
      severity: 'warning',
      category: 'Delivery',
      linkUrl: '/admin/projects'
    });
  }

  if (openLeadsCount > 3) {
    attentionItems.push({
      id: 'att_leads_new',
      title: `${openLeadsCount} Inbound Inquiries Unassigned`,
      description: `New potential leads received through website forms waiting qualification.`,
      severity: 'info',
      category: 'Sales',
      linkUrl: '/admin/inbox'
    });
  }

  res.json({
    success: true,
    metrics: {
      revenueCollected: canViewFinancials ? revenueCollected : null,
      totalBilled: canViewFinancials ? totalBilled : null,
      outstandingReceivables: canViewFinancials ? totalOutstanding : null,
      overdueReceivables: canViewFinancials ? overdueReceivables : null,
      activePipeline: canViewFinancials ? activePipelineValue : null,
      activeProjects: activeProjectsCount,
      projectsAtRisk: projectsAtRiskCount,
      pendingApprovals: pendingApprovalsCount,
      overdueTasks: overdueTasksCount,
      openLeads: openLeadsCount
    },
    todayAtKapitech: {
      openLeadsCount,
      dealsInPipelineCount,
      pipelineValue: canViewFinancials ? activePipelineValue : null,
      proposalsAwaitingCount,
      projectsAtRiskCount,
      overdueInvoicesCount,
      cashOutstanding: canViewFinancials ? totalOutstanding : null
    },
    financials: canViewFinancials ? {
      revenueThisMonth: revenueCollected,
      cashCollected: revenueCollected,
      outstandingReceivables: totalOutstanding,
      operatingExpenses: totalExpenses,
      netOperatingProfit,
      margin: revenueCollected > 0 ? ((netOperatingProfit / revenueCollected) * 100).toFixed(1) : '0'
    } : {
      revenueThisMonth: null,
      cashCollected: null,
      outstandingReceivables: null,
      operatingExpenses: null,
      netOperatingProfit: null,
      margin: null
    },
    pipelineByStage: canViewFinancials ? pipelineByStage : pipelineByStage.map((stage) => ({ ...stage, value: null })),
    attentionItems: canViewFinancials ? attentionItems : attentionItems.filter((item) => item.category !== 'Finance'),
    projects: activeProjectsList.slice(0, 10),
    recentActivity: (db.auditLogs || []).slice(0, 10)
  });
};

apiRouter.get('/dashboard/overview', requireAuth, handleOverview);
apiRouter.get('/executive/overview', requireAuth, handleOverview);

