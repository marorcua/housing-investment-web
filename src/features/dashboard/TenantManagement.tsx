import React, { useState } from 'react';
import { useTenants, useCreateTenant, useUpdateTenant, useDeleteTenant,
  useCreateRentIncrease, useUpdateRentIncrease, useDeleteRentIncrease } from '../../lib/queries';
import { User, Calendar, DollarSign, Plus, X, UserX, Trash2, Pencil, Check, TrendingUp, ChevronDown, ChevronRight } from 'lucide-react';
import type { Tenant, RentIncrease } from '../../lib/types';

interface Props {
  propertyId: number;
  onClose: () => void;
}

const inputCls = 'w-full p-1.5 text-xs border border-blue-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-400';

function computeEscalatedRent(baseRent: number, startDate: string, increases: RentIncrease[]): number {
  const startYear = new Date(startDate).getFullYear();
  const currentYear = new Date().getFullYear();
  const yearsSinceStart = currentYear - startYear;
  let multiplier = 1;
  for (const inc of increases) {
    if (inc.applied && inc.yearOffset <= yearsSinceStart) {
      multiplier *= (1 + inc.percentage / 100);
    }
  }
  return Math.round(baseRent * multiplier * 100) / 100;
}

export const TenantManagement: React.FC<Props> = ({ propertyId, onClose }) => {
  const { data: tenants, isLoading } = useTenants(propertyId);
  const createTenant = useCreateTenant();
  const updateTenant = useUpdateTenant();
  const deleteTenant = useDeleteTenant();
  const createIncrease = useCreateRentIncrease();
  const updateIncrease = useUpdateRentIncrease();
  const deleteIncrease = useDeleteRentIncrease();

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState<{ name?: string; startDate?: string; endDate?: string | null; monthlyRent?: number }>({});
  const [newName, setNewName] = useState('');
  const [newStartDate, setNewStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [newEndDate, setNewEndDate] = useState('');
  const [newMonthlyRent, setNewMonthlyRent] = useState<number>(0);
  const [error, setError] = useState('');
  const [showRentInc, setShowRentInc] = useState<number | null>(null);
  const [showAddInc, setShowAddInc] = useState<number | null>(null);
  const [newIncYear, setNewIncYear] = useState('');
  const [newIncPct, setNewIncPct] = useState('');

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

  const startEdit = (tenant: Tenant) => {
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

  const handleAddIncrease = async (tenantId: number) => {
    const yearOffset = parseInt(newIncYear);
    const percentage = parseFloat(newIncPct);
    if (isNaN(yearOffset) || yearOffset < 1 || isNaN(percentage) || percentage <= 0) return;
    try {
      await createIncrease.mutateAsync({ tenantId, data: { yearOffset, percentage } });
      setNewIncYear(''); setNewIncPct(''); setShowAddInc(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to add increase');
    }
  };

  const handleToggleApplied = async (tenantId: number, inc: RentIncrease) => {
    try {
      await updateIncrease.mutateAsync({ tenantId, increaseId: inc.id, data: { applied: !inc.applied } });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update increase');
    }
  };

  const handleDeleteIncrease = async (tenantId: number, incId: number) => {
    if (!window.confirm('Delete this rent increase?')) return;
    try {
      await deleteIncrease.mutateAsync({ tenantId, increaseId: incId });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete increase');
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const activeTenant = tenants?.find(t => !t.endDate || t.endDate >= todayStr);
  const inactiveTenants = tenants?.filter(t => t.id !== activeTenant?.id) || [];

  const renderRentIncreaseSection = (tenant: Tenant) => {
    const incs = tenant.rentIncreases || [];
    const effectiveRent = computeEscalatedRent(tenant.monthlyRent, tenant.startDate, incs);
    const isOpen = showRentInc === tenant.id;

    return (
      <div className="mt-3 border-t border-gray-100 pt-2">
        <button
          onClick={() => setShowRentInc(isOpen ? null : tenant.id)}
          className="flex items-center gap-1 text-[10px] font-bold text-gray-500 uppercase tracking-wide hover:text-gray-700 transition"
        >
          {isOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          <TrendingUp size={11} /> Rent Increases ({incs.length})
        </button>

        {isOpen && (
          <div className="mt-2 space-y-1.5">
            {incs.length === 0 && (
              <p className="text-[10px] text-gray-400 italic">No rent increases planned.</p>
            )}
            {incs.sort((a, b) => a.yearOffset - b.yearOffset).map(inc => (
              <div key={inc.id} className="flex items-center gap-2 bg-gray-50 rounded px-2 py-1.5 text-xs">
                <span className="font-medium text-gray-600 w-16 shrink-0">Year {inc.yearOffset}</span>
                <span className="font-semibold text-blue-600 w-16 shrink-0">+{inc.percentage}%</span>
                <button
                  onClick={() => handleToggleApplied(tenant.id, inc)}
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full transition cursor-pointer ${
                    inc.applied
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                  }`}
                >
                  {inc.applied ? 'Granted' : 'Pending'}
                </button>
                <button
                  onClick={() => handleDeleteIncrease(tenant.id, inc.id)}
                  className="ml-auto p-0.5 text-gray-300 hover:text-red-500 transition"
                >
                  <Trash2 size={11} />
                </button>
              </div>
            ))}

            {effectiveRent !== tenant.monthlyRent && (
              <div className="text-[10px] text-gray-500 bg-blue-50 rounded px-2 py-1">
                Effective rent: <span className="font-bold text-blue-700">{effectiveRent.toFixed(2)} €</span>
                <span className="text-gray-400"> (base: {tenant.monthlyRent} €)</span>
              </div>
            )}

            {showAddInc === tenant.id ? (
              <div className="flex items-center gap-1.5 pt-1">
                <input
                  type="number" placeholder="Year (1,2...)" value={newIncYear}
                  onChange={e => setNewIncYear(e.target.value)}
                  className="w-20 p-1 text-[10px] border border-gray-300 rounded"
                  min="1"
                />
                <input
                  type="number" placeholder="%" value={newIncPct}
                  onChange={e => setNewIncPct(e.target.value)}
                  className="w-20 p-1 text-[10px] border border-gray-300 rounded"
                  step="0.1" min="0"
                />
                <button
                  onClick={() => handleAddIncrease(tenant.id)}
                  className="p-1 text-green-600 hover:text-green-800"
                  disabled={!newIncYear || !newIncPct}
                >
                  <Check size={13} />
                </button>
                <button
                  onClick={() => { setShowAddInc(null); setNewIncYear(''); setNewIncPct(''); }}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <X size={13} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAddInc(tenant.id)}
                className="flex items-center gap-0.5 text-[10px] text-blue-600 hover:text-blue-800 font-medium transition pt-0.5"
              >
                <Plus size={11} /> Add Increase
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderTenantCard = (tenant: Tenant, isActive: boolean) => {
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
                  <label htmlFor="edit-tenant-name" className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Name</label>
                  <input id="edit-tenant-name" className={inputCls} value={editDraft.name || ''} onChange={e => setEditDraft(d => ({ ...d, name: e.target.value }))} />
                </div>
                <div>
                  <label htmlFor="edit-tenant-rent" className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Monthly Rent (€)</label>
                  <input id="edit-tenant-rent" type="number" className={inputCls} value={editDraft.monthlyRent || ''} onChange={e => setEditDraft(d => ({ ...d, monthlyRent: Number(e.target.value) }))} />
                </div>
                <div>
                  <label htmlFor="edit-tenant-start" className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Start Date</label>
                  <input id="edit-tenant-start" type="date" className={inputCls} value={editDraft.startDate || ''} onChange={e => setEditDraft(d => ({ ...d, startDate: e.target.value }))} />
                </div>
                <div>
                  <label htmlFor="edit-tenant-end" className="block text-[10px] font-bold text-gray-500 uppercase mb-1">End Date</label>
                  <input id="edit-tenant-end" type="date" className={inputCls} value={editDraft.endDate || ''} onChange={e => setEditDraft(d => ({ ...d, endDate: e.target.value }))} />
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
            {renderRentIncreaseSection(tenant)}
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
                  <label htmlFor="add-tenant-name" className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Tenant Name</label>
                  <input id="add-tenant-name" type="text" required value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. John Doe" className={inputCls} />
                </div>
                <div>
                  <label htmlFor="add-tenant-rent" className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Monthly Rent (€)</label>
                  <input id="add-tenant-rent" type="number" required value={newMonthlyRent || ''} onChange={e => setNewMonthlyRent(Number(e.target.value))} placeholder="e.g. 750" className={inputCls} />
                </div>
                <div>
                  <label htmlFor="add-tenant-start" className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Start Date</label>
                  <input id="add-tenant-start" type="date" required value={newStartDate} onChange={e => setNewStartDate(e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label htmlFor="add-tenant-end" className="block text-[10px] font-bold text-gray-500 uppercase mb-1">End Date (optional)</label>
                  <input id="add-tenant-end" type="date" value={newEndDate} onChange={e => setNewEndDate(e.target.value)} className={inputCls} />
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
