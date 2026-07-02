import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../infrastructure/api/client.js';
import type { Transaction } from '../../domain/types.js';
import { invalidateAll } from './utils.js';

export function useCreateRevenue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Transaction>) => api.revenues.create(data),
    onSuccess: () => invalidateAll(qc, [['revenues'], ['cashflow'], ['hacienda-summary'], ['hacienda-global']]),
  });
}

export function useUpdateRevenue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Transaction> }) => api.revenues.update(id, data),
    onSuccess: () => invalidateAll(qc, [['revenues'], ['cashflow'], ['hacienda-summary'], ['hacienda-global']]),
  });
}

export function useDeleteRevenue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.revenues.delete(id),
    onSuccess: () => invalidateAll(qc, [['revenues'], ['cashflow'], ['hacienda-summary'], ['hacienda-global']]),
  });
}
