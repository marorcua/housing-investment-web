import React, { useState } from 'react';
import { useCashflowData } from '../../../application/hooks/queries';
import { formatEuros } from '../../../domain/format';
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Minus, CalendarDays, BarChart3, CreditCard } from 'lucide-react';
import { MonthlyBarChart } from './MonthlyBarChart';
import { RevenueEntryList } from './RevenueEntryList';
import { ScheduledExpenseList } from './ScheduledExpenseList';
import { ManualExpenseList } from './ManualExpenseList';

interface Props {
  propertyId: number;
  propertyName: string;
}

export const CashflowCalendar: React.FC<Props> = ({ propertyId, propertyName }) => {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [expandedMonth, setExpandedMonth] = useState<number | null>(null);

  const { data: months, isLoading, isFetching } = useCashflowData(propertyId, year);

  const totalRevenue = months ? months.reduce((a, m) => a + m.totalRevenue, 0) : 0;
  const totalExpense = months ? months.reduce((a, m) => a + m.totalExpense, 0) : 0;
  const totalNet = totalRevenue - totalExpense;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarDays size={18} className="text-blue-600" />
          <h3 className="text-base font-bold text-gray-800">Annual Cashflow — {propertyName}</h3>
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

      {isLoading ? (
        <div className="text-center py-8 text-xs text-gray-500">
          <div className="h-4 w-48 bg-gray-200 rounded animate-pulse mx-auto mb-2" />
          <div className="h-3 w-36 bg-gray-200 rounded animate-pulse mx-auto" />
        </div>
      ) : months ? (
        <div style={{ opacity: isFetching ? 0.5 : 1, transition: 'opacity 0.5s cubic-bezier(0.22,1,0.36,1)' }}>
        <>
          <div className="grid grid-cols-3 gap-3 mb-2">
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
              <div className="text-[10px] font-bold text-green-700 uppercase mb-0.5">Total Revenue</div>
              <div className="text-lg font-bold text-green-700">+{formatEuros(totalRevenue)} €</div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
              <div className="text-[10px] font-bold text-red-700 uppercase mb-0.5">Total Expenses</div>
              <div className="text-lg font-bold text-red-700">-{formatEuros(totalExpense)} €</div>
            </div>
            <div className={`border rounded-lg p-3 text-center ${totalNet >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200'}`}>
              <div className={`text-[10px] font-bold uppercase mb-0.5 ${totalNet >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>Net Cashflow</div>
              <div className={`text-lg font-bold ${totalNet >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
                {totalNet >= 0 ? '+' : ''}{formatEuros(totalNet)} €
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-3 mb-4">
            <div className="flex items-center gap-1.5 mb-2 text-[10px] font-bold text-gray-500 uppercase tracking-wide">
              <BarChart3 size={13} /> Monthly revenue vs expenses
            </div>
            <MonthlyBarChart months={months} />
          </div>

          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left p-3 font-bold text-gray-500 uppercase tracking-wide">Month</th>
                  <th className="text-right p-3 font-bold text-green-600 uppercase tracking-wide">Revenue</th>
                  <th className="text-right p-3 font-bold text-red-600 uppercase tracking-wide">Expenses</th>
                  <th className="text-right p-3 font-bold text-gray-600 uppercase tracking-wide">Net</th>
                  <th className="w-8 p-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {months.map(m => {
                  const isExpanded = expandedMonth === m.month;
                  const hasData = m.revenues.length > 0 || m.expenses.length > 0;
                  return (
                    <React.Fragment key={m.month}>
                      <tr
                        className={`transition-colors ${hasData ? 'cursor-pointer hover:bg-gray-50' : 'opacity-50'} ${isExpanded ? 'bg-blue-50/40' : ''}`}
                        onClick={() => hasData && setExpandedMonth(isExpanded ? null : m.month)}
                      >
                        <td className="p-3 font-semibold text-gray-700">{m.label}</td>
                        <td className="p-3 text-right text-green-600 font-medium">
                          {m.totalRevenue > 0 ? `+${formatEuros(m.totalRevenue)} €` : '\u2014'}
                        </td>
                        <td className="p-3 text-right text-red-600 font-medium">
                          {m.totalExpense > 0 ? `-${formatEuros(m.totalExpense)} €` : '\u2014'}
                        </td>
                        <td className="p-3 text-right font-bold">
                          {!hasData ? (
                            <span className="text-gray-300">{'\u2014'}</span>
                          ) : m.net === 0 ? (
                            <span className="text-gray-500 flex items-center justify-end gap-0.5"><Minus size={12} /> 0 €</span>
                          ) : m.net > 0 ? (
                            <span className="text-emerald-600 flex items-center justify-end gap-0.5"><TrendingUp size={12} /> +{formatEuros(m.net)} €</span>
                          ) : (
                            <span className="text-red-600 flex items-center justify-end gap-0.5"><TrendingDown size={12} /> {formatEuros(m.net)} €</span>
                          )}
                        </td>
                        <td className="p-3 text-gray-400 text-right">
                          {hasData && <span className="text-[10px]">{isExpanded ? '\u25b2' : '\u25bc'}</span>}
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr>
                          <td colSpan={5} className="bg-gray-50/70 border-t border-b border-blue-100 p-0">
                            <div className="p-4 space-y-4">
                              {m.revenues.length > 0 && (
                                <div>
                                  <h6 className="text-[10px] font-bold text-green-700 uppercase mb-2 flex items-center gap-1">
                                    <TrendingUp size={11} /> Revenue entries
                                  </h6>
                                  <RevenueEntryList revenues={m.revenues} />
                                </div>
                              )}
                              {m.expenses.filter(e => e.id < 0).length > 0 && (
                                <div>
                                  <h6 className="text-[10px] font-bold text-orange-700 uppercase mb-2 flex items-center gap-1">
                                    <CreditCard size={11} /> Scheduled expenses
                                  </h6>
                                  <ScheduledExpenseList expenses={m.expenses.filter(e => e.id < 0)} />
                                </div>
                              )}
                              {m.expenses.filter(e => e.id > 0).length > 0 && (
                                <div>
                                  <h6 className="text-[10px] font-bold text-red-700 uppercase mb-2 flex items-center gap-1">
                                    <TrendingDown size={11} /> Manual expenses
                                  </h6>
                                  <ManualExpenseList expenses={m.expenses.filter(e => e.id > 0)} />
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-gray-100 border-t-2 border-gray-300 font-bold">
                  <td className="p-3 text-gray-700 uppercase text-[11px]">Annual Total</td>
                  <td className="p-3 text-right text-green-700">+{formatEuros(totalRevenue)} €</td>
                  <td className="p-3 text-right text-red-700">-{formatEuros(totalExpense)} €</td>
                  <td className={`p-3 text-right ${totalNet >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                    {totalNet >= 0 ? '+' : ''}{formatEuros(totalNet)} €
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </>
        </div>
      ) : null}
    </div>
  );
};
