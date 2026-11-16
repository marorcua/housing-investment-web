import React, { useState } from 'react';
import { useDashboardData } from '../../features/dashboard/use-dashboard';
import { useUpdateProperty, useDeleteProperty } from '../../features/properties/use-properties';
import { Home, Plus, X, LogOut } from 'lucide-react';
import { LoginPage } from '../authentication/LoginPage';
import { AddPropertyForm } from './AddPropertyForm';
import { AddTransactionForm } from '../transactions/AddTransactionForm';
import { TenantManagement } from '../leases/TenantManagement';
import { LoanManagement } from '../loans/LoanManagement';
import { RecurringExpenseManagement } from '../transactions/RecurringExpenseManagement';
import { CashflowCalendar } from '../transactions/CashflowCalendar';
import { GlobalChart } from '../transactions/GlobalChart';
import { PropertyCard } from './PropertyCard';
import { isAuthenticated, logout } from '../../infrastructure/api/client';

export const PropertyDashboard: React.FC = () => {
  const [authTick, setAuthTick] = useState(0);
  const { data: dashboard, isLoading } = useDashboardData();
  const updateProperty = useUpdateProperty();
  const deleteProperty = useDeleteProperty();

  const [showAddForm, setShowAddForm] = useState(false);
  const [activeTransaction, setActiveTransaction] = useState<{ id: number; type: 'revenue' | 'expense' } | null>(null);
  const [activeTenantManageId, setActiveTenantManageId] = useState<number | null>(null);
  const [activeLoanManageId, setActiveLoanManageId] = useState<number | null>(null);
  const [activeRecExpenseManageId, setActiveRecExpenseManageId] = useState<number | null>(null);
  const [activeCalendarId, setActiveCalendarId] = useState<number | null>(null);
  const [editingPropertyId, setEditingPropertyId] = useState<number | null>(null);
  const [editPropertyDraft, setEditPropertyDraft] = useState<Record<string, any>>({});
  const [error, setError] = useState('');

  const closeAllPanels = () => {
    setActiveTenantManageId(null);
    setActiveLoanManageId(null);
    setActiveRecExpenseManageId(null);
    setActiveCalendarId(null);
    setActiveTransaction(null);
  };

  const savePropertyEdit = async (id: number) => {
    try {
      await updateProperty.mutateAsync({ id, data: editPropertyDraft });
      setEditingPropertyId(null);
      setEditPropertyDraft({});
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    }
  };

  if (!isAuthenticated()) {
    return <LoginPage onLoggedIn={() => setAuthTick(t => t + 1)} />;
  }

  if (isLoading) {
    return <div className="py-20 text-center text-gray-500">Loading your investment portfolio...</div>;
  }

  const { properties, summaries, activeTenants } = dashboard || { properties: [], summaries: {}, activeTenants: {} };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Your Investments</h2>
          <p className="text-gray-500">Track and manage your real estate portfolio performance.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition font-medium ${showAddForm ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
          >
            {showAddForm ? <><X size={18} /> Cancel</> : <><Plus size={18} /> Add Property</>}
          </button>
          <button onClick={() => { logout(); setAuthTick(t => t + 1); }} className="flex items-center gap-2 px-4 py-2 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 transition font-medium">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}

      {showAddForm && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-300">
          <AddPropertyForm onAdded={() => setShowAddForm(false)} />
        </div>
      )}

      {properties.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border border-dashed border-gray-300 text-center">
          <Home className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500">No properties found. Add your first investment to start tracking.</p>
        </div>
      ) : (
        <>
          <GlobalChart />
          <div className="grid grid-cols-1 gap-8">
            {properties.map(property => (
              <div key={property.id}>
                <PropertyCard
                  property={property}
                  summary={summaries[property.id]}
                  activeTenant={activeTenants[property.id]}
                  isEditing={editingPropertyId === property.id}
                  editDraft={editPropertyDraft}
                  isManagingTenants={activeTenantManageId === property.id}
                  isManagingLoans={activeLoanManageId === property.id}
                  isManagingRecExpenses={activeRecExpenseManageId === property.id}
                  isAddingTransaction={activeTransaction?.id === property.id}
                  isViewingCalendar={activeCalendarId === property.id}
                  onEditStart={() => { setEditingPropertyId(property.id); setEditPropertyDraft({ ...property }); }}
                  onEditDraftChange={setEditPropertyDraft}
                  onEditSave={() => savePropertyEdit(property.id)}
                  onEditCancel={() => { setEditingPropertyId(null); setEditPropertyDraft({}); }}
                  onTenantsClick={() => { closeAllPanels(); setActiveTenantManageId(property.id); }}
                  onLoansClick={() => { closeAllPanels(); setActiveLoanManageId(property.id); }}
                  onRecExpensesClick={() => { closeAllPanels(); setActiveRecExpenseManageId(property.id); }}
                  onTransactionClick={(type) => setActiveTransaction({ id: property.id, type })}
                  onCalendarClick={() => { closeAllPanels(); setActiveCalendarId(property.id); }}
                  onDelete={() => deleteProperty.mutate(property.id)}
                />
                {activeTenantManageId === property.id && (
                  <div className="px-6">
                    <TenantManagement propertyId={property.id} onClose={() => setActiveTenantManageId(null)} />
                  </div>
                )}
                {activeLoanManageId === property.id && (
                  <div className="px-6">
                    <LoanManagement propertyId={property.id} onClose={() => setActiveLoanManageId(null)} />
                  </div>
                )}
                {activeRecExpenseManageId === property.id && (
                  <div className="px-6">
                    <RecurringExpenseManagement propertyId={property.id} onClose={() => setActiveRecExpenseManageId(null)} />
                  </div>
                )}
                {activeTransaction?.id === property.id && (
                  <div className="px-6">
                    <AddTransactionForm
                      propertyId={property.id} type={activeTransaction.type}
                      onAdded={() => setActiveTransaction(null)}
                      onCancel={() => setActiveTransaction(null)}
                    />
                  </div>
                )}
                {activeCalendarId === property.id && (
                  <div className="px-6 pt-4">
                    <CashflowCalendar propertyId={property.id} propertyName={property.name} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
