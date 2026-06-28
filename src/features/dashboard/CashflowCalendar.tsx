import React, { useState } from 'react';
import { useCashflowData, useUpdateRevenue, useDeleteRevenue, useUpdateExpense, useDeleteExpense } from '../../lib/queries';
import { formatEuros, formatEurosShort } from '../../lib/format';
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Minus, CalendarDays, Pencil, Check, X, Trash2, CreditCard, Repeat, BarChart3 } from 'lucide-react';

const expenseTypeLabels: Record<string, string> = {
  interest: 'Interest', tax: 'Tax', community: 'Community',
  insurance: 'Insurance', repair: 'Repair', other: 'Other',
};

const inputCls = 'p-1 text-xs border border-blue-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-400';

const BAR_CHART_W = 700;
const BAR_CHART_H = 210;
const BAR_PAD = { top: 18, right: 10, bottom: 28, left: 45 };

import type { MonthData } from '../../lib/types';

const MonthlyBarChart: React.FC<{ months: MonthData[] }> = ({ months }) => {
  const [hovered, setHovered] = useState<number | null>(null);
  const maxBar = Math.max(...months.map(m => Math.max(m.totalRevenue, m.totalExpense, 1)));
  const plotW = BAR_CHART_W - BAR_PAD.left - BAR_PAD.right;
  const plotH = BAR_CHART_H - BAR_PAD.top - BAR_PAD.bottom;
  const band = plotW / 12;
  const barW = band * 0.35;

  const scaleY = (v: number) => BAR_PAD.top + plotH - (v / maxBar) * plotH;

  const tickVals: number[] = [];
  const tickCount = 4;
  for (let i = 0; i <= tickCount; i++) tickVals.push((maxBar / tickCount) * i);

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${BAR_CHART_W} ${BAR_CHART_H}`} className="w-full h-auto">
        {tickVals.map(v => {
          const y = scaleY(v);
          return (
            <g key={v}>
              <line x1={BAR_PAD.left} y1={y} x2={BAR_PAD.left + plotW} y2={y} stroke="#e5e7eb" strokeWidth={0.5} />
              <text x={BAR_PAD.left - 4} y={y + 3} textAnchor="end" className="text-[9px] fill-gray-400 font-medium">
                {formatEurosShort(v)}
              </text>
            </g>
          );
        })}

        <line x1={BAR_PAD.left} y1={scaleY(0)} x2={BAR_PAD.left + plotW} y2={scaleY(0)} stroke="#9ca3af" strokeWidth={1} strokeDasharray="3,2" />

        {months.map((m, i) => {
          const cx = BAR_PAD.left + i * band + band / 2;
          const revH = (m.totalRevenue / maxBar) * plotH;
          const expH = (m.totalExpense / maxBar) * plotH;
          const active = hovered === m.month;

          return (
            <g key={m.month} onMouseEnter={() => setHovered(m.month)} onMouseLeave={() => setHovered(null)} style={{ cursor: 'pointer' }}>
              <rect x={cx - barW} y={scaleY(m.totalRevenue)} width={barW} height={revH || 1}
                fill={active ? '#16a34a' : '#86efac'} rx={2}
                className="transition-all duration-600 ease-[cubic-bezier(0.22,1,0.36,1)]"
                style={{ transitionDelay: `${i * 30}ms` }} />
              <rect x={cx} y={scaleY(m.totalExpense)} width={barW} height={expH || 1}
                fill={active ? '#dc2626' : '#fca5a5'} rx={2}
                className="transition-all duration-600 ease-[cubic-bezier(0.22,1,0.36,1)]"
                style={{ transitionDelay: `${i * 30}ms` }} />
              <text x={cx + barW / 2} y={BAR_CHART_H - 6} textAnchor="middle"
                className={`transition-all duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] text-[9px] ${active ? 'fill-gray-800 font-bold' : 'fill-gray-400'}`}>
                {m.label}
              </text>
            </g>
          );
        })}

        {months.slice(0, -1).map((_, i) => {
          const cx1 = BAR_PAD.left + i * band + band / 2;
          const cy1 = scaleY(Math.max(0, months[i].net));
          const cx2 = BAR_PAD.left + (i + 1) * band + band / 2;
          const cy2 = scaleY(Math.max(0, months[i + 1].net));
          return (
            <line key={i} x1={cx1} y1={cy1} x2={cx2} y2={cy2}
              stroke="#2563eb" strokeWidth={2} strokeLinecap="round"
              className="transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{ transitionDelay: `${i * 15}ms` }} />
          );
        })}

        {months.map((m, i) => {
          const cx = BAR_PAD.left + i * band + band / 2;
          const ny = scaleY(Math.max(0, m.net));
          return (
            <text key={m.month} x={cx + barW / 2} y={ny - 6} textAnchor="middle"
              className="transition-all duration-600 ease-[cubic-bezier(0.22,1,0.36,1)] text-[8px] fill-blue-600 font-semibold"
              style={{ transitionDelay: `${i * 30}ms` }}>
              {formatEurosShort(m.net)}
            </text>
          );
        })}

        <line x1={BAR_PAD.left} y1={BAR_PAD.top} x2={BAR_PAD.left} y2={BAR_PAD.top + plotH} stroke="#d1d5db" strokeWidth={0.5} />
        <line x1={BAR_PAD.left} y1={BAR_PAD.top + plotH} x2={BAR_PAD.left + plotW} y2={BAR_PAD.top + plotH} stroke="#d1d5db" strokeWidth={0.5} />

        {hovered !== null && months[hovered - 1] && (() => {
          const m = months[hovered - 1];
          const cx = BAR_PAD.left + (hovered - 1) * band + band / 2;
          const ny = scaleY(Math.max(0, m.net));
          return (
            <g>
              <circle cx={cx} cy={ny} r={5} fill="#2563eb" stroke="white" strokeWidth={2} />
              <rect x={BAR_CHART_W - 150} y={4} width={143} height={50} rx={4} fill="white" stroke="#d1d5db" strokeWidth={0.5} />
              <text x={BAR_CHART_W - 145} y={17} className="text-[9px] fill-gray-600 font-bold">{m.label}</text>
              <text x={BAR_CHART_W - 145} y={29} className="text-[9px] fill-green-600">Revenue  {m.totalRevenue > 0 ? '+' : ''}{formatEurosShort(m.totalRevenue)} €</text>
              <text x={BAR_CHART_W - 145} y={40} className="text-[9px] fill-red-600">Expenses  -{formatEurosShort(m.totalExpense)} €</text>
              <text x={BAR_CHART_W - 145} y={51} className="text-[9px] fill-blue-600">Net  {m.net >= 0 ? '+' : ''}{formatEurosShort(m.net)} €</text>
            </g>
          );
        })()}
      </svg>
      <div className="flex items-center justify-center gap-5 mt-1 text-[10px] text-gray-500">
        <span className="flex items-center gap-1.5"><span className="w-3 h-2.5 rounded bg-green-300 inline-block" /> Revenue</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-2.5 rounded bg-red-300 inline-block" /> Expenses</span>
        <span className="flex items-center gap-1.5"><span className="w-5 h-0.5 bg-blue-500 inline-block" /> Net</span>
      </div>
    </div>
  );
};

interface Props {
  propertyId: number;
  propertyName: string;
}

export const CashflowCalendar: React.FC<Props> = ({ propertyId, propertyName }) => {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [expandedMonth, setExpandedMonth] = useState<number | null>(null);
  const [editingRev, setEditingRev] = useState<number | null>(null);
  const [editingExp, setEditingExp] = useState<number | null>(null);
  const [editRevDraft, setEditRevDraft] = useState<{ date?: string; amount?: number; description?: string }>({});
  const [editExpDraft, setEditExpDraft] = useState<{ date?: string; amount?: number; type?: string; description?: string }>({});

  const { data: months, isLoading, isFetching } = useCashflowData(propertyId, year);
  const updateRevenue = useUpdateRevenue();
  const deleteRevenue = useDeleteRevenue();
  const updateExpense = useUpdateExpense();
  const deleteExpense = useDeleteExpense();

  const handleDeleteRevenue = (id: number) => {
    if (!window.confirm('Delete this revenue entry?')) return;
    deleteRevenue.mutate(id);
  };

  const handleDeleteExpense = (id: number) => {
    if (!window.confirm('Delete this expense entry?')) return;
    deleteExpense.mutate(id);
  };

  const handleSaveRevenue = (id: number) => {
    updateRevenue.mutate({ id, data: editRevDraft });
    setEditingRev(null);
    setEditRevDraft({});
  };

  const handleSaveExpense = (id: number) => {
    updateExpense.mutate({ id, data: editExpDraft });
    setEditingExp(null);
    setEditExpDraft({});
  };

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
                                  <div className="space-y-1">
                                    {m.revenues.map(rev => {
                                      const isTenantRev = rev.id < 0;
                                      return (
                                        <div key={rev.id} className={`flex items-center gap-2 bg-white border rounded p-2 ${isTenantRev ? 'border-blue-200' : 'border-green-100'}`}>
                                          {isTenantRev ? (
                                            <>
                                              <span className="text-gray-400 w-20 shrink-0">{rev.date}</span>
                                              <span className="font-semibold text-blue-600 w-20 shrink-0">+{formatEuros(rev.amount)} €</span>
                                              <span className="text-blue-500 flex-1 truncate">{rev.description}</span>
                                              <span className="text-[10px] text-blue-400 italic">(rent)</span>
                                            </>
                                          ) : editingRev === rev.id ? (
                                            <>
                                              <input type="date" className={inputCls} value={editRevDraft.date || ''} onChange={e => setEditRevDraft(d => ({ ...d, date: e.target.value }))} />
                                              <input type="number" className={`${inputCls} w-24`} value={editRevDraft.amount ?? ''} onChange={e => setEditRevDraft(d => ({ ...d, amount: Number(e.target.value) }))} placeholder="Amount" />
                                              <input type="text" className={`${inputCls} flex-1`} value={editRevDraft.description || ''} onChange={e => setEditRevDraft(d => ({ ...d, description: e.target.value }))} placeholder="Description" />
                                              <button onClick={() => handleSaveRevenue(rev.id)} className="p-1 text-green-600 hover:text-green-800"><Check size={13} /></button>
                                              <button onClick={() => { setEditingRev(null); setEditRevDraft({}); }} className="p-1 text-gray-400 hover:text-gray-600"><X size={13} /></button>
                                            </>
                                          ) : (
                                            <>
                                              <span className="text-gray-400 w-20 shrink-0">{rev.date}</span>
                                              <span className="font-semibold text-green-600 w-20 shrink-0">+{formatEuros(rev.amount)} €</span>
                                              <span className="text-gray-500 flex-1 truncate">{rev.description || '\u2014'}</span>
                                              <button onClick={() => { setEditingRev(rev.id); setEditRevDraft({ date: rev.date, amount: rev.amount, description: rev.description || '' }); }} className="p-1 text-gray-300 hover:text-blue-500 transition"><Pencil size={12} /></button>
                                              <button onClick={() => handleDeleteRevenue(rev.id)} className="p-1 text-gray-300 hover:text-red-500 transition"><Trash2 size={12} /></button>
                                            </>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                              {m.expenses.filter(e => e.id < 0).length > 0 && (
                                <div>
                                  <h6 className="text-[10px] font-bold text-orange-700 uppercase mb-2 flex items-center gap-1">
                                    <CreditCard size={11} /> Scheduled expenses
                                  </h6>
                                  <div className="space-y-1">
                                    {m.expenses.filter(e => e.id < 0).map(exp => (
                                      <div key={exp.id} className="flex items-center gap-2 bg-white border border-orange-200 rounded p-2">
                                        <span className="text-gray-400 w-20 shrink-0">{exp.date}</span>
                                        <span className="font-semibold text-orange-600 w-20 shrink-0">-{formatEuros(exp.amount)} €</span>
                                        <span className="text-orange-500 flex-1 truncate">{exp.description}</span>
                                        {exp.type === 'loan' ? (
                                          <span className="text-[10px] text-orange-400 italic flex items-center gap-0.5"><CreditCard size={10} /> loan</span>
                                        ) : (
                                          <span className="text-[10px] text-orange-400 italic flex items-center gap-0.5"><Repeat size={10} /> recurring</span>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {m.expenses.filter(e => e.id > 0).length > 0 && (
                                <div>
                                  <h6 className="text-[10px] font-bold text-red-700 uppercase mb-2 flex items-center gap-1">
                                    <TrendingDown size={11} /> Manual expenses
                                  </h6>
                                  <div className="space-y-1">
                                    {m.expenses.filter(e => e.id > 0).map(exp => (
                                      <div key={exp.id} className="flex items-center gap-2 bg-white border border-red-100 rounded p-2">
                                        {editingExp === exp.id ? (
                                          <>
                                            <input type="date" className={inputCls} value={editExpDraft.date || ''} onChange={e => setEditExpDraft(d => ({ ...d, date: e.target.value }))} />
                                            <input type="number" className={`${inputCls} w-24`} value={editExpDraft.amount ?? ''} onChange={e => setEditExpDraft(d => ({ ...d, amount: Number(e.target.value) }))} placeholder="Amount" />
                                            <select className={`${inputCls} w-28`} value={editExpDraft.type || 'other'} onChange={e => setEditExpDraft(d => ({ ...d, type: e.target.value }))}>
                                              {Object.entries(expenseTypeLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                                            </select>
                                            <input type="text" className={`${inputCls} flex-1`} value={editExpDraft.description || ''} onChange={e => setEditExpDraft(d => ({ ...d, description: e.target.value }))} placeholder="Description" />
                                            <button onClick={() => handleSaveExpense(exp.id)} className="p-1 text-green-600 hover:text-green-800"><Check size={13} /></button>
                                            <button onClick={() => { setEditingExp(null); setEditExpDraft({}); }} className="p-1 text-gray-400 hover:text-gray-600"><X size={13} /></button>
                                          </>
                                        ) : (
                                          <>
                                            <span className="text-gray-400 w-20 shrink-0">{exp.date}</span>
                                            <span className="font-semibold text-red-600 w-20 shrink-0">-{formatEuros(exp.amount)} €</span>
                                            <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded shrink-0">{expenseTypeLabels[exp.type || ''] || exp.type}</span>
                                            <span className="text-gray-500 flex-1 truncate">{exp.description || '\u2014'}</span>
                                            <button onClick={() => { setEditingExp(exp.id); setEditExpDraft({ date: exp.date, amount: exp.amount, type: exp.type, description: exp.description || '' }); }} className="p-1 text-gray-300 hover:text-blue-500 transition"><Pencil size={12} /></button>
                                            <button onClick={() => handleDeleteExpense(exp.id)} className="p-1 text-gray-300 hover:text-red-500 transition"><Trash2 size={12} /></button>
                                          </>
                                        )}
                                      </div>
                                    ))}
                                  </div>
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
