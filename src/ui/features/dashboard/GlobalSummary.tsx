import React, { useState } from 'react';
import { useProperties, useGlobalSummary } from '../../../application/hooks/queries';
import { formatEuros } from '../../../domain/format';
import { ChevronLeft, ChevronRight, FileSpreadsheet, Building2 } from 'lucide-react';

const cellCls = 'p-2 text-right text-[11px] font-medium whitespace-nowrap';
const headerCls = 'p-2 text-right text-[10px] font-bold uppercase tracking-wide';

export const GlobalSummary: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [selectedPropId, setSelectedPropId] = useState<number | null>(null);
  const { data: properties } = useProperties();
  const { data: rows, isFetching } = useGlobalSummary(
    selectedPropId ? [selectedPropId] : (properties?.map(p => p.id) ?? null),
    year
  );

  const totals = rows ? rows.reduce((a, r) => ({
    earnings: a.earnings + r.earnings,
    mortgageInterest: a.mortgageInterest + r.mortgageInterest,
    community: a.community + r.community,
    insurance: a.insurance + r.insurance,
    ibi: a.ibi + r.ibi,
    repairs: a.repairs + r.repairs,
    otherExpenses: a.otherExpenses + r.otherExpenses,
    subtotalExclPrincipal: a.subtotalExclPrincipal + r.subtotalExclPrincipal,
    principal: a.principal + r.principal,
    total: a.total + r.total,
  }), { earnings: 0, mortgageInterest: 0, community: 0, insurance: 0, ibi: 0, repairs: 0, otherExpenses: 0, subtotalExclPrincipal: 0, principal: 0, total: 0 }) : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <FileSpreadsheet size={18} className="text-amber-600" />
          <h3 className="text-base font-bold text-gray-800">Global Monthly Summary</h3>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Building2 size={14} />
            <select
              className="border border-gray-200 rounded px-2 py-1 text-xs font-medium text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-amber-400"
              value={selectedPropId ?? ''}
              onChange={e => setSelectedPropId(e.target.value ? Number(e.target.value) : null)}
            >
              <option value="">All Properties</option>
              {properties?.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setYear(y => y - 1)} className="p-1.5 rounded hover:bg-gray-100 text-gray-500 transition">
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm font-bold text-gray-700 w-12 text-center">{year}</span>
            <button onClick={() => setYear(y => y + 1)} className="p-1.5 rounded hover:bg-gray-100 text-gray-500 transition">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {!rows ? (
        <div className="text-center py-8 text-xs text-gray-500">
          <div className="h-4 w-48 bg-gray-200 rounded animate-pulse mx-auto mb-2" />
          <div className="h-3 w-36 bg-gray-200 rounded animate-pulse mx-auto" />
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-x-auto relative">
          {isFetching && (
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-amber-200 overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full animate-pulse" style={{ width: '40%' }} />
            </div>
          )}
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="p-2 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wide sticky left-0 bg-gray-50">Month</th>
                <th className={`${headerCls} text-green-600 border-l border-gray-100`}>Earnings</th>
                <th className={`${headerCls} text-blue-600 border-l border-gray-100`}>Mortgage Int.</th>
                <th className={`${headerCls} text-blue-600`}>Community</th>
                <th className={`${headerCls} text-blue-600`}>Insurance</th>
                <th className={`${headerCls} text-blue-600`}>IBI</th>
                <th className={`${headerCls} text-blue-600`}>Repairs</th>
                <th className={`${headerCls} text-blue-600`}>Other</th>
                <th className={`${headerCls} text-gray-700 border-l border-gray-200 border-r border-gray-200 bg-gray-50`}>Subtotal (excl. principal)</th>
                <th className={`${headerCls} text-purple-600 border-l border-gray-100`}>Principal</th>
                <th className={`${headerCls} text-gray-900 border-l border-gray-100 bg-gray-50`}>Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map(r => (
                <tr key={r.month} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-2 text-left font-semibold text-gray-700 text-[11px] sticky left-0 bg-white">{r.label}</td>
                  <td className={`${cellCls} text-green-600`}>{formatEuros(r.earnings)}</td>
                  <td className={`${cellCls} text-blue-600`}>{r.mortgageInterest > 0 ? formatEuros(r.mortgageInterest) : '\u2014'}</td>
                  <td className={`${cellCls} text-blue-600`}>{r.community > 0 ? formatEuros(r.community) : '\u2014'}</td>
                  <td className={`${cellCls} text-blue-600`}>{r.insurance > 0 ? formatEuros(r.insurance) : '\u2014'}</td>
                  <td className={`${cellCls} text-blue-600`}>{r.ibi > 0 ? formatEuros(r.ibi) : '\u2014'}</td>
                  <td className={`${cellCls} text-blue-600`}>{r.repairs > 0 ? formatEuros(r.repairs) : '\u2014'}</td>
                  <td className={`${cellCls} text-blue-600`}>{r.otherExpenses > 0 ? formatEuros(r.otherExpenses) : '\u2014'}</td>
                  <td className={`${cellCls} text-gray-800 font-semibold border-l border-r border-gray-100 bg-gray-50/50`}>{formatEuros(r.subtotalExclPrincipal)}</td>
                  <td className={`${cellCls} text-purple-600`}>{r.principal > 0 ? formatEuros(r.principal) : '\u2014'}</td>
                  <td className={`${cellCls} text-gray-900 font-bold bg-gray-50/50`}>{formatEuros(r.total)}</td>
                </tr>
              ))}
            </tbody>
            {totals && (
              <tfoot>
                <tr className="bg-gray-100 border-t-2 border-gray-300">
                  <td className="p-2 text-left font-bold text-gray-700 uppercase text-[10px] sticky left-0 bg-gray-100">Annual</td>
                  <td className={`${cellCls} text-green-700 font-bold`}>{formatEuros(totals.earnings)}</td>
                  <td className={`${cellCls} text-blue-700 font-bold`}>{totals.mortgageInterest > 0 ? formatEuros(totals.mortgageInterest) : '\u2014'}</td>
                  <td className={`${cellCls} text-blue-700 font-bold`}>{totals.community > 0 ? formatEuros(totals.community) : '\u2014'}</td>
                  <td className={`${cellCls} text-blue-700 font-bold`}>{totals.insurance > 0 ? formatEuros(totals.insurance) : '\u2014'}</td>
                  <td className={`${cellCls} text-blue-700 font-bold`}>{totals.ibi > 0 ? formatEuros(totals.ibi) : '\u2014'}</td>
                  <td className={`${cellCls} text-blue-700 font-bold`}>{totals.repairs > 0 ? formatEuros(totals.repairs) : '\u2014'}</td>
                  <td className={`${cellCls} text-blue-700 font-bold`}>{totals.otherExpenses > 0 ? formatEuros(totals.otherExpenses) : '\u2014'}</td>
                  <td className={`${cellCls} text-gray-900 font-bold border-l border-r border-gray-100 bg-gray-200`}>{formatEuros(totals.subtotalExclPrincipal)}</td>
                  <td className={`${cellCls} text-purple-700 font-bold`}>{totals.principal > 0 ? formatEuros(totals.principal) : '\u2014'}</td>
                  <td className={`${cellCls} text-gray-900 font-bold bg-gray-200`}>{formatEuros(totals.total)}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      )}
    </div>
  );
};
