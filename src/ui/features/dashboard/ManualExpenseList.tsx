import React, { useState } from 'react';
import { Pencil, Trash2, X, Check } from 'lucide-react';
import { formatEuros } from '../../../domain/format';
import { useUpdateExpense, useDeleteExpense } from '../../../application/hooks/queries';
import type { Transaction } from '../../../domain/types';

interface Props {
  expenses: Transaction[];
}

const inputCls = 'p-1 text-xs border border-blue-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-400';

const expenseTypeLabels: Record<string, string> = {
  interest: 'Interest', tax: 'Tax', community: 'Community',
  insurance: 'Insurance', repair: 'Repair', other: 'Other',
};

export const ManualExpenseList: React.FC<Props> = ({ expenses }) => {
  const [editingExp, setEditingExp] = useState<number | null>(null);
  const [editExpDraft, setEditExpDraft] = useState<{ date?: string; amount?: number; type?: string; description?: string }>({});
  const updateExpense = useUpdateExpense();
  const deleteExpense = useDeleteExpense();

  const handleSaveExpense = (id: number) => {
    updateExpense.mutate({ id, data: editExpDraft });
    setEditingExp(null);
    setEditExpDraft({});
  };

  return (
    <div className="space-y-1">
      {expenses.map(exp => (
        <div key={exp.id} className="flex items-center gap-2 bg-white border border-red-100 rounded p-2">
          {editingExp === exp.id ? (
            <>
              <input type="date" className={inputCls} value={editExpDraft.date || ''} onChange={e => setEditExpDraft(d => ({ ...d, date: e.target.value }))} />
              <input type="number" className={`${inputCls} w-24`} value={editExpDraft.amount ?? ''} onChange={e => setEditExpDraft(d => ({ ...d, amount: Number(e.target.value) }))} placeholder="Amount" />
              <select className={`${inputCls} w-28`} value={editExpDraft.type || 'other'} onChange={e => setEditExpDraft(d => ({ ...d, type: e.target.value }))}>
                {Object.entries(expenseTypeLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
              <input type="text" className={`${inputCls} flex-1`} value={editExpDraft.description || ''} onChange={e => setEditExpDraft(d => ({ ...d, description: e.target.value }))} placeholder="Description" />
              <button onClick={() => handleSaveExpense(exp.id)} className="p-1 text-green-600 hover:text-green-800"><Check size={13} /></button>
              <button onClick={() => { setEditingExp(null); setEditExpDraft({}); }} className="p-1 text-gray-400 hover:text-gray-600"><X size={13} /></button>
            </>
          ) : (
            <>
              <span className="text-gray-400 w-20 shrink-0">{exp.date}</span>
              <span className="font-semibold text-red-600 w-20 shrink-0">-{formatEuros(exp.amount)} €</span>
              <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded shrink-0">{expenseTypeLabels[exp.type || ''] || exp.type}</span>
              <span className="text-gray-500 flex-1 truncate">{exp.description || '\u2014'}</span>
              <button onClick={() => { setEditingExp(exp.id); setEditExpDraft({ date: exp.date, amount: exp.amount, type: exp.type, description: exp.description || '' }); }} className="p-1 text-gray-300 hover:text-blue-500 transition"><Pencil size={12} /></button>
              <button onClick={() => { if (window.confirm('Delete this expense entry?')) deleteExpense.mutate(exp.id); }} className="p-1 text-gray-300 hover:text-red-500 transition"><Trash2 size={12} /></button>
            </>
          )}
        </div>
      ))}
    </div>
  );
};
