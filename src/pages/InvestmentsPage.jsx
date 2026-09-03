import React, { useState } from 'react';
import { 
  TrendingUp, 
  Coins, 
  Plus, 
  Calendar, 
  ArrowUpRight, 
  DollarSign, 
  Briefcase,
  PieChart as PieIcon,
  ShieldCheck,
  Award,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  Users,
  Watch
} from 'lucide-react';
import { formatVND, formatDateVN } from '../utils/formatters';

export default function InvestmentsPage({ 
  transactions = [], 
  incomeSources = [], 
  wallets = [],
  thsData = {},
  onOpenNewTx,
  onSyncTHS,
  isSyncingTHS
}) {
  const [activeFund, setActiveFund] = useState('all'); // 'all', 'ths', 'thanh7'

  // Lọc giao dịch của Quỹ THS & Quỹ Thành 7
  const thsTransactions = transactions.filter(t => 
    (t.incomeSourceName || '').includes('THS')
  );

  const thanh7Transactions = transactions.filter(t => 
    (t.incomeSourceName || '').includes('Thành 7')
  );

  const totalTHS = thsTransactions.reduce((s, t) => s + Number(t.amount || 0), 0);
  const totalThanh7 = thanh7Transactions.reduce((s, t) => s + Number(t.amount || 0), 0);
  const totalCombined = totalTHS + totalThanh7;

  // Monthly reports từ THS
  const monthlyReports = thsData?.monthlyReports || {};
  const monthEntries = Object.entries(monthlyReports);

  // Giao dịch hiển thị theo tab
  const displayTransactions = activeFund === 'ths' 
    ? thsTransactions 
    : activeFund === 'thanh7' 
    ? thanh7Transactions 
    : [...thsTransactions, ...thanh7Transactions].sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Header Banner with THS Live Sync */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-amber-950 p-6 rounded-2xl border border-indigo-900/60 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30 mb-2">
              <Watch className="w-3.5 h-3.5 text-indigo-400" />
              <span>THS Chrono Online Connected</span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              Quản Lý Quỹ Đầu Tư: THS & Thành 7
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Theo dõi lợi nhuận cổ đông Thịnh (42.86%) đồng bộ trực tiếp từ website THS Chrono và dòng tiền Quỹ Thành 7.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="https://bandongho-ths.onrender.com/"
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center space-x-1.5 transition-colors"
            >
              <span>Mở bandongho-ths</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>

            <button
              onClick={onSyncTHS}
              disabled={isSyncingTHS}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center space-x-2 transition-all active:scale-95"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncingTHS ? 'animate-spin' : ''}`} />
              <span>{isSyncingTHS ? 'Đang đồng bộ...' : 'Đồng bộ từ THS Chrono'}</span>
            </button>

            <button
              onClick={onOpenNewTx}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 flex items-center space-x-1.5 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Ghi Nhận Lợi Nhuận</span>
            </button>
          </div>
        </div>
      </div>

      {/* THS Shareholder Spotlight Card */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white font-extrabold text-lg shadow-lg shadow-indigo-500/30">
              T
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-white">Thịnh (Cổ đông THS)</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[11px] font-bold border border-emerald-500/30">
                  Cổ phần: 42.86% (3/7)
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Vốn góp: <span className="text-slate-200 font-semibold">300.000.000 ₫</span> / Tổng vốn 700.000.000 ₫
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <div className="text-right">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Tổng Lợi Nhuận Đã Nhận (THS)</div>
              <div className="text-2xl font-black text-emerald-400">{formatVND(totalTHS)}</div>
            </div>
            <button
              onClick={onSyncTHS}
              disabled={isSyncingTHS}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
              title="Đồng bộ lại dữ liệu mới nhất từ website"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncingTHS ? 'animate-spin text-indigo-400' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Top 3 Metric Cards for Funds */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Return */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tổng Thu Nhập Đầu Tư</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-white tracking-tight">
            {formatVND(totalCombined)}
          </div>
          <div className="mt-2 text-xs text-emerald-400 font-medium">
            Từ Quỹ THS & Quỹ Thành 7
          </div>
        </div>

        {/* THS Fund Stats */}
        <div 
          onClick={() => setActiveFund('ths')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            activeFund === 'ths' 
              ? 'bg-indigo-950/40 border-indigo-500 ring-1 ring-indigo-500' 
              : 'bg-slate-900/90 border-slate-800 hover:border-indigo-500/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Quỹ Đầu Tư THS</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-indigo-400 tracking-tight">
            {formatVND(totalTHS)}
          </div>
          <div className="mt-2 text-xs text-slate-400 flex justify-between">
            <span>{thsTransactions.length} đợt phân phối</span>
            <span className="text-indigo-300 font-bold">{totalCombined > 0 ? Math.round((totalTHS / totalCombined) * 100) : 0}% danh mục</span>
          </div>
        </div>

        {/* Thanh 7 Fund Stats */}
        <div 
          onClick={() => setActiveFund('thanh7')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            activeFund === 'thanh7' 
              ? 'bg-amber-950/40 border-amber-500 ring-1 ring-amber-500' 
              : 'bg-slate-900/90 border-slate-800 hover:border-amber-500/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">Quỹ Đầu Tư Thành 7</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Coins className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-amber-400 tracking-tight">
            270.000.000 ₫
          </div>
          <div className="mt-2 text-xs text-slate-400 flex justify-between">
            <span>Vốn đầu tư dự kiến</span>
            <span className="text-amber-300 font-bold">Bắt đầu T9/2026</span>
          </div>
        </div>
      </div>

      {/* THS Monthly Reports Breakdown Table */}
      {monthEntries.length > 0 && (
        <div className="bg-slate-900/90 rounded-2xl border border-indigo-900/50 p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-400" />
                Báo Cáo Phân Chia Lợi Nhuận Tháng (THS Chrono)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Chi tiết doanh thu, lợi nhuận công ty và phần lợi nhuận cổ đông Thịnh được chia qua các tháng
              </p>
            </div>
            <div className="text-xs text-emerald-400 font-mono bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
              Đồng bộ từ https://bandongho-ths.onrender.com/
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Kỳ Báo Cáo</th>
                  <th className="py-3 px-4 text-right">Doanh Thu THS</th>
                  <th className="py-3 px-4 text-right">Lợi Nhuận Gộp THS</th>
                  <th className="py-3 px-4 text-right">Lương CEO</th>
                  <th className="py-3 px-4 text-right text-indigo-400">Lợi Nhuận Thịnh (42.86%)</th>
                  <th className="py-3 px-4 text-center">Trạng Thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {monthEntries.map(([mName, mData]) => {
                  const summary = mData.summary || {};
                  const thinhShare = Math.round(Number(summary.thinh_share || 0));

                  return (
                    <tr key={mName} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                        <span>{mName}</span>
                      </td>
                      <td className="py-3 px-4 text-right text-slate-300 font-mono">
                        {formatVND(summary.revenue)}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-300 font-mono">
                        {formatVND(summary.profit)}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-400 font-mono">
                        {formatVND(summary.ceo_salary)}
                      </td>
                      <td className="py-3 px-4 text-right text-sm font-extrabold text-emerald-400 font-mono">
                        +{formatVND(thinhShare)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3 mr-1" /> Đã nhận
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* History of Fund Transactions */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800/80 p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base font-bold text-white">Lịch Sử Dòng Tiền Lợi Nhuận</h3>
            <p className="text-xs text-slate-400">Danh sách các khoản thu từ Quỹ THS và Quỹ Thành 7</p>
          </div>

          <div className="flex items-center space-x-1 p-1 bg-slate-950 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveFund('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                activeFund === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Tất cả ({thsTransactions.length + thanh7Transactions.length})
            </button>
            <button
              onClick={() => setActiveFund('ths')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                activeFund === 'ths' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Quỹ THS ({thsTransactions.length})
            </button>
            <button
              onClick={() => setActiveFund('thanh7')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                activeFund === 'thanh7' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Quỹ Thành 7 ({thanh7Transactions.length})
            </button>
          </div>
        </div>

        <div className="divide-y divide-slate-800/80">
          {displayTransactions.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              Chưa có bản ghi lợi nhuận nào. Nhấn "Đồng bộ từ THS Chrono" để tự động tải dữ liệu về!
            </div>
          ) : (
            displayTransactions.map((tx) => (
              <div key={tx.id} className="py-3.5 flex items-center justify-between hover:bg-slate-800/30 px-2 rounded-xl transition-colors">
                <div className="flex items-center space-x-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                    (tx.incomeSourceName || '').includes('THS')
                      ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}>
                    {(tx.incomeSourceName || '').includes('THS') ? 'THS' : 'T7'}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-200">
                      {tx.incomeSourceName}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2">
                      <span>{formatDateVN(tx.date || tx.createdAt, true)}</span>
                      <span>•</span>
                      <span className="text-slate-500">{tx.walletName}</span>
                      {tx.note && (
                        <>
                          <span>•</span>
                          <span className="italic text-slate-400 truncate max-w-sm">{tx.note}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-sm font-extrabold text-emerald-400">
                  +{formatVND(tx.amount)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
