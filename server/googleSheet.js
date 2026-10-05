const SHEET_ID = process.env.GOOGLE_SHEET_ID || '16fJEGPnYfesl472G9QP9G0spdguhXf9cUyIr8AP8F2E';
const DEFAULT_WEBHOOK_URL = process.env.GOOGLE_SHEET_WEBHOOK || 'https://script.google.com/macros/s/AKfycbx_DejBzN1Buv-DNbCIgwAvWruRUqbewIUFjMYFMg3Muk0TH2W97rz0mh-UOVlw0qH2/exec';

function parseAmount(val) {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  const clean = String(val).replace(/[^\d.-]/g, '');
  return parseFloat(clean) || 0;
}

function parseVNOrGSheetDate(cell, expectedMonth = 10, expectedYear = 2026) {
  if (!cell) return new Date().toISOString();
  
  // 1. Chuỗi hiển thị format dd/MM/yyyy hoặc MM/dd/yyyy
  const str = String(cell.f || cell.v || '').trim();
  const dmyMatch = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if (dmyMatch) {
    const p1 = parseInt(dmyMatch[1], 10);
    const p2 = parseInt(dmyMatch[2], 10);
    const year = parseInt(dmyMatch[3], 10);

    let day = p1;
    let month = p2 - 1; // 0-indexed

    // Nếu đang trong tab Tháng M (ví dụ Tháng 10):
    if (expectedMonth) {
      if (p1 === expectedMonth && p2 !== expectedMonth && p2 <= 31) {
        // Ví dụ: 10/02/2026 trong tab Tháng 10 -> Ngày 02, Tháng 10!
        month = expectedMonth - 1;
        day = p2;
      } else if (p2 === expectedMonth && p1 !== expectedMonth && p1 <= 31) {
        // Ví dụ: 02/10/2026 trong tab Tháng 10 -> Ngày 02, Tháng 10!
        month = expectedMonth - 1;
        day = p1;
      }
    } else {
      if (p1 > 12) {
        day = p1;
        month = p2 - 1;
      } else if (p2 > 12) {
        day = p2;
        month = p1 - 1;
      }
    }
    return new Date(Date.UTC(year, month, day, 12, 0, 0)).toISOString();
  }

  // 2. Nếu là GViz Date(yyyy, m, d)
  const val = String(cell.v || '');
  if (val.startsWith('Date(')) {
    const parts = val.replace('Date(', '').replace(')', '').split(',').map(Number);
    let y = parts[0];
    let m = parts[1]; // 0-indexed trong GViz
    let d = parts[2] || 1;

    if (expectedMonth) {
      // Nếu GViz bị hiểu nhầm đảo ngày và tháng khi nhập trên mobile
      if (d === expectedMonth && (m + 1) !== expectedMonth) {
        d = m + 1;
        m = expectedMonth - 1;
      }
    }
    return new Date(Date.UTC(y, m, d, 12, 0, 0)).toISOString();
  }

  // 3. Chuỗi yyyy-mm-dd
  const ymdMatch = str.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
  if (ymdMatch) {
    return new Date(Date.UTC(parseInt(ymdMatch[1],10), parseInt(ymdMatch[2],10)-1, parseInt(ymdMatch[3],10), 12, 0, 0)).toISOString();
  }

  // 4. Fallback ISO
  const d = new Date(val);
  if (!isNaN(d.getTime())) return d.toISOString();

  return new Date().toISOString();
}

async function fetchTabTable(tabName) {
  try {
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(tabName)}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) return null;
    const text = await res.text();
    const jsonStr = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
    if (!jsonStr) return null;
    const parsed = JSON.parse(jsonStr);
    return parsed.table || null;
  } catch (e) {
    return null;
  }
}

function resolveWalletId(walletName) {
  const w = String(walletName || '').toLowerCase();
  if (w.includes('mặt') || w.includes('cash')) return 'wal-2';
  if (w.includes('momo') || w.includes('zalo') || w.includes('điện tử')) return 'wal-3';
  if (w.includes('đầu tư') || w.includes('ths') || w.includes('thành 7') || w.includes('cổ phần')) return 'wal-4';
  return 'wal-1'; // Mặc định Ngân hàng
}

function resolveIncomeSource(name) {
  const s = String(name || '').toLowerCase().trim();
  if (s.includes('lương') || s.includes('luong') || s.includes('cố định')) {
    return { name: 'Lương hàng tháng', id: 'inc-1' };
  }
  if (s.includes('ths') || s.includes('chrono') || s.includes('cổ phần') || s.includes('đầu tư ths') || s.includes('quỹ đầu tư ths')) {
    return { name: 'Quỹ Đầu tư THS', id: 'inc-2' };
  }
  if (s.includes('thành 7') || s.includes('thanh 7')) {
    return { name: 'Quỹ Đầu tư Thành 7', id: 'inc-3' };
  }
  return { name: 'Không xác định', id: 'inc-4' };
}

