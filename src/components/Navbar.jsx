import React from 'react';
import { 
  Plus, 
  RefreshCw,
  Menu,
  FileSpreadsheet
} from 'lucide-react';
import MonthSelector from './MonthSelector';

export default function Navbar({ 
  summary = {}, 
  selectedMonth = 10, 
  selectedYear = 2026, 
  onChangeMonth, 
  onOpenNewTx, 
  onRefresh, 
  onSyncGoogleSheet,
  onOpenDrawer,
  isLoading 
}) {
  return (
    <header className="h-14 md:h-16 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 px-3 md:px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Mobile Brand & Month Selector */}
      <div className="flex items-center space-x-2 md:space-x-3">
        {/* Mobile menu trigger */}
        <button
          onClick={onOpenDrawer}
          className="md:hidden p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60"
          title="Mở menu"
        >
          <Menu className="w-4 h-4" />
        </button>

        {/* Mobile Logo */}
        <div className="md:hidden flex items-center">
          <span className="text-sm">💎</span>
        </div>

        {/* Month Selector */}
        <MonthSelector
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          onChangeMonth={onChangeMonth}
        />
        
        <div className="hidden lg:flex items-center space-x-2 text-[11px] text-slate-400 pl-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Bắt đầu quản lý từ T10/2026</span>
        </div>
      </div>

      {/* Right Stats & Actions */}
      <div className="flex items-center space-x-2 md:space-x-3">
        {/* Nút Đồng bộ Google Sheet trực tiếp (Nổi bật & Siêu nhanh) */}
        <button
          onClick={onSyncGoogleSheet || onRefresh}
          disabled={isLoading}
          title="Đồng bộ trực tiếp tất cả giao dịch mới từ Google Sheet"
          className="flex items-center space-x-1.5 px-3 py-1.5 md:py-2 rounded-xl bg-emerald-950/80 hover:bg-emerald-900/90 text-emerald-400 border border-emerald-500/40 text-xs font-bold transition-all active:scale-95 shadow-md shadow-emerald-950/30"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-emerald-300' : 'text-emerald-400'}`} />
          <span className="hidden sm:inline">Đồng bộ Sheet</span>
        </button>

        {/* Quick Add Button */}
        <button
          onClick={onOpenNewTx}
          className="hidden sm:flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/30 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm giao dịch</span>
        </button>

        {/* User Profile */}
        <div className="flex items-center space-x-2 pl-1 md:pl-2 border-l border-slate-800">
          <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
            T
          </div>
          <span className="text-xs font-semibold text-slate-200 hidden md:inline">Thịnh</span>
        </div>
      </div>
    </header>
  );
}
