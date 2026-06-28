import React from 'react';
import { QueryProvider } from '../../lib/QueryProvider';
import { PropertyDashboard } from './PropertyDashboard';

export const DashboardApp: React.FC = () => (
  <QueryProvider>
    <PropertyDashboard />
  </QueryProvider>
);
