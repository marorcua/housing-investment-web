import { useQuery } from '@tanstack/react-query';
import { api } from '../../infrastructure/api/client.js';
import { buildMonthlySummaryRows } from '../../domain/summary.js';

async function computePropertySummary(propertyId: number, year: number) {
  const [revenues, expenses, tenants, loans, recurring] = await Promise.all([
    api.revenues.listByProperty(propertyId),
    api.expenses.listByProperty(propertyId),
    api.tenants.listByProperty(propertyId),
    api.loans.listByProperty(propertyId),
    api.recurringExpenses.listByProperty(propertyId),
  ]);
  return buildMonthlySummaryRows(revenues, expenses, tenants, loans, recurring, year);
}

export function useMonthlySummary(propertyId: number, year: number) {
  return useQuery({
    queryKey: ['monthly-summary', propertyId, year],
    placeholderData: (prev) => prev,
    queryFn: () => computePropertySummary(propertyId, year),
  });
}

export function useGlobalSummary(propertyIds: number[] | null, year: number) {
  return useQuery({
    queryKey: ['global-summary', propertyIds, year],
    placeholderData: (prev) => prev,
    queryFn: async () => {
      if (!propertyIds || propertyIds.length === 0) {
        return Array.from({ length: 12 }, (_, i) => ({
          month: i + 1, label: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
          earnings: 0, mortgageInterest: 0, community: 0,
          insurance: 0, ibi: 0, repairs: 0, otherExpenses: 0, subtotalExclPrincipal: 0, principal: 0, total: 0,
        }));
      }
      const allRows = await Promise.all(propertyIds.map(pid => computePropertySummary(pid, year)));
      const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const props = ['earnings', 'mortgageInterest', 'community', 'insurance', 'ibi', 'repairs', 'otherExpenses', 'subtotalExclPrincipal', 'principal', 'total'] as const;
      return Array.from({ length: 12 }, (_, i) => {
        const m = i + 1;
        const row: any = { month: m, label: labels[i] };
        for (const p of props) {
          row[p] = allRows.reduce((a, r) => a + r[m - 1][p], 0);
        }
        return row;
      });
    },
  });
}
