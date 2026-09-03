import React from 'react';
import { 
  X, 
  LayoutDashboard, 
  ReceiptText, 
  TrendingUp, 
  PieChart, 
  PiggyBank, 
  Wallet, 
  Settings, 
  ExternalLink,
  Coins,
  Plus
} from 'lucide-react';

export default function MobileDrawer({
  isOpen,
  onClose,
  currentTab,
  setCurrentTab,
  incomeSources = [],
  onOpenNewTx
}) {
  if (!isOpen) return null;

  const menuItems = [
    { id: 'dashboard', label: 'Tổng quan tài chính', icon: LayoutDashboard },
    { id: 'transactions', label: 'Sổ giao dịch thu & chi', icon: ReceiptText },
    { id: 'investments', label: 'Quỹ Đầu tư (THS & Thành 7)', icon: TrendingUp, badge: 'HOT' },
    { id: 'budgets', label: 'Ngân sách chi tiêu', icon: PieChart },
    { id: 'savings', label: 'Mục tiêu tiết kiệm', icon: PiggyBank },
    { id: 'wallets', label: 'Tài khoản & Ví', icon: Wallet },
    { id: 'settings', label: 'Cài đặt & Dữ liệu', icon: Settings },
  ];

  const handleSelect = (tabId) => {
    setCurrentTab(tabId);
    onClose();
  };

  return (
    <div className="md:hidden fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
      ></div>

      {/* Drawer Panel */}
      <div className="relative w-4/5 max-w-xs bg-slate-900 border-r border-slate-800 h-full flex flex-col justify-between shadow-2xl z-10 animate-slideRight">
        <div>
          {/* Header */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white font-black text-sm shadow-md">
                💎
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">Noo Finance</h2>
                <p className="text-[10px] text-emerald-400 font-medium">Bản Di Động</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Add Button */}
          <div className="p-3">
            <button
              onClick={() => {
                onClose();
                onOpenNewTx();
              }}
              className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-md shadow-emerald-500/20 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>+ Thêm Giao Dịch Nhanh</span>
            </button>
          </div>

          {/* Nav List */}
          <div className="px-2 py-1 space-y-1 overflow-y-auto max-h-[calc(100vh-250px)]">
            <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Danh mục
            </div>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : 'text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[9px] font-bold bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/30">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Income Sources Summary */}
            <div className="pt-3 pb-1">
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                4 Nguồn Thu Nhập
              </div>
              <div className="mt-1 space-y-1">
                {incomeSources.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => handleSelect('dashboard')}
                    className="px-3 py-1.5 rounded-lg text-xs flex items-center space-x-2 text-slate-300 hover:bg-slate-800/40 cursor-pointer"
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color || '#10b981' }}></span>
                    <span className="truncate">{s.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
          <span>Phiên bản v1.0 PRO</span>
          <span className="text-emerald-400 font-mono">Noo</span>
        </div>
      </div>
    </div>
  );
}
