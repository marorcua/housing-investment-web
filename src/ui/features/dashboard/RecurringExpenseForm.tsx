import React from 'react';
import { X } from 'lucide-react';

const inputCls = 'w-full p-1.5 text-xs border border-teal-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-teal-400';

const expenseTypeLabels: Record<string, string> = {
  insurance_housing: 'Housing Insurance',
  insurance_life: 'Life Insurance',
  tax_ibi: 'Property Tax (IBI)',
  community: 'Comunidad (Community fees)',
  other: 'Other Recurring',
};

interface Props {
  name: string;
  type: string;
  usePercent: boolean;
  amount: number;
  percentage: number;
  frequency: 'monthly' | 'annual';
  startDate: string;
  onNameChange: (v: string) => void;
  onTypeChange: (v: string) => void;
  onUsePercentChange: (v: boolean) => void;
  onAmountChange: (v: number) => void;
  onPercentageChange: (v: number) => void;
  onFrequencyChange: (v: 'monthly' | 'annual') => void;
  onStartDateChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isPending: boolean;
}

export const RecurringExpenseForm: React.FC<Props> = ({
  name, type, usePercent, amount, percentage, frequency, startDate,
  onNameChange, onTypeChange, onUsePercentChange, onAmountChange, onPercentageChange,
  onFrequencyChange, onStartDateChange, onSubmit, onCancel, isPending,
}) => (
  <form onSubmit={onSubmit} className="bg-white border border-gray-200 rounded-md p-4 space-y-3">
    <div className="flex justify-between items-center border-b border-gray-100 pb-1.5">
      <h5 className="text-xs font-bold text-gray-700 uppercase">Add Recurring Expense</h5>
      <button type="button" onClick={onCancel} className="text-gray-400 hover:text-gray-600"><X size={14} /></button>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div>
        <label htmlFor="add-re-name" className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Name</label>
        <input id="add-re-name" type="text" required value={name} onChange={e => onNameChange(e.target.value)} placeholder="e.g. Management fee" className={inputCls} />
      </div>
      <div>
        <label htmlFor="add-re-type" className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Type</label>
        <select id="add-re-type" value={type} onChange={e => onTypeChange(e.target.value)} className={inputCls}>
          {Object.entries(expenseTypeLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>
      <div className="col-span-2 flex gap-4">
        <label className="flex items-center gap-1 text-xs text-gray-600">
          <input type="radio" name="add-re-mode" checked={!usePercent} onChange={() => onUsePercentChange(false)} /> Fixed Amount
        </label>
        <label className="flex items-center gap-1 text-xs text-gray-600">
          <input type="radio" name="add-re-mode" checked={usePercent} onChange={() => onUsePercentChange(true)} /> % of Rent
        </label>
      </div>
      {!usePercent ? (
        <div className="md:col-span-2">
          <label htmlFor="add-re-amount" className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Amount (€)</label>
          <input id="add-re-amount" type="number" step="0.01" required={!usePercent} value={amount || ''} onChange={e => onAmountChange(Number(e.target.value))} placeholder="e.g. 50" className={inputCls} />
        </div>
      ) : (
        <div className="md:col-span-2">
          <label htmlFor="add-re-pct" className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Percentage of Monthly Rent (%)</label>
          <input id="add-re-pct" type="number" step="0.1" required={usePercent} value={percentage || ''} onChange={e => onPercentageChange(Number(e.target.value))} placeholder="e.g. 8" className={inputCls} />
        </div>
      )}
      <div>
        <label htmlFor="add-re-freq" className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Frequency</label>
        <select id="add-re-freq" value={frequency} onChange={e => onFrequencyChange(e.target.value as 'monthly' | 'annual')} className={inputCls}>
          <option value="monthly">Monthly</option>
          <option value="annual">Annual</option>
        </select>
      </div>
      <div>
        <label htmlFor="add-re-start" className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Start Date</label>
        <input id="add-re-start" type="date" required value={startDate} onChange={e => onStartDateChange(e.target.value)} className={inputCls} />
      </div>
    </div>
    <button type="submit" disabled={isPending} className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 rounded text-xs transition disabled:opacity-50">
      {isPending ? 'Saving...' : 'Register Recurring Expense'}
    </button>
  </form>
);
