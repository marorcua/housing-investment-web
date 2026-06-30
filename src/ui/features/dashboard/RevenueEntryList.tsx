import React, { useState } from 'react';
import { Pencil, Trash2, X, Check } from 'lucide-react';
import { formatEuros } from '../../../domain/format';
import { useUpdateRevenue, useDeleteRevenue } from '../../../application/hooks/queries';
import type { Transaction } from '../../../domain/types';

interface Props {
  revenues: Transaction[];
}

const inputCls = 'p-1 text-xs border border-blue-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-400';

export const RevenueEntryList: React.FC<Props> = ({ revenues }) => {
  const [editingRev, setEditingRev] = useState<number | null>(null);
  const [editRevDraft, setEditRevDraft] = useState<{ date?: string; amount?: number; description?: string }>({});
  const updateRevenue = useUpdateRevenue();
  const deleteRevenue = useDeleteRevenue();

  const handleSaveRevenue = (id: number) => {
    updateRevenue.mutate({ id, data: editRevDraft });
    setEditingRev(null);
    setEditRevDraft({});
  };

  return (
    <div className="space-y-1">
      {revenues.map(rev => {
        const isTenantRev = rev.id < 0;
        return (
          <div key={rev.id} className={`flex items-center gap-2 bg-white border rounded p-2 ${isTenantRev ? 'border-blue-200' : 'border-green-100'}`}>
            {isTenantRev ? (
              <>
                <span className="text-gray-400 w-20 shrink-0">{rev.date}</span>
                <span className="font-semibold text-blue-600 w-20 shrink-0">+{formatEuros(rev.amount)} €</span>
                <span className="text-blue-500 flex-1 truncate">{rev.description}</span>
                <span className="text-[10px] text-blue-400 italic">(rent)</span>
              </>
            ) : editingRev === rev.id ? (
              <>
                <input type="date" className={inputCls} value={editRevDraft.date || ''} onChange={e => setEditRevDraft(d => ({ ...d, date: e.target.value }))} />
                <input type="number" className={`${inputCls} w-24`} value={editRevDraft.amount ?? ''} onChange={e => setEditRevDraft(d => ({ ...d, amount: Number(e.target.value) }))} placeholder="Amount" />
                <input type="text" className={`${inputCls} flex-1`} value={editRevDraft.description || ''} onChange={e => setEditRevDraft(d => ({ ...d, description: e.target.value }))} placeholder="Description" />
                <button onClick={() => handleSaveRevenue(rev.id)} className="p-1 text-green-600 hover:text-green-800"><Check size={13} /></button>
                <button onClick={() => { setEditingRev(null); setEditRevDraft({}); }} className="p-1 text-gray-400 hover:text-gray-600"><X size={13} /></button>
              </>
            ) : (
              <>
                <span className="text-gray-400 w-20 shrink-0">{rev.date}</span>
                <span className="font-semibold text-green-600 w-20 shrink-0">+{formatEuros(rev.amount)} €</span>
                <span className="text-gray-500 flex-1 truncate">{rev.description || '\u2014'}</span>
                <button onClick={() => { setEditingRev(rev.id); setEditRevDraft({ date: rev.date, amount: rev.amount, description: rev.description || '' }); }} className="p-1 text-gray-300 hover:text-blue-500 transition"><Pencil size={12} /></button>
                <button onClick={() => { if (window.confirm('Delete this revenue entry?')) deleteRevenue.mutate(rev.id); }} className="p-1 text-gray-300 hover:text-red-500 transition"><Trash2 size={12} /></button>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};
