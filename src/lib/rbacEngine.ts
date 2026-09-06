// src/lib/rbacEngine.ts
// RBAC Permission Engine for Kapitech Agency Management System (AMS)

import { useState, useEffect } from 'react';

export type StakeholderRole = 'executive' | 'pm' | 'engineer' | 'staff';

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
    title: 'Stakeholder Executive',
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
    scopeDescription: 'Operational Sprints, Capacity Balancing, Client Approvals & Project Budgets',
    accountProfile: {
      displayName: 'Project Operations Lead',
      accountId: 'kapitech-pm-02',
      avatarLabel: 'PM',
      department: 'Delivery & Agile Operations'
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
      'cms_projects'
    ]
  },
  engineer: {
    id: 'engineer',
    title: 'Teknisi IT / Engineer',
    badge: 'DevOps & Infra',
    scopeDescription: 'Cloud Run Health, API Latencies, Container Ops & Git Backlog',
    accountProfile: {
      displayName: 'Systems DevOps Engineer',
      accountId: 'kapitech-eng-03',
      avatarLabel: 'EN',
      department: 'Cloud & Infrastructure'
    },
    allowedModuleKeys: [
      'dashboard',
      'projects',
      'cms_projects'
    ]
  },
  staff: {
    id: 'staff',
    title: 'Operational Staff',
    badge: 'Creative & Dev Staff',
    scopeDescription: 'Daily Tasks, Interactive Time Tracker & Asset Repositories',
    accountProfile: {
      displayName: 'Operations Specialist',
      accountId: 'kapitech-stf-04',
      avatarLabel: 'ST',
      department: 'Creative & Full-Stack Squad'
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
