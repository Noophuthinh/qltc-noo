const STORAGE_KEY = 'noo_finance_master_backup_v3';

export function getLocalBackup() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.error('Lỗi khi đọc local backup:', e);
    return null;
  }
}

export function saveLocalBackup(data) {
  try {
    if (!data) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      data,
      updatedAt: new Date().toISOString()
    }));
  } catch (e) {
    console.error('Lỗi khi lưu local backup:', e);
  }
}

export function clearOldBackups() {
  try {
    localStorage.removeItem('noo_finance_master_backup_v1');
    localStorage.removeItem('noo_finance_master_backup_v2');
  } catch (e) {}
}

export async function syncWithServer(serverData) {
  try {
    clearOldBackups();
    // Google Sheet & Server là nguồn chuẩn xác nhất
    if (serverData && Array.isArray(serverData.transactions)) {
      saveLocalBackup(serverData);
      return serverData;
    }

    const local = getLocalBackup();
    if (local && local.data) {
      return local.data;
    }

    return serverData;
  } catch (e) {
    console.error('Lỗi sync:', e);
    return serverData;
  }
}

