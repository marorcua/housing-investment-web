import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../infrastructure/api/client.js';
import type { Property } from '../../domain/types.js';
import { keys } from './keys.js';
import { invalidateAll } from './utils.js';

export function useProperties() {
  return useQuery({
    queryKey: keys.properties,
    queryFn: () => api.properties.list(),
  });
}

export function useProperty(id: number) {
  return useQuery({
    queryKey: ['property', id],
    queryFn: () => api.properties.get(id),
  });
}

export function useCreateProperty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Property>) => api.properties.create(data),
    onSuccess: () => invalidateAll(qc, [['properties'], ['dashboard'], ['hacienda-global']]),
  });
}

export function useUpdateProperty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Property> }) => api.properties.update(id, data),
    onSuccess: () => invalidateAll(qc, [['properties'], ['dashboard'], ['hacienda-global']]),
  });
}

export function useDeleteProperty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.properties.delete(id),
    onSuccess: () => invalidateAll(qc, [['properties'], ['dashboard'], ['hacienda-global']]),
  });
}
