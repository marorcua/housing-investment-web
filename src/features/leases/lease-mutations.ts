import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../infrastructure/api/client';
import { invalidateAll } from '../../shared/query-utils';
import type { Tenant, RentIncrease } from './tenant';

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

export function useCreateRentIncrease() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ tenantId, data }: { tenantId: number; data: { yearOffset: number; percentage: number } }) =>
      api.tenants.increases.create(tenantId, data),
    onSuccess: (_data, variables) =>
      invalidateAll(qc, [['tenants'], ['rent-increases', variables.tenantId]]),
  });
}

export function useUpdateRentIncrease() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ tenantId, increaseId, data }: { tenantId: number; increaseId: number; data: Partial<RentIncrease> }) =>
      api.tenants.increases.update(tenantId, increaseId, data),
    onSuccess: (_data, variables) =>
      invalidateAll(qc, [['tenants'], ['rent-increases', variables.tenantId]]),
  });
}

export function useDeleteRentIncrease() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ tenantId, increaseId }: { tenantId: number; increaseId: number }) =>
      api.tenants.increases.delete(tenantId, increaseId),
    onSuccess: (_data, variables) =>
      invalidateAll(qc, [['tenants'], ['rent-increases', variables.tenantId]]),
  });
}
