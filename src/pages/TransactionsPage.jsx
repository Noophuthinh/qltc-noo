import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Trash2, 
  Edit3, 
  ArrowDownLeft, 
  ArrowUpRight, 
  ArrowLeftRight, 
  Calendar,
  FileSpreadsheet
} from 'lucide-react';
import { formatVND, formatDateVN } from '../utils/formatters';
import MonthSelector from '../components/MonthSelector';

export default function TransactionsPage({
  transactions = [],
  incomeSources = [],
  expenseCategories = [],
  wallets = [],
  selectedMonth = 9,
  selectedYear = 2026,
  onChangeMonth,
  onOpenNewTx,
  onEditTx,
  onDeleteTx
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all'); // all, income, expense, transfer
  const [incomeSourceFilter, setIncomeSourceFilter] = useState('all');
  const [walletFilter, setWalletFilter] = useState('all');
  const [timeFilterMode, setTimeFilterMode] = useState('month'); // 'month' hoặc 'all'
  const [sortBy, setSortBy] = useState('date-desc');

  // Lọc danh sách giao dịch
  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      // Month filter if timeFilterMode is 'month'
      if (timeFilterMode === 'month') {
        const d = new Date(tx.date || tx.createdAt);
        if (d.getMonth() !== (selectedMonth - 1) || d.getFullYear() !== selectedYear) {
          return false;
        }
      }

      // Type filter
      if (typeFilter !== 'all' && tx.type !== typeFilter) return false;

      // Income Source filter
      if (incomeSourceFilter !== 'all' && tx.incomeSourceId !== incomeSourceFilter) return false;

      // Wallet filter
      if (walletFilter !== 'all' && tx.walletId !== walletFilter) return false;

      // Search term
      if (searchTerm.trim() !== '') {
        const query = searchTerm.toLowerCase();
        const noteMatch = (tx.note || '').toLowerCase().includes(query);
        const nameMatch = (tx.incomeSourceName || tx.categoryName || tx.category || '').toLowerCase().includes(query);
        const walletMatch = (tx.walletName || '').toLowerCase().includes(query);
        if (!noteMatch && !nameMatch && !walletMatch) return false;
      }

      return true;
    }).sort((a, b) => {
      const dateA = new Date(a.date || a.createdAt).getTime();
      const dateB = new Date(b.date || b.createdAt).getTime();
      if (sortBy === 'date-desc') return dateB - dateA;
      if (sortBy === 'date-asc') return dateA - dateB;
      if (sortBy === 'amount-desc') return Number(b.amount) - Number(a.amount);
      if (sortBy === 'amount-asc') return Number(a.amount) - Number(b.amount);
      return 0;
    });
  }, [transactions, timeFilterMode, selectedMonth, selectedYear, typeFilter, incomeSourceFilter, walletFilter, searchTerm, sortBy]);

  // Tổng tiền của các giao dịch đang hiển thị
  const filteredSummary = useMemo(() => {
    let income = 0;
    let expense = 0;
    filteredTransactions.forEach(t => {
      if (t.type === 'income') income += Number(t.amount || 0);
      if (t.type === 'expense') expense += Number(t.amount || 0);
    });
    return { income, expense, net: income - expense };
  }, [filteredTransactions]);

  const handleExportCSV = () => {
    window.location.href = '/api/export/csv';
  };

  return (
    <div className="space-y-4 md:space-y-6 pb-12 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/90 p-4 md:p-6 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              {timeFilterMode === 'month' ? `Kỳ Tháng ${selectedMonth}/${selectedYear}` : 'Toàn bộ lịch sử'}
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">Sổ Giao Dịch</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Quản lý và tra cứu dòng tiền theo tháng hoặc toàn bộ thời gian
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          <button
            onClick={handleExportCSV}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 flex items-center space-x-1.5 transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Xuất Excel</span>
          </button>
          <button
            onClick={onOpenNewTx}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 flex items-center space-x-1.5 transition-all active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Thêm Mới</span>
          </button>
        </div>
      </div>

      {/* Month & Period Filter Bar */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800/80 p-3.5 md:p-5 space-y-3 md:space-y-4">
        <div className="flex flex-col md:flex-row gap-2.5 items-stretch md:items-center justify-between">
          {/* Time mode selector */}
          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => setTimeFilterMode('month')}
              className={`flex-1 md:flex-initial px-3 py-1.5 rounded-xl text-xs font-bold transition-all text-center ${
                timeFilterMode === 'month'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              Theo Tháng ({selectedMonth})
            </button>
            <button
              onClick={() => setTimeFilterMode('all')}
              className={`flex-1 md:flex-initial px-3 py-1.5 rounded-xl text-xs font-bold transition-all text-center ${
                timeFilterMode === 'all'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              Toàn Bộ ({transactions.length})
            </button>
          </div>

          {/* Month selector widget if in month mode */}
          {timeFilterMode === 'month' && (
            <div className="flex justify-end">
              <MonthSelector
                selectedMonth={selectedMonth}
                selectedYear={selectedYear}
                onChangeMonth={onChangeMonth}
              />
            </div>
          )}
        </div>

        {/* Search & Type Tabs */}
        <div className="pt-2.5 border-t border-slate-800/80 flex flex-col md:flex-row gap-2.5 items-stretch md:items-center justify-between">
          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo ghi chú, danh mục, ví..."
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl py-1.5 pl-8 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Type Filter Buttons */}
          <div className="flex items-center space-x-1 p-1 bg-slate-950 rounded-xl border border-slate-800 overflow-x-auto">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                typeFilter === 'all' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Tất cả ({filteredTransactions.length})
            </button>
            <button
              onClick={() => setTypeFilter('income')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center space-x-1 transition-all ${
                typeFilter === 'income' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ArrowDownLeft className="w-3 h-3" />
              <span>Thu</span>
            </button>
            <button
              onClick={() => setTypeFilter('expense')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center space-x-1 transition-all ${
                typeFilter === 'expense' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ArrowUpRight className="w-3 h-3" />
              <span>Chi</span>
            </button>
            <button
              onClick={() => setTypeFilter('transfer')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center space-x-1 transition-all ${
                typeFilter === 'transfer' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ArrowLeftRight className="w-3 h-3" />
              <span>Ví</span>
            </button>
          </div>
        </div>

        {/* Sub-Filters */}
        <div className="pt-2.5 border-t border-slate-800/80 flex flex-wrap gap-2 items-center justify-between text-xs">
          <div className="flex flex-wrap gap-2 items-center">
            {/* Filter by Income Source */}
            <select
              value={incomeSourceFilter}
              onChange={(e) => setIncomeSourceFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700/80 rounded-lg py-1 px-2 text-[11px] md:text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="all">Tất cả nguồn thu</option>
              {incomeSources.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>

            {/* Filter by Wallet */}
            <select
              value={walletFilter}
              onChange={(e) => setWalletFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700/80 rounded-lg py-1 px-2 text-[11px] md:text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="all">Tất cả ví</option>
              {wallets.map(w => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-slate-950 border border-slate-700/80 rounded-lg py-1 px-2 text-[11px] md:text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="date-desc">Mới nhất</option>
            <option value="date-asc">Cũ nhất</option>
            <option value="amount-desc">Tiền cao nhất</option>
            <option value="amount-asc">Tiền thấp nhất</option>
          </select>
        </div>
      </div>

      {/* Filtered Summary Banner */}
      <div className="grid grid-cols-3 gap-2 md:gap-3 text-center">
        <div className="p-2.5 md:p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-[10px] md:text-xs text-slate-400">Thu kỳ này</div>
          <div className="text-xs md:text-sm font-bold text-emerald-400 truncate">+{formatVND(filteredSummary.income)}</div>
        </div>
        <div className="p-2.5 md:p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-[10px] md:text-xs text-slate-400">Chi kỳ này</div>
          <div className="text-xs md:text-sm font-bold text-rose-400 truncate">-{formatVND(filteredSummary.expense)}</div>
        </div>
        <div className="p-2.5 md:p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-[10px] md:text-xs text-slate-400">Chênh lệch</div>
          <div className={`text-xs md:text-sm font-bold truncate ${filteredSummary.net >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {formatVND(filteredSummary.net)}
          </div>
        </div>
      </div>

      {/* MOBILE VIEW: Card List */}
      <div className="md:hidden space-y-2.5">
        {filteredTransactions.length === 0 ? (
          <div className="py-10 text-center text-xs text-slate-500 bg-slate-900/60 rounded-2xl border border-slate-800">
            Không có giao dịch nào trong {timeFilterMode === 'month' ? `Tháng ${selectedMonth}/${selectedYear}` : 'bộ lọc'}
          </div>
        ) : (
          filteredTransactions.map((tx) => {
            const isInc = tx.type === 'income';
            const isExp = tx.type === 'expense';

            return (
              <div
                key={tx.id}
                className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800/80 shadow-md space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      isInc ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                      isExp ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                      'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                    }`}>
                      {isInc ? 'Thu nhập' : isExp ? 'Chi tiêu' : 'Chuyển ví'}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {formatDateVN(tx.date || tx.createdAt, true)}
                    </span>
                  </div>

                  <div className={`text-sm font-black ${isInc ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isInc ? '+' : '-'}{formatVND(tx.amount)}
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/60">
                  <div>
                    <div className="font-bold text-slate-200">
                      {tx.incomeSourceName || tx.categoryName || tx.category || 'Giao dịch'}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Ví: <span className="text-slate-300">{tx.walletName || 'Chính'}</span>
                      {tx.note && <span className="italic ml-2 text-slate-400">"{tx.note}"</span>}
                    </div>
                  </div>

                  <div className="flex items-center space-x-1.5 shrink-0">
                    <button
                      onClick={() => onEditTx(tx)}
                      className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                      title="Sửa"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteTx(tx.id)}
                      className="p-1.5 rounded-lg bg-rose-950/40 text-rose-300 hover:text-rose-100"
                      title="Xóa"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* DESKTOP VIEW: Table */}
      <div className="hidden md:block bg-slate-900/90 rounded-2xl border border-slate-800/80 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Loại</th>
                <th className="py-3.5 px-4">Khoản thu / Chi tiêu</th>
                <th className="py-3.5 px-4">Ví thanh toán</th>
                <th className="py-3.5 px-4">Thời gian</th>
                <th className="py-3.5 px-4">Ghi chú</th>
                <th className="py-3.5 px-4 text-right">Số tiền (VNĐ)</th>
                <th className="py-3.5 px-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-500">
                    Không có giao dịch nào trong {timeFilterMode === 'month' ? `Tháng ${selectedMonth}/${selectedYear}` : 'bộ lọc hiện tại'}
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => {
                  const isInc = tx.type === 'income';
                  const isExp = tx.type === 'expense';
                  const isTrans = tx.type === 'transfer';

                  return (
                    <tr key={tx.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          isInc ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' :
                          isExp ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30' :
                          'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30'
                        }`}>
                          {isInc ? 'Thu nhập' : isExp ? 'Chi tiêu' : 'Chuyển ví'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-200">
                          {tx.incomeSourceName || tx.categoryName || tx.category || 'Giao dịch'}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-300">
                        {isTrans ? (
                          <span>{tx.walletName} ➔ {tx.toWalletName}</span>
                        ) : (
                          <span>{tx.walletName || 'Chính'}</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                        {formatDateVN(tx.date || tx.createdAt, true)}
                      </td>

                      <td className="py-3.5 px-4 text-slate-400 italic max-w-xs truncate">
                        {tx.note || '-'}
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <span className={`text-sm font-extrabold ${
                          isInc ? 'text-emerald-400' : isExp ? 'text-rose-400' : 'text-indigo-400'
                        }`}>
                          {isInc ? '+' : isExp ? '-' : ''}{formatVND(tx.amount)}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center space-x-1.5">
                          <button
                            onClick={() => onEditTx(tx)}
                            title="Chỉnh sửa"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteTx(tx.id)}
                            title="Xóa"
                            className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 hover:text-rose-100 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
