import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../infrastructure/api/client';
import type { RecurringExpense } from '../../shared/types';
import { keys } from '../../shared/query-keys';
import { invalidateAll } from '../../shared/query-utils';

export function useRecurringExpenses(propertyId: number) {
  return useQuery({
    queryKey: keys.recurringExpenses(propertyId),
    queryFn: () => api.recurringExpenses.listByProperty(propertyId),
  });
}

export function useCreateRecurringExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<RecurringExpense>) => api.recurringExpenses.create(data),
    onSuccess: () => invalidateAll(qc, [['recurring-expenses'], ['dashboard'], ['cashflow'], ['hacienda-summary'], ['hacienda-global']]),
  });
}

export function useUpdateRecurringExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<RecurringExpense> }) => api.recurringExpenses.update(id, data),
    onSuccess: () => invalidateAll(qc, [['recurring-expenses'], ['dashboard'], ['cashflow'], ['hacienda-summary'], ['hacienda-global']]),
  });
}

export function useDeleteRecurringExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.recurringExpenses.delete(id),
    onSuccess: () => invalidateAll(qc, [['recurring-expenses'], ['dashboard'], ['cashflow'], ['hacienda-summary'], ['hacienda-global']]),
  });
}
