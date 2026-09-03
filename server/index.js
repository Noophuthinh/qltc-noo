const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 8888;

app.use(cors());
app.use(express.json());

// API: Lấy toàn bộ dữ liệu
app.get('/api/data', (req, res) => {
  res.json(db.getData());
});

// API: Thống kê & Phân tích tổng quan (Dashboard Analytics)
app.get('/api/analytics', (req, res) => {
  const data = db.getData();
  const txs = data.transactions || [];
  const now = new Date();
  
  // Lấy tháng và năm từ query params hoặc mặc định tháng 9/2026
  const selectedMonth = req.query.month ? (parseInt(req.query.month, 10) - 1) : 8; // 8 là Tháng 9 (0-indexed)
  const selectedYear = req.query.year ? parseInt(req.query.year, 10) : 2026;

  // Lọc giao dịch tháng được chọn
  const thisMonthTxs = txs.filter(t => {
    const d = new Date(t.date || t.createdAt);
    return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
  });

  const totalIncomeMonth = thisMonthTxs
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const totalExpenseMonth = thisMonthTxs
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const netSavingsMonth = totalIncomeMonth - totalExpenseMonth;
  const savingsRate = totalIncomeMonth > 0 ? Math.round((netSavingsMonth / totalIncomeMonth) * 100) : 0;

  // Tổng tài sản ròng từ các ví
  const totalNetWorth = (data.wallets || []).reduce((sum, w) => sum + Number(w.balance || 0), 0);

  // Phân tích theo 4 Nguồn Thu Nhập
  const incomeBySource = {};
  data.incomeSources.forEach(s => {
    incomeBySource[s.name] = { 
      id: s.id, 
      name: s.name, 
      color: s.color, 
      category: s.category,
      monthlyTarget: s.monthlyTarget || 0,
      totalMonth: 0, 
      totalAllTime: 0, 
      count: 0 
    };
  });

  // Tính tổng all time và tổng tháng này cho từng nguồn
  txs.filter(t => t.type === 'income').forEach(t => {
    const srcName = t.incomeSourceName || 'Không xác định';
    if (!incomeBySource[srcName]) {
      incomeBySource[srcName] = { 
        id: t.incomeSourceId, 
        name: srcName, 
        color: '#94a3b8', 
        monthlyTarget: 0, 
        totalMonth: 0, 
        totalAllTime: 0, 
        count: 0 
      };
    }
    incomeBySource[srcName].totalAllTime += Number(t.amount || 0);
    incomeBySource[srcName].count += 1;

    const d = new Date(t.date || t.createdAt);
    if (d.getMonth() === selectedMonth && d.getFullYear() === selectedYear) {
      incomeBySource[srcName].totalMonth += Number(t.amount || 0);
    }
  });

  // Phân tích theo Danh mục Chi tiêu trong tháng được chọn
  const expenseByCategory = {};
  data.expenseCategories.forEach(c => {
    expenseByCategory[c.name] = { id: c.id, name: c.name, color: c.color, icon: c.icon, total: 0, count: 0 };
  });

  thisMonthTxs
    .filter(t => t.type === 'expense')
    .forEach(t => {
      const catName = t.categoryName || t.category || 'Khác';
      if (!expenseByCategory[catName]) {
        expenseByCategory[catName] = { id: t.categoryId, name: catName, color: '#64748b', total: 0, count: 0 };
      }
      expenseByCategory[catName].total += Number(t.amount || 0);
      expenseByCategory[catName].count += 1;
    });

  // Xu hướng 6 tháng tính đến tháng được chọn
  const monthlyTrends = [];
  for (let i = 5; i >= 0; i--) {
    const targetDate = new Date(selectedYear, selectedMonth - i, 1);
    const m = targetDate.getMonth();
    const y = targetDate.getFullYear();
    const label = `T${m + 1}/${y.toString().slice(2)}`;

    const monthTxs = txs.filter(t => {
      const d = new Date(t.date || t.createdAt);
      return d.getMonth() === m && d.getFullYear() === y;
    });

    const inc = monthTxs.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount || 0), 0);
    const exp = monthTxs.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount || 0), 0);

    monthlyTrends.push({
      label,
      month: m + 1,
      year: y,
      income: inc,
      expense: exp,
      savings: inc - exp
    });
  }

  // Thống kê chuyên sâu cho Quỹ THS & Quỹ Thành 7
  const thsTxs = txs.filter(t => (t.incomeSourceName || '').includes('THS'));
  const thanh7Txs = txs.filter(t => (t.incomeSourceName || '').includes('Thành 7'));

  const thsTotalAllTime = thsTxs.reduce((s, t) => s + Number(t.amount || 0), 0);
  const thanh7TotalAllTime = thanh7Txs.reduce((s, t) => s + Number(t.amount || 0), 0);

  // Lợi nhuận THS trong tháng được chọn
  const thsThisMonth = thisMonthTxs
    .filter(t => (t.incomeSourceName || '').includes('THS') && t.type === 'income')
    .reduce((s, t) => s + Number(t.amount || 0), 0);

  const thanh7ThisMonth = thisMonthTxs
    .filter(t => (t.incomeSourceName || '').includes('Thành 7') && t.type === 'income')
    .reduce((s, t) => s + Number(t.amount || 0), 0);

  res.json({
    selectedPeriod: {
      month: selectedMonth + 1,
      year: selectedYear,
      label: `Tháng ${selectedMonth + 1}/${selectedYear}`
    },
    summary: {
      totalNetWorth,
      totalIncomeMonth,
      totalExpenseMonth,
      netSavingsMonth,
      savingsRate,
      incomeCountMonth: thisMonthTxs.filter(t => t.type === 'income').length,
      expenseCountMonth: thisMonthTxs.filter(t => t.type === 'expense').length,
      transactionCountMonth: thisMonthTxs.length,
      totalTransactionsCount: txs.length
    },
    incomeBySource: Object.values(incomeBySource),
    expenseByCategory: Object.values(expenseByCategory).filter(c => c.total > 0),
    monthlyTrends,
    investments: {
      ths: {
        name: 'Quỹ Đầu tư THS',
        totalEarned: thsTotalAllTime,
        txCount: thsTxs.length,
        recent: thsTxs.slice(0, 10),
        shareholder: data.thsData?.shareholderInfo || {},
        lastSync: data.thsData?.lastSync
      },
      thanh7: {
        name: 'Quỹ Đầu tư Thành 7',
        investedCapital: 270000000,
        startDate: 'Tháng 9/2026',
        status: 'Bắt đầu từ T9/2026',
        totalEarned: thanh7TotalAllTime,
        txCount: thanh7Txs.length,
        recent: thanh7Txs.slice(0, 5)
      }
    }
  });
});

