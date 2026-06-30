import React, { useState } from 'react';
import { formatEurosShort } from '../../../domain/format';
import type { MonthData } from '../../../domain/types';

const BAR_CHART_W = 700;
const BAR_CHART_H = 210;
const BAR_PAD = { top: 18, right: 10, bottom: 28, left: 45 };

export const MonthlyBarChart: React.FC<{ months: MonthData[] }> = ({ months }) => {
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
