import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export const QueryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [qc] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: 1,
      },
    },
  }));
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
};
