import React, { useState } from 'react';
import { Wallet, Building2, Smartphone, TrendingUp, Plus, ArrowLeftRight, Edit3 } from 'lucide-react';
import { formatVND } from '../utils/formatters';

export default function WalletsPage({
  wallets = [],
  onUpdateWallet,
  onCreateWallet,
  onOpenNewTx
}) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingWallet, setEditingWallet] = useState(null);
  const [name, setName] = useState('');
  const [balance, setBalance] = useState('');
  const [type, setType] = useState('bank');

  const totalBalance = wallets.reduce((s, w) => s + Number(w.balance || 0), 0);

  const handleCreateWallet = async (e) => {
    e.preventDefault();
    if (!name) return;
    await onCreateWallet({
      name,
      balance: Number(balance || 0),
      type,
      color: type === 'investment' ? '#6366f1' : type === 'cash' ? '#10b981' : '#3b82f6'
    });
    setName('');
    setBalance('');
    setShowAddModal(false);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingWallet) return;
    await onUpdateWallet(editingWallet.id, {
      name: editingWallet.name,
      balance: Number(editingWallet.balance || 0)
    });
    setEditingWallet(null);
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 p-6 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Tài Khoản & Ví Tiền</h2>
          <p className="text-xs text-slate-400 mt-1">
            Quản lý số dư tiền mặt, tài khoản ngân hàng, ví điện tử và tài khoản đầu tư
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={onOpenNewTx}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 flex items-center space-x-2 transition-colors"
          >
            <ArrowLeftRight className="w-4 h-4 text-indigo-400" />
            <span>Chuyển tiền giữa các ví</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 flex items-center space-x-2 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Ví Mới</span>
          </button>
        </div>
      </div>

      {/* Total Balance Card */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 p-6 rounded-2xl border border-emerald-500/20 shadow-xl flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tổng Số Dư Khả Dụng</span>
          <div className="text-3xl font-black text-white mt-2">
            {formatVND(totalBalance)}
          </div>
        </div>
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
          <Wallet className="w-8 h-8" />
        </div>
      </div>

      {/* Wallets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {wallets.map((w) => {
          const isBank = w.type === 'bank';
          const isCash = w.type === 'cash';
          const isInvest = w.type === 'investment';

          return (
            <div 
              key={w.id}
              className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    isInvest ? 'bg-indigo-500/20 text-indigo-400' :
                    isCash ? 'bg-emerald-500/20 text-emerald-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    {isInvest ? <TrendingUp className="w-5 h-5" /> :
                     isCash ? <Wallet className="w-5 h-5" /> :
                     <Building2 className="w-5 h-5" />}
                  </div>
                  <button
                    onClick={() => setEditingWallet(w)}
                    className="p-1 text-slate-500 hover:text-slate-300"
                    title="Chỉnh sửa số dư"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="text-sm font-bold text-white line-clamp-1">{w.name}</h3>
                <span className="text-[10px] text-slate-400 capitalize">{w.type}</span>

                <div className="mt-4 text-xl font-black text-emerald-400">
                  {formatVND(w.balance)}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex justify-between">
                <span>Tỷ trọng:</span>
                <span className="font-bold text-slate-300">
                  {totalBalance > 0 ? Math.round((w.balance / totalBalance) * 100) : 0}%
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Wallet Modal */}
      {editingWallet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6">
            <h3 className="text-base font-bold text-white mb-4">Chỉnh Sửa Số Dư Ví</h3>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Tên Ví</label>
                <input
                  type="text"
                  value={editingWallet.name}
                  onChange={(e) => setEditingWallet({ ...editingWallet, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Số dư hiện tại (VNĐ)</label>
                <input
                  type="number"
                  value={editingWallet.balance}
                  onChange={(e) => setEditingWallet({ ...editingWallet, balance: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingWallet(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Wallet Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6">
            <h3 className="text-base font-bold text-white mb-4">Thêm Ví / Tài Khoản Mới</h3>
            <form onSubmit={handleCreateWallet} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Tên Ví / Ngân Hàng</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="VD: Techcombank, Ví ShopeePay..."
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Loại tài khoản</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                >
                  <option value="bank">Tài khoản Ngân hàng</option>
                  <option value="cash">Tiền mặt</option>
                  <option value="ewallet">Ví điện tử</option>
                  <option value="investment">Tài khoản Đầu tư</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Số dư ban đầu (VNĐ)</label>
                <input
                  type="number"
                  value={balance}
                  onChange={(e) => setBalance(e.target.value)}
                  placeholder="0"
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
                  Tạo ví
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
