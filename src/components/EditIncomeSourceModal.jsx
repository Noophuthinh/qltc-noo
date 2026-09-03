import React, { useState, useEffect } from 'react';
import { X, Check, DollarSign, Tag, Palette } from 'lucide-react';
import { formatVND } from '../utils/formatters';

export default function EditIncomeSourceModal({
  source,
  isOpen,
  onClose,
  onUpdate
}) {
  if (!isOpen || !source) return null;

  const [name, setName] = useState(source.name || '');
  const [category, setCategory] = useState(source.category || '');
  const [monthlyTarget, setMonthlyTarget] = useState(source.monthlyTarget || 0);
  const [color, setColor] = useState(source.color || '#10b981');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (source) {
      setName(source.name || '');
      setCategory(source.category || '');
      setMonthlyTarget(source.monthlyTarget || 0);
      setColor(source.color || '#10b981');
    }
  }, [source]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Vui lòng nhập tên nguồn thu');
      return;
    }

    setIsSubmitting(true);
    try {
      await onUpdate(source.id, {
        name: name.trim(),
        category: category.trim(),
        monthlyTarget: Number(monthlyTarget || 0),
        color
      });
      onClose();
    } catch (err) {
      alert('Lỗi khi cập nhật: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const colors = [
    '#10b981', '#3b82f6', '#6366f1', '#8b5cf6', 
    '#ec4899', '#f59e0b', '#f97316', '#ef4444', '#14b8a6', '#94a3b8'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-800/40">
          <div className="flex items-center space-x-2">
            <span className="text-base font-bold text-white">Chỉnh Sửa Nguồn Thu Nhập</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Tên nguồn thu
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Mức lương / Mục tiêu dự kiến hàng tháng (VNĐ)
            </label>
            <div className="relative">
              <input
                type="number"
                value={monthlyTarget}
                onChange={(e) => setMonthlyTarget(e.target.value)}
                placeholder="25000000"
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl py-3 px-3.5 pr-10 text-base font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                ₫
              </span>
            </div>
            <div className="mt-1 text-[11px] text-slate-400">
              Định dạng: {formatVND(monthlyTarget)}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Nhóm phân loại
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="VD: Lương cố định, Đầu tư, Kinh doanh..."
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Màu đại diện
            </label>
            <div className="flex flex-wrap gap-2">
              {colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full border-2 transition-transform ${
                    color === c ? 'scale-110 border-white shadow-md' : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="pt-3 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 flex items-center justify-center space-x-1.5 transition-all"
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
