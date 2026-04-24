// ===== FitTracker Pro - Main App Entry =====
// ESM version: modular architecture with IndexedDB + Supabase sync

import { getState, setState, migrateFromLocalStorage, migrateAchievementsFromLocalStorage, loadAchievements, saveAchievements } from './db.js';
import { getUnlockedAchievements } from './achievements.js';
import { initSync, getCurrentUser, onAuthChange, syncAll, getSyncStatus, setupNetworkSync, onStatusChange } from './sync.js';
import { renderTraining } from './views/training.js';
import { renderRecord } from './views/record.js';
import { renderHistory } from './views/history.js';
import { renderProfile } from './views/profile.js';

// ===== Default State =====
const DEFAULT_STATE = {
  profile: { name: '', avatar: '' },
  trainingRecords: [],
  bodyRecords: [],
  customExercises: [],
  activeTab: 'training',
  trainingScreen: 'home',
  currentTraining: null,
  selectedBodyPart: null,
  historySubTab: 'training',
  historyFilter: 'all',
  lastDietFeedback: '',
  trainingTimerActive: false,
  trainingTimerStart: null,
  trainingTimerElapsed: 0,
  restSeconds: 90,
  unlockedAchievements: [],
  user: null,
  syncStatus: 'idle',
  lastSyncTime: null,
};

// ===== App State =====
let S = { ...DEFAULT_STATE };

// ===== View Containers =====
const viewsContainer = document.getElementById('views');
const tabBar = document.getElementById('tabBar');

// Tab definitions
const TABS = [
  { id: 'training', icon: tabIcon('training'), label: '训练' },
  { id: 'record', icon: tabIcon('record'), label: '记录' },
  { id: 'history', icon: tabIcon('history'), label: '历史' },
  { id: 'profile', icon: tabIcon('profile'), label: '我的' },
];

// ===== Tab Icons =====
function tabIcon(name) {
  const icons = {
    training: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="8" width="6" height="8" rx="1"/><rect x="15" y="8" width="6" height="8" rx="1"/><line x1="9" y1="12" x2="15" y2="12"/></svg>',
    record: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20V10"/><path d="M6 20v-4"/><path d="M18 20v-6"/><circle cx="12" cy="6" r="2"/></svg>',
    history: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>',
    profile: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-7 8-7s8 3 8 7"/></svg>'
  };
  return icons[name] || '';
}

// ===== Init =====
async function init() {
  initSync();
  setupNetworkSync();
  onStatusChange(() => render());

  await migrateFromLocalStorage();
  await migrateAchievementsFromLocalStorage();

  try {
    const savedState = await getState();
    if (savedState) {
      S = { ...DEFAULT_STATE, ...savedState };
      if (S.trainingTimerStart) {
        S.trainingTimerActive = true;
        S.trainingTimerElapsed = S.trainingTimerElapsed || 0;
      } else {
        S.trainingTimerActive = false;
      }
      S.trainingScreen = S.currentTraining ? 'active' : 'home';
    }
  } catch (e) {
    console.error('[App] Failed to load state:', e);
  }

  try {
    S.unlockedAchievements = await loadAchievements();
  } catch (e) {
    S.unlockedAchievements = [];
  }

  try {
    const user = await getCurrentUser();
    if (user) {
      S.user = { email: user.email, id: user.id };
      syncAll();
    }
  } catch (e) {
    console.warn('[App] Auth check failed:', e);
  }

  // Listen for auth state changes (Magic Link redirect back)
  onAuthChange((user) => {
    if (user) {
      S.user = user;
      syncAll();
    } else {
      S.user = null;
      S.syncStatus = 'idle';
    }
    render();
  });

  // BroadcastChannel: cross-tab auth sync

  // BroadcastChannel: cross-tab auth sync
  setupBroadcastChannel();

  window._appState = S;

  // Hide loading screen, show app
  const loadingEl = document.getElementById('loading');
  const appEl = document.getElementById('app');
  render();
  if (loadingEl) {
    loadingEl.classList.add('fade-out');
    setTimeout(() => loadingEl.remove(), 400);
  }
  if (appEl) appEl.style.display = '';
}

// ===== Auth Polling =====
// Polls Supabase session every 2s when user has initiated magic link login
let authPollTimer = null;
let authPollActive = false;

export function startAuthPolling() {
  if (authPollActive) return;
  authPollActive = true;
  authPollTimer = setInterval(async () => {
    try {
      const user = await getCurrentUser();
      if (user && !S.user) {
        // User logged in from another tab or magic link
        S.user = { email: user.email, id: user.id };
        syncAll();
        render();
        stopAuthPolling();
      }
    } catch (e) {
      // silently ignore polling errors
    }
  }, 2000);
}

