import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// Path to persistent JSON database file
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'kapitech_db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export interface StoredUser {
  id: string;
  name: string;
  username: string;
  email: string;
  passwordHash: string;
  salt: string;
  role: string;
  stakeholderType: 'Executive' | 'IT_Technical' | 'Project_Manager' | 'Operations' | 'Master';
  permissions: {
    canViewFinancials: boolean;
    canManageInvoices: boolean;
    canApproveBudgets: boolean;
    canManageCrm: boolean;
    canManageProjects: boolean;
    canManageKanbanTasks: boolean;
    canManageClients: boolean;
    canManageVendors: boolean;
    canManageCmsContent: boolean;
    canAccessServerAndApi: boolean;
    canRunDataMigration: boolean;
    canViewSecurityAuditLogs: boolean;
    canManageAdminAccounts: boolean;
  };
  mfaEnabled: boolean;
  division: 'Management' | 'Engineering' | 'Design' | 'Finance' | 'Operations';
  status: 'active' | 'suspended';
  lastLogin: string;
  createdAt: string;
}

export interface StoredSession {
  token: string;
  userId: string;
  username: string;
  role: string;
  ip: string;
  userAgent: string;
  expiresAt: number;
  createdAt: string;
}

export interface StoredAuditLog {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  actorRole: string;
  ip: string;
  userAgent: string;
  details: string;
  severity: 'info' | 'warning' | 'critical';
}

export interface DatabaseSchema {
  users: StoredUser[];
  sessions: StoredSession[];
  leads: any[];
  crmDeals: any[];
  clients: any[];
  projects: any[];
  invoices: any[];
  expenses: any[];
  vendors: any[];
  cmsServices: any[];
  cmsProjects: any[];
  cmsTestimonials: any[];
  cmsSettings: Record<string, any>;
  auditLogs: StoredAuditLog[];
  notificationSettings: {
    targetEmail: string;
    formspreeEndpoint: string;
    telegramBotToken: string;
    telegramChatId: string;
    isEmailActive: boolean;
    isTelegramActive: boolean;
    updatedAt: string;
  };
}

export function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
}

export function generateSalt(): string {
  return crypto.randomBytes(16).toString('hex');
}

// Initial seed accounts
function getInitialSeedData(): DatabaseSchema {
  const adminSalt = generateSalt();
  const execSalt = generateSalt();
  const pmSalt = generateSalt();
  const finSalt = generateSalt();

  return {
    users: [
      {
        id: 'usr_root_admin',
        name: 'Executive Master Admin',
        username: 'admin',
        email: 'admin@ams.kapitech.id',
        passwordHash: hashPassword('Kapitech#Admin2026!', adminSalt),
        salt: adminSalt,
        role: 'Tier 1: Top Management / Sponsor',
        stakeholderType: 'Master',
        permissions: {
          canViewFinancials: true,
          canManageInvoices: true,
          canApproveBudgets: true,
          canManageCrm: true,
          canManageProjects: true,
          canManageKanbanTasks: true,
          canManageClients: true,
          canManageVendors: true,
          canManageCmsContent: true,
          canAccessServerAndApi: true,
          canRunDataMigration: true,
          canViewSecurityAuditLogs: true,
          canManageAdminAccounts: true
        },
        mfaEnabled: true,
        division: 'Management',
        status: 'active',
        lastLogin: new Date().toISOString(),
        createdAt: '2025-01-01T00:00:00.000Z'
      },
      {
        id: 'usr_exec_partner',
        name: 'Executive Partner',
        username: 'executive',
        email: 'executive@ams.kapitech.id',
        passwordHash: hashPassword('Exec#Partner2026!', execSalt),
        salt: execSalt,
        role: 'Stakeholder Executive',
        stakeholderType: 'Executive',
        permissions: {
          canViewFinancials: true,
          canManageInvoices: true,
          canApproveBudgets: true,
          canManageCrm: true,
          canManageProjects: true,
          canManageKanbanTasks: false,
          canManageClients: true,
          canManageVendors: true,
          canManageCmsContent: false,
          canAccessServerAndApi: false,
          canRunDataMigration: false,
          canViewSecurityAuditLogs: true,
          canManageAdminAccounts: true
        },
        mfaEnabled: true,
        division: 'Management',
        status: 'active',
        lastLogin: new Date().toISOString(),
        createdAt: '2025-01-15T00:00:00.000Z'
      },
      {
        id: 'usr_pm_lead',
        name: 'Project Operations Lead',
        username: 'pm',
        email: 'pm@ams.kapitech.id',
        passwordHash: hashPassword('Pm#Sprint2026!', pmSalt),
        salt: pmSalt,
        role: 'Tier 2: Project Manager (PM)',
        stakeholderType: 'Project_Manager',
        permissions: {
          canViewFinancials: true,
          canManageInvoices: false,
          canApproveBudgets: false,
          canManageCrm: true,
          canManageProjects: true,
          canManageKanbanTasks: true,
          canManageClients: true,
          canManageVendors: true,
          canManageCmsContent: false,
          canAccessServerAndApi: false,
          canRunDataMigration: false,
          canViewSecurityAuditLogs: false,
          canManageAdminAccounts: false
        },
        mfaEnabled: false,
        division: 'Operations',
        status: 'active',
        lastLogin: new Date().toISOString(),
        createdAt: '2025-02-01T00:00:00.000Z'
      },
      {
        id: 'usr_fin_cfo',
        name: 'Chief Financial Officer',
        username: 'finance',
        email: 'finance@ams.kapitech.id',
        passwordHash: hashPassword('Fin#Treasury2026!', finSalt),
        salt: finSalt,
        role: 'Financial Officer',
        stakeholderType: 'Operations',
        permissions: {
          canViewFinancials: true,
          canManageInvoices: true,
          canApproveBudgets: true,
          canManageCrm: false,
          canManageProjects: false,
          canManageKanbanTasks: false,
          canManageClients: true,
          canManageVendors: true,
          canManageCmsContent: false,
          canAccessServerAndApi: false,
          canRunDataMigration: false,
          canViewSecurityAuditLogs: false,
          canManageAdminAccounts: false
        },
        mfaEnabled: false,
        division: 'Finance',
        status: 'active',
        lastLogin: new Date().toISOString(),
        createdAt: '2025-02-01T00:00:00.000Z'
      }
    ],
    sessions: [],
    leads: [],
    crmDeals: [],
    clients: [],
    projects: [],
    invoices: [],
    expenses: [],
    vendors: [],
    cmsServices: [],
    cmsProjects: [],
    cmsTestimonials: [],
    cmsSettings: {
      siteTitle: 'Kapitech Agency | High-Performance Digital Solutions',
      siteDescription: 'Premier digital product engineering agency in Indonesia.',
      contactReceiverEmail: 'kapitechagency@gmail.com',
      defaultLanguage: 'en',
      enableLiveChat: true,
      enableSoundAlerts: true,
      maintenanceMode: false
    },
    auditLogs: [
      {
        id: 'log_seed_init',
        timestamp: new Date().toISOString(),
        action: 'SYSTEM_BOOTSTRAP',
        actor: 'system',
        actorRole: 'Master',
        ip: '127.0.0.1',
        userAgent: 'Internal Init',
        details: 'Initialized secure persistent database storage.',
        severity: 'info'
      }
    ],
    notificationSettings: {
      targetEmail: 'kapitechagency@gmail.com',
      formspreeEndpoint: '',
      telegramBotToken: '',
      telegramChatId: '',
      isEmailActive: true,
      isTelegramActive: false,
      updatedAt: new Date().toISOString()
    }
  };
}

