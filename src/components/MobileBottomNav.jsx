import React from 'react';
import { 
  LayoutDashboard, 
  ReceiptText, 
  TrendingUp, 
  Plus, 
  Menu
} from 'lucide-react';

export default function MobileBottomNav({
  currentTab,
  setCurrentTab,
  onOpenNewTx,
  onOpenDrawer
}) {
  const navItems = [
    { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard },
    { id: 'transactions', label: 'Giao dịch', icon: ReceiptText },
    // Center is Plus Button
    { id: 'investments', label: 'Đầu tư', icon: TrendingUp },
    { id: 'more', label: 'Menu', icon: Menu, isAction: true },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800/90 px-3 py-1.5 safe-area-pb shadow-2xl">
      <div className="flex items-center justify-around relative">
        {/* Tab 1: Tổng quan */}
        <button
          onClick={() => setCurrentTab('dashboard')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
            currentTab === 'dashboard'
              ? 'text-emerald-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <LayoutDashboard className={`w-5 h-5 ${currentTab === 'dashboard' ? 'scale-110 text-emerald-400' : ''}`} />
          <span className="text-[10px] mt-0.5">Tổng quan</span>
        </button>

        {/* Tab 2: Sổ giao dịch */}
        <button
          onClick={() => setCurrentTab('transactions')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
            currentTab === 'transactions'
              ? 'text-emerald-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ReceiptText className={`w-5 h-5 ${currentTab === 'transactions' ? 'scale-110 text-emerald-400' : ''}`} />
          <span className="text-[10px] mt-0.5">Giao dịch</span>
        </button>

        {/* Center Floating Plus Button */}
        <div className="relative -top-3">
          <button
            onClick={onOpenNewTx}
            className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-lg shadow-emerald-500/40 active:scale-90 transition-transform border-2 border-slate-900"
            title="Thêm giao dịch mới"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>

        {/* Tab 3: Quỹ Đầu tư */}
        <button
          onClick={() => setCurrentTab('investments')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
            currentTab === 'investments'
              ? 'text-emerald-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <TrendingUp className={`w-5 h-5 ${currentTab === 'investments' ? 'scale-110 text-emerald-400' : ''}`} />
          <span className="text-[10px] mt-0.5">Đầu tư</span>
        </button>

        {/* Tab 4: Drawer / Thêm */}
        <button
          onClick={onOpenDrawer}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
            ['budgets', 'savings', 'wallets', 'settings'].includes(currentTab)
              ? 'text-emerald-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Thêm</span>
        </button>
      </div>
    </nav>
  );
}
