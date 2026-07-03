import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  year: number;
  onChange: (year: number) => void;
}

export const YearSelector: React.FC<Props> = ({ year, onChange }) => (
  <div className="flex items-center gap-2">
    <button
      onClick={() => onChange(year - 1)}
      className="p-1 rounded hover:bg-gray-100 text-gray-500 transition"
    >
      <ChevronLeft size={16} />
    </button>
    <span className="font-bold text-gray-800 text-sm min-w-[3rem] text-center">{year}</span>
    <button
      onClick={() => onChange(year + 1)}
      className="p-1 rounded hover:bg-gray-100 text-gray-500 transition"
    >
      <ChevronRight size={16} />
    </button>
  </div>
);
