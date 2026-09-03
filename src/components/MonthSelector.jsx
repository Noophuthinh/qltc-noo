import React from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

export default function MonthSelector({
  selectedMonth,
  selectedYear,
  onChangeMonth,
  className = ''
}) {
  const months = [
    { value: 1, label: 'Tháng 1' },
    { value: 2, label: 'Tháng 2' },
    { value: 3, label: 'Tháng 3' },
    { value: 4, label: 'Tháng 4' },
    { value: 5, label: 'Tháng 5' },
    { value: 6, label: 'Tháng 6' },
    { value: 7, label: 'Tháng 7' },
    { value: 8, label: 'Tháng 8' },
    { value: 9, label: 'Tháng 9 (Hiện tại)' },
    { value: 10, label: 'Tháng 10' },
    { value: 11, label: 'Tháng 11' },
    { value: 12, label: 'Tháng 12' },
  ];

  const handlePrev = () => {
    if (selectedMonth === 1) {
      onChangeMonth(12, selectedYear - 1);
    } else {
      onChangeMonth(selectedMonth - 1, selectedYear);
    }
  };

  const handleNext = () => {
    if (selectedMonth === 12) {
      onChangeMonth(1, selectedYear + 1);
    } else {
      onChangeMonth(selectedMonth + 1, selectedYear);
    }
  };

  const isCurrentMonth = selectedMonth === 9 && selectedYear === 2026;

  return (
    <div className={`flex items-center space-x-1.5 bg-slate-900/90 border border-slate-700/80 p-1 rounded-xl shadow-md ${className}`}>
      {/* Nút lùi tháng */}
      <button
        onClick={handlePrev}
        title="Tháng trước"
        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Dropdown chọn tháng */}
      <div className="flex items-center space-x-2 px-2">
        <Calendar className="w-3.5 h-3.5 text-emerald-400" />
        <select
          value={selectedMonth}
          onChange={(e) => onChangeMonth(parseInt(e.target.value, 10), selectedYear)}
          className="bg-transparent text-xs font-bold text-slate-100 focus:outline-none cursor-pointer py-1"
        >
          {months.map((m) => (
            <option key={m.value} value={m.value} className="bg-slate-900 text-white">
              {m.label} / {selectedYear}
            </option>
          ))}
        </select>
      </div>

      {/* Nút tiến tháng */}
      <button
        onClick={handleNext}
        title="Tháng sau"
        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      {/* Nút quay về Tháng 9 hiện tại nếu đang ở tháng khác */}
      {!isCurrentMonth && (
        <button
          onClick={() => onChangeMonth(9, 2026)}
          className="ml-1 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors whitespace-nowrap"
        >
          Về T9/2026
        </button>
      )}
    </div>
  );
}
