import React from 'react';
import { QueryProvider } from '../../shared/QueryProvider';
import { PropertyDashboard } from '../properties/PropertyDashboard';

export const DashboardApp: React.FC = () => (
  <QueryProvider>
    <PropertyDashboard />
  </QueryProvider>
);
