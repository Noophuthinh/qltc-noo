const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'finance_db.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Cấu trúc dữ liệu sạch và chuẩn xác
const cleanInitialData = {
  userName: 'Thịnh (Noo)',
  incomeSources: [
    {
      id: 'inc-1',
      name: 'Lương hàng tháng',
      category: 'Lương cố định',
      color: '#10b981',
      icon: 'Briefcase',
      description: 'Thu nhập từ tiền lương công việc chính',
      monthlyTarget: 25000000,
      createdAt: '2026-01-01'
    },
    {
      id: 'inc-2',
      name: 'Quỹ Đầu tư THS',
      category: 'Đầu tư tài chính (Đồng hồ Chrono)',
      color: '#6366f1',
      icon: 'TrendingUp',
      description: 'Lợi nhuận cổ đông Thịnh (42.86%) từ THS Chrono (https://bandongho-ths.onrender.com/)',
      monthlyTarget: 15000000,
      syncUrl: 'https://bandongho-ths.onrender.com/api/data',
      createdAt: '2026-01-01'
    },
    {
      id: 'inc-3',
      name: 'Quỹ Đầu tư Thành 7',
      category: 'Đầu tư tài chính',
      color: '#f59e0b',
      icon: 'Coins',
      description: 'Vốn đầu tư dự kiến 270.000.000 ₫ (Bắt đầu từ Tháng 9/2026)',
      investedCapital: 270000000,
      startDate: '2026-09-01',
      monthlyTarget: 10000000,
      createdAt: '2026-09-01'
    },
    {
      id: 'inc-4',
      name: 'Không xác định',
      category: 'Nguồn khác',
      color: '#94a3b8',
      icon: 'HelpCircle',
      description: 'Các khoản thu nhập vãng lai, thưởng phụ chưa phân loại',
      monthlyTarget: 0,
      createdAt: '2026-01-01'
    }
  ],

  expenseCategories: [
    { id: 'exp-1', name: 'Ăn uống & Cà phê', icon: 'Utensils', color: '#ef4444' },
    { id: 'exp-2', name: 'Nhà cửa & Hóa đơn', icon: 'Home', color: '#3b82f6' },
    { id: 'exp-3', name: 'Đi lại & Xăng xe', icon: 'Car', color: '#f97316' },
    { id: 'exp-4', name: 'Mua sắm & Tiêu dùng', icon: 'ShoppingBag', color: '#ec4899' },
    { id: 'exp-5', name: 'Giải trí & Du lịch', icon: 'Gamepad2', color: '#8b5cf6' },
    { id: 'exp-6', name: 'Sức khỏe & Y tế', icon: 'HeartPulse', color: '#14b8a6' },
    { id: 'exp-7', name: 'Học tập & Kỹ năng', icon: 'GraduationCap', color: '#06b6d4' },
    { id: 'exp-8', name: 'Gia đình & Bạn bè', icon: 'Users', color: '#a855f7' },
    { id: 'exp-9', name: 'Chi phí khác', icon: 'MoreHorizontal', color: '#64748b' }
  ],

  wallets: [
    { id: 'wal-1', name: 'Tài khoản Ngân hàng (Chính)', type: 'bank', balance: 0, icon: 'Building2', color: '#3b82f6' },
    { id: 'wal-2', name: 'Ví Tiền mặt', type: 'cash', balance: 0, icon: 'Wallet', color: '#10b981' },
    { id: 'wal-3', name: 'Ví Điện tử (Momo / ZaloPay)', type: 'ewallet', balance: 0, icon: 'Smartphone', color: '#ec4899' },
    { id: 'wal-4', name: 'Tài khoản Quỹ Đầu tư THS & Thành 7', type: 'investment', balance: 0, icon: 'TrendingUp', color: '#6366f1' }
  ],

  budgets: [
    { id: 'bud-1', categoryId: 'exp-1', categoryName: 'Ăn uống & Cà phê', amount: 5000000, period: 'month' },
    { id: 'bud-2', categoryId: 'exp-2', categoryName: 'Nhà cửa & Hóa đơn', amount: 4000000, period: 'month' },
    { id: 'bud-3', categoryId: 'exp-3', categoryName: 'Đi lại & Xăng xe', amount: 2000000, period: 'month' },
    { id: 'bud-4', categoryId: 'exp-4', categoryName: 'Mua sắm & Tiêu dùng', amount: 3000000, period: 'month' }
  ],

  savingsGoals: [
    { id: 'goal-1', title: 'Quỹ Khẩn cấp 6 tháng', targetAmount: 60000000, currentAmount: 0, deadline: '2026-12-31', color: '#10b981' },
    { id: 'goal-2', title: 'Tái đầu tư Quỹ THS & Thành 7', targetAmount: 100000000, currentAmount: 0, deadline: '2027-01-01', color: '#8b5cf6' }
  ],

  // Bắt đầu sạch sẽ
  transactions: [],

  // Dữ liệu chi tiết đồng bộ từ THS Chrono
  thsData: {
    lastSync: null,
    totalProfitThinh: 0,
    monthlyReports: {},
    shareholderInfo: {
      name: 'Thịnh (Cổ đông)',
      sharePercent: '42.86%',
      contributedCapital: 300000000
    }
  },

  settings: {
    currency: 'VND',
    currencySymbol: '₫',
    theme: 'dark',
    userName: 'Thịnh (Noo)'
  }
};

