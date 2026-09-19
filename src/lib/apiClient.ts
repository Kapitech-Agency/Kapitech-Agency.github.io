/**
 * Centralized API Client for Kapitech AMS
 * Seamlessly interfaces with the Express backend on /api
 */

const TOKEN_STORAGE_KEY = 'kapitech_session_token';

export function getSessionToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_STORAGE_KEY) || sessionStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setSessionToken(token: string, remember: boolean = true): void {
  if (typeof window === 'undefined') return;
  if (remember) {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } else {
    sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
  }
}

export function clearSessionToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  sessionStorage.removeItem(TOKEN_STORAGE_KEY);
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const token = getSessionToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {})
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      headers['x-session-token'] = token;
    }

    const url = endpoint.startsWith('/') ? endpoint : `/api/${endpoint}`;
    const res = await fetch(url, {
      ...options,
      headers
    });

    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      if (res.status === 401 && typeof window !== 'undefined') {
        // Expired or invalid session
        clearSessionToken();
      }
      return {
        success: false,
        error: json.error || `HTTP ${res.status}: ${res.statusText}`
      };
    }

    return {
      success: true,
      data: json
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Network request failed'
    };
  }
}

export const api = {
  // Auth
  auth: {
    login: (body: { identifier: string; password: string; rememberMe?: boolean }) =>
      apiRequest<{ success: boolean; token: string; user: any }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(body)
      }),
    logout: () => apiRequest('/api/auth/logout', { method: 'POST' }),
    me: () => apiRequest<{ success: boolean; user: any }>('/api/auth/me'),
    changePassword: (body: { currentPassword: string; newPassword: string }) =>
      apiRequest('/api/auth/change-password', {
        method: 'POST',
        body: JSON.stringify(body)
      }),
    getUsers: () => apiRequest<{ success: boolean; users: any[] }>('/api/auth/users'),
    createUser: (userData: any) =>
      apiRequest('/api/auth/users', {
        method: 'POST',
        body: JSON.stringify(userData)
      }),
    updateUser: (id: string, updates: any) =>
      apiRequest<{ success: boolean; user: any }>(`/api/auth/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      }),
    deleteUser: (id: string) => apiRequest(`/api/auth/users/${id}`, { method: 'DELETE' })
  },

  // Leads
  leads: {
    submit: (lead: any) =>
      apiRequest('/api/leads/submit', {
        method: 'POST',
        body: JSON.stringify(lead)
      }),
    getAll: () => apiRequest<{ success: boolean; leads: any[] }>('/api/leads'),
    update: (id: string, updates: any) =>
      apiRequest(`/api/leads/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      }),
    delete: (id: string) => apiRequest(`/api/leads/${id}`, { method: 'DELETE' }),
    convert: (id: string) => apiRequest(`/api/leads/${id}/convert`, { method: 'POST' })
  },

  // CRM
  crm: {
    getDeals: () => apiRequest<{ success: boolean; deals: any[] }>('/api/crm/deals'),
    createDeal: (deal: any) =>
      apiRequest('/api/crm/deals', {
        method: 'POST',
        body: JSON.stringify(deal)
      }),
    updateDeal: (id: string, updates: any) =>
      apiRequest(`/api/crm/deals/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      }),
    deleteDeal: (id: string) => apiRequest(`/api/crm/deals/${id}`, { method: 'DELETE' })
  },

  // Clients
  clients: {
    getAll: () => apiRequest<{ success: boolean; clients: any[] }>('/api/clients'),
    create: (client: any) =>
      apiRequest('/api/clients', {
        method: 'POST',
        body: JSON.stringify(client)
      }),
    update: (id: string, updates: any) =>
      apiRequest(`/api/clients/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      }),
    delete: (id: string) => apiRequest(`/api/clients/${id}`, { method: 'DELETE' })
  },

  // Projects
  projects: {
    getAll: () => apiRequest<{ success: boolean; projects: any[] }>('/api/projects'),
    create: (proj: any) =>
      apiRequest('/api/projects', {
        method: 'POST',
        body: JSON.stringify(proj)
      }),
    update: (id: string, updates: any) =>
      apiRequest(`/api/projects/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      }),
    delete: (id: string) => apiRequest(`/api/projects/${id}`, { method: 'DELETE' })
  },

  // Finance & Invoices
  finance: {
    getInvoices: () => apiRequest<{ success: boolean; invoices: any[] }>('/api/finance/invoices'),
    createInvoice: (inv: any) =>
      apiRequest('/api/finance/invoices', {
        method: 'POST',
        body: JSON.stringify(inv)
      }),
    updateInvoice: (id: string, updates: any) =>
      apiRequest(`/api/finance/invoices/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      }),
    payInvoice: (id: string, payment: { amount: number; date?: string; method?: string; reference?: string; notes?: string }) =>
      apiRequest(`/api/finance/invoices/${id}/pay`, {
        method: 'POST',
        body: JSON.stringify(payment)
      }),
    deleteInvoice: (id: string) => apiRequest(`/api/finance/invoices/${id}`, { method: 'DELETE' }),
    getExpenses: () => apiRequest<{ success: boolean; expenses: any[] }>('/api/finance/expenses'),
    createExpense: (exp: any) =>
      apiRequest('/api/finance/expenses', {
        method: 'POST',
        body: JSON.stringify(exp)
      }),
    deleteExpense: (id: string) => apiRequest(`/api/finance/expenses/${id}`, { method: 'DELETE' }),
    getMetrics: () => apiRequest<{ success: boolean; metrics: any }>('/api/finance/metrics')
  },

  // Vendors
  vendors: {
    getAll: () => apiRequest<{ success: boolean; vendors: any[] }>('/api/vendors'),
    create: (ven: any) =>
      apiRequest('/api/vendors', {
        method: 'POST',
        body: JSON.stringify(ven)
      }),
    update: (id: string, updates: any) =>
      apiRequest(`/api/vendors/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      }),
    delete: (id: string) => apiRequest(`/api/vendors/${id}`, { method: 'DELETE' })
  },

  // CMS
  cms: {
    getServices: () => apiRequest<{ success: boolean; services: any[] }>('/api/cms/services'),
    createService: (srv: any) =>
      apiRequest('/api/cms/services', {
        method: 'POST',
        body: JSON.stringify(srv)
      }),
    updateService: (id: string, updates: any) =>
      apiRequest(`/api/cms/services/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      }),
    deleteService: (id: string) => apiRequest(`/api/cms/services/${id}`, { method: 'DELETE' }),

    getProjects: () => apiRequest<{ success: boolean; projects: any[] }>('/api/cms/projects'),
    createProject: (proj: any) =>
      apiRequest('/api/cms/projects', {
        method: 'POST',
        body: JSON.stringify(proj)
      }),
    updateProject: (id: string, updates: any) =>
      apiRequest(`/api/cms/projects/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      }),
    deleteProject: (id: string) => apiRequest(`/api/cms/projects/${id}`, { method: 'DELETE' }),

    getTestimonials: () => apiRequest<{ success: boolean; testimonials: any[] }>('/api/cms/testimonials'),
    createTestimonial: (t: any) =>
      apiRequest('/api/cms/testimonials', {
        method: 'POST',
        body: JSON.stringify(t)
      }),
    updateTestimonial: (id: string, updates: any) =>
      apiRequest(`/api/cms/testimonials/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      }),
    deleteTestimonial: (id: string) => apiRequest(`/api/cms/testimonials/${id}`, { method: 'DELETE' }),

    getSettings: () => apiRequest<{ success: boolean; settings: any }>('/api/cms/settings'),
    updateSettings: (settings: any) =>
      apiRequest('/api/cms/settings', {
        method: 'PUT',
        body: JSON.stringify(settings)
      })
  },

  // Audit Logs
  auditLogs: {
    getAll: () => apiRequest<{ success: boolean; logs: any[] }>('/api/audit-logs')
  },

  // Notifications
  notifications: {
    getSettings: () => apiRequest<{ success: boolean; settings: any }>('/api/notifications/settings'),
    updateSettings: (settings: any) =>
      apiRequest('/api/notifications/settings', {
        method: 'PUT',
        body: JSON.stringify(settings)
      })
  },

  // AI Assist
  ai: {
    generate: (prompt: string, context?: string) =>
      apiRequest<{ success: boolean; result: string }>('/api/ai/generate', {
        method: 'POST',
        body: JSON.stringify({ prompt, context })
      })
  },

  // Migration
  migration: {
    importLocal: (data: any) =>
      apiRequest('/api/migration/import-local', {
        method: 'POST',
        body: JSON.stringify(data)
      })
  }
};
