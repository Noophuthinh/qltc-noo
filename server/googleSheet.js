const SHEET_ID = process.env.GOOGLE_SHEET_ID || '16fJEGPnYfesl472G9QP9G0spdguhXf9cUyIr8AP8F2E';
const DEFAULT_WEBHOOK_URL = process.env.GOOGLE_SHEET_WEBHOOK || 'https://script.google.com/macros/s/AKfycbx_DejBzN1Buv-DNbCIgwAvWruRUqbewIUFjMYFMg3Muk0TH2W97rz0mh-UOVlw0qH2/exec';

async function fetchGoogleSheetTransactions() {
  try {
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;
    const res = await fetch(url);
    if (!res.ok) {
      console.warn('Không thể tải Google Sheet:', res.statusText);
      return [];
    }

    const text = await res.text();
    // Google gviz returns /*O_o*/\ngoogle.visualization.Query.setResponse({...});
    const jsonStr = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
    if (!jsonStr) return [];

    const parsed = JSON.parse(jsonStr);
    const table = parsed.table;
    if (!table || !table.rows || table.rows.length === 0) {
      return [];
    }

    const cols = (table.cols || []).map(c => (c.label || '').trim().toLowerCase());
    const transactions = [];

    table.rows.forEach((row, idx) => {
      const cells = row.c || [];
      const getVal = (colIndex) => {
        if (!cells[colIndex]) return '';
        return cells[colIndex].v !== null && cells[colIndex].v !== undefined ? cells[colIndex].v : '';
      };

      // Nhận diện cột theo tên header hoặc theo vị trí chuẩn:
      // Col 0: ID / Thời gian
      // Col 1: Phân loại (Thu/Chi)
      // Col 2: Khoản mục / Nguồn thu
      // Col 3: Số tiền (VNĐ)
      // Col 4: Ví
      // Col 5: Ghi chú
      const timeVal = getVal(0);
      const typeVal = String(getVal(1) || '').toLowerCase();
      const nameVal = String(getVal(2) || 'Giao dịch');
      const amountVal = Number(getVal(3) || 0);
      const walletVal = String(getVal(4) || 'Tài khoản Ngân hàng (Chính)');
      const noteVal = String(getVal(5) || '');

      if (!amountVal || amountVal <= 0) return;

      const isInc = typeVal.includes('thu') || typeVal.includes('income');
      const isExp = typeVal.includes('chi') || typeVal.includes('expense');
      const type = isInc ? 'income' : isExp ? 'expense' : 'income';

      let dateIso = new Date().toISOString();
      if (timeVal) {
        // GViz can return "Date(2026,8,10,6,27,0)" or string
        if (typeof timeVal === 'string' && timeVal.startsWith('Date(')) {
          const dParts = timeVal.replace('Date(', '').replace(')', '').split(',').map(Number);
          dateIso = new Date(dParts[0], dParts[1], dParts[2], dParts[3] || 0, dParts[4] || 0).toISOString();
        } else {
          const d = new Date(timeVal);
          if (!isNaN(d.getTime())) {
            dateIso = d.toISOString();
          }
        }
      }

      transactions.push({
        id: `tx-gsheet-${idx}-${amountVal}`,
        date: dateIso,
        createdAt: dateIso,
        type,
        amount: amountVal,
        incomeSourceName: type === 'income' ? nameVal : undefined,
        categoryName: type === 'expense' ? nameVal : undefined,
        category: nameVal,
        walletName: walletVal,
        walletId: 'wal-1',
        note: noteVal,
        source: 'GoogleSheet'
      });
    });

    return transactions;
  } catch (err) {
    console.error('Lỗi khi parse Google Sheet:', err);
    return [];
  }
}

// Chuyển đổi giao dịch thành mảng hàng cho Google Sheet
function formatTxRow(t) {
  const d = new Date(t.date || t.createdAt);
  const dateStr = (d.getDate() < 10 ? '0' : '') + d.getDate() + '/' + ((d.getMonth() + 1) < 10 ? '0' : '') + (d.getMonth() + 1) + '/' + d.getFullYear();
  const typeStr = t.type === 'income' ? 'Thu nhập' : 'Chi tiêu';
  const catStr = t.type === 'income' ? (t.incomeSourceName || t.category || 'Nguồn khác') : (t.categoryName || 'Chi phí khác');
  const amountStr = Number(t.amount || 0);
  const walletStr = t.walletName || 'Tài khoản Ngân hàng (Chính)';
  const noteStr = t.note || '';
  return [dateStr, typeStr, catStr, amountStr, walletStr, noteStr];
}

// Đẩy toàn bộ danh sách giao dịch lên Google Sheet qua Apps Script Webhook
async function pushAllToGoogleSheet(transactions = [], webhookUrl) {
  const targetUrl = webhookUrl || DEFAULT_WEBHOOK_URL;
  if (!targetUrl) throw new Error('Chưa cấu hình Google Apps Script Webhook URL');
  const rows = transactions.map(formatTxRow);
  
  const res = await fetch(targetUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'syncAll',
      rows
    }),
    redirect: 'follow'
  });

  if (!res.ok) {
    throw new Error(`Google Apps Script phản hồi lỗi HTTP ${res.status}`);
  }

  const data = await res.json();
  return data;
}

// Thêm 1 giao dịch mới trực tiếp vào Google Sheet qua Webhook
async function appendTransactionToGoogleSheet(tx, webhookUrl) {
  const targetUrl = webhookUrl || DEFAULT_WEBHOOK_URL;
  if (!targetUrl) return;
  try {
    const row = formatTxRow(tx);
    await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'append',
        row
      }),
      redirect: 'follow'
    });
  } catch (err) {
    console.warn('Không thể gửi giao dịch tới Google Sheet Webhook:', err.message);
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

