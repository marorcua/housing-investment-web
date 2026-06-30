import type { Property, Transaction, Tenant, RentIncrease, Loan, RecurringExpense, Summary, GlobalData } from '../../domain/types';

const API_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:3000';

let token: string | null = typeof localStorage !== 'undefined' ? localStorage.getItem('auth_token') : null;

export const setToken = (t: string | null) => {
  token = t;
  if (t) localStorage.setItem('auth_token', t);
  else localStorage.removeItem('auth_token');
};

export const getToken = () => token;

export const isAuthenticated = () => !!token;

export const logout = () => setToken(null);

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new ApiError(body.error || 'Request failed', res.status);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  login: (password: string) =>
    request<{ token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ password }),
    }),

  properties: {
    list: () => request<Property[]>('/properties'),
    get: (id: number) => request<Property>(`/properties/${id}`),
    create: (data: Partial<Property>) =>
      request<Property>('/properties', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: Partial<Property>) =>
      request<Property>(`/properties/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: number) =>
      request<{ message: string }>(`/properties/${id}`, { method: 'DELETE' }),
  },

  revenues: {
    listByProperty: (propertyId: number) =>
      request<Transaction[]>(`/revenues/property/${propertyId}`),
    create: (data: Partial<Transaction>) =>
      request<Transaction>('/revenues', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: Partial<Transaction>) =>
      request<Transaction>(`/revenues/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: number) =>
      request<{ message: string }>(`/revenues/${id}`, { method: 'DELETE' }),
  },

  expenses: {
    listByProperty: (propertyId: number) =>
      request<Transaction[]>(`/expenses/property/${propertyId}`),
    create: (data: Partial<Transaction>) =>
      request<Transaction>('/expenses', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: Partial<Transaction>) =>
      request<Transaction>(`/expenses/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: number) =>
      request<{ message: string }>(`/expenses/${id}`, { method: 'DELETE' }),
  },

  tenants: {
    listByProperty: (propertyId: number) =>
      request<Tenant[]>(`/tenants/property/${propertyId}`),
    create: (data: Partial<Tenant>) =>
      request<Tenant>('/tenants', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: Partial<Tenant>) =>
      request<Tenant>(`/tenants/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: number) =>
      request<{ message: string }>(`/tenants/${id}`, { method: 'DELETE' }),
    increases: {
      list: (tenantId: number) =>
        request<RentIncrease[]>(`/tenants/${tenantId}/increases`),
      create: (tenantId: number, data: { yearOffset: number; percentage: number; applied?: boolean }) =>
        request<RentIncrease>(`/tenants/${tenantId}/increases`, { method: 'POST', body: JSON.stringify(data) }),
      update: (tenantId: number, increaseId: number, data: Partial<RentIncrease>) =>
        request<RentIncrease>(`/tenants/${tenantId}/increases/${increaseId}`, { method: 'PATCH', body: JSON.stringify(data) }),
      delete: (tenantId: number, increaseId: number) =>
        request<{ message: string }>(`/tenants/${tenantId}/increases/${increaseId}`, { method: 'DELETE' }),
    },
  },

  loans: {
    listByProperty: (propertyId: number) =>
      request<Loan[]>(`/loans/property/${propertyId}`),
    create: (data: Partial<Loan>) =>
      request<Loan>('/loans', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: Partial<Loan>) =>
      request<Loan>(`/loans/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: number) =>
      request<{ message: string }>(`/loans/${id}`, { method: 'DELETE' }),
  },

  recurringExpenses: {
    listByProperty: (propertyId: number) =>
      request<RecurringExpense[]>(`/recurring-expenses/property/${propertyId}`),
    create: (data: Partial<RecurringExpense>) =>
      request<RecurringExpense>('/recurring-expenses', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: Partial<RecurringExpense>) =>
      request<RecurringExpense>(`/recurring-expenses/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: number) =>
      request<{ message: string }>(`/recurring-expenses/${id}`, { method: 'DELETE' }),
  },

  hacienda: {
    summary: (propertyId: number, year?: string) =>
      request<Summary>(`/hacienda/summary/${propertyId}${year ? `?year=${year}` : ''}`),
    global: (year?: string) =>
      request<GlobalData>(`/hacienda-global${year ? `?year=${year}` : ''}`),
  },
};
