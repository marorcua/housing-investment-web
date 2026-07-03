import React, { useState } from 'react';
import { useCreateRentIncrease, useUpdateRentIncrease, useDeleteRentIncrease } from '../application/mutations.js';
import { TrendingUp, ChevronDown, ChevronRight, Plus, Check, X, Trash2 } from 'lucide-react';
import type { Tenant, RentIncrease } from '../domain/tenant.js';

interface Props {
  tenant: Tenant;
}

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

export const RentIncreaseSection: React.FC<Props> = ({ tenant }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newYear, setNewYear] = useState('');
  const [newPct, setNewPct] = useState('');
  const [error, setError] = useState('');

  const createIncrease = useCreateRentIncrease();
  const updateIncrease = useUpdateRentIncrease();
  const deleteIncrease = useDeleteRentIncrease();

  const incs = tenant.rentIncreases || [];
  const effectiveRent = computeEscalatedRent(tenant.monthlyRent, tenant.startDate, incs);

  const handleAdd = async () => {
    const yearOffset = parseInt(newYear);
    const percentage = parseFloat(newPct);
    if (isNaN(yearOffset) || yearOffset < 1 || isNaN(percentage) || percentage <= 0) return;
    try {
      await createIncrease.mutateAsync({ tenantId: tenant.id, data: { yearOffset, percentage } });
      setNewYear(''); setNewPct(''); setShowAddForm(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to add increase');
    }
  };

  const handleToggleApplied = async (inc: RentIncrease) => {
    try {
      await updateIncrease.mutateAsync({ tenantId: tenant.id, increaseId: inc.id, data: { applied: !inc.applied } });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update increase');
    }
  };

  const handleDelete = async (incId: number) => {
    if (!window.confirm('Delete this rent increase?')) return;
    try {
      await deleteIncrease.mutateAsync({ tenantId: tenant.id, increaseId: incId });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete increase');
    }
  };

  return (
    <div className="mt-3 border-t border-gray-100 pt-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 text-[10px] font-bold text-gray-500 uppercase tracking-wide hover:text-gray-700 transition"
      >
        {isOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        <TrendingUp size={11} /> Rent Increases ({incs.length})
      </button>
      {error && <p className="text-[10px] text-red-500 mt-1">{error}</p>}

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
                onClick={() => handleToggleApplied(inc)}
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full transition cursor-pointer ${
                  inc.applied
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                }`}
              >
                {inc.applied ? 'Granted' : 'Pending'}
              </button>
              <button onClick={() => handleDelete(inc.id)} className="ml-auto p-0.5 text-gray-300 hover:text-red-500 transition">
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

          {showAddForm ? (
            <div className="flex items-center gap-1.5 pt-1">
              <input type="number" placeholder="Year (1,2...)" value={newYear} onChange={e => setNewYear(e.target.value)} className="w-20 p-1 text-[10px] border border-gray-300 rounded" min="1" />
              <input type="number" placeholder="%" value={newPct} onChange={e => setNewPct(e.target.value)} className="w-20 p-1 text-[10px] border border-gray-300 rounded" step="0.1" min="0" />
              <button onClick={handleAdd} className="p-1 text-green-600 hover:text-green-800" disabled={!newYear || !newPct}><Check size={13} /></button>
              <button onClick={() => { setShowAddForm(false); setNewYear(''); setNewPct(''); }} className="p-1 text-gray-400 hover:text-gray-600"><X size={13} /></button>
            </div>
          ) : (
            <button onClick={() => setShowAddForm(true)} className="flex items-center gap-0.5 text-[10px] text-blue-600 hover:text-blue-800 font-medium transition pt-0.5">
              <Plus size={11} /> Add Increase
            </button>
          )}
        </div>
      )}
    </div>
  );
};
