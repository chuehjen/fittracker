// ===== IndexedDB Data Layer =====
// Replaces localStorage with IndexedDB for better storage limits
// Automatic migration from localStorage on first run

const DB_NAME = 'fittracker-db';
const DB_VERSION = 2;
const STORE_STATE = 'state';
const STORE_PHOTOS = 'photos';
const STORE_ACHIEVEMENTS = 'achievements';
const STORE_SYNC_QUEUE = 'sync_queue';

let dbInstance = null;

export function openDB() {
  if (dbInstance) return Promise.resolve(dbInstance);
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_STATE)) {
        db.createObjectStore(STORE_STATE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_PHOTOS)) {
        db.createObjectStore(STORE_PHOTOS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_ACHIEVEMENTS)) {
        db.createObjectStore(STORE_ACHIEVEMENTS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_SYNC_QUEUE)) {
        const store = db.createObjectStore(STORE_SYNC_QUEUE, { keyPath: 'id' });
        store.createIndex('table', 'table', { unique: false });
      }
    };
    request.onsuccess = (e) => {
      dbInstance = e.target.result;
      resolve(dbInstance);
    };
    request.onerror = (e) => reject(e.target.error);
  });
}

export async function getState() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_STATE, 'readonly');
    const store = tx.objectStore(STORE_STATE);
    const req = store.get('main');
    req.onsuccess = () => resolve(req.result ? req.result.data : null);
    req.onerror = () => reject(req.error);
  });
}

export async function setState(data) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_STATE, 'readwrite');
    const store = tx.objectStore(STORE_STATE);
    store.put({ id: 'main', data });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// Photo storage in IndexedDB (avoids localStorage 5MB limit)
export async function savePhoto(id, dataUrl) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_PHOTOS, 'readwrite');
    const store = tx.objectStore(STORE_PHOTOS);
    store.put({ id, data: dataUrl, timestamp: Date.now() });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getPhoto(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_PHOTOS, 'readonly');
    const store = tx.objectStore(STORE_PHOTOS);
    const req = store.get(id);
    req.onsuccess = () => resolve(req.result ? req.result.data : null);
    req.onerror = () => reject(req.error);
  });
}

export async function deletePhoto(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_PHOTOS, 'readwrite');
    const store = tx.objectStore(STORE_PHOTOS);
    store.delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// ===== Achievement Storage (IndexedDB) =====

export async function saveAchievements(unlockedIds) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_ACHIEVEMENTS, 'readwrite');
    const store = tx.objectStore(STORE_ACHIEVEMENTS);
    store.put({ id: 'unlocked', data: unlockedIds });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function loadAchievements() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_ACHIEVEMENTS, 'readonly');
    const store = tx.objectStore(STORE_ACHIEVEMENTS);
    const req = store.get('unlocked');
    req.onsuccess = () => resolve(req.result ? req.result.data : []);
    req.onerror = () => reject(req.error);
  });
}

// ===== Sync Queue =====

export async function addToSyncQueue(item) {
  const db = await openDB();
  const id = `${item.table}_${item.localId}`;
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_SYNC_QUEUE, 'readwrite');
    const store = tx.objectStore(STORE_SYNC_QUEUE);
    store.put({ id, table: item.table, localId: item.localId, data: item.data, operation: item.operation, createdAt: Date.now() });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getSyncQueue() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_SYNC_QUEUE, 'readonly');
    const store = tx.objectStore(STORE_SYNC_QUEUE);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

export async function markSynced(ids) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_SYNC_QUEUE, 'readwrite');
    const store = tx.objectStore(STORE_SYNC_QUEUE);
    ids.forEach(id => store.delete(id));
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function clearSyncQueue() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_SYNC_QUEUE, 'readwrite');
    const store = tx.objectStore(STORE_SYNC_QUEUE);
    store.clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// Migrate from localStorage to IndexedDB
export async function migrateFromLocalStorage() {
  const existingState = await getState();
  if (existingState) return false; // Already migrated

  const ls = localStorage.getItem('fittracker_data');
  if (!ls) return false;

  try {
    const data = JSON.parse(ls);
    // Migrate photos to IndexedDB
    const migratedRecords = (data.trainingRecords || []).map(r => ({ ...r }));
    await setState({
      profile: data.profile || {},
      trainingRecords: migratedRecords,
      bodyRecords: data.bodyRecords || [],
      customExercises: data.customExercises || [],
      restSeconds: data.restSeconds || 90,
      trainingTimerElapsed: data.trainingTimerElapsed || 0,
      trainingTimerStart: data.trainingTimerStart || null,
    });
    console.log('[DB] Migrated from localStorage to IndexedDB');
    return true;
  } catch (e) {
    console.error('[DB] Migration failed:', e);
    return false;
  }
}

// Migrate achievements from localStorage to IndexedDB
export async function migrateAchievementsFromLocalStorage() {
  const existing = await loadAchievements();
  if (existing.length > 0) return false;

  try {
    const lsData = localStorage.getItem('fittracker_achievements');
    if (!lsData) return false;
    const unlockedIds = JSON.parse(lsData);
    await saveAchievements(unlockedIds);
    console.log('[DB] Migrated achievements from localStorage to IndexedDB');
    return true;
  } catch {
    return false;
  }
}

// Export all data (for backup)
export async function exportAllData() {
  const state = await getState();
  if (!state) return null;
  const achievements = await loadAchievements();
  return {
    version: 2,
    exportedAt: new Date().toISOString(),
    ...state,
    achievements,
  };
}

// Import data (from backup)
export async function importAllData(data) {
  const importData = {
    profile: data.profile || {},
    trainingRecords: data.trainingRecords || [],
    bodyRecords: data.bodyRecords || [],
    customExercises: data.customExercises || [],
    restSeconds: data.restSeconds || 90,
    trainingTimerElapsed: 0,
    trainingTimerStart: null,
  };
  await setState(importData);
  if (data.achievements) {
    await saveAchievements(data.achievements);
  }
}
