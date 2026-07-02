import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../infrastructure/api/client.js';
import type { RentIncrease } from '../../domain/types.js';
import { keys } from './keys.js';
import { invalidateAll } from './utils.js';

export function useRentIncreases(tenantId: number) {
  return useQuery({
    queryKey: keys.rentIncreases(tenantId),
    queryFn: () => api.tenants.increases.list(tenantId),
  });
}

export function useCreateRentIncrease() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ tenantId, data }: { tenantId: number; data: { yearOffset: number; percentage: number } }) =>
      api.tenants.increases.create(tenantId, data),
    onSuccess: (_data, variables) =>
      invalidateAll(qc, [['tenants'], keys.rentIncreases(variables.tenantId)]),
  });
}

export function useUpdateRentIncrease() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ tenantId, increaseId, data }: { tenantId: number; increaseId: number; data: Partial<RentIncrease> }) =>
      api.tenants.increases.update(tenantId, increaseId, data),
    onSuccess: (_data, variables) =>
      invalidateAll(qc, [['tenants'], keys.rentIncreases(variables.tenantId)]),
  });
}

export function useDeleteRentIncrease() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ tenantId, increaseId }: { tenantId: number; increaseId: number }) =>
      api.tenants.increases.delete(tenantId, increaseId),
    onSuccess: (_data, variables) =>
      invalidateAll(qc, [['tenants'], keys.rentIncreases(variables.tenantId)]),
  });
}
