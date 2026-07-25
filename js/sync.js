// ===== Cloud Sync Engine =====
// Supabase-powered sync: local-first, background push, last-write-wins

import { addToSyncQueue, getSyncQueue, markSynced, getState, setState } from './db.js';

const SUPABASE_URL = 'https://nyzjftghajaecdcbulkt.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55empmdGdoYWphZWNkY2J1bGt0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5MTMyMDAsImV4cCI6MjA5MjQ4OTIwMH0.1yuWKiNZ-Ky6lkmY74DYOfz2FIVf3aFzaxkHO4Pd0uw';

let supabaseClient = null;
let syncInitialized = false;
let syncStatus = 'idle'; // idle | pushing | pulling | error
let lastSyncTime = null;

// Initialize Supabase client (called once on app start)
export function initSync() {
  if (syncInitialized) return true;
  if (typeof window.supabase === 'undefined') {
    console.error('[Sync] Supabase SDK not loaded');
    return false;
  }
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  syncInitialized = true;
  return true;
}

export function getSupabase() {
  return supabaseClient;
}

export function getSyncStatus() {
  return { status: syncStatus, lastSyncTime };
}

export function onStatusChange(callback) {
  _onStatusChange = callback;
}
let _onStatusChange = null;

export function onDataPulled(callback) {
  _onDataPulled = callback;
}
let _onDataPulled = null;

function setStatus(s) {
  syncStatus = s;
  if (_onStatusChange) _onStatusChange(s);
}

// ===== Auth =====

export async function sendMagicLink(email) {
  const { error } = await supabaseClient.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: window.location.origin + window.location.pathname.replace(/\/[^/]*$/, '/') },
  });
  if (error) throw error;
}

export async function signInWithEmailCode(email, token) {
  const { data: result, error } = await supabaseClient.auth.verifyOtp({
    email,
    token,
    type: 'email',
  });
  if (error) throw error;
  return result.user;
}

export async function signOut() {
  await supabaseClient.auth.signOut();
}

export async function getCurrentUser() {
  if (!supabaseClient) return null;
  const { data: { session }, error } = await supabaseClient.auth.getSession();
  if (error || !session) return null;
  return session.user;
}

export function onAuthChange(callback) {
  if (!supabaseClient) return { unsubscribe: () => {} };
  return supabaseClient.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' && session?.user) {
      callback({ email: session.user.email, id: session.user.id });
    } else if (event === 'SIGNED_OUT') {
      callback(null);
    }
  });
}

// ===== Sync =====

export async function queueUpsert(table, localId, data) {
  const item = {
    table,
    localId,
    data: {
      ...data,
      _updatedAt: data._updatedAt || new Date().toISOString(),
    },
    operation: 'upsert',
  };
  await addToSyncQueue(item);
  syncAll();
}

export async function queueDelete(table, localId) {
  await addToSyncQueue({
    table,
    localId,
    data: { _updatedAt: new Date().toISOString() },
    operation: 'delete',
  });
  syncAll();
}

export async function syncPull() {
  if (!supabaseClient) return;
  setStatus('pulling');

  try {
    const session = await getCurrentUser();
    if (!session) {
      setStatus('idle');
      return;
    }

    const now = new Date().toISOString();

    // Pull all tables
    const [trainingRes, bodyRes, customRes] = await Promise.all([
      supabaseClient.from('training_records').select('*').eq('deleted', false),
      supabaseClient.from('body_records').select('*').eq('deleted', false),
      supabaseClient.from('custom_exercises').select('*').eq('deleted', false),
    ]);

    if (trainingRes.error) throw trainingRes.error;
    if (bodyRes.error) throw bodyRes.error;
    if (customRes.error) throw customRes.error;

    // Merge into local state
    const localState = await getState() || {};

    const merged = mergeRecords(localState.trainingRecords || [], trainingRes.data || [], 'training');
    const mergedWeights = mergeRecords(getLocalWeightRecords(localState), bodyRes.data || [], 'weight');
    const mergedCustom = mergeRecords(localState.customExercises || [], customRes.data || [], 'custom');

    await setState({
      ...localState,
      trainingRecords: merged,
      weightRecords: mergedWeights,
      bodyRecords: mergedWeights,
      customExercises: mergedCustom,
    });

    if (_onDataPulled) _onDataPulled({ trainingRecords: merged, weightRecords: mergedWeights, customExercises: mergedCustom });

    lastSyncTime = now;
    setStatus('idle');
  } catch (e) {
    console.error('[Sync] Pull failed:', e);
    setStatus('error');
  }
}

