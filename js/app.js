// ===== FitTracker Pro - Main App Entry =====
// ESM version: modular architecture with IndexedDB

import { openDB, getState, setState, migrateFromLocalStorage } from './db.js';
import { renderTraining } from './views/training.js';
import { renderRecord } from './views/record.js';
import { renderHistory } from './views/history.js';
import { renderProfile } from './views/profile.js';
import { loadAchievements, saveAchievements } from './achievements.js';

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
    training: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="8" width="6" height="8" rx="1"/><rect x="15" y="8" width="6" height="8" rx="1"/><line x1="9" y1="12" x2="15" y2="12"/></svg>',
    record: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20V10"/><path d="M6 20v-4"/><path d="M18 20v-6"/><circle cx="12" cy="6" r="2"/></svg>',
    history: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>',
    profile: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-7 8-7s8 3 8 7"/></svg>'
  };
  return icons[name] || '';
}

// ===== Init =====
async function init() {
  // Migrate from localStorage to IndexedDB
  await migrateFromLocalStorage();

  // Load state from IndexedDB
  try {
    const savedState = await getState();
    if (savedState) {
      S = { ...DEFAULT_STATE, ...savedState };
      // Restore timer state
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

  // Load achievements
  loadAchievements();

  // Make state available globally for history module's photo viewer
  window._appState = S;

  render();
}

// ===== Render =====
function render() {
  // Save state to IndexedDB
  saveState();

  // Render tab bar
  renderTabs();

  // Render views
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
  // Create view containers
  viewsContainer.innerHTML = TABS.map(k =>
    `<div class="view${S.activeTab === k.id ? ' active' : ''}" id="view-${k.id}"></div>`
  ).join('');

  // Render active view
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

  // Also update global ref
  window._appState = S;
}

// ===== Start =====
init();
