import React, { useState } from 'react';
import { PieChart, Plus, Edit2, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { formatVND } from '../utils/formatters';

export default function BudgetsPage({
  budgets = [],
  expenseCategories = [],
  transactions = [],
  onSaveBudgets
}) {
  const [editingBudgets, setEditingBudgets] = useState(budgets);
  const [isEditing, setIsEditing] = useState(false);
  const [newCatId, setNewCatId] = useState(expenseCategories[0]?.id || '');
  const [newAmount, setNewAmount] = useState('');

  // Tính số tiền đã tiêu trong tháng này cho từng danh mục
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const thisMonthExpenses = transactions.filter(t => {
    if (t.type !== 'expense') return false;
    const d = new Date(t.date || t.createdAt);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const getSpentAmount = (catId, catName) => {
    return thisMonthExpenses
      .filter(t => t.categoryId === catId || (t.categoryName || t.category) === catName)
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);
  };

  const handleUpdateAmount = (id, amount) => {
    setEditingBudgets(prev => prev.map(b => b.id === id ? { ...b, amount: Number(amount) } : b));
  };

  const handleDeleteBudget = (id) => {
    setEditingBudgets(prev => prev.filter(b => b.id !== id));
  };

  const handleAddBudget = (e) => {
    e.preventDefault();
    if (!newAmount || Number(newAmount) <= 0) return;
    const cat = expenseCategories.find(c => c.id === newCatId);
    const newBudget = {
      id: 'bud-' + Date.now(),
      categoryId: newCatId,
      categoryName: cat?.name || 'Chi tiêu',
      amount: Number(newAmount),
      period: 'month'
    };
    const updated = [...editingBudgets, newBudget];
    setEditingBudgets(updated);
    onSaveBudgets(updated);
    setNewAmount('');
  };

  const handleSaveAll = async () => {
    await onSaveBudgets(editingBudgets);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 p-6 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Hạn Mức & Ngân Sách Chi Tiêu</h2>
          <p className="text-xs text-slate-400 mt-1">
            Thiết lập hạn mức chi tiêu hàng tháng theo từng danh mục để kiểm soát tài chính tối ưu
          </p>
        </div>
        <div>
          {isEditing ? (
            <button
              onClick={handleSaveAll}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all"
            >
              Lưu Ngân Sách
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center space-x-2 transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Chỉnh sửa hạn mức</span>
            </button>
          )}
        </div>
      </div>

      {/* Budget Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {editingBudgets.map((b) => {
          const spent = getSpentAmount(b.categoryId, b.categoryName);
          const limit = Number(b.amount || 0);
          const pct = limit > 0 ? Math.min(Math.round((spent / limit) * 100), 100) : 0;
          const isOver = spent > limit;
          const isWarning = pct >= 80 && !isOver;

          return (
            <div 
              key={b.id} 
              className={`p-5 rounded-2xl border bg-slate-900/90 transition-all ${
                isOver ? 'border-rose-500/60 shadow-rose-950/20' : isWarning ? 'border-amber-500/50' : 'border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2.5">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                    isOver ? 'bg-rose-500/20 text-rose-400' : isWarning ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    ●
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{b.categoryName}</h4>
                    <span className="text-[10px] text-slate-400">Hạn mức tháng này</span>
                  </div>
                </div>

                {isOver ? (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-rose-400 bg-rose-950/50 px-2 py-0.5 rounded-full border border-rose-800/50">
                    <ShieldAlert className="w-3.5 h-3.5" /> Vượt hạn mức
                  </span>
                ) : isWarning ? (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-950/50 px-2 py-0.5 rounded-full border border-amber-800/50">
                    <AlertTriangle className="w-3.5 h-3.5" /> Sắp chạm mốc ({pct}%)
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-800/50">
                    <CheckCircle2 className="w-3.5 h-3.5" /> An toàn ({pct}%)
                  </span>
                )}
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden my-3 border border-slate-800">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    isOver ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${pct}%` }}
                ></div>
              </div>

              {/* Amounts & Limit */}
              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400">Đã chi: </span>
                  <span className={`font-bold ${isOver ? 'text-rose-400' : 'text-slate-200'}`}>
                    {formatVND(spent)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Hạn mức: </span>
                  {isEditing ? (
                    <input
                      type="number"
                      value={b.amount}
                      onChange={(e) => handleUpdateAmount(b.id, e.target.value)}
                      className="w-28 bg-slate-950 border border-slate-700 rounded px-2 py-0.5 text-xs text-white"
                    />
                  ) : (
                    <span className="font-bold text-emerald-400">{formatVND(b.amount)}</span>
                  )}
                </div>
              </div>

              {isEditing && (
                <div className="mt-3 pt-2 border-t border-slate-800 text-right">
                  <button
                    onClick={() => handleDeleteBudget(b.id)}
                    className="text-xs text-rose-400 hover:text-rose-300 font-semibold"
                  >
                    Xóa ngân sách
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add New Budget */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6">
        <h3 className="text-sm font-bold text-white mb-4">Thêm Hạn Mức Danh Mục Mới</h3>
        <form onSubmit={handleAddBudget} className="flex flex-col sm:flex-row gap-3">
          <select
            value={newCatId}
            onChange={(e) => setNewCatId(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-700/80 rounded-xl py-2.5 px-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            {expenseCategories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <input
            type="number"
            value={newAmount}
            onChange={(e) => setNewAmount(e.target.value)}
            placeholder="Hạn mức số tiền (VD: 5000000)"
            className="flex-1 bg-slate-950 border border-slate-700/80 rounded-xl py-2.5 px-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md flex items-center justify-center space-x-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Hạn Mức</span>
          </button>
        </form>
      </div>
    </div>
  );
}
