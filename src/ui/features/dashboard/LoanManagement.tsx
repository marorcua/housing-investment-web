import React, { useState } from 'react';
import { useLoans, useCreateLoan, useUpdateLoan, useDeleteLoan } from '../../../application/hooks/loans';
import { Landmark, Plus, X } from 'lucide-react';
import { LoanCard } from './LoanCard';
import { LoanForm } from './LoanForm';

interface Props {
  propertyId: number;
  onClose: () => void;
}

export const LoanManagement: React.FC<Props> = ({ propertyId, onClose }) => {
  const { data: loans, isLoading } = useLoans(propertyId);
  const createLoan = useCreateLoan();
  const updateLoan = useUpdateLoan();
  const deleteLoan = useDeleteLoan();

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState<{ name?: string; principal?: number; interestRate?: number; termYears?: number; startDate?: string; actualPayment?: number }>({});
  const [name, setName] = useState('');
  const [principal, setPrincipal] = useState<number>(0);
  const [interestRate, setInterestRate] = useState<number>(0);
  const [termYears, setTermYears] = useState<number>(0);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [actualPayment, setActualPayment] = useState<number>(0);
  const [error, setError] = useState('');

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || principal <= 0 || termYears <= 0 || !startDate) return;
    try {
      await createLoan.mutateAsync({
        propertyId, name, principal, interestRate, termYears, startDate,
        ...(actualPayment > 0 ? { actualPayment } : {}),
      });
      setName(''); setPrincipal(0); setInterestRate(0); setTermYears(0); setActualPayment(0);
      setStartDate(new Date().toISOString().split('T')[0]); setShowAddForm(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to add loan');
    }
  };

  const startEdit = (loan: any) => {
    setEditingId(loan.id);
    setEditDraft({
      name: loan.name, principal: loan.principal, interestRate: loan.interestRate,
      termYears: loan.termYears, startDate: loan.startDate,
      actualPayment: loan.actualPayment,
    });
  };

  const saveEdit = async (id: number) => {
    try {
      const data: Record<string, unknown> = { ...editDraft };
      if (data.actualPayment === undefined || data.actualPayment === null) {
        data.actualPayment = null;
      }
      await updateLoan.mutateAsync({ id, data });
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
            {(loans || []).map(loan => (
              <LoanCard
                key={loan.id}
                loan={loan}
                isEditing={editingId === loan.id}
                editDraft={editDraft}
                onEditStart={() => startEdit(loan)}
                onEditDraftChange={setEditDraft}
                onEditSave={() => saveEdit(loan.id)}
                onEditCancel={() => { setEditingId(null); setEditDraft({}); }}
                onDelete={() => handleDelete(loan.id)}
              />
            ))}
          </div>
          {loans && loans.length > 0 && !showAddForm && (
            <button onClick={() => setShowAddForm(true)} className="inline-flex items-center gap-1 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 py-1.5 rounded transition">
              <Plus size={12} /> Add Another Loan
            </button>
          )}
          {showAddForm && (
            <LoanForm
              name={name}
              principal={principal}
              interestRate={interestRate}
              termYears={termYears}
              startDate={startDate}
              actualPayment={actualPayment}
              onNameChange={setName}
              onPrincipalChange={setPrincipal}
              onRateChange={setInterestRate}
              onTermChange={setTermYears}
              onStartDateChange={setStartDate}
              onActualPaymentChange={setActualPayment}
              onSubmit={handleAdd}
              onCancel={() => setShowAddForm(false)}
              isPending={createLoan.isPending}
            />
          )}
        </div>
      )}
    </div>
  );
};