export async function syncPush() {
  if (!supabaseClient) return;
  setStatus('pushing');

  try {
    const session = await getCurrentUser();
    if (!session) {
      setStatus('idle');
      return;
    }

    const queue = await getSyncQueue();
    if (queue.length === 0) {
      // No pending items, pull from cloud instead
      await syncPull();
      return;
    }

    const pushedIds = [];

    for (const item of queue) {
      const { table, data, operation, localId } = item;

      try {
        if (operation === 'delete') {
          const { error } = await supabaseClient
            .from(table)
            .update({ deleted: true, updated_at: new Date().toISOString() })
            .eq('local_id', localId)
            .eq('deleted', false);
          if (error) throw error;
        } else if (operation === 'upsert') {
          await upsertMappedRow(table, localId, data, session.id);
        }
        pushedIds.push(item.id);
      } catch (e) {
        console.warn('[Sync] Failed to push item:', e);
      }
    }

    if (pushedIds.length > 0) {
      await markSynced(pushedIds);
    }

    // After pushing, pull latest from cloud
    await syncPull();
  } catch (e) {
    console.error('[Sync] Push failed:', e);
    setStatus('error');
  }
}

// Full sync: push dirty items, then pull
export async function syncAll() {
  if (!supabaseClient) return;
  const user = await getCurrentUser();
  if (!user) return;

  await syncPush();
}

// ===== Merge Helpers =====

function mergeRecords(local, cloud, type) {
  const merged = [...local];
  const cloudByLocalId = {};
  for (const c of cloud) {
    if (c.local_id) cloudByLocalId[c.local_id] = c;
  }

  // Update or insert cloud records
  for (const c of cloud) {
    if (!c.local_id) continue;
    const existing = merged.find(r => r.id === c.local_id || r._cloudId === c.id);
    if (existing) {
      // last-write-wins
      const cloudTs = new Date(c.updated_at).getTime();
      const localTs = existing._updatedAt ? new Date(existing._updatedAt).getTime() : 0;
      if (cloudTs > localTs) {
        // Cloud is newer, update local
        Object.assign(existing, normalizeCloudRecord(c, type));
      }
    } else {
      // New cloud record, add to local
      merged.push(normalizeCloudRecord(c, type));
    }
  }

  return merged;
}

function normalizeCloudRecord(c, type) {
  const base = { _cloudId: c.id, _updatedAt: c.updated_at };
  if (type === 'training') {
    return { ...base, id: c.local_id, bodyPart: c.body_part, exercises: c.exercises, duration: c.duration || 0, date: c.date };
  }
  if (type === 'weight') {
    return { ...base, id: c.local_id, weight: Number(c.weight), date: c.date };
  }
  if (type === 'custom') {
    return {
      ...base,
      id: c.local_id,
      name: c.name,
      bodyPart: c.body_part || c.bodyPart || 'custom',
      type: c.type || 'free',
      defaultSets: c.default_sets,
      defaultReps: c.default_reps,
    };
  }
  return { ...base };
}

function getLocalWeightRecords(state) {
  return state.weightRecords || (state.bodyRecords || [])
    .filter(r => r.weight)
    .map(r => ({ id: r.id, date: r.date, weight: r.weight, _cloudId: r._cloudId, _updatedAt: r._updatedAt }));
}

async function upsertMappedRow(table, localId, data, userId) {
  const row = mapLocalToCloudRow(table, localId, data, userId);
  const { error } = await supabaseClient
    .from(table)
    .upsert(row, { onConflict: 'user_id,local_id' });

  if (!error) return;

  // Older installations may not yet have body_part/type on custom_exercises.
  // Keep the sync alive with the legacy shape instead of blocking all pushes.
  if (table === 'custom_exercises' && /body_part|type|column/i.test(error.message || '')) {
    const fallback = {
      user_id: userId,
      local_id: localId,
      name: data.name,
      default_sets: data.defaultSets || null,
      default_reps: data.defaultReps || null,
      updated_at: data._updatedAt || new Date().toISOString(),
      deleted: false,
    };
    const retry = await supabaseClient
      .from(table)
      .upsert(fallback, { onConflict: 'user_id,local_id' });
    if (retry.error) throw retry.error;
    return;
  }

  throw error;
}

export function mapLocalToCloudRow(table, localId, data, userId) {
  const updatedAt = data._updatedAt || new Date().toISOString();
  if (table === 'training_records') {
    return {
      user_id: userId,
      local_id: localId,
      body_part: data.bodyPart,
      exercises: data.exercises || [],
      duration: data.duration || 0,
      date: data.date,
      updated_at: updatedAt,
      deleted: false,
    };
  }
  if (table === 'body_records') {
    return {
      user_id: userId,
      local_id: localId,
      weight: data.weight || null,
      body_fat: null,
      diet: null,
      notes: null,
      date: data.date,
      updated_at: updatedAt,
      deleted: false,
    };
  }
  if (table === 'custom_exercises') {
    return {
      user_id: userId,
      local_id: localId,
      name: data.name,
      body_part: data.bodyPart,
      type: data.type,
      default_sets: data.defaultSets || null,
      default_reps: data.defaultReps || null,
      updated_at: updatedAt,
      deleted: false,
    };
  }
  return {
    user_id: userId,
    local_id: localId,
    ...data,
    updated_at: updatedAt,
    deleted: false,
  };
}

// ===== Network Awareness =====

export function setupNetworkSync() {
  window.addEventListener('online', () => {
    console.log('[Sync] Network online, syncing...');
    syncAll();
  });
}
