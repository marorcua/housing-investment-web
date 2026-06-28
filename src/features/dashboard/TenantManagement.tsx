import React, { useState } from 'react';
import { useTenants, useCreateTenant, useUpdateTenant, useDeleteTenant } from '../../lib/queries';
import { User, Calendar, DollarSign, Plus, X, UserX, Trash2, Pencil, Check } from 'lucide-react';

interface Props {
  propertyId: number;
  onClose: () => void;
}

const inputCls = 'w-full p-1.5 text-xs border border-blue-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-400';

export const TenantManagement: React.FC<Props> = ({ propertyId, onClose }) => {
  const { data: tenants, isLoading } = useTenants(propertyId);
  const createTenant = useCreateTenant();
  const updateTenant = useUpdateTenant();
  const deleteTenant = useDeleteTenant();

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState<{ name?: string; startDate?: string; endDate?: string | null; monthlyRent?: number }>({});
  const [newName, setNewName] = useState('');
  const [newStartDate, setNewStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [newEndDate, setNewEndDate] = useState('');
  const [newMonthlyRent, setNewMonthlyRent] = useState<number>(0);
  const [error, setError] = useState('');

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || newMonthlyRent <= 0 || !newStartDate) return;
    try {
      await createTenant.mutateAsync({ propertyId, name: newName, startDate: newStartDate, endDate: newEndDate || null, monthlyRent: newMonthlyRent });
      setNewName(''); setNewStartDate(new Date().toISOString().split('T')[0]);
      setNewEndDate(''); setNewMonthlyRent(0); setShowAddForm(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to add tenant');
    }
  };

  const startEdit = (tenant: { id: number; name: string; startDate: string; endDate: string | null; monthlyRent: number }) => {
    setEditingId(tenant.id);
    setEditDraft({ name: tenant.name, startDate: tenant.startDate, endDate: tenant.endDate || '', monthlyRent: tenant.monthlyRent });
  };

  const saveEdit = async (id: number) => {
    const payload = { ...editDraft };
    if (payload.endDate === '') payload.endDate = null;
    try {
      await updateTenant.mutateAsync({ id, data: payload });
      setEditingId(null); setEditDraft({});
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save');
    }
  };

  const cancelEdit = () => { setEditingId(null); setEditDraft({}); };

  const handleTerminate = async (id: number) => {
    const today = new Date().toISOString().split('T')[0];
    const d = window.prompt('Enter lease end date (YYYY-MM-DD):', today);
    if (d === null) return;
    try {
      await updateTenant.mutateAsync({ id, data: { endDate: d || today } });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to terminate');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this tenant record?')) return;
    try {
      await deleteTenant.mutateAsync(id);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete');
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const activeTenant = tenants?.find(t => !t.endDate || t.endDate >= todayStr);
  const inactiveTenants = tenants?.filter(t => t.id !== activeTenant?.id) || [];

  const renderTenantCard = (tenant: { id: number; name: string; startDate: string; endDate: string | null; monthlyRent: number }, isActive: boolean) => {
    const isEditing = editingId === tenant.id;
    return (
      <div key={tenant.id} className={`bg-white border rounded-md p-4 shadow-xs relative ${isActive ? 'border-green-200' : 'border-gray-200'}`}>
        {isActive && (
          <span className="absolute top-3 right-12 text-[10px] bg-green-100 text-green-800 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Active</span>
        )}
        {isEditing ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Name</label>
                <input className={inputCls} value={editDraft.name || ''} onChange={e => setEditDraft(d => ({ ...d, name: e.target.value }))} />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Monthly Rent (€)</label>
                <input type="number" className={inputCls} value={editDraft.monthlyRent || ''} onChange={e => setEditDraft(d => ({ ...d, monthlyRent: Number(e.target.value) }))} />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Start Date</label>
                <input type="date" className={inputCls} value={editDraft.startDate || ''} onChange={e => setEditDraft(d => ({ ...d, startDate: e.target.value }))} />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">End Date</label>
                <input type="date" className={inputCls} value={editDraft.endDate || ''} onChange={e => setEditDraft(d => ({ ...d, endDate: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={() => saveEdit(tenant.id)} className="flex items-center gap-1 px-3 py-1 rounded bg-green-600 hover:bg-green-700 text-white font-bold text-xs transition">
                <Check size={12} /> Save
              </button>
              <button onClick={cancelEdit} className="flex items-center gap-1 px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-xs transition">
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
              <div className="flex items-center gap-1"><Calendar size={13} /> {tenant.startDate} \u2192 {tenant.endDate || 'current'}</div>
            </div>
            <div className="pt-2 flex gap-2 flex-wrap">
              <button onClick={() => startEdit(tenant)} className="flex items-center gap-1 px-3 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs transition">
                <Pencil size={12} /> Edit
              </button>
              {isActive && (
                <button onClick={() => handleTerminate(tenant.id)} className="flex items-center gap-1 px-3 py-1 rounded bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold text-xs transition">
                  <UserX size={12} /> Terminate
                </button>
              )}
              <button onClick={() => handleDelete(tenant.id)} className="flex items-center gap-1 px-3 py-1 rounded bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs transition">
                <Trash2 size={12} /> Delete
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 mt-4 space-y-4">
      <div className="flex justify-between items-center border-b border-gray-200 pb-2">
        <h4 className="font-bold text-gray-800 text-sm flex items-center gap-1.5">
          <User size={16} className="text-blue-600" /> Tenant Management
        </h4>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      {isLoading ? (
        <div className="text-center py-4 text-xs text-gray-500">Loading tenants...</div>
      ) : (
        <div className="space-y-4">
          {activeTenant ? renderTenantCard(activeTenant, true) : (
            <div className="bg-white border border-dashed border-gray-300 rounded-md p-4 text-center">
              <p className="text-xs text-gray-500 mb-2">No active tenant registered.</p>
              {!showAddForm && (
                <button onClick={() => setShowAddForm(true)} className="inline-flex items-center gap-1 text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded transition">
                  <Plus size={12} /> Add Tenant
                </button>
              )}
            </div>
          )}
          {activeTenant && !showAddForm && (
            <button onClick={() => setShowAddForm(true)} className="inline-flex items-center gap-1 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold px-3 py-1.5 rounded transition">
              <Plus size={12} /> Add New Contract
            </button>
          )}
          {showAddForm && (
            <form onSubmit={handleAdd} className="bg-white border border-gray-200 rounded-md p-4 space-y-3">
              <div className="flex justify-between items-center">
                <h5 className="text-xs font-bold text-gray-700 uppercase">New Lease Contract</h5>
                <button type="button" onClick={() => setShowAddForm(false)} className="text-gray-400 hover:text-gray-600"><X size={14} /></button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Tenant Name</label>
                  <input type="text" required value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. John Doe" className={inputCls} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Monthly Rent (€)</label>
                  <input type="number" required value={newMonthlyRent || ''} onChange={e => setNewMonthlyRent(Number(e.target.value))} placeholder="e.g. 750" className={inputCls} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Start Date</label>
                  <input type="date" required value={newStartDate} onChange={e => setNewStartDate(e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">End Date (optional)</label>
                  <input type="date" value={newEndDate} onChange={e => setNewEndDate(e.target.value)} className={inputCls} />
                </div>
              </div>
              <button type="submit" disabled={createTenant.isPending} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded text-xs transition disabled:opacity-50">
                {createTenant.isPending ? 'Saving...' : 'Create Lease Contract'}
              </button>
            </form>
          )}
          {inactiveTenants.length > 0 && (
            <div className="space-y-2">
              <h5 className="text-xs font-bold text-gray-500 uppercase">Lease History</h5>
              <div className="space-y-2">{inactiveTenants.map(t => renderTenantCard(t, false))}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
