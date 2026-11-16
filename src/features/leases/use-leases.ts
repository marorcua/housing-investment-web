import { useQuery } from '@tanstack/react-query';
import { api } from '../../infrastructure/api/client';
import type { Tenant } from './tenant';
import { getActiveTenant } from './tenant';

export const keys = {
  tenants: (id: number) => ['tenants', id] as const,
  rentIncreases: (id: number) => ['rent-increases', id] as const,
};

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

export function useRentIncreases(tenantId: number) {
  return useQuery({
    queryKey: keys.rentIncreases(tenantId),
    queryFn: () => api.tenants.increases.list(tenantId),
  });
}
