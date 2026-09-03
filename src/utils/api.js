const BASE_URL = '/api';

export async function fetchAllData() {
  const res = await fetch(`${BASE_URL}/data`);
  if (!res.ok) throw new Error('Không thể tải dữ liệu');
  return res.json();
}

export async function fetchAnalytics(month = 9, year = 2026) {
  const res = await fetch(`${BASE_URL}/analytics?month=${month}&year=${year}`);
  if (!res.ok) throw new Error('Không thể tải thống kê');
  return res.json();
}

export async function syncTHS() {
  const res = await fetch(`${BASE_URL}/ths/sync`, { method: 'POST' });
  if (!res.ok) throw new Error('Lỗi khi đồng bộ từ Quỹ THS Chrono');
  return res.json();
}

export async function cleanWipeData() {
  const res = await fetch(`${BASE_URL}/clean-wipe`, { method: 'POST' });
  if (!res.ok) throw new Error('Lỗi khi xóa dữ liệu');
  return res.json();
}

export async function createTransaction(txData) {
  const res = await fetch(`${BASE_URL}/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(txData)
  });
  if (!res.ok) throw new Error('Lỗi khi thêm giao dịch');
  return res.json();
}

export async function updateTransaction(id, txData) {
  const res = await fetch(`${BASE_URL}/transactions/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(txData)
  });
  if (!res.ok) throw new Error('Lỗi khi cập nhật giao dịch');
  return res.json();
}

export async function deleteTransaction(id) {
  const res = await fetch(`${BASE_URL}/transactions/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Lỗi khi xóa giao dịch');
  return res.json();
}

export async function createIncomeSource(source) {
  const res = await fetch(`${BASE_URL}/income-sources`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(source)
  });
  return res.json();
}

export async function updateIncomeSource(id, source) {
  const res = await fetch(`${BASE_URL}/income-sources/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(source)
  });
  if (!res.ok) throw new Error('Lỗi khi cập nhật nguồn thu nhập');
  return res.json();
}

export async function deleteIncomeSource(id) {
  const res = await fetch(`${BASE_URL}/income-sources/${id}`, {
    method: 'DELETE'
  });
  return res.json();
}

export async function updateWallet(id, wallet) {
  const res = await fetch(`${BASE_URL}/wallets/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(wallet)
  });
  return res.json();
}

export async function createWallet(wallet) {
  const res = await fetch(`${BASE_URL}/wallets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(wallet)
  });
  return res.json();
}

export async function saveBudgets(budgets) {
  const res = await fetch(`${BASE_URL}/budgets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(budgets)
  });
  return res.json();
}

export async function createSavingsGoal(goal) {
  const res = await fetch(`${BASE_URL}/savings-goals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(goal)
  });
  return res.json();
}

export async function updateSavingsGoal(id, goal) {
  const res = await fetch(`${BASE_URL}/savings-goals/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(goal)
  });
  return res.json();
}

export async function deleteSavingsGoal(id) {
  const res = await fetch(`${BASE_URL}/savings-goals/${id}`, {
    method: 'DELETE'
  });
  return res.json();
}

export async function resetDatabase() {
  const res = await fetch(`${BASE_URL}/reset`, {
    method: 'POST'
  });
  return res.json();
}

export async function importDatabase(jsonData) {
  const res = await fetch(`${BASE_URL}/backup/import`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(jsonData)
  });
  return res.json();
}
