import Dexie from 'dexie';

// Local offline queue for attendance scans made while the device has no connectivity.
// Matches the offline-first design described in Section 2.6 / 3.4.1 of the project report.
export const db = new Dexie('AttendanceOfflineDB');

db.version(1).stores({
  pendingScans: '++id, sessionId, queuedAt',
});

export async function queueScan(payload) {
  return db.pendingScans.add({ ...payload, queuedAt: Date.now() });
}

export async function getQueuedScans() {
  return db.pendingScans.toArray();
}

export async function removeQueuedScan(id) {
  return db.pendingScans.delete(id);
}
