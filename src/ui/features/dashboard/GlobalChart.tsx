import React, { useState } from 'react';
import { useGlobalData } from '../../../application/hooks/queries';
import { formatEurosShort } from '../../../domain/format';
import { BarChart3, ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';

type ViewMode = 'annual' | 'monthly';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const CHART_W = 700;
const CHART_H = 210;
const PAD = { top: 18, right: 10, bottom: 28, left: 45 };

const ChartSVG: React.FC<{
  labels: string[];
  dataPoints: { revenue: number; expenses: number; net: number }[];
}> = ({ labels, dataPoints }) => {
  const [hovered, setHovered] = useState<number | null>(null);
  const maxBar = Math.max(...dataPoints.map(d => Math.max(d.revenue, d.expenses, 1)));
  const plotW = CHART_W - PAD.left - PAD.right;
  const plotH = CHART_H - PAD.top - PAD.bottom;
  const band = plotW / labels.length;
  const barW = Math.min(band * 0.3, 14);

  const scaleY = (v: number) => PAD.top + plotH - (v / maxBar) * plotH;

  const tickVals: number[] = [];
  const tickCount = 4;
  for (let i = 0; i <= tickCount; i++) tickVals.push((maxBar / tickCount) * i);

  return (
    <svg viewBox={`0 0 ${CHART_W} ${CHART_H}`} className="w-full h-auto">
      {tickVals.map(v => {
        const y = scaleY(v);
        return (
          <g key={v}>
            <line x1={PAD.left} y1={y} x2={PAD.left + plotW} y2={y} stroke="#e5e7eb" strokeWidth={0.5} />
            <text x={PAD.left - 4} y={y + 3} textAnchor="end" className="text-[9px] fill-gray-400 font-medium">
              {formatEurosShort(v)}
            </text>
          </g>
        );
      })}

      <line x1={PAD.left} y1={scaleY(0)} x2={PAD.left + plotW} y2={scaleY(0)} stroke="#9ca3af" strokeWidth={1} strokeDasharray="3,2" />

      {dataPoints.map((d, i) => {
        const cx = PAD.left + i * band + band / 2;
        const revH = (d.revenue / maxBar) * plotH;
        const expH = (d.expenses / maxBar) * plotH;
        const active = hovered === i;

        return (
          <g key={i} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)} style={{ cursor: 'pointer' }}>
            <rect x={cx - barW} y={scaleY(d.revenue)} width={barW} height={revH || 1}
              fill={active ? '#16a34a' : '#86efac'} rx={2}
              className="transition-all duration-600 ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{ transitionDelay: `${i * 30}ms` }} />
            <rect x={cx} y={scaleY(d.expenses)} width={barW} height={expH || 1}
              fill={active ? '#dc2626' : '#fca5a5'} rx={2}
              className="transition-all duration-600 ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{ transitionDelay: `${i * 30}ms` }} />
            <text x={cx + barW / 2} y={CHART_H - 6} textAnchor="middle"
              className={`transition-all duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] text-[9px] ${active ? 'fill-gray-800 font-bold' : 'fill-gray-400'}`}>
              {labels[i]}
            </text>
          </g>
        );
      })}

      {dataPoints.slice(0, -1).map((_, i) => {
        const cx1 = PAD.left + i * band + band / 2;
        const cy1 = scaleY(Math.max(0, dataPoints[i].net));
        const cx2 = PAD.left + (i + 1) * band + band / 2;
        const cy2 = scaleY(Math.max(0, dataPoints[i + 1].net));
        return (
          <line key={i} x1={cx1} y1={cy1} x2={cx2} y2={cy2}
            stroke="#2563eb" strokeWidth={2} strokeLinecap="round"
            className="transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{ transitionDelay: `${i * 15}ms` }} />
        );
      })}

      {dataPoints.map((d, i) => {
        const cx = PAD.left + i * band + band / 2;
        const ny = scaleY(Math.max(0, d.net));
        return (
          <text key={i} x={cx + barW / 2} y={ny - 6} textAnchor="middle"
            className="transition-all duration-600 ease-[cubic-bezier(0.22,1,0.36,1)] text-[8px] fill-blue-600 font-semibold"
            style={{ transitionDelay: `${i * 30}ms` }}>
            {formatEurosShort(d.net)}
          </text>
        );
      })}

      <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={PAD.top + plotH} stroke="#d1d5db" strokeWidth={0.5} />
      <line x1={PAD.left} y1={PAD.top + plotH} x2={PAD.left + plotW} y2={PAD.top + plotH} stroke="#d1d5db" strokeWidth={0.5} />

      {hovered !== null && dataPoints[hovered] && (
        <g>
          <rect x={CHART_W - 150} y={4} width={143} height={50} rx={4} fill="white" stroke="#d1d5db" strokeWidth={0.5} />
          <text x={CHART_W - 145} y={17} className="text-[9px] fill-gray-600 font-bold">{labels[hovered]}</text>
          <text x={CHART_W - 145} y={29} className="text-[9px] fill-green-600">Revenue  {dataPoints[hovered].revenue > 0 ? '+' : ''}{formatEurosShort(dataPoints[hovered].revenue)} €</text>
          <text x={CHART_W - 145} y={40} className="text-[9px] fill-red-600">Expenses  -{formatEurosShort(dataPoints[hovered].expenses)} €</text>
          <text x={CHART_W - 145} y={51} className="text-[9px] fill-blue-600">Net  {dataPoints[hovered].net >= 0 ? '+' : ''}{formatEurosShort(dataPoints[hovered].net)} €</text>
        </g>
      )}
    </svg>
  );
};