class Database {
  constructor() {
    this.data = this.load();
  }

  load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf8');
        return JSON.parse(raw);
      }
    } catch (e) {
      console.error('Lỗi khi đọc file DB:', e);
    }
    this.save(cleanInitialData);
    return JSON.parse(JSON.stringify(cleanInitialData));
  }

  save(data = this.data) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
      this.data = data;
      return true;
    } catch (e) {
      console.error('Lỗi khi ghi DB:', e);
      return false;
    }
  }

  getData() {
    return this.data;
  }

  // Xóa toàn bộ dữ liệu giao dịch & reset sạch
  cleanWipe() {
    this.data.transactions = [];
    this.data.wallets.forEach(w => w.balance = 0);
    this.data.savingsGoals.forEach(g => g.currentAmount = 0);
    this.data.thsData = {
      lastSync: null,
      totalProfitThinh: 0,
      monthlyReports: {},
      shareholderInfo: {
        name: 'Thịnh (Cổ đông)',
        sharePercent: '42.86%',
        contributedCapital: 300000000
      }
    };
    this.save();
    return this.data;
  }

  // Cập nhật số dư các ví dựa trên transactions
  recalculateBalances() {
    // Reset balances
    this.data.wallets.forEach(w => {
      // Giữ baseBalance nếu có, hoặc tính thuần từ txs
      w.balance = Number(w.initialBalance || 0);
    });

    // Cộng trừ theo transactions
    for (const tx of this.data.transactions) {
      const amt = Number(tx.amount || 0);
      if (tx.type === 'income') {
        const w = this.data.wallets.find(w => w.id === tx.walletId);
        if (w) w.balance += amt;
      } else if (tx.type === 'expense') {
        const w = this.data.wallets.find(w => w.id === tx.walletId);
        if (w) w.balance -= amt;
      } else if (tx.type === 'transfer') {
        const fromW = this.data.wallets.find(w => w.id === tx.walletId);
        const toW = this.data.wallets.find(w => w.id === tx.toWalletId);
        if (fromW) fromW.balance -= amt;
        if (toW) toW.balance += amt;
      }
    }
    this.save();
  }

  // Transactions
  getTransactions() {
    return this.data.transactions || [];
  }

  addTransaction(tx) {
    const newTx = {
      id: 'tx-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
      createdAt: new Date().toISOString(),
      ...tx
    };
    this.data.transactions.unshift(newTx);
    this.recalculateBalances();
    return newTx;
  }

  updateTransaction(id, updatedFields) {
    const idx = this.data.transactions.findIndex(t => t.id === id);
    if (idx === -1) return null;

    this.data.transactions[idx] = {
      ...this.data.transactions[idx],
      ...updatedFields,
      updatedAt: new Date().toISOString()
    };
    this.recalculateBalances();
    return this.data.transactions[idx];
  }

  deleteTransaction(id) {
    const idx = this.data.transactions.findIndex(t => t.id === id);
    if (idx === -1) return false;

    this.data.transactions.splice(idx, 1);
    this.recalculateBalances();
    return true;
  }

  // Income Sources
  getIncomeSources() {
    return this.data.incomeSources || [];
  }

  addIncomeSource(source) {
    const newSource = {
      id: 'inc-' + Date.now(),
      createdAt: new Date().toISOString(),
      monthlyTarget: Number(source.monthlyTarget || 0),
      ...source
    };
    this.data.incomeSources.push(newSource);
    this.save();
    return newSource;
  }

  updateIncomeSource(id, fields) {
    const idx = this.data.incomeSources.findIndex(s => s.id === id);
    if (idx === -1) return null;

    if (fields.monthlyTarget !== undefined) {
      fields.monthlyTarget = Number(fields.monthlyTarget);
    }

    this.data.incomeSources[idx] = {
      ...this.data.incomeSources[idx],
      ...fields
    };
    this.save();
    return this.data.incomeSources[idx];
  }

  deleteIncomeSource(id) {
    const idx = this.data.incomeSources.findIndex(s => s.id === id);
    if (idx === -1) return false;
    this.data.incomeSources.splice(idx, 1);
    this.save();
    return true;
  }

  // Expense Categories
  getExpenseCategories() {
    return this.data.expenseCategories || [];
  }

  addExpenseCategory(cat) {
    const newCat = { id: 'exp-' + Date.now(), ...cat };
    this.data.expenseCategories.push(newCat);
    this.save();
    return newCat;
  }

  // Wallets
  getWallets() {
    return this.data.wallets || [];
  }

  updateWallet(id, fields) {
    const idx = this.data.wallets.findIndex(w => w.id === id);
    if (idx === -1) return null;

    if (fields.balance !== undefined) {
      fields.balance = Number(fields.balance);
      fields.initialBalance = Number(fields.balance);
    }

    this.data.wallets[idx] = { ...this.data.wallets[idx], ...fields };
    this.save();
    return this.data.wallets[idx];
  }

  addWallet(wallet) {
    const newWallet = {
      id: 'wal-' + Date.now(),
      balance: Number(wallet.balance || 0),
      initialBalance: Number(wallet.balance || 0),
      ...wallet
    };
    this.data.wallets.push(newWallet);
    this.save();
    return newWallet;
  }

  deleteWallet(id) {
    const idx = this.data.wallets.findIndex(w => w.id === id);
    if (idx === -1) return false;
    this.data.wallets.splice(idx, 1);
    this.save();
    return true;
  }

  // Budgets
  getBudgets() {
    return this.data.budgets || [];
  }

  saveBudgets(budgets) {
    this.data.budgets = budgets;
    this.save();
    return this.data.budgets;
  }

  // Savings Goals
  getSavingsGoals() {
    return this.data.savingsGoals || [];
  }

  addSavingsGoal(goal) {
    const newGoal = {
      id: 'goal-' + Date.now(),
      currentAmount: Number(goal.currentAmount || 0),
      targetAmount: Number(goal.targetAmount || 0),
      ...goal
    };
    this.data.savingsGoals.push(newGoal);
    this.save();
    return newGoal;
  }

  updateSavingsGoal(id, fields) {
    const idx = this.data.savingsGoals.findIndex(g => g.id === id);
    if (idx === -1) return null;
    this.data.savingsGoals[idx] = { ...this.data.savingsGoals[idx], ...fields };
    this.save();
    return this.data.savingsGoals[idx];
  }

  deleteSavingsGoal(id) {
    const idx = this.data.savingsGoals.findIndex(g => g.id === id);
    if (idx === -1) return false;
    this.data.savingsGoals.splice(idx, 1);
    this.save();
    return true;
  }

  // Đồng bộ dữ liệu Quỹ THS từ https://bandongho-ths.onrender.com/
  async syncTHSData() {
    try {
      const res = await fetch('https://bandongho-ths.onrender.com/api/data');
      if (!res.ok) throw new Error(`Lỗi kết nối máy chủ THS: ${res.status}`);
      const thsJson = await res.json();

      const monthlyReports = thsJson.monthlyReports || {};
      const thsWallet = this.data.wallets.find(w => w.id === 'wal-4') || this.data.wallets[0];
      const thsSource = this.data.incomeSources.find(s => s.id === 'inc-2');

      // Xóa các transaction THS tự động đã sync trước đó để tránh trùng
      this.data.transactions = this.data.transactions.filter(t => !t.isTHSAutoSync);

      let totalThinhProfit = 0;
      const syncedReports = [];

      // Sắp xếp các tháng theo thứ tự thời gian
      const monthKeys = Object.keys(monthlyReports);
      
      for (const mKey of monthKeys) {
        const mData = monthlyReports[mKey];
        const summary = mData.summary || {};
        const thinhShare = Math.round(Number(summary.thinh_share || 0));

        if (thinhShare > 0) {
          totalThinhProfit += thinhShare;

          // Parse month / year từ chuỗi "Tháng 8 2026"
          const parts = mKey.match(/(\d+)\s*(\d{4})/);
          let txDate = new Date();
          if (parts) {
            const m = parseInt(parts[1], 10) - 1;
            const y = parseInt(parts[2], 10);
            txDate = new Date(y, m, 28, 10, 0, 0); // Ngày cuối tháng
          }

          const syncTx = {
            id: `tx-ths-sync-${mKey.replace(/\s+/g, '-').toLowerCase()}`,
            type: 'income',
            amount: thinhShare,
            incomeSourceId: 'inc-2',
            incomeSourceName: 'Quỹ Đầu tư THS',
            category: 'Đầu tư tài chính (Đồng hồ Chrono)',
            walletId: thsWallet.id,
            walletName: thsWallet.name,
            date: txDate.toISOString(),
            note: `Lợi nhuận cổ đông Thịnh (42.86%) - ${mKey} [THS Chrono Online]`,
            isTHSAutoSync: true,
            thsDetails: {
              month: mKey,
              revenue: summary.revenue,
              profit: summary.profit,
              ceoSalary: summary.ceo_salary,
              salesCount: mData.sales ? mData.sales.length : 0
            },
            createdAt: txDate.toISOString()
          };

          this.data.transactions.push(syncTx);
          syncedReports.push({
            month: mKey,
            amount: thinhShare,
            revenue: summary.revenue,
            profit: summary.profit
          });
        }
      }

      // Sắp xếp lại transactions theo ngày mới nhất
      this.data.transactions.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));

      // Lưu trữ chi tiết THS data
      this.data.thsData = {
        lastSync: new Date().toISOString(),
        totalProfitThinh: totalThinhProfit,
        monthlyReports,
        syncedReports,
        shareholderInfo: {
          name: 'Thịnh (Cổ đông)',
          sharePercent: '42.86%',
          contributedCapital: 300000000
        }
      };

      this.recalculateBalances();
      return {
        success: true,
        totalThinhProfit,
        count: syncedReports.length,
        syncedReports
      };
    } catch (e) {
      console.error('Lỗi sync THS:', e);
      throw e;
    }
  }

  // Reset to defaults
  resetToDefaults() {
    this.save(JSON.parse(JSON.stringify(cleanInitialData)));
    return this.data;
  }

  importData(importedJson) {
    if (!importedJson || !Array.isArray(importedJson.transactions)) {
      throw new Error('Dữ liệu JSON không hợp lệ');
    }
    this.save(importedJson);
    return this.data;
  }
}

module.exports = new Database();