// API: THS Live Sync
app.post('/api/ths/sync', async (req, res) => {
  try {
    const result = await db.syncTHSData();
    res.json({
      success: true,
      message: `Đã đồng bộ thành công ${result.count} tháng báo cáo từ Quỹ THS Chrono Online!`,
      result,
      data: db.getData()
    });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// API: Xóa toàn bộ dữ liệu mẫu / Làm sạch
app.post('/api/clean-wipe', (req, res) => {
  const data = db.cleanWipe();
  res.json({ success: true, message: 'Đã xóa toàn bộ dữ liệu mẫu', data });
});

// API: Transactions
app.get('/api/transactions', (req, res) => {
  res.json(db.getTransactions());
});

app.post('/api/transactions', (req, res) => {
  try {
    const tx = db.addTransaction(req.body);
    res.status(201).json(tx);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.put('/api/transactions/:id', (req, res) => {
  try {
    const tx = db.updateTransaction(req.params.id, req.body);
    if (!tx) return res.status(404).json({ error: 'Không tìm thấy giao dịch' });
    res.json(tx);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.delete('/api/transactions/:id', (req, res) => {
  const ok = db.deleteTransaction(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Không tìm thấy giao dịch' });
  res.json({ success: true, message: 'Đã xóa giao dịch thành công' });
});

// API: Income Sources
app.get('/api/income-sources', (req, res) => {
  res.json(db.getIncomeSources());
});

app.post('/api/income-sources', (req, res) => {
  const item = db.addIncomeSource(req.body);
  res.status(201).json(item);
});

app.put('/api/income-sources/:id', (req, res) => {
  const item = db.updateIncomeSource(req.params.id, req.body);
  if (!item) return res.status(404).json({ error: 'Không tìm thấy nguồn thu' });
  res.json(item);
});

app.delete('/api/income-sources/:id', (req, res) => {
  const ok = db.deleteIncomeSource(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Không tìm thấy nguồn thu' });
  res.json({ success: true });
});

// API: Expense Categories
app.get('/api/expense-categories', (req, res) => {
  res.json(db.getExpenseCategories());
});

app.post('/api/expense-categories', (req, res) => {
  const cat = db.addExpenseCategory(req.body);
  res.status(201).json(cat);
});

// API: Wallets
app.get('/api/wallets', (req, res) => {
  res.json(db.getWallets());
});

app.post('/api/wallets', (req, res) => {
  const wallet = db.addWallet(req.body);
  res.status(201).json(wallet);
});

app.put('/api/wallets/:id', (req, res) => {
  const wallet = db.updateWallet(req.params.id, req.body);
  if (!wallet) return res.status(404).json({ error: 'Không tìm thấy ví' });
  res.json(wallet);
});

app.delete('/api/wallets/:id', (req, res) => {
  const ok = db.deleteWallet(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Không tìm thấy ví' });
  res.json({ success: true });
});

// API: Budgets
app.get('/api/budgets', (req, res) => {
  res.json(db.getBudgets());
});

app.post('/api/budgets', (req, res) => {
  const budgets = db.saveBudgets(req.body);
  res.json(budgets);
});

// API: Savings Goals
app.get('/api/savings-goals', (req, res) => {
  res.json(db.getSavingsGoals());
});

app.post('/api/savings-goals', (req, res) => {
  const goal = db.addSavingsGoal(req.body);
  res.status(201).json(goal);
});

app.put('/api/savings-goals/:id', (req, res) => {
  const goal = db.updateSavingsGoal(req.params.id, req.body);
  if (!goal) return res.status(404).json({ error: 'Không tìm thấy mục tiêu' });
  res.json(goal);
});

app.delete('/api/savings-goals/:id', (req, res) => {
  const ok = db.deleteSavingsGoal(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Không tìm thấy mục tiêu' });
  res.json({ success: true });
});

// API: Export CSV
app.get('/api/export/csv', (req, res) => {
  const txs = db.getTransactions();
  const headers = ['ID', 'Loại', 'Số tiền (VNĐ)', 'Nguồn thu / Danh mục', 'Ví thanh toán', 'Ngày', 'Ghi chú'];
  const rows = txs.map(t => [
    t.id,
    t.type === 'income' ? 'Thu nhập' : t.type === 'expense' ? 'Chi tiêu' : 'Chuyển khoản',
    t.amount,
    `"${(t.incomeSourceName || t.categoryName || t.category || '').replace(/"/g, '""')}"`,
    `"${(t.walletName || '').replace(/"/g, '""')}"`,
    t.date || t.createdAt,
    `"${(t.note || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="quan-ly-tai-chinh-noo.csv"');
  res.send(csvContent);
});

// API: Backup & Restore
app.get('/api/backup/export', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename="noo-finance-backup.json"');
  res.send(JSON.stringify(db.getData(), null, 2));
});

app.post('/api/backup/import', (req, res) => {
  try {
    const data = db.importData(req.body);
    res.json({ success: true, message: 'Đã nhập dữ liệu thành công', data });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.post('/api/reset', (req, res) => {
  const data = db.resetToDefaults();
  res.json({ success: true, message: 'Đã khôi phục dữ liệu ban đầu', data });
});

// Phục vụ frontend static nếu đã build
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

// Fallback SPA
app.use((req, res) => {
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) {
      res.status(200).send(`
        <html>
          <head><title>Noo Finance Server</title></head>
          <body style="font-family: sans-serif; background: #0f172a; color: #fff; padding: 40px; text-align: center;">
            <h1 style="color: #10b981;">💎 Noo Finance API Server đang chạy trên port ${PORT}!</h1>
          </body>
        </html>
      `);
    }
  });
});

function startServer(port) {
  const s = app.listen(port, () => {
    console.log(`\n====================================================`);
    console.log(`🚀 NOO FINANCE APP ĐANG CHẠY TRÊN: http://localhost:${port}`);
    console.log(`====================================================\n`);
  });

  s.on('error', (err) => {
    if ((err.code === 'EACCES' || err.code === 'EADDRINUSE') && port === 8888) {
      console.warn(`⚠️ Port 8888 đang bị Windows/dịch vụ khác giữ (${err.code}). Đang tự động chuyển sang port 8889...`);
      startServer(8889);
    } else {
      console.error('Lỗi khởi động Server:', err);
    }
  });
}

startServer(PORT);
