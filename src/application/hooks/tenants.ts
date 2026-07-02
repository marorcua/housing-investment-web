import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../infrastructure/api/client.js';
import type { Tenant } from '../../domain/types.js';
import { getActiveTenant } from '../../domain/tenant.js';
import { keys } from './keys.js';
import { invalidateAll } from './utils.js';

export function useTenants(propertyId: number) {
  return useQuery({
    queryKey: keys.tenants(propertyId),
    queryFn: () => api.tenants.listByProperty(propertyId),
  });
}

export function useActiveTenant(propertyId: number) {
  const { data: tenants } = useTenants(propertyId);
  return tenants ? getActiveTenant(tenants) : null;
}

export function useCreateTenant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Tenant>) => api.tenants.create(data),
    onSuccess: () => invalidateAll(qc, [['tenants'], ['dashboard'], ['cashflow'], ['hacienda-summary'], ['hacienda-global']]),
  });
}

export function useUpdateTenant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Tenant> }) => api.tenants.update(id, data),
    onSuccess: () => invalidateAll(qc, [['tenants'], ['dashboard'], ['cashflow'], ['hacienda-summary'], ['hacienda-global']]),
  });
}

export function useDeleteTenant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.tenants.delete(id),
    onSuccess: () => invalidateAll(qc, [['tenants'], ['dashboard'], ['cashflow'], ['hacienda-summary'], ['hacienda-global']]),
  });
}
