import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../infrastructure/api/client';
import type { Transaction } from '../../shared/types';
import { invalidateAll } from '../../shared/query-utils';

export function useCreateExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Transaction>) => api.expenses.create(data),
    onSuccess: () => invalidateAll(qc, [['expenses'], ['cashflow'], ['hacienda-summary'], ['hacienda-global']]),
  });
}

export function useUpdateExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Transaction> }) => api.expenses.update(id, data),
    onSuccess: () => invalidateAll(qc, [['expenses'], ['cashflow'], ['hacienda-summary'], ['hacienda-global']]),
  });
}

export function useDeleteExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.expenses.delete(id),
    onSuccess: () => invalidateAll(qc, [['expenses'], ['cashflow'], ['hacienda-summary'], ['hacienda-global']]),
  });
}
