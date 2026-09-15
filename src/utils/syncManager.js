const STORAGE_KEY = 'noo_finance_master_backup_v2';

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

export async function syncWithServer(serverData) {
  try {
    const local = getLocalBackup();
    if (!local || !local.data || !Array.isArray(local.data.transactions)) {
      // Lưu bản mới từ server vào local
      saveLocalBackup(serverData);
      return serverData;
    }

    const localTxs = local.data.transactions;
    const serverTxs = serverData.transactions || [];

    const serverMap = new Set(serverTxs.map(t => t.id));
    const missingOnServer = localTxs.filter(t => !serverMap.has(t.id));

    if (missingOnServer.length > 0) {
      console.log(`⚡ Phát hiện ${missingOnServer.length} giao dịch chưa có trên Server (do Render restart). Đang tự động nạp lại lên Server...`);
      const res = await fetch('/api/sync/client', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactions: localTxs })
      });
      if (res.ok) {
        const result = await res.json();
        const merged = result.data || serverData;
        saveLocalBackup(merged);
        return merged;
      }
    }

    // Merge transactions từ server vào local
    const localMap = new Set(localTxs.map(t => t.id));
    let localChanged = false;
    for (const st of serverTxs) {
      if (!localMap.has(st.id)) {
        localTxs.push(st);
        localMap.add(st.id);
        localChanged = true;
      }
    }

    if (localChanged) {
      localTxs.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));
      local.data.transactions = localTxs;
      saveLocalBackup(local.data);
    }

    return serverData;
  } catch (e) {
    console.error('Lỗi sync:', e);
    return serverData;
  }
}
