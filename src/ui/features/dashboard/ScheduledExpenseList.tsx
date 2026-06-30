import React from 'react';
import { formatEuros } from '../../../domain/format';
import { CreditCard, Repeat } from 'lucide-react';
import type { Transaction } from '../../../domain/types';

interface Props {
  expenses: Transaction[];
}

export const ScheduledExpenseList: React.FC<Props> = ({ expenses }) => {
  return (
    <div className="space-y-1">
      {expenses.map(exp => (
        <div key={exp.id} className="flex items-center gap-2 bg-white border border-orange-200 rounded p-2">
          <span className="text-gray-400 w-20 shrink-0">{exp.date}</span>
          <span className="font-semibold text-orange-600 w-20 shrink-0">-{formatEuros(exp.amount)} €</span>
          <span className="text-orange-500 flex-1 truncate">{exp.description}</span>
          {exp.type === 'loan' ? (
            <span className="text-[10px] text-orange-400 italic flex items-center gap-0.5"><CreditCard size={10} /> loan</span>
          ) : (
            <span className="text-[10px] text-orange-400 italic flex items-center gap-0.5"><Repeat size={10} /> recurring</span>
          )}
        </div>
      ))}
    </div>
  );
};