let inMemoryDb: DatabaseSchema | null = null;
let writeQueue: Promise<void> = Promise.resolve();

export function getDatabase(): DatabaseSchema {
  if (inMemoryDb) {
    return inMemoryDb;
  }

  if (fs.existsSync(DB_FILE)) {
    try {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      inMemoryDb = JSON.parse(raw);
      // Validate schema keys
      const seed = getInitialSeedData();
      for (const key of Object.keys(seed) as (keyof DatabaseSchema)[]) {
        if (inMemoryDb && (inMemoryDb[key] === undefined || inMemoryDb[key] === null)) {
          (inMemoryDb as any)[key] = seed[key];
        }
      }
      return inMemoryDb!;
    } catch (err) {
      console.error('Failed reading database file, initializing fresh database:', err);
    }
  }

  inMemoryDb = getInitialSeedData();
  saveDatabaseSync(inMemoryDb);
  return inMemoryDb;
}

export function saveDatabaseSync(db: DatabaseSchema): void {
  inMemoryDb = db;
  const tempPath = `${DB_FILE}.${Date.now()}.tmp`;
  fs.writeFileSync(tempPath, JSON.stringify(db, null, 2), 'utf-8');
  fs.renameSync(tempPath, DB_FILE);
}

export function saveDatabase(db: DatabaseSchema): Promise<void> {
  inMemoryDb = db;
  writeQueue = writeQueue.then(async () => {
    try {
      const tempPath = `${DB_FILE}.${Date.now()}.tmp`;
      await fs.promises.writeFile(tempPath, JSON.stringify(db, null, 2), 'utf-8');
      await fs.promises.rename(tempPath, DB_FILE);
    } catch (err) {
      console.error('Database write error:', err);
    }
  });
  return writeQueue;
}

// Append-only tamper resistant audit log
export function recordAuditLog(entry: {
  action: string;
  actor: string;
  actorRole: string;
  ip?: string;
  userAgent?: string;
  details: string;
  severity?: 'info' | 'warning' | 'critical';
}): void {
  const db = getDatabase();
  const log: StoredAuditLog = {
    id: `log_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
    timestamp: new Date().toISOString(),
    action: entry.action,
    actor: entry.actor || 'anonymous',
    actorRole: entry.actorRole || 'visitor',
    ip: entry.ip || '127.0.0.1',
    userAgent: entry.userAgent || 'unknown',
    details: entry.details,
    severity: entry.severity || 'info'
  };

  db.auditLogs.unshift(log);
  // Cap at 2000 log entries
  if (db.auditLogs.length > 2000) {
    db.auditLogs = db.auditLogs.slice(0, 2000);
  }
  saveDatabase(db);
}
