import React from 'react';
import { QueryProvider } from '../../../application/providers/QueryProvider';
import { PropertyDashboard } from './PropertyDashboard';

export const DashboardApp: React.FC = () => (
  <QueryProvider>
    <PropertyDashboard />
  </QueryProvider>
);
