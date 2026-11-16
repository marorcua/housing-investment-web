import { useQuery } from '@tanstack/react-query';
import { api } from '../../infrastructure/api/client';
import { buildMonthData } from './cashflow';

export function useCashflowData(propertyId: number, year: number) {
  return useQuery({
    queryKey: ['cashflow', propertyId, year],
    queryFn: async () => {
      const [revenues, expenses, tenants, loans, recurring] = await Promise.all([
        api.revenues.listByProperty(propertyId),
        api.expenses.listByProperty(propertyId),
        api.tenants.listByProperty(propertyId),
        api.loans.listByProperty(propertyId),
        api.recurringExpenses.listByProperty(propertyId),
      ]);
      return buildMonthData(revenues, expenses, tenants, loans, recurring, propertyId, year);
    },
  });
}
