const db = require('./db');

async function wipeAndSync() {
  console.log('1. Xóa sạch dữ liệu mẫu cũ...');
  db.cleanWipe();
  
  console.log('2. Đang đồng bộ dữ liệu từ https://bandongho-ths.onrender.com/ ...');
  const res = await db.syncTHSData();
  console.log('Kết quả đồng bộ THS:', res);
  
  console.log('3. Kiểm tra các giao dịch THS đã sync:');
  db.getTransactions().forEach(t => {
    console.log(`- ${t.date.slice(0, 10)} | ${t.incomeSourceName} | +${t.amount.toLocaleString()} ₫ | ${t.note}`);
  });
}

wipeAndSync().catch(console.error);
