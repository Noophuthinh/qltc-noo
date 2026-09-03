import React, { useState } from 'react';
import { X, Check, Trash2 } from 'lucide-react';
import { toInputDateTime } from '../utils/formatters';

export default function EditTransactionModal({
  transaction,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
  incomeSources = [],
  expenseCategories = [],
  wallets = []
}) {
  if (!isOpen || !transaction) return null;

  const [amount, setAmount] = useState(transaction.amount || '');
  const [incomeSourceId, setIncomeSourceId] = useState(transaction.incomeSourceId || incomeSources[0]?.id || '');
  const [categoryId, setCategoryId] = useState(transaction.categoryId || expenseCategories[0]?.id || '');
  const [walletId, setWalletId] = useState(transaction.walletId || wallets[0]?.id || '');
  const [date, setDate] = useState(toInputDateTime(transaction.date || transaction.createdAt));
  const [note, setNote] = useState(transaction.note || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      alert('Vui lòng nhập số tiền hợp lệ');
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedSource = incomeSources.find(s => s.id === incomeSourceId);
      const selectedCat = expenseCategories.find(c => c.id === categoryId);
      const selectedWallet = wallets.find(w => w.id === walletId);

      const payload = {
        amount: Number(amount),
        walletId,
        walletName: selectedWallet?.name || '',
        date: new Date(date).toISOString(),
        note: note.trim()
      };

      if (transaction.type === 'income') {
        payload.incomeSourceId = incomeSourceId;
        payload.incomeSourceName = selectedSource?.name || 'Không xác định';
        payload.category = selectedSource?.category || 'Thu nhập';
      } else if (transaction.type === 'expense') {
        payload.categoryId = categoryId;
        payload.categoryName = selectedCat?.name || 'Chi tiêu';
      }

      await onUpdate(transaction.id, payload);
      onClose();
    } catch (err) {
      alert('Lỗi: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa giao dịch này?')) {
      await onDelete(transaction.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-800/40">
          <div className="text-base font-bold text-white">
            Chỉnh sửa {transaction.type === 'income' ? 'Khoản Thu' : transaction.type === 'expense' ? 'Khoản Chi' : 'Chuyển Khoản'}
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Số tiền (VNĐ)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl py-3 px-4 text-xl font-bold text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          {transaction.type === 'income' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Nguồn thu nhập
              </label>
              <select
                value={incomeSourceId}
                onChange={(e) => setIncomeSourceId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                {incomeSources.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.category})</option>
                ))}
              </select>
            </div>
          )}

          {transaction.type === 'expense' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Danh mục chi tiêu
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                {expenseCategories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Ví thanh toán
              </label>
              <select
                value={walletId}
                onChange={(e) => setWalletId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                {wallets.map(w => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Thời gian
              </label>
              <input
                type="datetime-local"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Ghi chú
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="pt-3 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-2.5 rounded-xl bg-rose-950/50 hover:bg-rose-900 border border-rose-800/60 text-rose-300 font-semibold text-xs flex items-center space-x-1.5 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Xóa</span>
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center space-x-2 shadow-md transition-all"
            >
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? 'Đang lưu...' : 'Lưu Thay Đổi'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
