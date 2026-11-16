import React from 'react';
import { formatEurosShort } from '../../shared/format';
import { calcMonthlyPayment } from '../../shared/loan';
import { Landmark, Calendar, DollarSign, Percent, Pencil, Trash2, Check, X, Banknote } from 'lucide-react';

const inputCls = 'w-full p-1.5 text-xs border border-indigo-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-indigo-400';

interface Props {
  loan: any;
  isEditing: boolean;
  editDraft: Record<string, any>;
  onEditStart: () => void;
  onEditDraftChange: (draft: Record<string, any>) => void;
  onEditSave: () => void;
  onEditCancel: () => void;
  onDelete: () => void;
}

export const LoanCard: React.FC<Props> = ({
  loan, isEditing, editDraft,
  onEditStart, onEditDraftChange, onEditSave, onEditCancel, onDelete,
}) => {
  const monthly = calcMonthlyPayment(loan.principal, loan.interestRate, loan.termYears);
  const effectiveMonthly = loan.actualPayment ?? monthly;

  return (
    <div className="bg-white border border-gray-200 rounded-md p-4 shadow-xs">
      {isEditing ? (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label htmlFor={`edit-loan-name-${loan.id}`} className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Name</label>
              <input id={`edit-loan-name-${loan.id}`} className={inputCls} value={editDraft.name || ''} onChange={e => onEditDraftChange({ ...editDraft, name: e.target.value })} />
            </div>
            <div>
              <label htmlFor={`edit-loan-principal-${loan.id}`} className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Principal (€)</label>
              <input id={`edit-loan-principal-${loan.id}`} type="number" className={inputCls} value={editDraft.principal || ''} onChange={e => onEditDraftChange({ ...editDraft, principal: Number(e.target.value) })} />
            </div>
            <div>
              <label htmlFor={`edit-loan-rate-${loan.id}`} className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Interest Rate (%)</label>
              <input id={`edit-loan-rate-${loan.id}`} type="number" step="0.01" className={inputCls} value={editDraft.interestRate ?? ''} onChange={e => onEditDraftChange({ ...editDraft, interestRate: Number(e.target.value) })} />
            </div>
            <div>
              <label htmlFor={`edit-loan-term-${loan.id}`} className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Term (Years)</label>
              <input id={`edit-loan-term-${loan.id}`} type="number" className={inputCls} value={editDraft.termYears || ''} onChange={e => onEditDraftChange({ ...editDraft, termYears: Number(e.target.value) })} />
            </div>
            <div>
              <label htmlFor={`edit-loan-actpay-${loan.id}`} className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Actual Payment (€)</label>
              <input id={`edit-loan-actpay-${loan.id}`} type="number" step="0.01" className={inputCls} value={editDraft.actualPayment ?? ''} onChange={e => onEditDraftChange({ ...editDraft, actualPayment: Number(e.target.value) })} />
            </div>
            <div className="col-span-2">
              <label htmlFor={`edit-loan-start-${loan.id}`} className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Start Date</label>
              <input id={`edit-loan-start-${loan.id}`} type="date" className={inputCls} value={editDraft.startDate || ''} onChange={e => onEditDraftChange({ ...editDraft, startDate: e.target.value })} />
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
              <Landmark size={14} className="text-indigo-500" /> {loan.name}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-1 text-xs text-gray-500">
              <span className="flex items-center gap-0.5"><DollarSign size={12} /> {formatEurosShort(loan.principal)} €</span>
              <span className="flex items-center gap-0.5"><Percent size={12} /> {loan.interestRate}%</span>
              <span className="flex items-center gap-0.5"><Calendar size={12} /> {loan.termYears} yrs · {loan.startDate}</span>
              {loan.actualPayment ? (
                <span className="font-semibold text-amber-700 flex items-center gap-0.5">
                  <Banknote size={12} /> {loan.actualPayment.toFixed(2)} €/mo <span className="font-normal text-gray-400">(bank)</span>
                </span>
              ) : (
                <span className="font-semibold text-indigo-700">{monthly.toFixed(2)} €/mo</span>
              )}
            </div>
          </div>
          <div className="flex gap-1 ml-2">
            <button onClick={onEditStart} className="p-1 text-gray-400 hover:text-indigo-600 transition"><Pencil size={14} /></button>
            <button onClick={onDelete} className="p-1 text-gray-400 hover:text-red-600 transition"><Trash2 size={14} /></button>
          </div>
        </div>
      )}
    </div>
  );
};
