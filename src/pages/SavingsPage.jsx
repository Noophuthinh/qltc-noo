import React, { useState } from 'react';
import { PiggyBank, Plus, Target, Calendar, Check, Trash2 } from 'lucide-react';
import { formatVND, formatDateVN } from '../utils/formatters';

export default function SavingsPage({
  savingsGoals = [],
  onCreateGoal,
  onUpdateGoal,
  onDeleteGoal
}) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [deadline, setDeadline] = useState('');

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title || !targetAmount) return;
    await onCreateGoal({
      title,
      targetAmount: Number(targetAmount),
      currentAmount: Number(currentAmount || 0),
      deadline: deadline || '2026-12-31',
      color: '#10b981'
    });
    setTitle('');
    setTargetAmount('');
    setCurrentAmount('');
    setShowAddModal(false);
  };

  const handleDeposit = async (goal) => {
    const amountStr = prompt(`Nhập số tiền nạp thêm vào mục tiêu "${goal.title}":`, '1000000');
    if (!amountStr || isNaN(amountStr) || Number(amountStr) <= 0) return;
    const added = Number(amountStr);
    await onUpdateGoal(goal.id, {
      currentAmount: Number(goal.currentAmount || 0) + added
    });
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 p-6 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Mục Tiêu Tiết Kiệm & Tích Lũy</h2>
          <p className="text-xs text-slate-400 mt-1">
            Thiết lập kế hoạch tài chính tương lai, quỹ khẩn cấp và các mục tiêu mua sắm
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 flex items-center space-x-2 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Mục Tiêu Mới</span>
        </button>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {savingsGoals.map((g) => {
          const target = Number(g.targetAmount || 1);
          const current = Number(g.currentAmount || 0);
          const pct = Math.min(Math.round((current / target) * 100), 100);
          const isComplete = current >= target;

          return (
            <div 
              key={g.id}
              className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold">
                    <Target className="w-5 h-5" />
                  </div>
                  <button
                    onClick={() => onDeleteGoal(g.id)}
                    className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                    title="Xóa mục tiêu"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="text-base font-bold text-white line-clamp-1">{g.title}</h3>
                <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Hạn mục tiêu: {formatDateVN(g.deadline)}</span>
                </div>

                {/* Progress */}
                <div className="my-4">
                  <div className="flex justify-between text-xs font-bold mb-1.5">
                    <span className="text-slate-400">Tiến độ</span>
                    <span className={isComplete ? 'text-emerald-400' : 'text-indigo-400'}>{pct}%</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${isComplete ? 'bg-emerald-500' : 'bg-gradient-to-r from-teal-500 to-indigo-500'}`}
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-1 text-xs bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Hiện có:</span>
                    <span className="font-bold text-emerald-400">{formatVND(current)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Mục tiêu:</span>
                    <span className="font-bold text-white">{formatVND(target)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Còn thiếu:</span>
                    <span className="font-semibold text-slate-300">{formatVND(Math.max(0, target - current))}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80">
                <button
                  onClick={() => handleDeposit(g)}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 hover:text-emerald-300 text-xs font-bold border border-slate-700 transition-colors flex items-center justify-center space-x-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Nạp thêm tiền vào mục tiêu</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Goal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6">
            <h3 className="text-base font-bold text-white mb-4">Thêm Mục Tiêu Tiết Kiệm Mới</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Tên mục tiêu</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="VD: Quỹ đầu tư mới, Mua xe, Du lịch..."
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Số tiền mục tiêu (VNĐ)</label>
                <input
                  type="number"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  placeholder="50000000"
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Số tiền hiện có (VNĐ)</label>
                <input
                  type="number"
                  value={currentAmount}
                  onChange={(e) => setCurrentAmount(e.target.value)}
                  placeholder="0"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Hạn hoàn thành</label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                >
                  Tạo mục tiêu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
