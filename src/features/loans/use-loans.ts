import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../infrastructure/api/client';
import type { Loan } from '../../shared/types';
import { keys } from '../../shared/query-keys';
import { invalidateAll } from '../../shared/query-utils';

export function useLoans(propertyId: number) {
  return useQuery({
    queryKey: keys.loans(propertyId),
    queryFn: () => api.loans.listByProperty(propertyId),
  });
}

export function useCreateLoan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Loan>) => api.loans.create(data),
    onSuccess: () => invalidateAll(qc, [['loans'], ['dashboard'], ['cashflow'], ['hacienda-summary'], ['hacienda-global']]),
  });
}

export function useUpdateLoan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Loan> }) => api.loans.update(id, data),
    onSuccess: () => invalidateAll(qc, [['loans'], ['dashboard'], ['cashflow'], ['hacienda-summary'], ['hacienda-global']]),
  });
}

export function useDeleteLoan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.loans.delete(id),
    onSuccess: () => invalidateAll(qc, [['loans'], ['dashboard'], ['cashflow'], ['hacienda-summary'], ['hacienda-global']]),
  });
}
