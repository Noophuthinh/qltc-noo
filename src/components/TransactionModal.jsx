import React, { useState } from 'react';
import { 
  X, 
  ArrowDownLeft, 
  ArrowUpRight, 
  ArrowLeftRight, 
  Calendar, 
  CreditCard, 
  Tag, 
  FileText,
  DollarSign,
  TrendingUp,
  Coins,
  Briefcase,
  HelpCircle,
  Check
} from 'lucide-react';
import { toInputDateTime } from '../utils/formatters';

export default function TransactionModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  incomeSources = [], 
  expenseCategories = [], 
  wallets = [] 
}) {
  if (!isOpen) return null;

  const [type, setType] = useState('income'); // 'income', 'expense', 'transfer'
  const [amount, setAmount] = useState('');
  const [incomeSourceId, setIncomeSourceId] = useState(incomeSources[0]?.id || 'inc-1');
  const [categoryId, setCategoryId] = useState(expenseCategories[0]?.id || 'exp-1');
  const [walletId, setWalletId] = useState(wallets[0]?.id || 'wal-1');
  const [toWalletId, setToWalletId] = useState(wallets[1]?.id || 'wal-2');
  const [date, setDate] = useState(toInputDateTime(new Date()));
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Quick Amount adders (VNĐ)
  const quickAmounts = [100000, 500000, 1000000, 5000000, 10000000, 20000000];

  const handleQuickAdd = (val) => {
    const current = Number(amount || 0);
    setAmount(String(current + val));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      alert('Vui lòng nhập số tiền hợp lệ lớn hơn 0');
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedSource = incomeSources.find(s => s.id === incomeSourceId);
      const selectedCat = expenseCategories.find(c => c.id === categoryId);
      const selectedWallet = wallets.find(w => w.id === walletId);
      const selectedToWallet = wallets.find(w => w.id === toWalletId);

      const payload = {
        type,
        amount: Number(amount),
        walletId,
        walletName: selectedWallet?.name || '',
        date: new Date(date).toISOString(),
        note: note.trim()
      };

      if (type === 'income') {
        payload.incomeSourceId = incomeSourceId;
        payload.incomeSourceName = selectedSource?.name || 'Không xác định';
        payload.category = selectedSource?.category || 'Thu nhập';
      } else if (type === 'expense') {
        payload.categoryId = categoryId;
        payload.categoryName = selectedCat?.name || 'Chi tiêu';
      } else if (type === 'transfer') {
        payload.toWalletId = toWalletId;
        payload.toWalletName = selectedToWallet?.name || '';
      }

      await onSubmit(payload);
      onClose();
    } catch (err) {
      alert('Có lỗi xảy ra: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-800/40">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-white">Ghi chép Giao dịch Mới</span>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Type Selector Tabs */}
          <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-950/80 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setType('income')}
              className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition-all ${
                type === 'income'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ArrowDownLeft className="w-4 h-4" />
              <span>+ Thu nhập</span>
            </button>
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition-all ${
                type === 'expense'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>- Chi tiêu</span>
            </button>
            <button
              type="button"
              onClick={() => setType('transfer')}
              className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition-all ${
                type === 'transfer'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ArrowLeftRight className="w-4 h-4" />
              <span>Chuyển ví</span>
            </button>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Số tiền (VNĐ) <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                min="1"
                required
                className="w-full bg-slate-950 border border-slate-700/80 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl py-3.5 pl-4 pr-12 text-2xl font-bold text-white placeholder-slate-600 focus:outline-none"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                ₫
              </span>
            </div>

            {/* Quick add pills */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {quickAmounts.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => handleQuickAdd(q)}
                  className="text-[11px] font-medium bg-slate-800/90 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded-md border border-slate-700/50 transition-colors"
                >
                  +{q >= 1000000 ? `${q / 1000000}tr` : `${q / 1000}k`}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setAmount('')}
                className="text-[11px] font-medium bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 px-2 py-1 rounded-md border border-rose-800/40 transition-colors"
              >
                Xóa
              </button>
            </div>
          </div>

          {/* Type Specific Fields */}
          {type === 'income' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Nguồn thu nhập cá nhân <span className="text-emerald-400 font-bold">(* 4 Nguồn chính)</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {incomeSources.map((source) => {
                  const isSelected = incomeSourceId === source.id;
                  return (
                    <button
                      key={source.id}
                      type="button"
                      onClick={() => setIncomeSourceId(source.id)}
                      className={`p-3 rounded-xl border text-left flex items-start space-x-3 transition-all ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-950/30 text-white shadow-sm ring-1 ring-emerald-500'
                          : 'border-slate-800 bg-slate-950/50 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                        style={{ backgroundColor: `${source.color || '#10b981'}20`, color: source.color || '#10b981' }}
                      >
                        {source.name.includes('Lương') ? (
                          <Briefcase className="w-4 h-4" />
                        ) : source.name.includes('THS') ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : source.name.includes('Thành 7') ? (
                          <Coins className="w-4 h-4" />
                        ) : (
                          <HelpCircle className="w-4 h-4" />
                        )}
                      </div>
                      <div className="overflow-hidden">
                        <div className="font-semibold text-xs truncate">{source.name}</div>
                        <div className="text-[10px] text-slate-400 truncate">{source.category}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {type === 'expense' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Danh mục chi tiêu
              </label>
              <div className="grid grid-cols-3 gap-2">
                {expenseCategories.map((cat) => {
                  const isSelected = categoryId === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategoryId(cat.id)}
                      className={`p-2.5 rounded-xl border text-center flex flex-col items-center justify-center transition-all ${
                        isSelected
                          ? 'border-rose-500 bg-rose-950/30 text-white ring-1 ring-rose-500'
                          : 'border-slate-800 bg-slate-950/50 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <span 
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-xs mb-1"
                        style={{ backgroundColor: `${cat.color}25`, color: cat.color }}
                      >
                        ●
                      </span>
                      <span className="text-[11px] font-medium leading-tight line-clamp-1">{cat.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Wallet selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                {type === 'transfer' ? 'Từ Ví' : type === 'income' ? 'Cộng vào Ví' : 'Trừ từ Ví'}
              </label>
              <select
                value={walletId}
                onChange={(e) => setWalletId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl py-2.5 px-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                {wallets.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} (Số dư: {new Intl.NumberFormat('vi-VN').format(w.balance)} ₫)
                  </option>
                ))}
              </select>
            </div>

            {type === 'transfer' ? (
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Chuyển đến Ví
                </label>
                <select
                  value={toWalletId}
                  onChange={(e) => setToWalletId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl py-2.5 px-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  {wallets.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Thời gian
                </label>
                <input
                  type="datetime-local"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl py-2.5 px-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
            )}
          </div>

          {/* Note Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Ghi chú / Diễn giải
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="VD: Cổ tức quỹ THS đợt 1, Tiền lương tháng này, Đổ xăng..."
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl py-2.5 px-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3.5 rounded-xl font-bold text-sm text-white flex items-center justify-center space-x-2 shadow-lg transition-all ${
                type === 'income'
                  ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
                  : type === 'expense'
                  ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30'
                  : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30'
              }`}
            >
              <Check className="w-5 h-5" />
              <span>{isSubmitting ? 'Đang lưu...' : 'Xác Nhận & Lưu Giao Dịch'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