// Đọc toàn bộ giao dịch từ các tab theo tháng và tab chung
async function fetchGoogleSheetTransactions() {
  try {
    const monthCandidateTabs = [
      'tháng 10', 'Tháng 10',
      'tháng 11', 'Tháng 11',
      'tháng 12', 'Tháng 12',
      'tháng 1', 'Tháng 1',
      'tháng 2', 'Tháng 2',
      'tháng 3', 'Tháng 3',
      'tháng 4', 'Tháng 4',
      'tháng 5', 'Tháng 5',
      'tháng 6', 'Tháng 6',
      'tháng 7', 'Tháng 7',
      'tháng 8', 'Tháng 8',
      'tháng 9', 'Tháng 9',
      'Trang tính1', 'Sheet1'
    ];

    const fetchedTabs = new Set();
    const allTransactions = [];

    for (const tab of monthCandidateTabs) {
      const lower = tab.toLowerCase();
      if (fetchedTabs.has(lower)) continue;

      const table = await fetchTabTable(tab);
      if (!table || !table.rows || table.rows.length === 0) continue;

      fetchedTabs.add(lower);
      const rows = table.rows;
      const monthNumMatch = tab.match(/\d+/);
      const expectedMonth = monthNumMatch ? parseInt(monthNumMatch[0], 10) : 10;

      rows.forEach((r, idx) => {
        const cells = r.c || [];

        // Trường hợp 1: Template bố cục đẹp (Cột H/7: Ngày, I/8: Phân loại, J/9: Danh mục/Khoản mục, K/10: Số tiền, L/11: Ví, M/12: Ghi chú)
        const dateCellTemplate = cells[7];
        const typeCellTemplate = cells[8];
        const typeStrTemplate = String(typeCellTemplate?.v || typeCellTemplate?.f || '').toLowerCase();

        if (dateCellTemplate && (typeStrTemplate.includes('thu') || typeStrTemplate.includes('chi'))) {
          const dateIso = parseVNOrGSheetDate(dateCellTemplate, expectedMonth);
          const amount = parseAmount(cells[10]?.v || cells[10]?.f);
          const cat = String(cells[9]?.v || cells[9]?.f || '').trim();
          const wallet = String(cells[11]?.v || cells[11]?.f || 'Tài khoản Ngân hàng (Chính)').trim();
          const note = String(cells[12]?.v || cells[12]?.f || '').trim();
          const isInc = typeStrTemplate.includes('thu');

          if (amount > 0) {
            const incSource = isInc ? resolveIncomeSource(cat) : null;
            allTransactions.push({
              id: `tx-gsheet-${lower.replace(/\s+/g, '')}-${idx}-${amount}`,
              date: dateIso,
              createdAt: dateIso,
              type: isInc ? 'income' : 'expense',
              amount,
              incomeSourceName: isInc ? incSource.name : undefined,
              incomeSourceId: isInc ? incSource.id : undefined,
              categoryName: !isInc ? (cat || 'Chi phí khác') : undefined,
              category: isInc ? incSource.name : cat,
              walletName: wallet || 'Tài khoản Ngân hàng (Chính)',
              walletId: resolveWalletId(wallet),
              note: isInc && incSource.name === 'Không xác định' && cat !== 'Không xác định' ? (note ? `${note} (${cat})` : cat) : note,
              source: 'GoogleSheet',
              sheetTab: tab
            });
            return;
          }
        }

        // Trường hợp 2: Bố cục đơn giản chuẩn (Cột A/0: Ngày, B/1: Phân loại, C/2: Khoản mục, D/3: Số tiền, E/4: Ví, F/5: Ghi chú)
        const dateCellStd = cells[0];
        const typeCellStd = cells[1];
        const typeStrStd = String(typeCellStd?.v || typeCellStd?.f || '').toLowerCase();

        if (dateCellStd && (typeStrStd.includes('thu') || typeStrStd.includes('chi') || typeStrStd.includes('income') || typeStrStd.includes('expense'))) {
          const dateIso = parseVNOrGSheetDate(dateCellStd, expectedMonth);
          const amount = parseAmount(cells[3]?.v || cells[3]?.f);
          const cat = String(cells[2]?.v || cells[2]?.f || '').trim();
          const wallet = String(cells[4]?.v || cells[4]?.f || 'Tài khoản Ngân hàng (Chính)').trim();
          const note = String(cells[5]?.v || cells[5]?.f || '').trim();
          const isInc = typeStrStd.includes('thu') || typeStrStd.includes('income');

          if (amount > 0) {
            const incSource = isInc ? resolveIncomeSource(cat) : null;
            allTransactions.push({
              id: `tx-gsheet-std-${lower.replace(/\s+/g, '')}-${idx}-${amount}`,
              date: dateIso,
              createdAt: dateIso,
              type: isInc ? 'income' : 'expense',
              amount,
              incomeSourceName: isInc ? incSource.name : undefined,
              incomeSourceId: isInc ? incSource.id : undefined,
              categoryName: !isInc ? (cat || 'Chi phí khác') : undefined,
              category: isInc ? incSource.name : cat,
              walletName: wallet || 'Tài khoản Ngân hàng (Chính)',
              walletId: resolveWalletId(wallet),
              note: isInc && incSource.name === 'Không xác định' && cat !== 'Không xác định' ? (note ? `${note} (${cat})` : cat) : note,
              source: 'GoogleSheet',
              sheetTab: tab
            });
          }
        }
      });
    }

    return allTransactions;
  } catch (err) {
    console.error('Lỗi khi tải Google Sheet theo tháng:', err);
    return [];
  }
}

