import React from 'react';
import { 
  TrendingUp, 
  ArrowDownLeft, 
  ArrowUpRight, 
  PiggyBank, 
  Wallet, 
  Calendar,
  Briefcase,
  Coins,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Edit3,
  RefreshCw,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { formatVND, formatCompactVND, formatDateVN } from '../utils/formatters';
import MonthSelector from '../components/MonthSelector';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function DashboardPage({
  analytics = {},
  data = {},
  selectedMonth = 9,
  selectedYear = 2026,
  onChangeMonth,
  onOpenNewTx,
  onNavigateTab,
  onEditIncomeSource,
  onSyncTHS,
  isSyncingTHS
}) {
  const summary = analytics.summary || {};
  const incomeBySource = analytics.incomeBySource || [];
  const expenseByCategory = analytics.expenseByCategory || [];
  const monthlyTrends = analytics.monthlyTrends || [];
  const investments = analytics.investments || {};

  // Lọc giao dịch của riêng tháng đang chọn
  const monthTransactions = (data.transactions || []).filter(t => {
    const d = new Date(t.date || t.createdAt);
    return d.getMonth() === (selectedMonth - 1) && d.getFullYear() === selectedYear;
  });

  const isCurrentMonth = selectedMonth === 9 && selectedYear === 2026;

  // 1. Biểu đồ Xu hướng dòng tiền
  const lineChartData = {
    labels: monthlyTrends.map(t => t.label),
    datasets: [
      {
        label: 'Thu nhập',
        data: monthlyTrends.map(t => t.income),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.35,
        fill: true,
        pointBackgroundColor: '#10b981',
        pointRadius: 4,
      },
      {
        label: 'Chi tiêu',
        data: monthlyTrends.map(t => t.expense),
        borderColor: '#f43f5e',
        backgroundColor: 'rgba(244, 63, 94, 0.05)',
        tension: 0.35,
        fill: true,
        pointBackgroundColor: '#f43f5e',
        pointRadius: 4,
      }
    ]
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans', size: 12 } }
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.dataset.label}: ${formatVND(context.parsed.y)}`
        }
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#94a3b8' }
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: {
          color: '#94a3b8',
          callback: (value) => formatCompactVND(value)
        }
      }
    }
  };

  // 2. Biểu đồ Cơ cấu nguồn thu trong tháng được chọn
  const doughnutIncomeData = {
    labels: incomeBySource.map(s => s.name),
    datasets: [
      {
        data: incomeBySource.map(s => s.totalMonth || 0),
        backgroundColor: [
          '#10b981',
          '#6366f1',
          '#f59e0b',
          '#94a3b8',
          '#ec4899',
          '#3b82f6'
        ],
        borderWidth: 0,
        hoverOffset: 4
      }
    ]
  };

  const doughnutIncomeOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { 
          color: '#cbd5e1', 
          font: { family: 'Plus Jakarta Sans', size: 11 },
          boxWidth: 12,
          padding: 10
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const val = context.parsed;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const pct = total > 0 ? ((val / total) * 100).toFixed(1) : 0;
            return ` ${context.label}: ${formatVND(val)} (${pct}%)`;
          }
        }
      }
    },
    cutout: '70%'
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Top Banner with Selected Month Indicator */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-bold border border-emerald-500/20">
              <Calendar className="w-3.5 h-3.5 mr-1" />
              <span>Báo Cáo Tháng {selectedMonth}/{selectedYear}</span>
            </span>
            {isCurrentMonth && (
              <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-bold border border-blue-500/30">
                Tháng Bắt Đầu Quản Lý
              </span>
            )}
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Quản Lý Tài Chính Tháng {selectedMonth}/{selectedYear}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Theo dõi độc lập doanh thu, chi tiêu, lương và cổ tức quỹ theo từng tháng riêng biệt
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <MonthSelector
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            onChangeMonth={onChangeMonth}
          />
          <button
            onClick={onOpenNewTx}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all active:scale-95 flex items-center space-x-1.5"
          >
            <span>+ Ghi Thu / Chi Tháng {selectedMonth}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid for the Selected Month (3 thẻ chỉ số trực quan) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Thu Nhập Tháng Này */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tổng Thu Tháng {selectedMonth}</span>
            <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-black text-emerald-400 tracking-tight">
            +{formatVND(summary.totalIncomeMonth || 0)}
          </div>
          <div className="mt-2 text-xs text-slate-400 truncate">
            {summary.incomeCountMonth || 0} khoản thu nhập đã nhận
          </div>
          <div className="absolute right-0 bottom-0 w-24 h-24 bg-teal-500/5 rounded-full blur-2xl pointer-events-none"></div>
        </div>

        {/* Card 2: Chi Tiêu Tháng Này */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tổng Chi Tháng {selectedMonth}</span>
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-black text-rose-400 tracking-tight">
            -{formatVND(summary.totalExpenseMonth || 0)}
          </div>
          <div className="mt-2 text-xs text-slate-400">
            {summary.expenseCountMonth || 0} khoản chi tiêu phát sinh
          </div>
          <div className="absolute right-0 bottom-0 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl pointer-events-none"></div>
        </div>

        {/* Card 3: Thặng Dư / Tiết Kiệm Tháng Này */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Thặng Dư Tháng {selectedMonth}</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <PiggyBank className="w-5 h-5" />
            </div>
          </div>
          <div className={`mt-3 text-3xl font-black tracking-tight ${summary.netSavingsMonth >= 0 ? 'text-indigo-300' : 'text-rose-400'}`}>
            {formatVND(summary.netSavingsMonth || 0)}
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center justify-between">
            <span>Tỷ lệ tích lũy:</span>
            <span className="font-bold text-slate-200">{summary.savingsRate || 0}%</span>
          </div>
          <div className="absolute right-0 bottom-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none"></div>
        </div>
      </div>

      {/* 4 Income Sources - Filtered for the Selected Month */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800/80 p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Coins className="w-5 h-5 text-amber-400" />
              Tình Hình 4 Nguồn Thu Nhập (Tháng {selectedMonth}/{selectedYear})
            </h3>
            <p className="text-xs text-slate-400">
              Kiểm tra thực nhận so với mức lương/kế hoạch tháng {selectedMonth}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-emerald-400 bg-slate-950 px-3 py-1 rounded-lg border border-slate-800">
              Tổng thu tháng: {formatVND(summary.totalIncomeMonth || 0)}
            </span>
          </div>
        </div>

        {/* Tổng quan tiến độ kế hoạch toàn tháng */}
        {(() => {
          const totalTarget = (data.incomeSources || []).reduce((sum, s) => sum + Number(s.monthlyTarget || 0), 0);
          const totalActual = Number(summary.totalIncomeMonth || 0);
          const overallPct = totalTarget > 0 ? Math.min(Math.round((totalActual / totalTarget) * 100), 100) : 0;
          const remaining = Math.max(0, totalTarget - totalActual);
          const isAllDone = totalTarget > 0 && totalActual >= totalTarget;

          return (
            <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800/80 space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-200">Tổng Tiến Độ Thu Nhập Tháng {selectedMonth}:</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                    isAllDone
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                      : overallPct > 0
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}>
                    {isAllDone ? '🎉 ĐÃ HOÀN THÀNH 100% KẾ HOẠCH' : `ĐẠT ${overallPct}% MỤC TIÊU`}
                  </span>
                </div>
                <div className="font-mono text-slate-300">
                  <span className="text-emerald-400 font-extrabold">{formatVND(totalActual)}</span>
                  <span className="text-slate-500"> / {formatVND(totalTarget)}</span>
                  {remaining > 0 ? (
                    <span className="text-amber-400 ml-2">(Còn thiếu: {formatVND(remaining)})</span>
                  ) : (
                    <span className="text-emerald-400 ml-2">(Đạt chỉ tiêu)</span>
                  )}
                </div>
              </div>

              {/* Big Overall Progress Bar */}
              <div className="w-full bg-slate-900 h-3.5 rounded-full overflow-hidden p-0.5 border border-slate-700/60 shadow-inner">
                <div 
                  className={`h-full rounded-full transition-all duration-700 ${
                    isAllDone
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-md shadow-emerald-500/30'
                      : 'bg-gradient-to-r from-indigo-500 via-teal-500 to-emerald-400'
                  }`}
                  style={{ width: `${overallPct}%` }}
                ></div>
              </div>
            </div>
          );
        })()}

        {/* 4 Cards Nguồn Thu Nhập với Process Bar & Trạng Thái Chi Tiết */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(data.incomeSources || []).map((source) => {
            const stats = incomeBySource.find(s => s.name === source.name) || {};
            const earnedThisMonth = stats.totalMonth || 0;
            const target = Number(source.monthlyTarget || 0);
            const rawPct = target > 0 ? (earnedThisMonth / target) * 100 : 0;
            const pct = Math.min(Math.round(rawPct), 100);
            const isCompleted = target > 0 && earnedThisMonth >= target;
            const isPartial = earnedThisMonth > 0 && !isCompleted;
            const diff = target - earnedThisMonth;

            return (
              <div 
                key={source.id}
                className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                  isCompleted 
                    ? 'border-emerald-500/50 bg-emerald-950/20 shadow-lg shadow-emerald-950/30 ring-1 ring-emerald-500/30' 
                    : isPartial 
                    ? 'border-amber-500/40 bg-amber-950/10' 
                    : 'border-slate-800 bg-slate-950/70'
                }`}
              >
                <div>
                  {/* Top Name & Edit button */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-200 truncate max-w-[130px]">{source.name}</span>
                    <button
                      onClick={() => onEditIncomeSource(source)}
                      className="p-1 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-emerald-400 transition-colors"
                      title="Sửa kế hoạch / mức lương"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Status Pill Badge */}
                  <div className="mb-2">
                    {isCompleted ? (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-[10px] font-extrabold border border-emerald-500/40">
                        <CheckCircle2 className="w-3 h-3 mr-0.5" />
                        <span>ĐÃ ĐẠT MỤC TIÊU (100%)</span>
                      </span>
                    ) : isPartial ? (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-extrabold border border-amber-500/40">
                        <span>⏳ ĐẠT {pct}% KẾ HOẠCH</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 text-[10px] font-semibold border border-slate-700">
                        <span>⚪ CHƯA NHẬN (0%)</span>
                      </span>
                    )}
                  </div>

                  {/* Amount Earned */}
                  <div className="text-xl font-black text-emerald-400">
                    {formatVND(earnedThisMonth)}
                  </div>

                  {/* Individual Process Bar */}
                  <div className="mt-3 space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>Tiến độ</span>
                      <span className={`font-bold ${isCompleted ? 'text-emerald-400' : 'text-slate-300'}`}>{pct}%</span>
                    </div>
                    <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-800">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          isCompleted
                            ? 'bg-emerald-400 shadow-sm shadow-emerald-400'
                            : isPartial
                            ? 'bg-amber-400'
                            : 'bg-slate-700'
                        }`}
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Target and Remaining Info */}
                <div className="mt-3 pt-2.5 border-t border-slate-800/80 text-[11px] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Kế hoạch:</span>
                    <span className="font-bold text-slate-200">{formatVND(target)}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-500">Trạng thái:</span>
                    {isCompleted ? (
                      <span className="text-emerald-400 font-bold">Đã hoàn thành ✓</span>
                    ) : diff > 0 ? (
                      <span className="text-amber-400 font-medium">Còn thiếu {formatVND(diff)}</span>
                    ) : (
                      <span className="text-slate-400">0 ₫</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900/90 rounded-2xl border border-slate-800/80 p-6 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white">Xu Hướng Dòng Tiền 6 Tháng (Đến T{selectedMonth})</h3>
              <p className="text-xs text-slate-400">So sánh tổng thu và chi các tháng</p>
            </div>
            <div className="flex items-center space-x-2 text-xs">
              <span className="flex items-center gap-1 text-emerald-400"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Thu</span>
              <span className="flex items-center gap-1 text-rose-400 ml-2"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Chi</span>
            </div>
          </div>
          <div className="h-64 w-full">
            <Line data={lineChartData} options={lineChartOptions} />
          </div>
        </div>

        <div className="bg-slate-900/90 rounded-2xl border border-slate-800/80 p-6 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Cơ Cấu Thu Tháng {selectedMonth}</h3>
            <p className="text-xs text-slate-400">Tỷ trọng các nguồn thu</p>
          </div>
          <div className="h-56 w-full my-auto flex items-center justify-center">
            {summary.totalIncomeMonth > 0 ? (
              <Doughnut data={doughnutIncomeData} options={doughnutIncomeOptions} />
            ) : (
              <div className="text-center text-xs text-slate-500">
                Tháng {selectedMonth} chưa có khoản thu nào.<br/>
                <span className="text-emerald-400 cursor-pointer" onClick={onOpenNewTx}>+ Nhấn để ghi nhận</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Section: Transactions in the Selected Month */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800/80 p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-400" />
              Giao Dịch Phát Sinh Trong Tháng {selectedMonth}/{selectedYear}
            </h3>
            <p className="text-xs text-slate-400">Toàn bộ các khoản thu chi thuộc kỳ Tháng {selectedMonth}</p>
          </div>
          <button
            onClick={() => onNavigateTab('transactions')}
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center space-x-1"
          >
            <span>Mở sổ giao dịch chi tiết</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="divide-y divide-slate-800/80">
          {monthTransactions.length === 0 ? (
            <div className="py-10 text-center space-y-2">
              <p className="text-xs text-slate-400">Chưa có giao dịch phát sinh nào trong Tháng {selectedMonth}/{selectedYear}</p>
              <button
                onClick={onOpenNewTx}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md"
              >
                + Ghi Chép Giao Dịch Đầu Tiên Cho Tháng {selectedMonth}
              </button>
            </div>
          ) : (
            monthTransactions.map((tx) => {
              const isInc = tx.type === 'income';
              return (
                <div key={tx.id} className="py-3.5 flex items-center justify-between hover:bg-slate-800/30 px-2 rounded-xl transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                      isInc ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                    }`}>
                      {isInc ? '+' : '-'}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-200">
                        {tx.incomeSourceName || tx.categoryName || tx.category || 'Giao dịch'}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2">
                        <span>{formatDateVN(tx.date || tx.createdAt, true)}</span>
                        <span>•</span>
                        <span className="text-slate-500">{tx.walletName}</span>
                        {tx.note && (
                          <>
                            <span>•</span>
                            <span className="italic text-slate-400 truncate max-w-md">{tx.note}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className={`text-sm font-extrabold ${isInc ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isInc ? '+' : '-'}{formatVND(tx.amount)}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
