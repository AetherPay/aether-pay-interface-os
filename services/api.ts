/**
 * AetherOS - Admin API Service
 * Connects to the backend API for admin operations
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
const ADMIN_KEY = import.meta.env.VITE_ADMIN_KEY || '';

// Auth token storage
let authToken: string | null = null;

export const setAuthToken = (token: string) => {
  authToken = token;
  localStorage.setItem('aetheros_token', token);
};

export const getAuthToken = (): string | null => {
  if (!authToken) {
    authToken = localStorage.getItem('aetheros_token');
  }
  return authToken;
};

export const clearAuthToken = () => {
  authToken = null;
  localStorage.removeItem('aetheros_token');
};

// Base fetch function with auth
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(ADMIN_KEY ? { 'X-Admin-Key': ADMIN_KEY } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || 'API request failed');
  }

  return data.data;
}

// ==================== DASHBOARD ====================

export const dashboardApi = {
  getKPIs: () => apiFetch<any>('/v1/admin/dashboard'),
  getFlux: () => apiFetch<any[]>('/v1/admin/flux'),
  getRiskDashboard: () => apiFetch<any>('/v1/admin/risk/dashboard'),
};

// ==================== MERCHANTS ====================

export interface MerchantFilters {
  page?: number;
  limit?: number;
  status?: string;
  tier?: string;
  country?: string;
  search?: string;
}

export const merchantsApi = {
  list: (filters: MerchantFilters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) params.append(key, String(value));
    });
    return apiFetch<any>(`/v1/admin/merchants?${params}`);
  },

  get: (id: string) => apiFetch<any>(`/v1/admin/merchants/${id}`),

  update: (id: string, dto: any) =>
    apiFetch<any>(`/v1/admin/merchants/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(dto),
    }),

  suspend: (id: string) =>
    apiFetch<any>(`/v1/admin/merchants/${id}/suspend`, {
      method: 'POST',
    }),

  activate: (id: string) =>
    apiFetch<any>(`/v1/admin/merchants/${id}/activate`, {
      method: 'POST',
    }),
};

// ==================== TRANSACTIONS ====================

export interface TransactionFilters {
  page?: number;
  limit?: number;
  status?: string;
  currency?: string;
  dateFrom?: string;
  dateTo?: string;
}

export const transactionsApi = {
  list: (filters: TransactionFilters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) params.append(key, String(value));
    });
    return apiFetch<any>(`/v1/admin/transactions?${params}`);
  },

  get: (id: string) => apiFetch<any>(`/v1/admin/transactions/${id}`),
};

// ==================== USERS ====================

export const usersApi = {
  list: () => apiFetch<any[]>('/v1/admin/users'),

  get: (id: string) => apiFetch<any>(`/v1/admin/users/${id}`),

  lock: (id: string) =>
    apiFetch<any>(`/v1/admin/users/${id}/lock`, {
      method: 'POST',
    }),

  unlock: (id: string) =>
    apiFetch<any>(`/v1/admin/users/${id}/unlock`, {
      method: 'POST',
    }),
};

// ==================== RBAC ====================

export const rbacApi = {
  getRoles: () => apiFetch<any[]>('/v1/admin/roles'),
  getPermissions: () => apiFetch<any[]>('/v1/admin/permissions'),
  getPermissionsMatrix: () => apiFetch<any>('/v1/admin/permissions/matrix'),
};

// ==================== TREASURY / FOREX ====================

export const treasuryApi = {
  getFxRates: () => apiFetch<any[]>('/v1/admin/treasury/forex/rates'),

  updateFxSpread: (pair: string, spreadPercentage: number) =>
    apiFetch<any>(`/v1/admin/treasury/forex/rates/${pair}/spread`, {
      method: 'PATCH',
      body: JSON.stringify({ spreadPercentage }),
    }),
};

// ==================== PAYOUTS ====================

export const payoutsApi = {
  list: (filters: { status?: string; merchantId?: string; requiresAdminAction?: boolean; limit?: number; offset?: number } = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) params.append(key, String(value));
    });
    return apiFetch<any>(`/v1/admin/payouts?${params}`);
  },

  process: (id: string) =>
    apiFetch<any>(`/v1/admin/payouts/${id}/process`, {
      method: 'POST',
    }),

  complete: (id: string, providerRef?: string) =>
    apiFetch<any>(`/v1/admin/payouts/${id}/complete`, {
      method: 'POST',
      body: JSON.stringify({ providerRef }),
    }),

  fail: (id: string, reason: string) =>
    apiFetch<any>(`/v1/admin/payouts/${id}/fail`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),
};

// ==================== SETTLEMENTS ====================

export const settlementsApi = {
  list: (filters: { status?: string; merchantId?: string; limit?: number; offset?: number } = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) params.append(key, String(value));
    });
    return apiFetch<any>(`/v1/admin/settlements?${params}`);
  },

  release: (id: string) =>
    apiFetch<any>(`/v1/admin/settlements/${id}/release`, {
      method: 'POST',
    }),
};

// ==================== WEBHOOKS ====================

export interface WebhookFilters {
  status?: string;
  siteId?: string;
  merchantId?: string;
  limit?: number;
  offset?: number;
}

export const webhooksApi = {
  list: (filters: WebhookFilters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) params.append(key, String(value));
    });
    return apiFetch<any>(`/v1/admin/webhooks?${params}`);
  },

  replay: (id: string) =>
    apiFetch<any>(`/v1/admin/webhooks/${id}/replay`, {
      method: 'POST',
    }),
};

// ==================== AUDIT LOGS ====================

export interface AuditFilters {
  page?: number;
  limit?: number;
  action?: string;
  actorId?: string;
  merchantId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export const auditApi = {
  list: (filters: AuditFilters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) params.append(key, String(value));
    });
    return apiFetch<any>(`/v1/admin/audit-logs?${params}`);
  },

  get: (id: string) => apiFetch<any>(`/v1/admin/audit-logs/${id}`),
};

// ==================== IMPERSONATION ====================

export const impersonationApi = {
  start: (merchantId: string, reason?: string) =>
    apiFetch<any>('/v1/auth/impersonate', {
      method: 'POST',
      body: JSON.stringify({ merchantId, reason }),
    }),

  end: () =>
    apiFetch<any>('/v1/auth/impersonate/end', {
      method: 'POST',
    }),
};

// ==================== USER PROFILE ====================

export const profileApi = {
  get: () => apiFetch<any>('/v1/shared/me'),

  update: (dto: { name?: string; phoneNumber?: string }) =>
    apiFetch<any>('/v1/shared/me', {
      method: 'PATCH',
      body: JSON.stringify(dto),
    }),
};

// ==================== REFERENCE DATA ====================

export const referenceApi = {
  getCurrencies: () => apiFetch<any[]>('/v1/shared/currencies'),
  getCountries: () => apiFetch<any[]>('/v1/shared/countries'),
  getProviders: () => apiFetch<any[]>('/v1/shared/providers'),
  healthCheck: () => apiFetch<any>('/v1/shared/health'),
};


// ==================== PLANS (Admin CRUD) ======================================
 
export interface CreatePlanPayload {
  name: string;
  slug: string;
  price: number;
  currency?: string;
  billingCycle?: 'monthly' | 'yearly';
  features: string[];
  limits: { collaborators: number; transactions: number; links: number };
  isActive?: boolean;
  sortOrder?: number;
}
 
export interface UpdatePlanPayload {
  name?: string;
  price?: number;
  currency?: string;
  features?: string[];
  limits?: { collaborators: number; transactions: number; links: number };
  isActive?: boolean;
  sortOrder?: number;
}
 
export const plansApi = {
  /**
   * Liste tous les plans (admin — tous statuts + compteur marchands)
   * GET /v1/admin/plans
   */
  list: () => apiFetch<any[]>('/v1/admin/plans'),
 
  /**
   * Crée un plan
   * POST /v1/admin/plans
   */
  create: (dto: CreatePlanPayload) =>
    apiFetch<any>('/v1/admin/plans', {
      method: 'POST',
      body: JSON.stringify(dto),
    }),
 
  /**
   * Modifie un plan
   * PATCH /v1/admin/plans/:planId
   */
  update: (planId: string, dto: UpdatePlanPayload) =>
    apiFetch<any>(`/v1/admin/plans/${planId}`, {
      method: 'PATCH',
      body: JSON.stringify(dto),
    }),
 
  /**
   * Supprime un plan (échoue si marchands actifs)
   * DELETE /v1/admin/plans/:planId
   */
  delete: (planId: string) =>
    apiFetch<void>(`/v1/admin/plans/${planId}`, { method: 'DELETE' }),
};
 
