import React, { useState } from 'react';
import { useRecurringExpenses, useCreateRecurringExpense, useUpdateRecurringExpense, useDeleteRecurringExpense } from '../../lib/queries';
import { formatEurosShort } from '../../lib/format';
import { CreditCard, Calendar, DollarSign, Percent, Plus, X, Trash2, Pencil, Check } from 'lucide-react';

interface Props {
  propertyId: number;
  onClose: () => void;
}

const expenseTypeLabels: Record<string, string> = {
  insurance_housing: 'Housing Insurance',
  insurance_life: 'Life Insurance',
  tax_ibi: 'Property Tax (IBI)',
  community: 'Comunidad (Community fees)',
  other: 'Other Recurring',
};

const inputCls = 'w-full p-1.5 text-xs border border-teal-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-teal-400';

export const RecurringExpenseManagement: React.FC<Props> = ({ propertyId, onClose }) => {
  const { data: expenses, isLoading } = useRecurringExpenses(propertyId);
  const createExpense = useCreateRecurringExpense();
  const updateExpense = useUpdateRecurringExpense();
  const deleteExpense = useDeleteRecurringExpense();

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState<{ name?: string; type?: 'insurance_housing' | 'insurance_life' | 'tax_ibi' | 'community' | 'other'; amount?: number; percentage?: number; usePercent?: boolean; frequency?: 'monthly' | 'annual'; startDate?: string }>({});
  const [name, setName] = useState('');
  const [type, setType] = useState<string>('other');
  const [usePercent, setUsePercent] = useState(false);
  const [amount, setAmount] = useState<number>(0);
  const [percentage, setPercentage] = useState<number>(0);
  const [frequency, setFrequency] = useState<'monthly' | 'annual'>('monthly');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState('');

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !startDate) return;
    if (!usePercent && amount <= 0) return;
    if (usePercent && percentage <= 0) return;
    try {
      await createExpense.mutateAsync({
        propertyId, name, type: type as any,
        ...(usePercent ? { percentage } : { amount }),
        frequency, startDate,
      });
      setName(''); setType('other'); setUsePercent(false); setAmount(0); setPercentage(0);
      setFrequency('monthly'); setStartDate(new Date().toISOString().split('T')[0]); setShowAddForm(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to add');
    }
  };

  const startEdit = (expense: any) => {
    const hasPct = !!expense.percentage;
    setEditingId(expense.id);
    setEditDraft({
      name: expense.name, type: expense.type,
      amount: expense.amount, percentage: expense.percentage,
      usePercent: hasPct,
      frequency: expense.frequency, startDate: expense.startDate,
    });
  };

  const saveEdit = async (id: number) => {
    try {
      const data: Record<string, unknown> = { ...editDraft };
      delete data.usePercent;
      if (editDraft.usePercent) delete data.amount;
      else delete data.percentage;
      await updateExpense.mutateAsync({ id, data });
      setEditingId(null); setEditDraft({});
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this recurring expense?')) return;
    try {
      await deleteExpense.mutateAsync(id);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete');
    }
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 mt-4 space-y-4">
      <div className="flex justify-between items-center border-b border-gray-200 pb-2">
        <h4 className="font-bold text-gray-800 text-sm flex items-center gap-1.5">
          <CreditCard size={16} className="text-teal-600" /> Recurring Expenses
        </h4>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      {isLoading ? (
        <div className="text-center py-4 text-xs text-gray-500">Loading expenses...</div>
      ) : (
        <div className="space-y-4">
          {(!expenses || expenses.length === 0) && !showAddForm && (
            <div className="bg-white border border-dashed border-gray-300 rounded-md p-4 text-center">
              <p className="text-xs text-gray-500 mb-2">No recurring expenses (insurance, IBI, community, etc.).</p>
              <button onClick={() => setShowAddForm(true)} className="inline-flex items-center gap-1 text-xs bg-teal-600 hover:bg-teal-700 text-white font-bold px-3 py-1.5 rounded transition">
                <Plus size={12} /> Add Recurring Expense
              </button>
            </div>
          )}
          <div className="space-y-2">
            {(expenses || []).map(expense => {
              const hasPct = !!expense.percentage;
              const annualVal = hasPct ? null : (expense.frequency === 'monthly' ? expense.amount * 12 : expense.amount);
              const isEditing = editingId === expense.id;
              return (
                <div key={expense.id} className="bg-white border border-gray-200 rounded-md p-4 shadow-xs">
                  {isEditing ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label htmlFor={`edit-re-name-${expense.id}`} className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Name</label>
                          <input id={`edit-re-name-${expense.id}`} className={inputCls} value={editDraft.name || ''} onChange={e => setEditDraft(d => ({ ...d, name: e.target.value }))} />
                        </div>
                        <div>
                          <label htmlFor={`edit-re-type-${expense.id}`} className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Type</label>
                          <select id={`edit-re-type-${expense.id}`} className={inputCls} value={editDraft.type || 'other'} onChange={e => setEditDraft(d => ({ ...d, type: e.target.value as any }))}>
                            {Object.entries(expenseTypeLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                          </select>
                        </div>
                        <div className="col-span-2 flex gap-3">
                          <label className="flex items-center gap-1 text-xs text-gray-600">
                            <input type="radio" name={`edit-re-mode-${expense.id}`} checked={!editDraft.usePercent} onChange={() => setEditDraft(d => ({ ...d, usePercent: false }))} /> Fixed
                          </label>
                          <label className="flex items-center gap-1 text-xs text-gray-600">
                            <input type="radio" name={`edit-re-mode-${expense.id}`} checked={!!editDraft.usePercent} onChange={() => setEditDraft(d => ({ ...d, usePercent: true }))} /> % of Rent
                          </label>
                        </div>
                        {!editDraft.usePercent ? (
                          <div className="col-span-2">
                            <label htmlFor={`edit-re-amount-${expense.id}`} className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Amount (€)</label>
                            <input id={`edit-re-amount-${expense.id}`} type="number" step="0.01" className={inputCls} value={editDraft.amount ?? ''} onChange={e => setEditDraft(d => ({ ...d, amount: Number(e.target.value) }))} />
                          </div>
                        ) : (
                          <div className="col-span-2">
                            <label htmlFor={`edit-re-pct-${expense.id}`} className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Percentage (%)</label>
                            <input id={`edit-re-pct-${expense.id}`} type="number" step="0.1" className={inputCls} value={editDraft.percentage ?? ''} onChange={e => setEditDraft(d => ({ ...d, percentage: Number(e.target.value) }))} />
                          </div>
                        )}
                        <div>
                          <label htmlFor={`edit-re-freq-${expense.id}`} className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Frequency</label>
                          <select id={`edit-re-freq-${expense.id}`} className={inputCls} value={editDraft.frequency || 'monthly'} onChange={e => setEditDraft(d => ({ ...d, frequency: e.target.value as 'monthly' | 'annual' }))}>
                            <option value="monthly">Monthly</option>
                            <option value="annual">Annual</option>
                          </select>
                        </div>
                        <div className="col-span-2">
                          <label htmlFor={`edit-re-start-${expense.id}`} className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Start Date</label>
                          <input id={`edit-re-start-${expense.id}`} type="date" className={inputCls} value={editDraft.startDate || ''} onChange={e => setEditDraft(d => ({ ...d, startDate: e.target.value }))} />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => saveEdit(expense.id)} className="flex items-center gap-1 px-3 py-1 rounded bg-green-600 hover:bg-green-700 text-white font-bold text-xs transition">
                          <Check size={12} /> Save
                        </button>
                        <button onClick={() => { setEditingId(null); setEditDraft({}); }} className="flex items-center gap-1 px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-xs transition">
                          <X size={12} /> Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="font-bold text-gray-800 flex items-center gap-1.5">
                          <CreditCard size={14} className="text-teal-500" /> {expense.name}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-1 text-xs text-gray-500">
                          <span className="font-semibold text-teal-800">{expenseTypeLabels[expense.type] || expense.type}</span>
                          {hasPct ? (
                            <span className="flex items-center gap-0.5"><Percent size={12} /> {expense.percentage}% / {expense.frequency}</span>
                          ) : (
                            <span className="flex items-center gap-0.5"><DollarSign size={12} /> {formatEurosShort(expense.amount)} € / {expense.frequency}</span>
                          )}
                          <span className="flex items-center gap-0.5"><Calendar size={12} /> {expense.startDate}</span>
                          {!hasPct && <span className="font-semibold text-gray-600">({formatEurosShort(annualVal!)} € / yr)</span>}
                          {hasPct && <span className="font-semibold text-teal-600">% of rental income</span>}
                        </div>
                      </div>
                      <div className="flex gap-1 ml-2">
                        <button onClick={() => startEdit(expense)} className="p-1 text-gray-400 hover:text-teal-600 transition"><Pencil size={14} /></button>
                        <button onClick={() => handleDelete(expense.id)} className="p-1 text-gray-400 hover:text-red-600 transition"><Trash2 size={14} /></button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {expenses && expenses.length > 0 && !showAddForm && (
            <button onClick={() => setShowAddForm(true)} className="inline-flex items-center gap-1 text-xs bg-teal-600 hover:bg-teal-700 text-white font-bold px-3 py-1.5 rounded transition">
              <Plus size={12} /> Add Another Expense
            </button>
          )}
          {showAddForm && (
            <form onSubmit={handleAdd} className="bg-white border border-gray-200 rounded-md p-4 space-y-3">
              <div className="flex justify-between items-center border-b border-gray-100 pb-1.5">
                <h5 className="text-xs font-bold text-gray-700 uppercase">Add Recurring Expense</h5>
                <button type="button" onClick={() => setShowAddForm(false)} className="text-gray-400 hover:text-gray-600"><X size={14} /></button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="add-re-name" className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Name</label>
                  <input id="add-re-name" type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Management fee" className={inputCls} />
                </div>
                <div>
                  <label htmlFor="add-re-type" className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Type</label>
                  <select id="add-re-type" value={type} onChange={e => setType(e.target.value)} className={inputCls}>
                    {Object.entries(expenseTypeLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div className="col-span-2 flex gap-4">
                  <label className="flex items-center gap-1 text-xs text-gray-600">
                    <input type="radio" name="add-re-mode" checked={!usePercent} onChange={() => setUsePercent(false)} /> Fixed Amount
                  </label>
                  <label className="flex items-center gap-1 text-xs text-gray-600">
                    <input type="radio" name="add-re-mode" checked={usePercent} onChange={() => setUsePercent(true)} /> % of Rent
                  </label>
                </div>
                {!usePercent ? (
                  <div className="md:col-span-2">
                    <label htmlFor="add-re-amount" className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Amount (€)</label>
                    <input id="add-re-amount" type="number" step="0.01" required={!usePercent} value={amount || ''} onChange={e => setAmount(Number(e.target.value))} placeholder="e.g. 50" className={inputCls} />
                  </div>
                ) : (
                  <div className="md:col-span-2">
                    <label htmlFor="add-re-pct" className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Percentage of Monthly Rent (%)</label>
                    <input id="add-re-pct" type="number" step="0.1" required={usePercent} value={percentage || ''} onChange={e => setPercentage(Number(e.target.value))} placeholder="e.g. 8" className={inputCls} />
                  </div>
                )}
                <div>
                  <label htmlFor="add-re-freq" className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Frequency</label>
                  <select id="add-re-freq" value={frequency} onChange={e => setFrequency(e.target.value as 'monthly' | 'annual')} className={inputCls}>
                    <option value="monthly">Monthly</option>
                    <option value="annual">Annual</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="add-re-start" className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Start Date</label>
                  <input id="add-re-start" type="date" required value={startDate} onChange={e => setStartDate(e.target.value)} className={inputCls} />
                </div>
              </div>
              <button type="submit" disabled={createExpense.isPending} className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 rounded text-xs transition disabled:opacity-50">
                {createExpense.isPending ? 'Saving...' : 'Register Recurring Expense'}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};
