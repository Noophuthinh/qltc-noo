import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import MobileBottomNav from './components/MobileBottomNav';
import MobileDrawer from './components/MobileDrawer';
import TransactionModal from './components/TransactionModal';
import EditTransactionModal from './components/EditTransactionModal';
import EditIncomeSourceModal from './components/EditIncomeSourceModal';

import DashboardPage from './pages/DashboardPage';
import TransactionsPage from './pages/TransactionsPage';
import InvestmentsPage from './pages/InvestmentsPage';
import BudgetsPage from './pages/BudgetsPage';
import SavingsPage from './pages/SavingsPage';
import WalletsPage from './pages/WalletsPage';
import SettingsPage from './pages/SettingsPage';

import {
  fetchAllData,
  fetchAnalytics,
  syncTHS,
  syncGoogleSheet,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  createIncomeSource,
  updateIncomeSource,
  deleteIncomeSource,
  updateWallet,
  createWallet,
  saveBudgets,
  createSavingsGoal,
  updateSavingsGoal,
  deleteSavingsGoal
} from './utils/api';
import { syncWithServer, saveLocalBackup, getLocalBackup } from './utils/syncManager';

export default function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [selectedMonth, setSelectedMonth] = useState(9); // Mặc định Tháng 9
  const [selectedYear, setSelectedYear] = useState(2026); // Năm 2026
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [data, setData] = useState(() => {
    const cached = getLocalBackup();
    return cached && cached.data ? cached.data : {
      incomeSources: [],
      expenseCategories: [],
      wallets: [],
      budgets: [],
      savingsGoals: [],
      transactions: [],
      thsData: {},
      settings: {}
    };
  });
  const [analytics, setAnalytics] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncingTHS, setIsSyncingTHS] = useState(false);

  // Modals
  const [isNewTxOpen, setIsNewTxOpen] = useState(false);
  const [editingTx, setEditingTx] = useState(null);
  const [editingSource, setEditingSource] = useState(null);

  const loadAll = async (m = selectedMonth, y = selectedYear) => {
    try {
      setIsLoading(true);
      const serverData = await fetchAllData();
      const syncedData = await syncWithServer(serverData);
      const analyticsData = await fetchAnalytics(m, y);
      setData(syncedData);
      setAnalytics(analyticsData);
      saveLocalBackup(syncedData);
    } catch (err) {
      console.error('Lỗi tải dữ liệu:', err);
      const cached = getLocalBackup();
      if (cached && cached.data) {
        setData(cached.data);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAll(selectedMonth, selectedYear);
  }, [selectedMonth, selectedYear]);

  const handleChangeMonth = (m, y) => {
    setSelectedMonth(m);
    setSelectedYear(y);
  };

  // Handlers
  const handleSyncTHS = async () => {
    try {
      setIsSyncingTHS(true);
      const res = await syncTHS();
      alert(res.message || 'Đồng bộ từ Quỹ THS Chrono Online thành công!');
      await loadAll(selectedMonth, selectedYear);
    } catch (err) {
      alert('Lỗi khi đồng bộ: ' + err.message);
    } finally {
      setIsSyncingTHS(false);
    }
  };

  const handleSyncGoogleSheet = async () => {
    try {
      setIsLoading(true);
      const res = await syncGoogleSheet();
      if (res.addedCount > 0) {
        alert(`📊 Đã đồng bộ từ Google Sheet!\n- Thêm mới: ${res.addedCount} giao dịch`);
      } else {
        alert(`📊 Đã kết nối và kiểm tra Google Sheet thành công! (Hiện có ${res.sheetTotal || 0} dòng)`);
      }
      await loadAll(selectedMonth, selectedYear);
    } catch (err) {
      alert('Lỗi đồng bộ Google Sheet: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTx = async (txData) => {
    await createTransaction(txData);
    await loadAll(selectedMonth, selectedYear);
  };

  const handleUpdateTx = async (id, txData) => {
    await updateTransaction(id, txData);
    await loadAll(selectedMonth, selectedYear);
  };

  const handleDeleteTx = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa giao dịch này?')) {
      // Cập nhật local storage trước
      const cached = getLocalBackup();
      if (cached && cached.data && Array.isArray(cached.data.transactions)) {
        cached.data.transactions = cached.data.transactions.filter(t => t.id !== id);
        saveLocalBackup(cached.data);
      }
      await deleteTransaction(id);
      await loadAll(selectedMonth, selectedYear);
    }
  };

  const handleCreateIncomeSource = async (source) => {
    await createIncomeSource(source);
    await loadAll(selectedMonth, selectedYear);
  };

  const handleUpdateIncomeSource = async (id, source) => {
    await updateIncomeSource(id, source);
    await loadAll(selectedMonth, selectedYear);
  };

  const handleDeleteIncomeSource = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa nguồn thu nhập này?')) {
      await deleteIncomeSource(id);
      await loadAll(selectedMonth, selectedYear);
    }
  };

  const handleUpdateWallet = async (id, wallet) => {
    await updateWallet(id, wallet);
    await loadAll(selectedMonth, selectedYear);
  };

  const handleCreateWallet = async (wallet) => {
    await createWallet(wallet);
    await loadAll(selectedMonth, selectedYear);
  };

  const handleSaveBudgets = async (budgets) => {
    await saveBudgets(budgets);
    await loadAll(selectedMonth, selectedYear);
  };

  const handleCreateGoal = async (goal) => {
    await createSavingsGoal(goal);
    await loadAll(selectedMonth, selectedYear);
  };

  const handleUpdateGoal = async (id, goal) => {
    await updateSavingsGoal(id, goal);
    await loadAll(selectedMonth, selectedYear);
  };

  const handleDeleteGoal = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa mục tiêu này?')) {
      await deleteSavingsGoal(id);
      await loadAll(selectedMonth, selectedYear);
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Desktop Sidebar */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenNewTx={() => setIsNewTxOpen(true)}
        incomeSources={data.incomeSources}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Navbar with Month Selector & Mobile Menu trigger */}
        <Navbar
          summary={analytics.summary}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          onChangeMonth={handleChangeMonth}
          onOpenNewTx={() => setIsNewTxOpen(true)}
          onRefresh={() => loadAll(selectedMonth, selectedYear)}
          onOpenDrawer={() => setIsDrawerOpen(true)}
          isLoading={isLoading}
        />

        {/* Dynamic Page Views with safe mobile padding */}
        <main className="flex-1 overflow-y-auto px-3 py-4 md:px-6 md:py-6 pb-24 md:pb-8 scroll-smooth">
          <div className="max-w-7xl mx-auto">
            {currentTab === 'dashboard' && (
              <DashboardPage
                analytics={analytics}
                data={data}
                selectedMonth={selectedMonth}
                selectedYear={selectedYear}
                onChangeMonth={handleChangeMonth}
                onOpenNewTx={() => setIsNewTxOpen(true)}
                onNavigateTab={setCurrentTab}
                onEditIncomeSource={(s) => setEditingSource(s)}
                onSyncTHS={handleSyncTHS}
                isSyncingTHS={isSyncingTHS}
              />
            )}

            {currentTab === 'transactions' && (
              <TransactionsPage
                transactions={data.transactions}
                incomeSources={data.incomeSources}
                expenseCategories={data.expenseCategories}
                wallets={data.wallets}
                selectedMonth={selectedMonth}
                selectedYear={selectedYear}
                onChangeMonth={handleChangeMonth}
                onOpenNewTx={() => setIsNewTxOpen(true)}
                onEditTx={(tx) => setEditingTx(tx)}
                onDeleteTx={handleDeleteTx}
                onSyncGoogleSheet={handleSyncGoogleSheet}
              />
            )}

            {currentTab === 'investments' && (
              <InvestmentsPage
                transactions={data.transactions}
                incomeSources={data.incomeSources}
                wallets={data.wallets}
                thsData={data.thsData}
                onOpenNewTx={() => setIsNewTxOpen(true)}
                onSyncTHS={handleSyncTHS}
                isSyncingTHS={isSyncingTHS}
              />
            )}

            {currentTab === 'budgets' && (
              <BudgetsPage
                budgets={data.budgets}
                expenseCategories={data.expenseCategories}
                transactions={data.transactions}
                onSaveBudgets={handleSaveBudgets}
              />
            )}

            {currentTab === 'savings' && (
              <SavingsPage
                savingsGoals={data.savingsGoals}
                onCreateGoal={handleCreateGoal}
                onUpdateGoal={handleUpdateGoal}
                onDeleteGoal={handleDeleteGoal}
              />
            )}

            {currentTab === 'wallets' && (
              <WalletsPage
                wallets={data.wallets}
                onUpdateWallet={handleUpdateWallet}
                onCreateWallet={handleCreateWallet}
                onOpenNewTx={() => setIsNewTxOpen(true)}
              />
            )}

            {currentTab === 'settings' && (
              <SettingsPage
                incomeSources={data.incomeSources}
                onCreateIncomeSource={handleCreateIncomeSource}
                onEditIncomeSource={(s) => setEditingSource(s)}
                onDeleteIncomeSource={handleDeleteIncomeSource}
                onSyncTHS={handleSyncTHS}
                isSyncingTHS={isSyncingTHS}
                onSyncGoogleSheet={handleSyncGoogleSheet}
                onReload={() => loadAll(selectedMonth, selectedYear)}
              />
            )}
          </div>
        </main>

        {/* Mobile Bottom Navigation Bar */}
        <MobileBottomNav
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          onOpenNewTx={() => setIsNewTxOpen(true)}
          onOpenDrawer={() => setIsDrawerOpen(true)}
        />
      </div>

      {/* Mobile Slide-out Drawer */}
      <MobileDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        incomeSources={data.incomeSources}
        onOpenNewTx={() => setIsNewTxOpen(true)}
      />

      {/* Transaction Modals */}
      <TransactionModal
        isOpen={isNewTxOpen}
        onClose={() => setIsNewTxOpen(false)}
        onSubmit={handleCreateTx}
        incomeSources={data.incomeSources}
        expenseCategories={data.expenseCategories}
        wallets={data.wallets}
      />

      <EditTransactionModal
        transaction={editingTx}
        isOpen={!!editingTx}
        onClose={() => setEditingTx(null)}
        onUpdate={handleUpdateTx}
        onDelete={handleDeleteTx}
        incomeSources={data.incomeSources}
        expenseCategories={data.expenseCategories}
        wallets={data.wallets}
      />

      {/* Edit Income Source / Salary Modal */}
      <EditIncomeSourceModal
        source={editingSource}
        isOpen={!!editingSource}
        onClose={() => setEditingSource(null)}
        onUpdate={handleUpdateIncomeSource}
      />
    </div>
  );
}
