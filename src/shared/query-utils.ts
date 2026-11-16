import { useQueryClient, type QueryKey } from '@tanstack/react-query';

export function invalidateAll(qc: ReturnType<typeof useQueryClient>, keys: QueryKey[]) {
  keys.forEach(k => qc.invalidateQueries({ queryKey: k }));
}
