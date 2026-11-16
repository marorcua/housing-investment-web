import React from 'react';
import { formatEurosShort } from '../../shared/format';
import { CreditCard, Calendar, DollarSign, Percent, Pencil, Trash2, Check, X } from 'lucide-react';

const inputCls = 'w-full p-1.5 text-xs border border-teal-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-teal-400';

const expenseTypeLabels: Record<string, string> = {
  insurance_housing: 'Housing Insurance',
  insurance_life: 'Life Insurance',
  tax_ibi: 'Property Tax (IBI)',
  community: 'Comunidad (Community fees)',
  other: 'Other Recurring',
};

interface Props {
  expense: any;
  isEditing: boolean;
  editDraft: Record<string, any>;
  onEditStart: () => void;
  onEditDraftChange: (draft: Record<string, any>) => void;
  onEditSave: () => void;
  onEditCancel: () => void;
  onDelete: () => void;
}

export const RecurringExpenseCard: React.FC<Props> = ({
  expense, isEditing, editDraft,
  onEditStart, onEditDraftChange, onEditSave, onEditCancel, onDelete,
}) => {
  const hasPct = !!expense.percentage;
  const annualVal = hasPct ? null : (expense.frequency === 'monthly' ? expense.amount * 12 : expense.amount);

  return (
    <div className="bg-white border border-gray-200 rounded-md p-4 shadow-xs">
      {isEditing ? (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label htmlFor={`edit-re-name-${expense.id}`} className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Name</label>
              <input id={`edit-re-name-${expense.id}`} className={inputCls} value={editDraft.name || ''} onChange={e => onEditDraftChange({ ...editDraft, name: e.target.value })} />
            </div>
            <div>
              <label htmlFor={`edit-re-type-${expense.id}`} className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Type</label>
              <select id={`edit-re-type-${expense.id}`} className={inputCls} value={editDraft.type || 'other'} onChange={e => onEditDraftChange({ ...editDraft, type: e.target.value as any })}>
                {Object.entries(expenseTypeLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div className="col-span-2 flex gap-3">
              <label className="flex items-center gap-1 text-xs text-gray-600">
                <input type="radio" name={`edit-re-mode-${expense.id}`} checked={!editDraft.usePercent} onChange={() => onEditDraftChange({ ...editDraft, usePercent: false })} /> Fixed
              </label>
              <label className="flex items-center gap-1 text-xs text-gray-600">
                <input type="radio" name={`edit-re-mode-${expense.id}`} checked={!!editDraft.usePercent} onChange={() => onEditDraftChange({ ...editDraft, usePercent: true })} /> % of Rent
              </label>
            </div>
            {!editDraft.usePercent ? (
              <div className="col-span-2">
                <label htmlFor={`edit-re-amount-${expense.id}`} className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Amount (€)</label>
                <input id={`edit-re-amount-${expense.id}`} type="number" step="0.01" className={inputCls} value={editDraft.amount ?? ''} onChange={e => onEditDraftChange({ ...editDraft, amount: Number(e.target.value) })} />
              </div>
            ) : (
              <div className="col-span-2">
                <label htmlFor={`edit-re-pct-${expense.id}`} className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Percentage (%)</label>
                <input id={`edit-re-pct-${expense.id}`} type="number" step="0.1" className={inputCls} value={editDraft.percentage ?? ''} onChange={e => onEditDraftChange({ ...editDraft, percentage: Number(e.target.value) })} />
              </div>
            )}
            <div>
              <label htmlFor={`edit-re-freq-${expense.id}`} className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Frequency</label>
              <select id={`edit-re-freq-${expense.id}`} className={inputCls} value={editDraft.frequency || 'monthly'} onChange={e => onEditDraftChange({ ...editDraft, frequency: e.target.value as 'monthly' | 'annual' })}>
                <option value="monthly">Monthly</option>
                <option value="annual">Annual</option>
              </select>
            </div>
            <div className="col-span-2">
              <label htmlFor={`edit-re-start-${expense.id}`} className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Start Date</label>
              <input id={`edit-re-start-${expense.id}`} type="date" className={inputCls} value={editDraft.startDate || ''} onChange={e => onEditDraftChange({ ...editDraft, startDate: e.target.value })} />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={onEditSave} className="flex items-center gap-1 px-3 py-1 rounded bg-green-600 hover:bg-green-700 text-white font-bold text-xs transition">
              <Check size={12} /> Save
            </button>
            <button onClick={onEditCancel} className="flex items-center gap-1 px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-xs transition">
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
            <button onClick={onEditStart} className="p-1 text-gray-400 hover:text-teal-600 transition"><Pencil size={14} /></button>
            <button onClick={onDelete} className="p-1 text-gray-400 hover:text-red-600 transition"><Trash2 size={14} /></button>
          </div>
        </div>
      )}
    </div>
  );
};
