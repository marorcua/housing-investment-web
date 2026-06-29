import React from 'react';
import { isAuthenticated, logout } from '../../lib/api-client';

export const TopBar: React.FC = () => {
  const loggedIn = isAuthenticated();
  const path = typeof window !== 'undefined' ? window.location.pathname : '';

  const linkCls = (href: string) =>
    `transition ${path === href ? 'text-blue-600 font-semibold' : 'hover:text-blue-600'}`;

  const handleLogout = () => {
    logout();
    window.location.href = '/dashboard';
  };

  return (
    <nav className="bg-white border-b border-gray-200 py-4 px-6 mb-8">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <a href="/" className="text-xl font-bold text-blue-600">HousingInvest</a>
        <div className="space-x-6 flex items-center">
          <a href="/" className={linkCls('/')}>Calculator</a>
          <a href="/dashboard" className={linkCls('/dashboard')}>Dashboard</a>
          <a href="/summary" className={linkCls('/summary')}>Summary</a>
          {loggedIn && (
            <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-red-600 ml-4 transition font-medium">
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};
