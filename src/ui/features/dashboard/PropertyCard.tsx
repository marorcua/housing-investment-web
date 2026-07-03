import React from 'react';
import { useUpdateProperty, useDeleteProperty } from '../../../application/hooks/properties';
import { formatEurosShort } from '../../../domain/format';
import {
  User, Users, Landmark, CreditCard, Calendar, Pencil, Check, X,
  ArrowUpRight, ArrowDownRight, Trash2, Home,
} from 'lucide-react';
import type { Property, Summary } from '../../../domain/types';
import { PropertyForm } from './PropertyForm';
import { ConfirmDialog } from '../../components/ConfirmDialog';

interface Props {
  property: Property;
  summary?: Summary;
  activeTenant: { name: string; monthlyRent: number } | null;
  isManagingTenants: boolean;
  isManagingLoans: boolean;
  isManagingRecExpenses: boolean;
  isAddingTransaction: boolean;
  isViewingCalendar: boolean;
  isEditing: boolean;
  editDraft: Record<string, any>;
  onEditStart: () => void;
  onEditDraftChange: (draft: Record<string, any>) => void;
  onEditSave: () => void;
  onEditCancel: () => void;
  onTenantsClick: () => void;
  onLoansClick: () => void;
  onRecExpensesClick: () => void;
  onTransactionClick: (type: 'revenue' | 'expense') => void;
  onCalendarClick: () => void;
  onDelete: () => void;
}

export const PropertyCard: React.FC<Props> = ({
  property, summary, activeTenant,
  isEditing, editDraft, onEditStart, onEditDraftChange, onEditSave, onEditCancel,
  onTenantsClick, onLoansClick, onRecExpensesClick,
  onTransactionClick, onCalendarClick, onDelete,
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        {isEditing ? (
          <PropertyForm
            draft={editDraft}
            onChange={onEditDraftChange}
            onSave={onEditSave}
            onCancel={onEditCancel}
          />
        ) : (
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-gray-900">{property.name}</h3>
                <button onClick={onEditStart} className="text-gray-300 hover:text-blue-500 transition p-1">
                  <Pencil size={14} />
                </button>
                <button onClick={() => setShowDeleteConfirm(true)} className="text-gray-300 hover:text-red-500 transition p-1">
                  <Trash2 size={14} />
                </button>
              </div>
              <p className="text-gray-500 text-sm mb-2">{property.address}</p>
              {activeTenant ? (
                <div className="inline-flex items-center gap-1.5 text-xs bg-green-50 text-green-700 px-2.5 py-1 rounded-md font-medium border border-green-200">
                  <User size={13} /> Tenant: {activeTenant.name} ({activeTenant.monthlyRent.toLocaleString()} €/mo)
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 text-xs bg-gray-50 text-gray-400 px-2.5 py-1 rounded-md font-medium border border-gray-200">
                  <User size={13} /> No Active Tenant
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2 justify-end">
              <button onClick={onTenantsClick} className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 transition">
                <Users size={14} /> Tenants
              </button>
              <button onClick={onLoansClick} className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition">
                <Landmark size={14} /> Loans
              </button>
              <button onClick={onRecExpensesClick} className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded bg-teal-50 text-teal-700 hover:bg-teal-100 transition">
                <CreditCard size={14} /> Fixed Costs
              </button>
              <button onClick={() => onTransactionClick('revenue')} className="flex items-center gap-1 text-xs font-bold bg-green-50 text-green-700 px-3 py-1.5 rounded hover:bg-green-100 transition">
                <ArrowUpRight size={14} /> Revenue
              </button>
              <button onClick={() => onTransactionClick('expense')} className="flex items-center gap-1 text-xs font-bold bg-red-50 text-red-700 px-3 py-1.5 rounded hover:bg-red-100 transition">
                <ArrowDownRight size={14} /> Expense
              </button>
              <button onClick={onCalendarClick} className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded bg-purple-50 text-purple-700 hover:bg-purple-100 transition">
                <Calendar size={14} /> Cashflow
              </button>
            </div>
          </div>
        )}
      </div>

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
        <div className={`p-6 ${(summary?.metrics?.cashflow?.netCashflow ?? 0) >= 0 ? 'bg-green-50/10' : 'bg-red-50/10'}`}>
          <span className="block text-xs text-gray-500 uppercase font-bold mb-1">Net Cashflow</span>
          <span className={`text-xl font-bold ${(summary?.metrics?.cashflow?.netCashflow ?? 0) >= 0 ? 'text-green-700' : 'text-red-700'}`}>
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

      <ConfirmDialog
        open={showDeleteConfirm}
        title="Delete Property"
        message={`Delete "${property.name}" and all its data?`}
        onConfirm={() => { setShowDeleteConfirm(false); onDelete(); }}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
};