export function stopAuthPolling() {
  authPollActive = false;
  if (authPollTimer) {
    clearInterval(authPollTimer);
    authPollTimer = null;
  }
}

// ===== BroadcastChannel =====
// Cross-tab communication for instant auth sync
let authChannel = null;

function setupBroadcastChannel() {
  if ('BroadcastChannel' in window) {
    authChannel = new BroadcastChannel('fittracker-auth');
    authChannel.onmessage = (e) => {
      if (e.data.type === 'signed-in' && e.data.user) {
        S.user = e.data.user;
        syncAll();
        render();
        stopAuthPolling();
      } else if (e.data.type === 'signed-out') {
        S.user = null;
        S.syncStatus = 'idle';
        S.lastSyncTime = null;
        render();
      }
    };
  }
}

function broadcastAuth(user) {
  if (authChannel) {
    authChannel.postMessage({
      type: user ? 'signed-in' : 'signed-out',
      user: user ? { email: user.email, id: user.id } : null,
    });
  }
}

// ===== Render =====
function render() {
  const { status, lastSyncTime } = getSyncStatus();
  S.syncStatus = status;
  S.lastSyncTime = lastSyncTime;

  saveState();
  renderTabs();
  renderViews();
}

function renderTabs() {
  tabBar.innerHTML = TABS.map(t =>
    `<div class="tab-item${S.activeTab === t.id ? ' active' : ''}" data-tab="${t.id}">${t.icon}<span>${t.label}</span></div>`
  ).join('');

  tabBar.querySelectorAll('.tab-item').forEach(el => {
    el.addEventListener('click', () => {
      S.activeTab = el.dataset.tab;
      render();
    });
  });
}

function renderViews() {
  viewsContainer.innerHTML = TABS.map(k =>
    `<div class="view${S.activeTab === k.id ? ' active' : ''}" id="view-${k.id}"></div>`
  ).join('');

  const activeContainer = document.getElementById(`view-${S.activeTab}`);
  if (!activeContainer) return;

  switch (S.activeTab) {
    case 'training':
      renderTraining(activeContainer, S, stateChanged);
      break;
    case 'record':
      renderRecord(activeContainer, S, stateChanged);
      break;
    case 'history':
      renderHistory(activeContainer, S, stateChanged);
      break;
    case 'profile':
      renderProfile(activeContainer, S, stateChanged);
      break;
  }
}

function stateChanged() {
  render();
}

// ===== State Persistence =====
function saveState() {
  const data = {
    profile: S.profile,
    trainingRecords: S.trainingRecords,
    bodyRecords: S.bodyRecords,
    customExercises: S.customExercises,
    restSeconds: S.restSeconds,
    trainingTimerElapsed: S.trainingTimerActive && S.trainingTimerStart
      ? (S.trainingTimerElapsed || 0) + Math.floor((Date.now() - S.trainingTimerStart) / 1000)
      : S.trainingTimerElapsed,
    trainingTimerStart: S.trainingTimerActive ? S.trainingTimerStart : null,
    currentTraining: S.currentTraining,
  };
  setState(data).catch(e => console.error('[App] Save failed:', e));

  const unlocked = getUnlockedAchievements(S);
  const prev = S.unlockedAchievements || [];
  if (unlocked.length !== prev.length || unlocked.some(id => !prev.includes(id))) {
    S.unlockedAchievements = unlocked;
    saveAchievements(unlocked).catch(e => console.error('[App] Achievement save failed:', e));
  }

  window._appState = S;
}

// Expose sync actions for profile view
window._syncActions = {
  sendMagicLink: async (email) => {
    const { sendMagicLink } = await import('./sync.js');
    await sendMagicLink(email);
    startAuthPolling();
  },
  signInWithEmailCode: async (email, token) => {
    const { signInWithEmailCode, syncAll } = await import('./sync.js');
    const user = await signInWithEmailCode(email, token);
    if (user) {
      S.user = { email: user.email, id: user.id };
      broadcastAuth(user);
      stopAuthPolling();
      stateChanged();
      syncAll();
    }
  },
  signOut: async () => {
    const { signOut } = await import('./sync.js');
    await signOut();
    S.user = null;
    S.syncStatus = 'idle';
    S.lastSyncTime = null;
    broadcastAuth(null);
    stopAuthPolling();
    stateChanged();
  },
  manualSync: () => {
    syncAll();
  },
};

// Expose auth polling for profile view
window._startAuthPolling = startAuthPolling;
window._stopAuthPolling = stopAuthPolling;

// ===== Start =====
init();