// ==================== SUBSCRIPTIONS (Admin — gestion marchands) ==============
 
export interface AdminChangePlanPayload {
  planId: string;
  billingCycle?: 'monthly' | 'yearly';
  note?: string;
}
 
export interface SuspendPlanPayload {
  reason: string;
  note?: string;
}
 
export const subscriptionsAdminApi = {
  /**
   * Liste tous les abonnements avec filtres
   * GET /v1/admin/subscriptions
   */
  list: (filters: {
    planId?: string;
    status?: string;
    search?: string;
    limit?: number;
    offset?: number;
  } = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined) params.append(k, String(v));
    });
    return apiFetch<any>(`/v1/admin/subscriptions?${params}`);
  },
 
  /**
   * Abonnement actuel d'un marchand
   * GET /v1/admin/merchants/:merchantId/subscription
   */
  getMerchantSubscription: (merchantId: string) =>
    apiFetch<any>(`/v1/admin/merchants/${merchantId}/subscription`),
 
  /**
   * Historique abonnements d'un marchand
   * GET /v1/admin/merchants/:merchantId/subscription/history
   */
  getMerchantHistory: (merchantId: string, limit = 20, offset = 0) =>
    apiFetch<any>(
      `/v1/admin/merchants/${merchantId}/subscription/history?limit=${limit}&offset=${offset}`,
    ),
 
  /**
   * Change le plan d'un marchand
   * PATCH /v1/admin/merchants/:merchantId/plan
   */
  changeMerchantPlan: (merchantId: string, dto: AdminChangePlanPayload) =>
    apiFetch<any>(`/v1/admin/merchants/${merchantId}/plan`, {
      method: 'PATCH',
      body: JSON.stringify(dto),
    }),
 
  /**
   * Suspend le plan d'un marchand (motif obligatoire)
   * POST /v1/admin/merchants/:merchantId/plan/suspend
   */
  suspendMerchantPlan: (merchantId: string, dto: SuspendPlanPayload) =>
    apiFetch<any>(`/v1/admin/merchants/${merchantId}/plan/suspend`, {
      method: 'POST',
      body: JSON.stringify(dto),
    }),
 
  /**
   * Réactive le plan d'un marchand suspendu
   * POST /v1/admin/merchants/:merchantId/plan/activate
   */
  activateMerchantPlan: (merchantId: string) =>
    apiFetch<any>(`/v1/admin/merchants/${merchantId}/plan/activate`, {
      method: 'POST',
    }),
};


// Export all APIs
export const api = {
  dashboard: dashboardApi,
  merchants: merchantsApi,
  transactions: transactionsApi,
  webhooks: webhooksApi,
  users: usersApi,
  rbac: rbacApi,
  treasury: treasuryApi,
  payouts: payoutsApi,
  settlements: settlementsApi,
  audit: auditApi,
  impersonation: impersonationApi,
  profile: profileApi,
  reference: referenceApi,
  plans: plansApi,
  subscriptions: subscriptionsAdminApi,
};

export default api;
