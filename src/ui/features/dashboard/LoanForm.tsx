import React from 'react';
import { X } from 'lucide-react';

const inputCls = 'w-full p-1.5 text-xs border border-indigo-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-indigo-400';

interface Props {
  name: string;
  principal: number;
  interestRate: number;
  termYears: number;
  startDate: string;
  actualPayment: number;
  onNameChange: (v: string) => void;
  onPrincipalChange: (v: number) => void;
  onRateChange: (v: number) => void;
  onTermChange: (v: number) => void;
  onStartDateChange: (v: string) => void;
  onActualPaymentChange: (v: number) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isPending: boolean;
}

export const LoanForm: React.FC<Props> = ({
  name, principal, interestRate, termYears, startDate, actualPayment,
  onNameChange, onPrincipalChange, onRateChange, onTermChange, onStartDateChange, onActualPaymentChange,
  onSubmit, onCancel, isPending,
}) => (
  <form onSubmit={onSubmit} className="bg-white border border-gray-200 rounded-md p-4 space-y-3">
    <div className="flex justify-between items-center border-b border-gray-100 pb-1.5">
      <h5 className="text-xs font-bold text-gray-700 uppercase">Add Financing / Loan</h5>
      <button type="button" onClick={onCancel} className="text-gray-400 hover:text-gray-600"><X size={14} /></button>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div>
        <label htmlFor="add-loan-name" className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Loan Name</label>
        <input id="add-loan-name" type="text" required value={name} onChange={e => onNameChange(e.target.value)} placeholder="e.g. Mortgage, Reform Loan" className={inputCls} />
      </div>
      <div>
        <label htmlFor="add-loan-principal" className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Principal (€)</label>
        <input id="add-loan-principal" type="number" required value={principal || ''} onChange={e => onPrincipalChange(Number(e.target.value))} placeholder="e.g. 150000" className={inputCls} />
      </div>
      <div>
        <label htmlFor="add-loan-rate" className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Interest Rate (%)</label>
        <input id="add-loan-rate" type="number" step="0.01" required value={interestRate || ''} onChange={e => onRateChange(Number(e.target.value))} placeholder="e.g. 3.25" className={inputCls} />
      </div>
      <div>
        <label htmlFor="add-loan-term" className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Term (Years)</label>
        <input id="add-loan-term" type="number" required value={termYears || ''} onChange={e => onTermChange(Number(e.target.value))} placeholder="e.g. 30" className={inputCls} />
      </div>
      <div>
        <label htmlFor="add-loan-actpay" className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Actual Payment (€) — optional</label>
        <input id="add-loan-actpay" type="number" step="0.01" value={actualPayment || ''} onChange={e => onActualPaymentChange(Number(e.target.value))} placeholder="e.g. 675.50" className={inputCls} />
      </div>
      <div className="md:col-span-2">
        <label htmlFor="add-loan-start" className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Start Date</label>
        <input id="add-loan-start" type="date" required value={startDate} onChange={e => onStartDateChange(e.target.value)} className={inputCls} />
      </div>
    </div>
    <button type="submit" disabled={isPending} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded text-xs transition disabled:opacity-50">
      {isPending ? 'Saving...' : 'Register Loan'}
    </button>
  </form>
);
