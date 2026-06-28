import React, { useState } from 'react';
import { useCreateRevenue, useCreateExpense } from '../../lib/queries';

interface Props {
  propertyId: number;
  type: 'revenue' | 'expense';
  onAdded: () => void;
  onCancel: () => void;
}

export const AddTransactionForm: React.FC<Props> = ({ propertyId, type, onAdded, onCancel }) => {
  const createRevenue = useCreateRevenue();
  const createExpense = useCreateExpense();
  const mutation = type === 'revenue' ? createRevenue : createExpense;

  const [amount, setAmount] = useState(0);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [expenseType, setExpenseType] = useState('other');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const body = type === 'revenue'
        ? { propertyId, amount, date, description }
        : { propertyId, amount, type: expenseType, date, description };
      await mutation.mutateAsync(body);
      onAdded();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded-lg border border-gray-200 mt-4 space-y-3">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-sm font-bold uppercase tracking-wide">Add {type}</h4>
        <button type="button" onClick={onCancel} className="text-gray-400 hover:text-gray-600 italic text-xs">Cancel</button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase">Amount (€)</label>
          <input type="number" required value={amount} onChange={e => setAmount(Number(e.target.value))} className="w-full p-1 text-sm border rounded" />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase">Date</label>
          <input type="date" required value={date} onChange={e => setDate(e.target.value)} className="w-full p-1 text-sm border rounded" />
        </div>
      </div>
      {type === 'expense' && (
        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase">Type</label>
          <select value={expenseType} onChange={e => setExpenseType(e.target.value)} className="w-full p-1 text-sm border rounded">
            <option value="interest">Interest</option>
            <option value="tax">Tax (IBI, etc)</option>
            <option value="community">Community</option>
            <option value="insurance">Insurance</option>
            <option value="repair">Repair</option>
            <option value="other">Other</option>
          </select>
        </div>
      )}
      <div>
        <label className="block text-[10px] font-bold text-gray-400 uppercase">Description</label>
        <input type="text" value={description} onChange={e => setDescription(e.target.value)} className="w-full p-1 text-sm border rounded" />
      </div>
      <button type="submit" disabled={mutation.isPending} className={`w-full py-2 rounded text-white text-sm font-bold ${type === 'revenue' ? 'bg-green-600' : 'bg-red-600'} disabled:opacity-50`}>
        {mutation.isPending ? 'Saving...' : `Add ${type === 'revenue' ? 'Revenue' : 'Expense'}`}
      </button>
    </form>
  );
};
