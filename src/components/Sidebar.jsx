import React from 'react';
import { 
  LayoutDashboard, 
  ReceiptText, 
  TrendingUp, 
  PiggyBank, 
  Wallet, 
  PieChart, 
  Settings, 
  PlusCircle,
  Coins,
  Briefcase
} from 'lucide-react';

export default function Sidebar({ currentTab, setCurrentTab, onOpenNewTx, incomeSources = [] }) {
  const menuItems = [
    { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard },
    { id: 'transactions', label: 'Sổ giao dịch', icon: ReceiptText },
    { id: 'investments', label: 'Quỹ Đầu tư (THS & Thành 7)', icon: TrendingUp, badge: 'Hot' },
    { id: 'budgets', label: 'Ngân sách chi tiêu', icon: PieChart },
    { id: 'savings', label: 'Mục tiêu tiết kiệm', icon: PiggyBank },
    { id: 'wallets', label: 'Tài khoản & Ví', icon: Wallet },
    { id: 'settings', label: 'Cài đặt & Dữ liệu', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900/90 border-r border-slate-800 flex flex-col shrink-0 min-h-screen">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 font-extrabold text-xl">
            💎
          </div>
          <div>
            <h1 className="font-bold text-slate-100 text-lg leading-tight">Noo Finance</h1>
            <p className="text-xs text-emerald-400 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Port 8888 Live
            </p>
          </div>
        </div>
      </div>

      {/* Quick Add Button */}
      <div className="p-4">
        <button
          onClick={onOpenNewTx}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-semibold flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all duration-200 active:scale-[0.98]"
        >
          <PlusCircle className="w-5 h-5" />
          <span>+ Ghi Chép Nhanh</span>
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 space-y-1.5 overflow-y-auto">
        <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Menu Chính
        </div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-slate-100'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] uppercase font-bold bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/30">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Nguồn thu nhập cá nhân preview */}
        <div className="pt-5 pb-2">
          <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Nguồn thu nhập</span>
            <span className="text-xs bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">4 nguồn</span>
          </div>
          <div className="mt-1 space-y-1">
            {incomeSources.map(s => (
              <div 
                key={s.id} 
                onClick={() => setCurrentTab('investments')}
                className="px-3.5 py-1.5 rounded-lg text-xs flex items-center space-x-2.5 text-slate-300 hover:bg-slate-800/40 cursor-pointer transition-colors"
              >
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color || '#10b981' }}></span>
                <span className="truncate">{s.name}</span>
              </div>
            ))}
          </div>
        </div>
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800 text-xs text-slate-500 flex items-center justify-between">
        <span>Phiên bản v1.0 PRO</span>
        <span className="text-emerald-400 font-mono">localhost:8888</span>
      </div>
    </aside>
  );
}
