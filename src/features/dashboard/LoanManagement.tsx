import React, { useState } from 'react';
import { useLoans, useCreateLoan, useUpdateLoan, useDeleteLoan } from '../../lib/queries';
import { formatEurosShort } from '../../lib/format';
import { calcMonthlyPayment } from '../../lib/loan';
import { Landmark, Calendar, DollarSign, Percent, Plus, X, Trash2, Pencil, Check } from 'lucide-react';

interface Props {
  propertyId: number;
  onClose: () => void;
}

const inputCls = 'w-full p-1.5 text-xs border border-indigo-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-indigo-400';

export const LoanManagement: React.FC<Props> = ({ propertyId, onClose }) => {
  const { data: loans, isLoading } = useLoans(propertyId);
  const createLoan = useCreateLoan();
  const updateLoan = useUpdateLoan();
  const deleteLoan = useDeleteLoan();

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState<{ name?: string; principal?: number; interestRate?: number; termYears?: number; startDate?: string }>({});
  const [name, setName] = useState('');
  const [principal, setPrincipal] = useState<number>(0);
  const [interestRate, setInterestRate] = useState<number>(0);
  const [termYears, setTermYears] = useState<number>(0);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState('');

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || principal <= 0 || termYears <= 0 || !startDate) return;
    try {
      await createLoan.mutateAsync({ propertyId, name, principal, interestRate, termYears, startDate });
      setName(''); setPrincipal(0); setInterestRate(0); setTermYears(0);
      setStartDate(new Date().toISOString().split('T')[0]); setShowAddForm(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to add loan');
    }
  };

  const startEdit = (loan: { id: number; name: string; principal: number; interestRate: number; termYears: number; startDate: string }) => {
    setEditingId(loan.id);
    setEditDraft({ name: loan.name, principal: loan.principal, interestRate: loan.interestRate, termYears: loan.termYears, startDate: loan.startDate });
  };

  const saveEdit = async (id: number) => {
    try {
      await updateLoan.mutateAsync({ id, data: editDraft });
      setEditingId(null); setEditDraft({});
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this loan? This will recalculate cashflow metrics.')) return;
    try {
      await deleteLoan.mutateAsync(id);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete');
    }
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 mt-4 space-y-4">
      <div className="flex justify-between items-center border-b border-gray-200 pb-2">
        <h4 className="font-bold text-gray-800 text-sm flex items-center gap-1.5">
          <Landmark size={16} className="text-indigo-600" /> Loans & Mortgages
        </h4>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      {isLoading ? (
        <div className="text-center py-4 text-xs text-gray-500">Loading loans...</div>
      ) : (
        <div className="space-y-4">
          {(!loans || loans.length === 0) && !showAddForm && (
            <div className="bg-white border border-dashed border-gray-300 rounded-md p-4 text-center">
              <p className="text-xs text-gray-500 mb-2">No loans or mortgages registered.</p>
              <button onClick={() => setShowAddForm(true)} className="inline-flex items-center gap-1 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 py-1.5 rounded transition">
                <Plus size={12} /> Add Loan / Mortgage
              </button>
            </div>
          )}
          <div className="space-y-2">
            {(loans || []).map(loan => {
              const monthly = calcMonthlyPayment(loan.principal, loan.interestRate, loan.termYears);
              const isEditing = editingId === loan.id;
              return (
                <div key={loan.id} className="bg-white border border-gray-200 rounded-md p-4 shadow-xs">
                  {isEditing ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label htmlFor="edit-loan-name" className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Name</label>
                          <input id="edit-loan-name" className={inputCls} value={editDraft.name || ''} onChange={e => setEditDraft(d => ({ ...d, name: e.target.value }))} />
                        </div>
                        <div>
                          <label htmlFor="edit-loan-principal" className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Principal (€)</label>
                          <input id="edit-loan-principal" type="number" className={inputCls} value={editDraft.principal || ''} onChange={e => setEditDraft(d => ({ ...d, principal: Number(e.target.value) }))} />
                        </div>
                        <div>
                          <label htmlFor="edit-loan-rate" className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Interest Rate (%)</label>
                          <input id="edit-loan-rate" type="number" step="0.01" className={inputCls} value={editDraft.interestRate ?? ''} onChange={e => setEditDraft(d => ({ ...d, interestRate: Number(e.target.value) }))} />
                        </div>
                        <div>
                          <label htmlFor="edit-loan-term" className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Term (Years)</label>
                          <input id="edit-loan-term" type="number" className={inputCls} value={editDraft.termYears || ''} onChange={e => setEditDraft(d => ({ ...d, termYears: Number(e.target.value) }))} />
                        </div>
                        <div className="col-span-2">
                          <label htmlFor="edit-loan-start" className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Start Date</label>
                          <input id="edit-loan-start" type="date" className={inputCls} value={editDraft.startDate || ''} onChange={e => setEditDraft(d => ({ ...d, startDate: e.target.value }))} />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => saveEdit(loan.id)} className="flex items-center gap-1 px-3 py-1 rounded bg-green-600 hover:bg-green-700 text-white font-bold text-xs transition">
                          <Check size={12} /> Save
                        </button>
                        <button onClick={() => { setEditingId(null); setEditDraft({}); }} className="flex items-center gap-1 px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-xs transition">
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
                          <span className="flex items-center gap-0.5"><Calendar size={12} /> {loan.termYears} yrs \u00b7 {loan.startDate}</span>
                          <span className="font-semibold text-indigo-700">{monthly.toFixed(2)} €/mo</span>
                        </div>
                      </div>
                      <div className="flex gap-1 ml-2">
                        <button onClick={() => startEdit(loan)} className="p-1 text-gray-400 hover:text-indigo-600 transition"><Pencil size={14} /></button>
                        <button onClick={() => handleDelete(loan.id)} className="p-1 text-gray-400 hover:text-red-600 transition"><Trash2 size={14} /></button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {loans && loans.length > 0 && !showAddForm && (
            <button onClick={() => setShowAddForm(true)} className="inline-flex items-center gap-1 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 py-1.5 rounded transition">
              <Plus size={12} /> Add Another Loan
            </button>
          )}
          {showAddForm && (
            <form onSubmit={handleAdd} className="bg-white border border-gray-200 rounded-md p-4 space-y-3">
              <div className="flex justify-between items-center border-b border-gray-100 pb-1.5">
                <h5 className="text-xs font-bold text-gray-700 uppercase">Add Financing / Loan</h5>
                <button type="button" onClick={() => setShowAddForm(false)} className="text-gray-400 hover:text-gray-600"><X size={14} /></button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="add-loan-name" className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Loan Name</label>
                  <input id="add-loan-name" type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Mortgage, Reform Loan" className={inputCls} />
                </div>
                <div>
                  <label htmlFor="add-loan-principal" className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Principal (€)</label>
                  <input id="add-loan-principal" type="number" required value={principal || ''} onChange={e => setPrincipal(Number(e.target.value))} placeholder="e.g. 150000" className={inputCls} />
                </div>
                <div>
                  <label htmlFor="add-loan-rate" className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Interest Rate (%)</label>
                  <input id="add-loan-rate" type="number" step="0.01" required value={interestRate || ''} onChange={e => setInterestRate(Number(e.target.value))} placeholder="e.g. 3.25" className={inputCls} />
                </div>
                <div>
                  <label htmlFor="add-loan-term" className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Term (Years)</label>
                  <input id="add-loan-term" type="number" required value={termYears || ''} onChange={e => setTermYears(Number(e.target.value))} placeholder="e.g. 30" className={inputCls} />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="add-loan-start" className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Start Date</label>
                  <input id="add-loan-start" type="date" required value={startDate} onChange={e => setStartDate(e.target.value)} className={inputCls} />
                </div>
              </div>
              <button type="submit" disabled={createLoan.isPending} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded text-xs transition disabled:opacity-50">
                {createLoan.isPending ? 'Saving...' : 'Register Loan'}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};
