import React from 'react';
import { Check, X } from 'lucide-react';

const inputCls = 'p-1.5 text-xs border border-blue-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-400 w-full';

interface PropertyDraft {
  name?: string;
  address?: string | null;
  purchasePrice?: number;
  purchaseDate?: string;
  cadastralValue?: number | null;
  buildingValue?: number | null;
}

interface Props {
  draft: PropertyDraft;
  onChange: (draft: PropertyDraft) => void;
  onSave: () => void;
  onCancel: () => void;
}

export const PropertyForm: React.FC<Props> = ({ draft, onChange, onSave, onCancel }) => (
  <div className="space-y-3">
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      <div>
        <label htmlFor="edit-prop-name" className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Property Name</label>
        <input id="edit-prop-name" className={inputCls} value={draft.name || ''} onChange={e => onChange({ ...draft, name: e.target.value })} />
      </div>
      <div>
        <label htmlFor="edit-prop-address" className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Address</label>
        <input id="edit-prop-address" className={inputCls} value={draft.address || ''} onChange={e => onChange({ ...draft, address: e.target.value })} />
      </div>
      <div>
        <label htmlFor="edit-prop-price" className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Purchase Price (€)</label>
        <input id="edit-prop-price" type="number" className={inputCls} value={draft.purchasePrice || ''} onChange={e => onChange({ ...draft, purchasePrice: Number(e.target.value) })} />
      </div>
      <div>
        <label htmlFor="edit-prop-date" className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Purchase Date</label>
        <input id="edit-prop-date" type="date" className={inputCls} value={draft.purchaseDate || ''} onChange={e => onChange({ ...draft, purchaseDate: e.target.value })} />
      </div>
      <div>
        <label htmlFor="edit-prop-cadastral" className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Cadastral Value (€)</label>
        <input id="edit-prop-cadastral" type="number" className={inputCls} value={draft.cadastralValue ?? ''} onChange={e => onChange({ ...draft, cadastralValue: Number(e.target.value) })} />
      </div>
      <div>
        <label htmlFor="edit-prop-building" className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Building Value (€)</label>
        <input id="edit-prop-building" type="number" className={inputCls} value={draft.buildingValue ?? ''} onChange={e => onChange({ ...draft, buildingValue: Number(e.target.value) })} />
      </div>
    </div>
    <div className="flex gap-2">
      <button onClick={onSave} className="flex items-center gap-1 px-3 py-1.5 rounded bg-green-600 hover:bg-green-700 text-white font-bold text-xs transition">
        <Check size={13} /> Save Changes
      </button>
      <button onClick={onCancel} className="flex items-center gap-1 px-3 py-1.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-xs transition">
        <X size={13} /> Cancel
      </button>
    </div>
  </div>
);
