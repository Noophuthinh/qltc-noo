const SHEET_ID = process.env.GOOGLE_SHEET_ID || '16fJEGPnYfesl472G9QP9G0spdguhXf9cUyIr8AP8F2E';

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

module.exports = {
  SHEET_ID,
  fetchGoogleSheetTransactions
};
