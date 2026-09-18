// src/lib/rbacEngine.ts
// RBAC Permission Engine for Kapitech Agency Management System (AMS)

import { useState, useEffect } from 'react';

export type StakeholderRole = 'executive' | 'pm' | 'finance' | 'account_manager' | 'client_viewer';

export interface RoleMetadata {
  id: StakeholderRole;
  title: string;
  badge: string;
  scopeDescription: string;
  accountProfile: {
    displayName: string;
    accountId: string;
    avatarLabel: string;
    department: string;
  };
  allowedModuleKeys: string[];
}

export const ROLE_DEFINITIONS: Record<StakeholderRole, RoleMetadata> = {
  executive: {
    id: 'executive',
    title: 'Stakeholder Executive (Full Access)',
    badge: 'C-Level / Partner',
    scopeDescription: 'Full 100% Access (Strategic, Financial, P&L, Operations & Admin)',
    accountProfile: {
      displayName: 'Executive Partner',
      accountId: 'kapitech-exec-01',
      avatarLabel: 'EX',
      department: 'Top Management & Governance'
    },
    allowedModuleKeys: [
      'dashboard',
      'inbox',
      'crm',
      'projects',
      'invoicing',
      'clients',
      'vendors',
      'services',
      'cms_projects',
      'testimonials',
      'settings',
      'rbac'
    ]
  },
  pm: {
    id: 'pm',
    title: 'Project Manager',
    badge: 'Operations & Sprints',
    scopeDescription: 'Operational Sprints, Capacity Balancing, Client Approvals & Delivery Milestones',
    accountProfile: {
      displayName: 'Project Operations Lead',
      accountId: 'kapitech-pm-02',
      avatarLabel: 'PM',
      department: 'Delivery & Agile Operations'
    },
    allowedModuleKeys: [
      'dashboard',
      'projects',
      'clients',
      'vendors',
      'services',
      'cms_projects'
    ]
  },
  finance: {
    id: 'finance',
    title: 'Financial Officer',
    badge: 'Finance & P&L',
    scopeDescription: 'Invoicing Workflow, A/R & A/P Management, P&L Reports, Taxes & Expenses',
    accountProfile: {
      displayName: 'Chief Financial Officer',
      accountId: 'kapitech-fin-03',
      avatarLabel: 'FO',
      department: 'Financial Operations & Treasury'
    },
    allowedModuleKeys: [
      'dashboard',
      'invoicing',
      'clients',
      'vendors'
    ]
  },
  account_manager: {
    id: 'account_manager',
    title: 'Account Manager',
    badge: 'CRM & Accounts',
    scopeDescription: 'Client Directory, Sales Funnel, Deal Pipeline, Leads & Inbound Inquiries',
    accountProfile: {
      displayName: 'Senior Account Manager',
      accountId: 'kapitech-am-04',
      avatarLabel: 'AM',
      department: 'Client Partnerships & Growth'
    },
    allowedModuleKeys: [
      'dashboard',
      'inbox',
      'crm',
      'clients'
    ]
  },
  client_viewer: {
    id: 'client_viewer',
    title: 'Client / Viewer',
    badge: 'Read-Only Portal',
    scopeDescription: 'Read-only view into Active Projects, Showcase, and Services',
    accountProfile: {
      displayName: 'Stakeholder Client Partner',
      accountId: 'kapitech-cli-05',
      avatarLabel: 'CL',
      department: 'Client Stakeholder'
    },
    allowedModuleKeys: [
      'dashboard',
      'projects',
      'cms_projects'
    ]
  }
};

const STORAGE_KEY = 'kapitech_simulated_role';
const ROLE_EVENT_NAME = 'kapitech_rbac_role_change';

export function getStoredRole(): StakeholderRole {
  if (typeof window === 'undefined') return 'executive';
  const saved = localStorage.getItem(STORAGE_KEY) as StakeholderRole;
  if (saved && ROLE_DEFINITIONS[saved]) {
    return saved;
  }
  return 'executive';
}

export function setStoredRole(role: StakeholderRole): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, role);
  window.dispatchEvent(new CustomEvent(ROLE_EVENT_NAME, { detail: { role } }));
}

export function isModuleAllowed(role: StakeholderRole, moduleKey: string): boolean {
  const meta = ROLE_DEFINITIONS[role];
  if (!meta) return false;
  return meta.allowedModuleKeys.includes(moduleKey);
}

export function useRbacRole() {
  const [currentRole, setCurrentRoleState] = useState<StakeholderRole>(getStoredRole);

  useEffect(() => {
    const handler = (e: Event) => {
      const custom = e as CustomEvent<{ role: StakeholderRole }>;
      if (custom.detail?.role && ROLE_DEFINITIONS[custom.detail.role]) {
        setCurrentRoleState(custom.detail.role);
      }
    };
    window.addEventListener(ROLE_EVENT_NAME, handler);
    return () => window.removeEventListener(ROLE_EVENT_NAME, handler);
  }, []);

  const switchRole = (newRole: StakeholderRole) => {
    setStoredRole(newRole);
    setCurrentRoleState(newRole);
  };

  const meta = ROLE_DEFINITIONS[currentRole];

  return {
    role: currentRole,
    setRole: switchRole,
    roleMeta: meta,
    isAllowed: (key: string) => isModuleAllowed(currentRole, key)
  };
}
