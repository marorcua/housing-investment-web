import React from 'react';
import { User, DollarSign, Calendar, Pencil, X, Check, UserX, Trash2 } from 'lucide-react';
import type { Tenant } from '../../features/leases/tenant';
import { RentIncreaseSection } from './RentIncreaseSection';

const inputCls = 'w-full p-1.5 text-xs border border-blue-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-400';

interface Props {
  tenant: Tenant;
  isActive: boolean;
  isEditing: boolean;
  editDraft: Record<string, any>;
  onEditStart: () => void;
  onEditDraftChange: (draft: Record<string, any>) => void;
  onEditSave: () => void;
  onEditCancel: () => void;
  onTerminate: () => void;
  onDelete: () => void;
}

export const TenantCard: React.FC<Props> = ({
  tenant, isActive, isEditing, editDraft,
  onEditStart, onEditDraftChange, onEditSave, onEditCancel,
  onTerminate, onDelete,
}) => (
  <div className={`bg-white border rounded-md p-4 shadow-xs relative ${isActive ? 'border-green-200' : 'border-gray-200'}`}>
    {isActive && (
      <span className="absolute top-3 right-12 text-[10px] bg-green-100 text-green-800 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Active</span>
    )}
    {isEditing ? (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label htmlFor={`edit-tenant-name-${tenant.id}`} className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Name</label>
            <input id={`edit-tenant-name-${tenant.id}`} className={inputCls} value={editDraft.name || ''} onChange={e => onEditDraftChange({ ...editDraft, name: e.target.value })} />
          </div>
          <div>
            <label htmlFor={`edit-tenant-rent-${tenant.id}`} className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Monthly Rent (€)</label>
            <input id={`edit-tenant-rent-${tenant.id}`} type="number" className={inputCls} value={editDraft.monthlyRent || ''} onChange={e => onEditDraftChange({ ...editDraft, monthlyRent: Number(e.target.value) })} />
          </div>
          <div>
            <label htmlFor={`edit-tenant-start-${tenant.id}`} className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Start Date</label>
            <input id={`edit-tenant-start-${tenant.id}`} type="date" className={inputCls} value={editDraft.startDate || ''} onChange={e => onEditDraftChange({ ...editDraft, startDate: e.target.value })} />
          </div>
          <div>
            <label htmlFor={`edit-tenant-end-${tenant.id}`} className="block text-[10px] font-bold text-gray-500 uppercase mb-1">End Date</label>
            <input id={`edit-tenant-end-${tenant.id}`} type="date" className={inputCls} value={editDraft.endDate || ''} onChange={e => onEditDraftChange({ ...editDraft, endDate: e.target.value })} />
          </div>
        </div>
        <div className="flex gap-2 pt-1">
          <button onClick={onEditSave} className="flex items-center gap-1 px-3 py-1 rounded bg-green-600 hover:bg-green-700 text-white font-bold text-xs transition">
            <Check size={12} /> Save
          </button>
          <button onClick={onEditCancel} className="flex items-center gap-1 px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-xs transition">
            <X size={12} /> Cancel
          </button>
        </div>
      </div>
    ) : (
      <div className="space-y-2">
        <div className="font-bold text-gray-800 flex items-center gap-1.5">
          <User size={15} className={isActive ? 'text-green-600' : 'text-gray-400'} /> {tenant.name}
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
          <div className="flex items-center gap-1"><DollarSign size={13} /> {tenant.monthlyRent} € / month</div>
          <div className="flex items-center gap-1"><Calendar size={13} /> {tenant.startDate} → {tenant.endDate || 'current'}</div>
        </div>
        <div className="pt-2 flex gap-2 flex-wrap">
          <button onClick={onEditStart} className="flex items-center gap-1 px-3 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs transition">
            <Pencil size={12} /> Edit
          </button>
          {isActive && (
            <button onClick={onTerminate} className="flex items-center gap-1 px-3 py-1 rounded bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold text-xs transition">
              <UserX size={12} /> Terminate
            </button>
          )}
          <button onClick={onDelete} className="flex items-center gap-1 px-3 py-1 rounded bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs transition">
            <Trash2 size={12} /> Delete
          </button>
        </div>
        <RentIncreaseSection tenant={tenant} />
      </div>
    )}
  </div>
);
