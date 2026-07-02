import { useQuery } from '@tanstack/react-query';
import { api } from '../../infrastructure/api/client.js';
import { keys } from './keys.js';

export function useHaciendaSummary(propertyId: number, year?: string) {
  return useQuery({
    queryKey: keys.haciendaSummary(propertyId, year),
    queryFn: () => api.hacienda.summary(propertyId, year),
  });
}

export function useGlobalData(mode: string, year?: string) {
  return useQuery({
    queryKey: keys.haciendaGlobal(mode, year),
    queryFn: () => api.hacienda.global(year),
  });
}