const Skeleton: React.FC = () => (
  <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 w-28 bg-gray-200 rounded animate-pulse" />
      </div>
      <div className="h-6 w-24 bg-gray-200 rounded-lg animate-pulse" />
    </div>
    <svg viewBox={`0 0 ${CHART_W} ${CHART_H}`} className="w-full h-auto">
      {[0, 1, 2, 3, 4].map(i => (
        <rect key={i} x={PAD.left + (CHART_W - PAD.left - PAD.right) / 5 * i}
          y={PAD.top + 40 + Math.random() * 60} width={(CHART_W - PAD.left - PAD.right) / 5 - 10}
          height={CHART_H - PAD.top - PAD.bottom - 60 + Math.random() * 20}
          fill="#f3f4f6" rx={2} className="animate-pulse" />
      ))}
    </svg>
    <div className="flex justify-center gap-5 mt-3">
      <div className="h-3 w-14 bg-gray-200 rounded animate-pulse" />
      <div className="h-3 w-14 bg-gray-200 rounded animate-pulse" />
      <div className="h-3 w-10 bg-gray-200 rounded animate-pulse" />
    </div>
  </div>
);

export const GlobalChart: React.FC = () => {
  const [mode, setMode] = useState<ViewMode>('annual');
  const [year, setYear] = useState(new Date().getFullYear());
  const { data, isLoading, isFetching } = useGlobalData(mode, mode === 'monthly' ? year.toString() : undefined);

  if (isLoading) return <Skeleton />;

  if (!data) return null;

  const isAnnual = mode === 'annual';
  const labels = isAnnual
    ? data.annual.map(d => d.year.toString())
    : data.monthly.map(d => MONTHS[d.month - 1]);
  const dataPoints = isAnnual ? data.annual : data.monthly;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
      <style>{`@keyframes fadeIn { 0% { opacity: 0; transform: scale(0.96) translateY(8px); } 100% { opacity: 1; transform: scale(1) translateY(0); } }`}</style>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <BarChart3 size={16} className="text-indigo-600" />
          <h3 className="text-sm font-bold text-gray-800">Global Overview</h3>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 rounded-lg p-0.5 text-xs font-medium">
            <button onClick={() => setMode('annual')}
              className={`px-3 py-1 rounded-md transition-colors ${isAnnual ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              Annual
            </button>
            <button onClick={() => setMode('monthly')}
              className={`px-3 py-1 rounded-md transition-colors ${!isAnnual ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              Monthly
            </button>
          </div>
          {!isAnnual && (
            <div className="flex items-center gap-1">
              <button onClick={() => setYear(y => y - 1)} className="p-1 rounded hover:bg-gray-100 text-gray-500 transition">
                <ChevronLeft size={14} />
              </button>
              <span className="text-xs font-bold text-gray-600 w-10 text-center flex items-center justify-center gap-0.5">
                <CalendarDays size={12} />{year}
              </span>
              <button onClick={() => setYear(y => y + 1)} className="p-1 rounded hover:bg-gray-100 text-gray-500 transition">
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
      </div>

      <div key={mode} style={{ animation: 'fadeIn 0.45s cubic-bezier(0.22,1,0.36,1) backwards' }}>
        <div style={{ opacity: isFetching ? 0.5 : 1, transition: 'opacity 0.5s cubic-bezier(0.22,1,0.36,1)' }}>
          <ChartSVG labels={labels} dataPoints={dataPoints} />
        </div>
      </div>

      <div className="flex items-center justify-center gap-5 mt-1 text-[10px] text-gray-500">
        <span className="flex items-center gap-1.5"><span className="w-3 h-2.5 rounded bg-green-300 inline-block" /> Revenue</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-2.5 rounded bg-red-300 inline-block" /> Expenses</span>
        <span className="flex items-center gap-1.5"><span className="w-5 h-0.5 bg-blue-500 inline-block" /> Net</span>
      </div>
    </div>
  );
};
