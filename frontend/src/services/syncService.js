import api from './api';
import { getQueuedScans, removeQueuedScan } from './db';

export async function syncPendingScans(onResult) {
  const queued = await getQueuedScans();
  for (const scan of queued) {
    try {
      const { id, queuedAt, ...payload } = scan;
      const res = await api.post('/attendance/scan', payload);
      await removeQueuedScan(id);
      if (onResult) onResult({ success: true, message: res.data.message });
    } catch (err) {
      if (err.response && err.response.status < 500) {
        await removeQueuedScan(scan.id);
        if (onResult) onResult({ success: false, message: err.response.data.error });
      }
    }
  }
}

export function registerSyncListener(onResult) {
  window.addEventListener('online', () => syncPendingScans(onResult));
}
