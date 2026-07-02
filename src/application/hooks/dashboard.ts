import { useQuery } from '@tanstack/react-query';
import { api, isAuthenticated } from '../../infrastructure/api/client.js';
import type { Property, Summary } from '../../domain/types.js';
import { getActiveTenant } from '../../domain/tenant.js';

export interface DashboardData {
  properties: Property[];
  summaries: Record<number, Summary>;
  activeTenants: Record<number, { name: string; monthlyRent: number } | null>;
}

export function useDashboardData() {
  return useQuery({
    queryKey: ['dashboard'],
    enabled: isAuthenticated(),
    queryFn: async () => {
      const properties = await api.properties.list();
      const summaryResults = await Promise.allSettled(
        properties.map(p => api.hacienda.summary(p.id).then(s => ({ id: p.id, summary: s })))
      );
      const summaries: Record<number, Summary> = {};
      summaryResults.forEach(r => {
        if (r.status === 'fulfilled') summaries[r.value.id] = r.value.summary;
      });
      const tenantResults = await Promise.allSettled(
        properties.map(p => api.tenants.listByProperty(p.id).then(tenants => ({
          id: p.id,
          tenant: getActiveTenant(tenants),
        })))
      );
      const activeTenants: Record<number, { name: string; monthlyRent: number } | null> = {};
      tenantResults.forEach(r => {
        if (r.status === 'fulfilled') activeTenants[r.value.id] = r.value.tenant;
      });
      return { properties, summaries, activeTenants };
    },
  });
}
