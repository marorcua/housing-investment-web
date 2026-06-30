import React, { useState } from 'react';
import { useDashboardData, useUpdateProperty, useDeleteProperty } from '../../../application/hooks/queries';
import { formatEurosShort } from '../../../domain/format';
import { Home, Plus, X, Users, User, Landmark, CreditCard, Calendar, Pencil, Check, ArrowUpRight, ArrowDownRight, LogOut, Trash2 } from 'lucide-react';
import { LoginPage } from '../auth/LoginPage';
import { AddPropertyForm } from './AddPropertyForm';
import { AddTransactionForm } from './AddTransactionForm';
import { TenantManagement } from './TenantManagement';
import { LoanManagement } from './LoanManagement';
import { RecurringExpenseManagement } from './RecurringExpenseManagement';
import { CashflowCalendar } from './CashflowCalendar';
import { GlobalChart } from './GlobalChart';
import { isAuthenticated, logout } from '../../../infrastructure/api/client';

const inputCls = 'p-1.5 text-xs border border-blue-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-400 w-full';

export const PropertyDashboard: React.FC = () => {
  const [authTick, setAuthTick] = useState(0);
  const { data: dashboard, isLoading } = useDashboardData();
  const updateProperty = useUpdateProperty();

  const [showAddForm, setShowAddForm] = useState(false);
  const [activeTransaction, setActiveTransaction] = useState<{ id: number; type: 'revenue' | 'expense' } | null>(null);
  const [activeTenantManageId, setActiveTenantManageId] = useState<number | null>(null);
  const [activeLoanManageId, setActiveLoanManageId] = useState<number | null>(null);
  const [activeRecExpenseManageId, setActiveRecExpenseManageId] = useState<number | null>(null);
  const [activeCalendarId, setActiveCalendarId] = useState<number | null>(null);
  const [editingPropertyId, setEditingPropertyId] = useState<number | null>(null);
  const [editPropertyDraft, setEditPropertyDraft] = useState<{ name?: string; address?: string | null; purchasePrice?: number; purchaseDate?: string; cadastralValue?: number | null; buildingValue?: number | null }>({});
  const deleteProperty = useDeleteProperty();
  const [error, setError] = useState('');

  const closeAllPanels = () => {
    setActiveTenantManageId(null);
    setActiveLoanManageId(null);
    setActiveRecExpenseManageId(null);
    setActiveCalendarId(null);
    setActiveTransaction(null);
  };

  const startEditProperty = (p: { id: number; name: string; address: string | null; purchasePrice: number; purchaseDate: string; cadastralValue: number | null; buildingValue: number | null }) => {
    setEditingPropertyId(p.id);
    setEditPropertyDraft({ ...p });
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
          {properties.map(property => {
            const summary = summaries[property.id];
            const isEditingProp = editingPropertyId === property.id;
            return (
              <div key={property.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  {isEditingProp ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          <div>
                            <label htmlFor="edit-prop-name" className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Property Name</label>
                            <input id="edit-prop-name" className={inputCls} value={editPropertyDraft.name || ''} onChange={e => setEditPropertyDraft(d => ({ ...d, name: e.target.value }))} />
                          </div>
                          <div>
                            <label htmlFor="edit-prop-address" className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Address</label>
                            <input id="edit-prop-address" className={inputCls} value={editPropertyDraft.address || ''} onChange={e => setEditPropertyDraft(d => ({ ...d, address: e.target.value }))} />
                          </div>
                          <div>
                            <label htmlFor="edit-prop-price" className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Purchase Price (€)</label>
                            <input id="edit-prop-price" type="number" className={inputCls} value={editPropertyDraft.purchasePrice || ''} onChange={e => setEditPropertyDraft(d => ({ ...d, purchasePrice: Number(e.target.value) }))} />
                          </div>
                          <div>
                            <label htmlFor="edit-prop-date" className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Purchase Date</label>
                            <input id="edit-prop-date" type="date" className={inputCls} value={editPropertyDraft.purchaseDate || ''} onChange={e => setEditPropertyDraft(d => ({ ...d, purchaseDate: e.target.value }))} />
                          </div>
                          <div>
                            <label htmlFor="edit-prop-cadastral" className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Cadastral Value (€)</label>
                            <input id="edit-prop-cadastral" type="number" className={inputCls} value={editPropertyDraft.cadastralValue ?? ''} onChange={e => setEditPropertyDraft(d => ({ ...d, cadastralValue: Number(e.target.value) }))} />
                          </div>
                          <div>
                            <label htmlFor="edit-prop-building" className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Building Value (€)</label>
                            <input id="edit-prop-building" type="number" className={inputCls} value={editPropertyDraft.buildingValue ?? ''} onChange={e => setEditPropertyDraft(d => ({ ...d, buildingValue: Number(e.target.value) }))} />
                          </div>
                        </div>
                      <div className="flex gap-2">
                        <button onClick={() => savePropertyEdit(property.id)} className="flex items-center gap-1 px-3 py-1.5 rounded bg-green-600 hover:bg-green-700 text-white font-bold text-xs transition">
                          <Check size={13} /> Save Changes
                        </button>
                        <button onClick={() => { setEditingPropertyId(null); setEditPropertyDraft({}); }} className="flex items-center gap-1 px-3 py-1.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-xs transition">
                          <X size={13} /> Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-bold text-gray-900">{property.name}</h3>
                          <button onClick={() => startEditProperty(property)} className="text-gray-300 hover:text-blue-500 transition p-1">
                            <Pencil size={14} />
                          </button>
                          <button onClick={() => { if (window.confirm(`Delete "${property.name}" and all its data?`)) deleteProperty.mutate(property.id); }} className="text-gray-300 hover:text-red-500 transition p-1">
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <p className="text-gray-500 text-sm mb-2">{property.address}</p>
                        {activeTenants[property.id] ? (
                          <div className="inline-flex items-center gap-1.5 text-xs bg-green-50 text-green-700 px-2.5 py-1 rounded-md font-medium border border-green-200">
                            <User size={13} /> Tenant: {activeTenants[property.id]!.name} ({activeTenants[property.id]!.monthlyRent.toLocaleString()} €/mo)
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 text-xs bg-gray-50 text-gray-400 px-2.5 py-1 rounded-md font-medium border border-gray-200">
                            <User size={13} /> No Active Tenant
                            </div>
                          )}
                        </div>

                      <div className="flex flex-wrap gap-2 justify-end">
                        <button
                          className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded transition ${activeTenantManageId === property.id ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'}`}
                          onClick={() => { closeAllPanels(); setActiveTenantManageId(property.id); }}
                        >
                          <Users size={14} /> Tenants
                        </button>
                        <button
                          className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded transition ${activeLoanManageId === property.id ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'}`}
                          onClick={() => { closeAllPanels(); setActiveLoanManageId(property.id); }}
                        >
                          <Landmark size={14} /> Loans
                        </button>
                        <button
                          className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded transition ${activeRecExpenseManageId === property.id ? 'bg-teal-600 text-white' : 'bg-teal-50 text-teal-700 hover:bg-teal-100'}`}
                          onClick={() => { closeAllPanels(); setActiveRecExpenseManageId(property.id); }}
                        >
                          <CreditCard size={14} /> Fixed Costs
                        </button>
                        <button
                          onClick={() => setActiveTransaction({ id: property.id, type: 'revenue' })}
                          className="flex items-center gap-1 text-xs font-bold bg-green-50 text-green-700 px-3 py-1.5 rounded hover:bg-green-100 transition"
                        >
                          <ArrowUpRight size={14} /> Revenue
                        </button>
                        <button
                          onClick={() => setActiveTransaction({ id: property.id, type: 'expense' })}
                          className="flex items-center gap-1 text-xs font-bold bg-red-50 text-red-700 px-3 py-1.5 rounded hover:bg-red-100 transition"
                        >
                          <ArrowDownRight size={14} /> Expense
                        </button>
                        <button
                          className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded transition ${activeCalendarId === property.id ? 'bg-purple-600 text-white' : 'bg-purple-50 text-purple-700 hover:bg-purple-100'}`}
                          onClick={() => { closeAllPanels(); setActiveCalendarId(property.id); }}
                        >
                          <Calendar size={14} /> Cashflow
                        </button>

                      </div>
                    </div>
                  )}
                </div>

                {activeTenantManageId === property.id && (
                  <div className="px-6 pb-6">
                    <TenantManagement propertyId={property.id} onClose={() => setActiveTenantManageId(null)} />
                  </div>
                )}
                {activeLoanManageId === property.id && (
                  <div className="px-6 pb-6">
                    <LoanManagement propertyId={property.id} onClose={() => setActiveLoanManageId(null)} />
                  </div>
                )}
                {activeRecExpenseManageId === property.id && (
                  <div className="px-6 pb-6">
                    <RecurringExpenseManagement propertyId={property.id} onClose={() => setActiveRecExpenseManageId(null)} />
                  </div>
                )}
                {activeTransaction?.id === property.id && (
                  <div className="px-6 pb-6">
                    <AddTransactionForm
                      propertyId={property.id} type={activeTransaction.type}
                      onAdded={() => { setActiveTransaction(null); }}
                      onCancel={() => setActiveTransaction(null)}
                    />
                  </div>
                )}
                {activeCalendarId === property.id && (
                  <div className="px-6 pb-6 pt-4">
                    <CashflowCalendar propertyId={property.id} propertyName={property.name} />
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-gray-100 border-b border-gray-100">
                  <div className="p-6">
                    <span className="block text-xs text-gray-500 uppercase font-bold mb-1">Purchase Price</span>
                    <span className="text-xl font-semibold">{formatEurosShort(property.purchasePrice)} €</span>
                  </div>
                  <div className="p-6">
                    <span className="block text-xs text-gray-500 uppercase font-bold mb-1">Annual Revenue</span>
                    <span className="text-xl font-semibold text-green-600">{summary?.metrics?.totalRevenue?.toLocaleString() || 0} €</span>
                  </div>
                  <div className="p-6">
                    <span className="block text-xs text-gray-500 uppercase font-bold mb-1">Tax Deductions</span>
                    <span className="text-xl font-semibold text-blue-600">{summary?.metrics?.totalDeductions?.toFixed(2) || 0} €</span>
                  </div>
                  <div className="p-6">
                    <span className="block text-xs text-gray-500 uppercase font-bold mb-1">Net Yield (Hacienda)</span>
                    <span className="text-xl font-bold text-gray-900">{summary?.metrics?.netYield?.toFixed(2) || 0} €</span>
                  </div>
                  <div className={`p-6 ${summary?.metrics?.cashflow?.netCashflow >= 0 ? 'bg-green-50/10' : 'bg-red-50/10'}`}>
                    <span className="block text-xs text-gray-500 uppercase font-bold mb-1">Net Cashflow</span>
                    <span className={`text-xl font-bold ${summary?.metrics?.cashflow?.netCashflow >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                      {summary?.metrics?.cashflow?.netCashflow?.toFixed(2) || 0} €
                    </span>
                  </div>
                </div>

                {summary && (
                  <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100">
                    <div className="p-6 bg-blue-50/10">
                      <h4 className="text-xs font-bold text-blue-800 uppercase mb-4">Hacienda Breakdown (Annual)</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="block text-[10px] text-blue-600 uppercase font-semibold">Total Revenue</span>
                          <span className="text-sm font-medium text-gray-800">{(summary.metrics.totalRevenue || 0).toLocaleString()} €</span>
                        </div>
                        <div>
                          <span className="block text-[10px] text-blue-600 uppercase font-semibold">Amortization (3%)</span>
                          <span className="text-sm font-medium text-gray-800">{(summary.metrics.deductions.amortization || 0).toLocaleString()} €</span>
                        </div>
                        <div>
                          <span className="block text-[10px] text-blue-600 uppercase font-semibold">Loan Interests</span>
                          <span className="text-sm font-medium text-gray-800">{(summary.metrics.deductions.interests || 0).toLocaleString()} €</span>
                        </div>
                        <div>
                          <span className="block text-[10px] text-blue-600 uppercase font-semibold">Other Deductions</span>
                          <span className="text-sm font-medium text-gray-800">{(summary.metrics.deductions.others || 0).toLocaleString()} €</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-6 bg-green-50/10">
                      <h4 className="text-xs font-bold text-green-800 uppercase mb-4">Cashflow Breakdown (Annual)</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="block text-[10px] text-green-600 uppercase font-semibold">Gross Rent Inflow</span>
                          <span className="text-sm font-medium text-gray-800">{(summary.metrics.cashflow.totalRevenue || 0).toLocaleString()} €</span>
                        </div>
                        <div>
                          <span className="block text-[10px] text-green-600 uppercase font-semibold">Loan Payments</span>
                          <span className="text-sm font-medium text-gray-800">{(summary.metrics.cashflow.loanOutflows || 0).toLocaleString()} €</span>
                        </div>
                        <div>
                          <span className="block text-[10px] text-green-600 uppercase font-semibold">Fixed Recurring Outflows</span>
                          <span className="text-sm font-medium text-gray-800">{(summary.metrics.cashflow.recurringOutflows || 0).toLocaleString()} €</span>
                        </div>
                        <div>
                          <span className="block text-[10px] text-green-600 uppercase font-semibold">Manual Extra Outflows</span>
                          <span className="text-sm font-medium text-gray-800">{(summary.metrics.cashflow.manualOutflows || 0).toLocaleString()} €</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        </>
      )}
    </div>
  );
};
