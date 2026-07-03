import React from 'react';
import { X } from 'lucide-react';

const inputCls = 'w-full p-1.5 text-xs border border-blue-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-400';

interface Props {
  name: string;
  monthlyRent: number;
  startDate: string;
  endDate: string;
  onNameChange: (v: string) => void;
  onRentChange: (v: number) => void;
  onStartDateChange: (v: string) => void;
  onEndDateChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isPending: boolean;
}

export const TenantForm: React.FC<Props> = ({
  name, monthlyRent, startDate, endDate,
  onNameChange, onRentChange, onStartDateChange, onEndDateChange,
  onSubmit, onCancel, isPending,
}) => (
  <form onSubmit={onSubmit} className="bg-white border border-gray-200 rounded-md p-4 space-y-3">
    <div className="flex justify-between items-center">
      <h5 className="text-xs font-bold text-gray-700 uppercase">New Lease Contract</h5>
      <button type="button" onClick={onCancel} className="text-gray-400 hover:text-gray-600"><X size={14} /></button>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div>
        <label htmlFor="add-tenant-name" className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Tenant Name</label>
        <input id="add-tenant-name" type="text" required value={name} onChange={e => onNameChange(e.target.value)} placeholder="e.g. John Doe" className={inputCls} />
      </div>
      <div>
        <label htmlFor="add-tenant-rent" className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Monthly Rent (€)</label>
        <input id="add-tenant-rent" type="number" required value={monthlyRent || ''} onChange={e => onRentChange(Number(e.target.value))} placeholder="e.g. 750" className={inputCls} />
      </div>
      <div>
        <label htmlFor="add-tenant-start" className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Start Date</label>
        <input id="add-tenant-start" type="date" required value={startDate} onChange={e => onStartDateChange(e.target.value)} className={inputCls} />
      </div>
      <div>
        <label htmlFor="add-tenant-end" className="block text-[10px] font-bold text-gray-500 uppercase mb-1">End Date (optional)</label>
        <input id="add-tenant-end" type="date" value={endDate} onChange={e => onEndDateChange(e.target.value)} className={inputCls} />
      </div>
    </div>
    <button type="submit" disabled={isPending} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded text-xs transition disabled:opacity-50">
      {isPending ? 'Saving...' : 'Create Lease Contract'}
    </button>
  </form>
);