// Chuyển đổi giao dịch thành mảng hàng cho Google Sheet
function formatTxRow(t) {
  let dateStr = '';
  const d = new Date(t.date || t.createdAt);
  if (!isNaN(d.getTime())) {
    const y = d.getFullYear();
    const m = (d.getMonth() + 1 < 10 ? '0' : '') + (d.getMonth() + 1);
    const day = (d.getDate() < 10 ? '0' : '') + d.getDate();
    dateStr = `${day}/${m}/${y}`;
  } else {
    const today = new Date();
    const y = today.getFullYear();
    const m = (today.getMonth() + 1 < 10 ? '0' : '') + (today.getMonth() + 1);
    const day = (today.getDate() < 10 ? '0' : '') + today.getDate();
    dateStr = `${day}/${m}/${y}`;
  }
  const typeStr = t.type === 'income' ? 'Thu nhập' : 'Chi tiêu';
  const catStr = t.type === 'income' ? (t.incomeSourceName || t.category || 'Nguồn khác') : (t.categoryName || 'Chi phí khác');
  const amountStr = Number(t.amount || 0);
  const walletStr = t.walletName || 'Tài khoản Ngân hàng (Chính)';
  const noteStr = t.note || '';
  const statusStr = 'Đã thanh toán';
  return [dateStr, typeStr, catStr, amountStr, walletStr, noteStr, statusStr];
}

// Đẩy toàn bộ danh sách giao dịch lên Google Sheet qua Apps Script Webhook
async function pushAllToGoogleSheet(transactions = [], webhookUrl) {
  const targetUrl = webhookUrl || DEFAULT_WEBHOOK_URL;
  if (!targetUrl) throw new Error('Chưa cấu hình Google Apps Script Webhook URL');
  
  // Nhóm transactions theo tháng
  const groupedByMonth = {};
  transactions.forEach(t => {
    const d = new Date(t.date || t.createdAt);
    const m = !isNaN(d.getTime()) ? (d.getMonth() + 1) : (new Date().getMonth() + 1);
    const y = !isNaN(d.getTime()) ? d.getFullYear() : new Date().getFullYear();
    const tabName = `tháng ${m}`;
    if (!groupedByMonth[tabName]) groupedByMonth[tabName] = { month: m, year: y, rows: [] };
    groupedByMonth[tabName].rows.push(formatTxRow(t));
  });

  const tabKeys = Object.keys(groupedByMonth);
  if (tabKeys.length === 0) {
    // Trống
    const currentM = new Date().getMonth() + 1;
    const currentY = new Date().getFullYear();
    const res = await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'syncAll',
        sheetName: `tháng ${currentM}`,
        month: currentM,
        year: currentY,
        rows: []
      }),
      redirect: 'follow',
      signal: AbortSignal.timeout(10000)
    });
    return await res.json();
  }

  let lastResult = null;
  for (const tabName of tabKeys) {
    const group = groupedByMonth[tabName];
    const res = await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'syncAll',
        sheetName: tabName,
        month: group.month,
        year: group.year,
        rows: group.rows
      }),
      redirect: 'follow',
      signal: AbortSignal.timeout(10000)
    });
    lastResult = await res.json();
  }

  return lastResult;
}

// Thêm 1 giao dịch mới trực tiếp vào Google Sheet qua Webhook theo đúng tab tháng
async function appendTransactionToGoogleSheet(tx, webhookUrl) {
  const targetUrl = webhookUrl || DEFAULT_WEBHOOK_URL;
  if (!targetUrl) return;
  try {
    const d = new Date(tx.date || tx.createdAt);
    const m = !isNaN(d.getTime()) ? (d.getMonth() + 1) : (new Date().getMonth() + 1);
    const y = !isNaN(d.getTime()) ? d.getFullYear() : new Date().getFullYear();
    const tabName = `tháng ${m}`;
    const row = formatTxRow(tx);

    await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'append',
        sheetName: tabName,
        month: m,
        year: y,
        row
      }),
      redirect: 'follow',
      signal: AbortSignal.timeout(8000)
    });
  } catch (err) {
    console.warn('Lỗi gửi Webhook Google Sheet theo tháng:', err.message);
  }
}

module.exports = {
  SHEET_ID,
  DEFAULT_WEBHOOK_URL,
  fetchGoogleSheetTransactions,
  formatTxRow,
  pushAllToGoogleSheet,
  appendTransactionToGoogleSheet
};

