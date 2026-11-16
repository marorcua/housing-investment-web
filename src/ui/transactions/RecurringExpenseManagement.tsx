import React, { useState } from 'react';
import { useRecurringExpenses, useCreateRecurringExpense, useUpdateRecurringExpense, useDeleteRecurringExpense } from '../../features/transactions/use-recurring-expenses';
import { CreditCard, Plus, X } from 'lucide-react';
import { RecurringExpenseCard } from './RecurringExpenseCard';
import { RecurringExpenseForm } from './RecurringExpenseForm';

interface Props {
  propertyId: number;
  onClose: () => void;
}

export const RecurringExpenseManagement: React.FC<Props> = ({ propertyId, onClose }) => {
  const { data: expenses, isLoading } = useRecurringExpenses(propertyId);
  const createExpense = useCreateRecurringExpense();
  const updateExpense = useUpdateRecurringExpense();
  const deleteExpense = useDeleteRecurringExpense();

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState<Record<string, any>>({});
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
    setEditingId(expense.id);
    setEditDraft({
      name: expense.name, type: expense.type,
      amount: expense.amount, percentage: expense.percentage,
      usePercent: !!expense.percentage,
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
            {(expenses || []).map(expense => (
              <RecurringExpenseCard
                key={expense.id}
                expense={expense}
                isEditing={editingId === expense.id}
                editDraft={editDraft}
                onEditStart={() => startEdit(expense)}
                onEditDraftChange={setEditDraft}
                onEditSave={() => saveEdit(expense.id)}
                onEditCancel={() => { setEditingId(null); setEditDraft({}); }}
                onDelete={() => handleDelete(expense.id)}
              />
            ))}
          </div>
          {expenses && expenses.length > 0 && !showAddForm && (
            <button onClick={() => setShowAddForm(true)} className="inline-flex items-center gap-1 text-xs bg-teal-600 hover:bg-teal-700 text-white font-bold px-3 py-1.5 rounded transition">
              <Plus size={12} /> Add Another Expense
            </button>
          )}
          {showAddForm && (
            <RecurringExpenseForm
              name={name}
              type={type}
              usePercent={usePercent}
              amount={amount}
              percentage={percentage}
              frequency={frequency}
              startDate={startDate}
              onNameChange={setName}
              onTypeChange={setType}
              onUsePercentChange={setUsePercent}
              onAmountChange={setAmount}
              onPercentageChange={setPercentage}
              onFrequencyChange={setFrequency}
              onStartDateChange={setStartDate}
              onSubmit={handleAdd}
              onCancel={() => setShowAddForm(false)}
              isPending={createExpense.isPending}
            />
          )}
        </div>
      )}
    </div>
  );
};
