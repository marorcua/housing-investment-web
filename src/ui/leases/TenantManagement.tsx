import React, { useState } from 'react';
import { useTenants } from '../../features/leases/use-leases';
import { useCreateTenant, useUpdateTenant, useDeleteTenant } from '../../features/leases/lease-mutations';
import { User, Plus, X } from 'lucide-react';
import type { Tenant } from '../../features/leases/tenant';
import { TenantCard } from './TenantCard';
import { TenantForm } from './TenantForm';

interface Props {
  propertyId: number;
  onClose: () => void;
}

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

  const todayStr = new Date().toISOString().split('T')[0];
  const activeTenant = tenants?.find(t => !t.endDate || t.endDate >= todayStr);
  const inactiveTenants = tenants?.filter(t => t.id !== activeTenant?.id) || [];

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
          {activeTenant ? (
            <TenantCard
              tenant={activeTenant}
              isActive={true}
              isEditing={editingId === activeTenant.id}
              editDraft={editDraft}
              onEditStart={() => startEdit(activeTenant)}
              onEditDraftChange={setEditDraft}
              onEditSave={() => saveEdit(activeTenant.id)}
              onEditCancel={cancelEdit}
              onTerminate={() => handleTerminate(activeTenant.id)}
              onDelete={() => handleDelete(activeTenant.id)}
            />
          ) : (
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
            <TenantForm
              name={newName}
              monthlyRent={newMonthlyRent}
              startDate={newStartDate}
              endDate={newEndDate}
              onNameChange={setNewName}
              onRentChange={setNewMonthlyRent}
              onStartDateChange={setNewStartDate}
              onEndDateChange={setNewEndDate}
              onSubmit={handleAdd}
              onCancel={() => setShowAddForm(false)}
              isPending={createTenant.isPending}
            />
          )}
          {inactiveTenants.length > 0 && (
            <div className="space-y-2">
              <h5 className="text-xs font-bold text-gray-500 uppercase">Lease History</h5>
              <div className="space-y-2">
                {inactiveTenants.map(t => (
                  <TenantCard
                    key={t.id}
                    tenant={t}
                    isActive={false}
                    isEditing={editingId === t.id}
                    editDraft={editDraft}
                    onEditStart={() => startEdit(t)}
                    onEditDraftChange={setEditDraft}
                    onEditSave={() => saveEdit(t.id)}
                    onEditCancel={cancelEdit}
                    onTerminate={() => {}}
                    onDelete={() => handleDelete(t.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
