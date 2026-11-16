import React from 'react';

export const LoadingSpinner: React.FC<{ text?: string }> = ({ text = 'Loading...' }) => (
  <div className="py-20 text-center text-gray-500">{text}</div>
);
