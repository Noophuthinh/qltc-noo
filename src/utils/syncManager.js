const STORAGE_KEY = 'noo_finance_master_backup_v4';

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
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('noo_finance_master_backup_') || key.startsWith('noo_finance_backup_')) && key !== STORAGE_KEY) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
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

