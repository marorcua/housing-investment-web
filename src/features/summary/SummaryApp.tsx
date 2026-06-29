import React, { useState } from 'react';
import { QueryProvider } from '../../lib/QueryProvider';
import { GlobalSummary } from '../dashboard/GlobalSummary';
import { LoginPage } from '../auth/LoginPage';
import { isAuthenticated } from '../../lib/api-client';

const SummaryContent: React.FC = () => {
  const [authTick, setAuthTick] = useState(0);

  if (!isAuthenticated()) {
    return <LoginPage onLoggedIn={() => setAuthTick(t => t + 1)} />;
  }

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Monthly Summary</h2>
        <p className="text-gray-500">View monthly earnings, expenses, and principal breakdown across your properties.</p>
      </div>
      <GlobalSummary />
    </div>
  );
};

export const SummaryApp: React.FC = () => (
  <QueryProvider>
    <SummaryContent />
  </QueryProvider>
);
