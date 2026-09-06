// ===== Training View =====
// Home → Select Body Part → Select Exercise → Active Training → Summary

import { BODY_PARTS, EXERCISES, getExMeta, getExerciseDetail, EQUIPMENT_LABELS } from '../exercises.js';
import { hasExerciseDetail } from '../exercise_db.js';
import { showExerciseDetailDrawer } from '../exercise_detail.js';
import { getWeeklyNews } from '../news.js';
import { ACHIEVEMENTS, getUnlockedAchievements } from '../achievements.js';
import { aiPreWorkout, aiPostWorkout } from '../ai.js';
import { genId, today, fmtDateFull, fmtDuration, fmtTime, fmtVol, calcVolume, getRecordBodyParts } from '../helpers.js';
import { escapeAttr, escapeHtml } from '../html.js';
import { doExport, doImport } from '../data.js';
import { showConfirm } from '../toast.js';
import { queueUpsert } from '../sync.js';
import { TRAINING_TEMPLATES, getLastExercisePerformance, getProgressionSuggestion } from '../training_guidance.js';

let onStateChange = null;
let currentRender = null;
let currentContainer = null;

export function renderTraining(container, S, stateChanged) {
  if (S._timerInterval && currentContainer !== container) {
    clearInterval(S._timerInterval);
    S._timerInterval = null;
  }
  currentContainer = container;
  onStateChange = stateChanged;
  currentRender = () => renderTraining(container, S, stateChanged);
  const screens = {
    home: renderTrainingHome,
    selectPart: renderSelectPart,
    selectExercise: renderSelectExercise,
    templateSelect: renderTemplateSelect,
    active: renderActiveTraining,
    summary: renderTrainingSummary
  };
  const fn = screens[S.trainingScreen] || screens.home;
  fn(container, S);
  if (!localStorage.getItem('fittracker_welcome_shown')) {
    showOnboarding();
  }
}

function renderTrainingHome(container, S) {
  const ai = aiPreWorkout(S);
  const news = getWeeklyNews();
  const unlocked = getUnlockedAchievements(S);
  const latestRecord = getMostRecentTrainingRecord(S);
  container.innerHTML = `
    <div class="app-header">
      <div class="title">FITTRACKER PRO</div>
      <div class="subtitle">极简健身追踪</div>
    </div>
    <div class="ai-card">
      <div class="ai-header"><svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1l1.5 3.5L13 6l-3.5 1.5L8 11 6.5 7.5 3 6l3.5-1.5L8 1z"/></svg> ${ai.title}</div>
      <div class="ai-body">${ai.body}</div>
    </div>
    <button class="btn btn-primary btn-block" id="btnStartTraining" style="padding:16px;font-size:17px;border-radius:var(--r-l);margin-bottom:16px">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg> 开始训练
    </button>
    <div class="training-home-actions">
      ${latestRecord ? `<button class="btn btn-outline" id="btnReuseLastTraining">
        复用上次训练 · ${getRecordBodyParts(latestRecord).map(id => getBodyPartName(S, id)).join(' + ')}
      </button>` : ''}
      <button class="btn btn-ghost" id="btnChooseTemplate">选择训练模板</button>
    </div>
    <div class="achievements-section">
      <div class="section-title" style="font-size:15px">成就徽章</div>
      <div class="achievements-grid">
        ${ACHIEVEMENTS.map(ach => {
          const isUnlocked = unlocked.includes(ach.id);
          return `<div class="achievement-badge ${isUnlocked ? 'unlocked' : 'locked'}" title="${ach.desc}">
            <span class="badge-icon">${ach.icon}</span>
            <span class="badge-name">${ach.name}</span>
          </div>`;
        }).join('')}
      </div>
    </div>
    <div class="news-section">
      <div class="section-title" style="font-size:15px;display:flex;align-items:center;gap:6px">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 22h16a2 2 0 002-2V4a2 2 0 00-2-2H8a2 2 0 00-2 2v16a2 2 0 01-2 2zm0 0a2 2 0 01-2-2v-9c0 1.1.9 2 2 2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8V6z"/></svg> 本周健身资讯
      </div>
      ${news.map(n => `
        <div class="news-card">
          <div class="news-header">
            <span class="news-tag">${n.type === 'training' ? '训练科学' : n.type === 'diet' ? '饮食营养' : n.type === 'recovery' ? '恢复健康' : '补剂知识'}</span>
            <span class="news-title">${n.title}</span>
          </div>
          <div class="news-content">${n.content}</div>
        </div>
      `).join('')}
    </div>
    ${renderRecentTraining(S)}
    ${renderQuickActions()}
  `;
  container.querySelector('#btnStartTraining').addEventListener('click', () => {
    S.trainingScreen = 'selectPart';
    onStateChange();
  });
  const reuseLastBtn = container.querySelector('#btnReuseLastTraining');
  if (reuseLastBtn && latestRecord) {
    reuseLastBtn.addEventListener('click', () => startTrainingFromRecord(latestRecord, S));
  }
  container.querySelector('#btnChooseTemplate').addEventListener('click', () => {
    S.trainingScreen = 'templateSelect';
    onStateChange();
  });
  const backupBtn = container.querySelector('#btnBackup');
  const restoreBtn = container.querySelector('#btnRestore');
  if (backupBtn) backupBtn.addEventListener('click', () => doExport(S));
  if (restoreBtn) restoreBtn.addEventListener('click', () => {
    const input = container.querySelector('#restoreInput');
    input.onchange = e => { doImport(e.target.files[0], S, onStateChange); input.value = ''; };
    input.click();
  });
}

function renderQuickActions() {
  return `<div class="quick-actions">
    <button class="quick-action-btn" id="btnBackup">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
      备份数据
    </button>
    <button class="quick-action-btn" id="btnRestore">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
      恢复数据
    </button>
    <input type="file" accept=".json" id="restoreInput" style="display:none">
  </div>`;
}

function renderRecentTraining(S) {
  const recent = S.trainingRecords.slice(-3).reverse();
  if (recent.length === 0) return '';
  return `<div class="mt-16"><div class="section-title" style="font-size:15px">最近训练</div>
    ${recent.map(r => `
      <div class="card" style="padding:12px 14px;display:flex;align-items:center;justify-content:space-between">
        <div><div class="text-sm fw-700">${getRecordBodyParts(r).map(id => getBodyPartName(S, id)).join(' + ')}</div><div class="text-xs text-muted">${fmtDateFull(r.date)} · ${fmtDuration(r.duration || 0)}</div></div>
        <div class="badge badge-accent">${fmtVol(calcVolume(r.exercises))} kg</div>
      </div>
    `).join('')}</div>`;
}

function getMostRecentTrainingRecord(S) {
  return [...(S.trainingRecords || [])].filter(record => (record.exercises || []).length > 0).sort((a, b) => {
    const aTime = new Date(a._updatedAt || a.date || 0).getTime();
    const bTime = new Date(b._updatedAt || b.date || 0).getTime();
    return bTime - aTime;
  })[0] || null;
}

function startNewTraining(S, bodyPart, exercises, { prefillFromHistory = false } = {}) {
  S.currentTraining = {
    id: genId(),
    date: today(),
    bodyPart,
    exercises: exercises.map(exercise => ({ ...exercise, sets: [] })),
    duration: 0,
    photo: '',
    notes: '',
    totalVolume: 0,
    prefillFromHistory,
  };
  S.selectedBodyPart = bodyPart;
  S.trainingTimerActive = true;
  S.trainingTimerStart = Date.now();
  S.trainingTimerElapsed = 0;
  S.trainingScreen = 'active';
  onStateChange();
}

function startTrainingFromRecord(record, S) {
  startNewTraining(S, record.bodyPart, (record.exercises || []).map(exercise => ({
    name: exercise.name,
    type: exercise.type || 'free',
    bodyPart: exercise.bodyPart || record.bodyPart,
  })), { prefillFromHistory: true });
}

function startTrainingFromTemplate(template, S) {
  startNewTraining(S, template.primaryBodyPart, template.exercises);
}

function renderTemplateSelect(container, S) {
  container.innerHTML = `
    <div class="flex-between mb-16">
      <div>
        <div class="section-title" style="margin:0">选择训练模板</div>
        <div class="text-xs text-muted">选一套直接开始，训练中仍可自由调整。</div>
      </div>
      <button class="btn btn-ghost btn-sm" id="btnBackTemplateHome">返回</button>
    </div>
    <div class="template-list">
      ${TRAINING_TEMPLATES.map(template => `
        <article class="template-card">
          <div class="flex-between" style="align-items:flex-start;gap:12px">
            <div>
              <h3>${template.name}</h3>
              <p>${template.description}</p>
            </div>
            <span class="badge badge-accent">${template.duration}</span>
          </div>
          <div class="template-exercises">${template.exercises.map(exercise => escapeHtml(exercise.name)).join(' · ')}</div>
          <button class="btn btn-primary btn-block" data-template-id="${template.id}">开始这套训练</button>
        </article>
      `).join('')}
    </div>
  `;
  container.querySelector('#btnBackTemplateHome').addEventListener('click', () => {
    S.trainingScreen = 'home';
    onStateChange();
  });
  container.querySelectorAll('[data-template-id]').forEach(button => {
    button.addEventListener('click', () => {
      const template = TRAINING_TEMPLATES.find(item => item.id === button.dataset.templateId);
      if (template) startTrainingFromTemplate(template, S);
    });
  });
}

function renderSelectPart(container, S) {
  container.innerHTML = `
    <div class="flex-between mb-16">
      <div class="section-title" style="margin:0">选择训练部位</div>
      <button class="btn btn-ghost btn-sm" id="btnBackHome">取消</button>
    </div>
    <div class="bp-grid">${BODY_PARTS.map(bp => `
      <div class="bp-card" data-part="${bp.id}" style="--acc-color:${bp.color};background:rgba(${hexToRgb(bp.color)},.06)">
        <span class="bp-char" style="color:${bp.color}">${bp.name}</span>
        <div class="bp-name">${bp.name}</div>
      </div>
    `).join('')}</div>
  `;
  container.querySelector('#btnBackHome').addEventListener('click', () => {
    S.trainingScreen = 'home';
    onStateChange();
  });
  container.querySelectorAll('.bp-card').forEach(el => el.addEventListener('click', () => {
    S.selectedBodyPart = el.dataset.part;
    S.trainingScreen = 'selectExercise';
    onStateChange();
  }));
}

// ===================================================================
// ===== Select Exercise Screen (rebuilt per exercise-selection docs) =====
// ===================================================================

// Full-length body part names for the selection screen title only.
// BODY_PARTS[].name stays as a short single-character label used elsewhere
// (body-part picker cards, active-training header) — changing it would
// affect unrelated screens, which is out of scope per the technical design doc.
const BODY_PART_FULL_NAME = {
  chest: '胸部',
  back: '背部',
  legs: '腿部',
  shoulders: '肩部',
  arms: '手臂',
  core: '核心',
};
function getBodyPartFullName(id) {
  return BODY_PART_FULL_NAME[id] || getBodyPartName({ trainingRecords: [] }, id);
}

// ----- 1. Build exercise option view models for a body part -----
function getExerciseOptionsForBodyPart(S, bp) {
  const base = EXERCISES[bp] || { machine: [], free: [] };
  const custom = (S.customExercises || []).filter(e => e.bodyPart === bp);

  const machineNames = base.machine.map(name => ({ name, type: 'machine', isCustom: false }));
  const freeNames = base.free.map(name => ({ name, type: 'free', isCustom: false }));
  const customNames = custom.map(e => ({ name: e.name, type: e.type, isCustom: true }));

  const all = [...machineNames, ...freeNames, ...customNames];

  return all.map(item => {
    const detail = getExerciseDetail(item.name, item.type);
    const meta = getExMeta(item.name);
    return {
      name: item.name,
      type: item.type,
      isCustom: item.isCustom,
      equipment: detail.equipment,
      target: detail.target,
      level: detail.level,
      tags: detail.tags,
      defaultReason: detail.reason,
      tip: meta.tip || '',
    };
  });
}

// ----- 2. Last performance text -----
function getLastPerformanceText(S, exerciseName) {
  const records = [...(S.trainingRecords || [])].reverse();
  for (const record of records) {
    const exercise = record.exercises.find(e => e.name === exerciseName);
    if (!exercise || !exercise.sets.length) continue;
    const best = exercise.sets.reduce((max, set) =>
      set.weight > max.weight ? set : max, exercise.sets[0]);
    return `上次 ${best.weight}kg x ${best.reps}`;
  }
  return '';
}

// ----- 3. Recommendation logic (lightweight, deterministic, no network) -----
function getRecommendedExercises(options, S, bp) {
  const recs = S.trainingRecords || [];
  const hasAnyHistory = recs.length > 0;

  // exercises used for this body part in the most recent matching workout
  const sameBodyPartRecords = recs
    .filter(r => getRecordBodyParts(r).includes(bp))
    .sort((a, b) => b.date.localeCompare(a.date));
  const recentNamesForBodyPart = new Set();
  if (sameBodyPartRecords.length > 0) {
    sameBodyPartRecords[0].exercises.forEach(ex => recentNamesForBodyPart.add(ex.name));
  }

  // has this body part been trained recently (within last 14 days, last 14 records)?
  const recent14 = recs.slice(-14);
  const trainedRecently = recent14.some(r => getRecordBodyParts(r).includes(bp));

  const scored = options.map(opt => {
    let score = 0;
    let reason = opt.defaultReason || '';

    if (recentNamesForBodyPart.has(opt.name)) {
      score += 30;
      reason = '最近练过，延续训练节奏';
    }
    if (opt.tags.includes('主项')) {
      score += 20;
      if (!reason) reason = opt.defaultReason || '适合作为本次训练的主项';
    }
    if (opt.level === 'beginner' && recs.length < 5) {
      score += 15;
      if (!hasAnyHistory && !reason) reason = '新手容易上手';
    }
    if (!hasAnyHistory && opt.level === 'beginner') {
      score += 10;
    }
    if (!trainedRecently && opt.tags.includes('主项')) {
      score += 8;
      reason = '这个部位最近训练较少，适合今天补上';
    }
    if (opt.isCustom) score -= 5;

    return { ...opt, score, reason: reason || opt.defaultReason || '适合加入本次训练' };
  });

  scored.sort((a, b) => b.score - a.score);

  // Diversify equipment among top picks where possible
  const top = [];
  const usedEquipment = new Set();
  for (const item of scored) {
    if (top.length >= 3) break;
    if (usedEquipment.has(item.equipment) && top.length < 2) continue;
    top.push(item);
    usedEquipment.add(item.equipment);
  }
  // fill up to 3 if diversification left gaps
  for (const item of scored) {
    if (top.length >= 3) break;
    if (!top.find(t => t.name === item.name)) top.push(item);
  }

  return top.map(t => t.name);
}

// ----- 4. Search matching -----
function exerciseMatchesQuery(opt, query) {
  if (!query) return true;
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const haystacks = [
    opt.name,
    EQUIPMENT_LABELS[opt.equipment] || '',
    opt.target,
    opt.type === 'machine' ? '器械' : '自由',
    ...(opt.tags || []),
  ].map(s => (s || '').toLowerCase());
  return haystacks.some(h => h.includes(q));
}

// ----- 5. Main render function -----
function renderSelectExercise(container, S) {
  const bp = S.selectedBodyPart || S.currentTraining?.bodyPart;
  if (!bp) {
    S.trainingScreen = S.currentTraining ? 'active' : 'selectPart';
    onStateChange();
    return;
  }
  S.selectedBodyPart = bp;
  const isAddMore = !!S.currentTraining; // user came from active training "加动作"

  S.exerciseSearch = S.exerciseSearch || '';
  S.exerciseFilter = S.exerciseFilter || 'recommended';
  S.pendingExercises = S.pendingExercises || [];

  const lockedNames = new Set(
    isAddMore ? S.currentTraining.exercises.map(e => e.name) : []
  );

  const allOptions = getExerciseOptionsForBodyPart(S, bp);
  const recommendedNames = new Set(getRecommendedExercises(allOptions, S, bp));

  // enrich options with selection/lock/recommend/context info
  const enriched = allOptions.map(opt => {
    const isLocked = lockedNames.has(opt.name);
    const isSelected = isLocked || S.pendingExercises.some(p => p.name === opt.name);
    const isRecommended = recommendedNames.has(opt.name);
    const lastPerf = getLastPerformanceText(S, opt.name);
    let contextLine = '';
    if (lastPerf) {
      contextLine = lastPerf;
    } else if (isRecommended) {
      const recScored = allOptions.find(o => o.name === opt.name);
      contextLine = recScored ? (recScored.defaultReason || '') : '';
    } else if (opt.defaultReason) {
      contextLine = opt.defaultReason;
    }
    return { ...opt, isLocked, isSelected, isRecommended, lastPerf, contextLine };
  });

  // available equipment chips (only show if matching exercises exist)
  const availableEquipment = [...new Set(enriched.map(o => o.equipment))]
    .filter(eq => EQUIPMENT_LABELS[eq]);

  // apply filter
  let filtered = enriched;
  if (S.exerciseFilter === 'recommended') {
    filtered = enriched.filter(o => o.isRecommended || o.isSelected);
  } else if (S.exerciseFilter === 'all') {
    filtered = enriched;
  } else {
    // equipment filter value
    filtered = enriched.filter(o => o.equipment === S.exerciseFilter);
  }

  // apply search (search overrides filter result set, searches across all options)
  const query = S.exerciseSearch.trim();
  const searchActive = query.length > 0;
  const finalList = searchActive
    ? enriched.filter(o => exerciseMatchesQuery(o, query))
    : filtered;

  const selectedCount = S.pendingExercises.length + (isAddMore ? S.currentTraining.exercises.length : 0);
  const selectedCountForCTA = isAddMore ? S.pendingExercises.length + S.currentTraining.exercises.length : S.pendingExercises.length;

  const headerHelper = isAddMore
    ? `已选 ${S.currentTraining.exercises.length + S.pendingExercises.length} 个动作，可继续补充`
    : (S.pendingExercises.length > 0
        ? `已选 ${S.pendingExercises.length} 个动作，可继续补充`
        : '建议选择 3-5 个动作，可训练中继续添加');

  function renderRow(opt) {
    const equipLabel = EQUIPMENT_LABELS[opt.equipment] || '';
    const levelLabel = opt.level === 'beginner' ? '新手友好' : opt.level === 'advanced' ? '进阶' : '';
    const hasDetail = hasExerciseDetail(opt.name);
    return `<div class="exercise-row${opt.isSelected ? ' selected' : ''}${opt.isLocked ? ' locked' : ''}" data-name="${escapeAttr(opt.name)}" data-type="${opt.type}">
      <div class="exercise-row-main">
        <div class="exercise-row-name">
          <span>${escapeHtml(opt.name)}</span>
          ${hasDetail ? `<button class="exercise-row-info" data-info-name="${escapeAttr(opt.name)}" aria-label="查看动作详情">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
          </button>` : ''}
        </div>
        <div class="exercise-row-meta">
          ${opt.target ? `<span class="exercise-chip-tag">${escapeHtml(opt.target)}</span>` : ''}
          ${equipLabel ? `<span class="exercise-chip-tag">${escapeHtml(equipLabel)}</span>` : ''}
          ${levelLabel ? `<span class="exercise-chip-tag">${escapeHtml(levelLabel)}</span>` : ''}
          ${opt.isCustom ? `<span class="exercise-chip-tag">自定义</span>` : ''}
        </div>
        ${opt.contextLine ? `<div class="exercise-row-context">${escapeHtml(opt.contextLine)}</div>` : ''}
      </div>
      <button class="exercise-row-action${opt.isSelected ? ' is-selected' : ''}${opt.isLocked ? ' is-locked' : ''}" data-name="${escapeAttr(opt.name)}" ${opt.isLocked ? 'disabled' : ''}>
        ${opt.isLocked
          ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/></svg>`
          : opt.isSelected
            ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>`
            : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>`
        }
      </button>
    </div>`;
  }

  const recommendationStripHtml = (!searchActive && S.exerciseFilter === 'recommended' && finalList.length > 0)
    ? '' // recommended filter already shows the strip content inline as the list itself
    : '';

  // Build a dedicated recommendation strip (shown above filters, always reflects top picks)
  const topRecommended = enriched.filter(o => recommendedNames.has(o.name)).slice(0, 3);

  const filterChips = [
    { key: 'recommended', label: '推荐' },
    { key: 'all', label: '全部' },
    ...availableEquipment.map(eq => ({ key: eq, label: EQUIPMENT_LABELS[eq] })),
  ];

  const bodyPartSwitchHtml = isAddMore ? `
    <div class="exercise-bodypart-bar" id="exerciseBodyPartBar" aria-label="切换动作部位">
      ${BODY_PARTS.map(part => `
        <button class="exercise-bodypart-chip${bp === part.id ? ' active' : ''}" data-part="${part.id}">
          ${escapeHtml(getBodyPartFullName(part.id))}
        </button>
      `).join('')}
    </div>
  ` : '';

  const isEmpty = finalList.length === 0;

  container.innerHTML = `
    <div class="exercise-select-header">
      <div class="flex-between mb-8">
        <div class="section-title" style="margin:0">添加${getBodyPartFullName(bp)}动作</div>
        <button class="btn btn-ghost btn-sm" id="btnBackPart">${isAddMore ? '取消' : '返回'}</button>
      </div>
      <div class="text-xs text-muted" id="exerciseHelperCopy">${headerHelper}</div>
    </div>

    ${bodyPartSwitchHtml}

    <div class="exercise-search">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/></svg>
      <input type="text" id="exerciseSearchInput" placeholder="搜索动作、器械或训练重点" value="${escapeAttr(S.exerciseSearch)}">
    </div>

    ${(!searchActive && topRecommended.length > 0) ? `
    <div class="exercise-recommend-strip">
      ${topRecommended.map(opt => `
        <div class="exercise-recommend-card${opt.isSelected ? ' selected' : ''}" data-name="${escapeAttr(opt.name)}" data-type="${opt.type}">
          <div class="exercise-recommend-name">
            <span>${escapeHtml(opt.name)}</span>
            ${hasExerciseDetail(opt.name) ? `<button class="exercise-row-info" data-info-name="${escapeAttr(opt.name)}" aria-label="查看动作详情">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            </button>` : ''}
          </div>
          <div class="exercise-recommend-reason">${escapeHtml(opt.contextLine || opt.defaultReason || '')}</div>
        </div>
      `).join('')}
    </div>` : ''}

    <div class="exercise-filter-bar" id="exerciseFilterBar">
      ${filterChips.map(c => `<button class="exercise-chip${S.exerciseFilter === c.key ? ' active' : ''}" data-filter="${c.key}">${escapeHtml(c.label)}</button>`).join('')}
    </div>

    <div class="exercise-list" id="exerciseList">
      ${isEmpty ? `
        <div class="exercise-empty-state">
          <div class="text-sm text-muted mb-8">没找到这个动作？</div>
          <button class="btn btn-outline btn-sm" id="btnAddCustomEmpty">创建自定义动作</button>
        </div>
      ` : finalList.map(renderRow).join('')}
    </div>

    ${!isEmpty ? `
    <button class="btn btn-outline btn-block btn-sm mt-16" id="btnAddCustom" style="margin-bottom:88px">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg> 创建自定义动作
    </button>` : '<div style="height:24px"></div>'}
  `;

  // ----- Sticky bottom CTA -----
  // Remove any stale fab left over from a previous render before inserting the new one,
  // otherwise duplicate-id elements accumulate in the DOM and getElementById always
  // returns the first (stale) node, breaking the CTA click handler after re-renders.
  const staleSelectFab = document.getElementById('exerciseSelectFab');
  if (staleSelectFab) staleSelectFab.remove();

  const fab = document.createElement('div');
  fab.id = 'exerciseSelectFab';
  fab.style.cssText = 'position:fixed;bottom:0;left:0;right:0;z-index:100;padding:12px 16px 20px;background:var(--bg);border-top:1px solid var(--bd);box-shadow:0 -4px 16px rgba(0,0,0,.12);max-width:430px;margin:0 auto;';
  const ctaDisabled = selectedCountForCTA === 0;
  const ctaLabel = ctaDisabled
    ? '请选择动作'
    : (isAddMore ? `已选 ${selectedCountForCTA} 个 · 返回训练` : `已选 ${selectedCountForCTA} 个 · 开始训练`);
  fab.innerHTML = `
    <button class="btn btn-primary btn-block" id="btnStartWithSelected" style="padding:14px;font-size:15px;border-radius:var(--r-m)" ${ctaDisabled ? 'disabled' : ''}>
      ${escapeHtml(ctaLabel)}
    </button>
  `;
  document.body.appendChild(fab);
  if (ctaDisabled) fab.querySelector('#btnStartWithSelected').classList.add('btn-disabled');

  const removeFab = () => { const el = document.getElementById('exerciseSelectFab'); if (el) el.remove(); };

  // ----- Event handlers -----
  container.querySelector('#btnBackPart').addEventListener('click', () => {
    removeFab();
    S.pendingExercises = [];
    S.exerciseSearch = '';
    S.exerciseFilter = 'recommended';
    S.trainingScreen = isAddMore ? 'active' : 'selectPart';
    onStateChange();
  });

  const searchInput = container.querySelector('#exerciseSearchInput');
  let isComposing = false;
  searchInput.addEventListener('compositionstart', () => {
    isComposing = true;
  });
  searchInput.addEventListener('compositionend', e => {
    isComposing = false;
    S.exerciseSearch = e.target.value;
    onStateChange();
  });
  searchInput.addEventListener('input', e => {
    // During IME composition, do NOT trigger re-render or the composition will break
    if (isComposing) return;
    S.exerciseSearch = e.target.value;
    onStateChange();
  });
  // Restore focus & cursor position after re-render so mobile keyboard stays open
  if (S.exerciseSearch) {
    searchInput.focus();
    const len = searchInput.value.length;
    searchInput.setSelectionRange(len, len);
  }

  container.querySelectorAll('#exerciseFilterBar .exercise-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      S.exerciseFilter = chip.dataset.filter;
      onStateChange();
    });
  });

  container.querySelectorAll('#exerciseBodyPartBar .exercise-bodypart-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      S.selectedBodyPart = chip.dataset.part;
      S.exerciseSearch = '';
      S.exerciseFilter = 'recommended';
      onStateChange();
    });
  });

  function toggleSelection(name, type) {
    if (lockedNames.has(name)) return; // cannot deselect locked (already logged) exercises
    const idx = S.pendingExercises.findIndex(p => p.name === name);
    if (idx >= 0) {
      S.pendingExercises.splice(idx, 1);
    } else {
      S.pendingExercises.push({ name, type, bodyPart: bp });
    }
    onStateChange();
  }

  container.querySelectorAll('.exercise-row').forEach(row => {
    row.addEventListener('click', (e) => {
      // Info icon: open detail drawer, do not toggle selection
      const infoBtn = e.target.closest('.exercise-row-info');
      if (infoBtn) {
        e.stopPropagation();
        showExerciseDetailDrawer(infoBtn.dataset.infoName);
        return;
      }
      if (e.target.closest('.exercise-row-action[disabled]')) return;
      toggleSelection(row.dataset.name, row.dataset.type);
    });
  });

  container.querySelectorAll('.exercise-recommend-card').forEach(card => {
    card.addEventListener('click', (e) => {
      const infoBtn = e.target.closest('.exercise-row-info');
      if (infoBtn) {
        e.stopPropagation();
        showExerciseDetailDrawer(infoBtn.dataset.infoName);
        return;
      }
      toggleSelection(card.dataset.name, card.dataset.type);
    });
  });

  const addCustomBtn = container.querySelector('#btnAddCustom') || container.querySelector('#btnAddCustomEmpty');
  if (addCustomBtn) {
    addCustomBtn.addEventListener('click', () => {
      removeFab();
      showAddExerciseModal(S, onStateChange);
    });
  }

  const startBtn = fab.querySelector('#btnStartWithSelected');
  if (!ctaDisabled) {
    startBtn.addEventListener('click', () => {
      removeFab();
      startTrainingWithSelectedExercises(S);
    });
  }
}

// ----- 6. Start training with selected exercises -----
function startTrainingWithSelectedExercises(S) {
  if (!S.currentTraining) {
    S.currentTraining = {
      id: genId(),
      date: today(),
      bodyPart: S.selectedBodyPart,
      exercises: [],
      duration: 0,
      photo: '',
      notes: '',
      totalVolume: 0
    };
    S.trainingTimerActive = true;
    S.trainingTimerStart = Date.now();
    S.trainingTimerElapsed = 0;
  }

  for (const item of S.pendingExercises || []) {
    if (!S.currentTraining.exercises.find(e => e.name === item.name)) {
      // Insert at the top so the newest exercise is immediately visible without scrolling
      S.currentTraining.exercises.unshift({ name: item.name, type: item.type, bodyPart: item.bodyPart || S.selectedBodyPart, sets: [] });
    }
  }

  S.pendingExercises = [];
  S.exerciseSearch = '';
  S.exerciseFilter = 'recommended';
  S.trainingScreen = 'active';
  onStateChange();
}

// ===================================================================
// ===== End Select Exercise Screen =====
// ===================================================================

function renderActiveTraining(container, S) {
  if (!S.currentTraining) { S.trainingScreen = 'home'; onStateChange(); return; }
  const ct = S.currentTraining;
  const elapsed = S.trainingTimerActive
    ? Math.floor((Date.now() - S.trainingTimerStart) / 1000) + (S.trainingTimerElapsed || 0)
    : (S.trainingTimerElapsed || 0);

  // 顶部不再放"加动作"和"完成"按钮，改为底部悬浮栏
  container.innerHTML = `
    <div style="margin-bottom:14px">
      <div class="flex-between">
        <div class="text-sm text-muted">${getBodyPartName(S, ct.bodyPart)}训练中</div>
      </div>
      <div class="training-timer" id="trainingTime" style="font-size:32px;margin-top:2px">${fmtTime(elapsed)}</div>
      <div class="rest-bar">
        <span class="text-xs text-muted">组间休息</span>
        <div style="display:flex;gap:4px" id="restPicker">
          ${[30, 60, 90, 120, 180].map(s => `<button class="rest-pick${S.restSeconds === s ? ' active' : ''}" data-sec="${s}">${s >= 60 && s % 60 === 0 ? s / 60 + 'min' : s + 's'}</button>`).join('')}
        </div>
        <button class="rest-start-btn" id="btnStartRest"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="5,3 19,12 5,21"/></svg>开始</button>
      </div>
    </div>
    ${ct.exercises.map((ex, ei) => {
      const pr = getPR(S, ex.name);
      const currentMax = ex.sets.length > 0 ? Math.max(...ex.sets.map(s => s.weight)) : 0;
      const isPR = currentMax > 0 && currentMax > getPRBefore(S, ex.name, ct.id) && getPRBefore(S, ex.name, ct.id) > 0;
      const nextNum = ex.sets.length + 1;
      const progression = getProgressionSuggestion(getLastExercisePerformance(S.trainingRecords, ex.name));
      const shouldPrefill = ct.prefillFromHistory && ex.sets.length === 0 && progression.canApply;
      const lastW = ex.sets.length > 0 ? ex.sets[ex.sets.length - 1].weight : (shouldPrefill ? progression.weight : '');
      const lastR = ex.sets.length > 0 ? ex.sets[ex.sets.length - 1].reps : (shouldPrefill ? progression.reps : '');
      return `<div class="card" style="padding:12px">
        <div class="flex-between mb-8">
          <div>
            <span class="fw-700">${escapeHtml(ex.name)}</span>
            <span class="badge ${ex.type === 'machine' ? 'badge-machine' : 'badge-free'} text-xs" style="margin-left:6px">${ex.type === 'machine' ? '器械' : '自由'}</span>
            ${isPR ? '<span class="badge badge-success text-xs" style="margin-left:4px">PR!</span>' : ''}
          </div>
          ${pr > 0 ? `<span class="text-xs text-muted">PR: ${pr}kg</span>` : ''}
        </div>
        <div class="set-tbl">
          <div class="set-tbl-hd"><span>组别</span><span>KG</span><span>次数</span><span></span></div>
          <div class="set-tbl-row">
            <div class="s-num">${nextNum}</div>
            <input type="number" placeholder="kg" id="w-${ei}" inputmode="decimal" step="0.5" value="${lastW}">
            <input type="number" placeholder="次数" id="r-${ei}" inputmode="numeric" value="${lastR}">
            <button class="s-check-btn" data-ei="${ei}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg></button>
          </div>
          <div class="progression-hint">
            <span>${progression.lastText ? `${progression.lastText} · ${progression.goalText}` : progression.goalText}</span>
            ${progression.canApply ? `<button class="progression-apply" data-apply-suggestion="${ei}">${progression.mode === 'consider-load' ? '带入上次' : '应用建议'}</button>` : ''}
          </div>
          ${ex.sets.slice().reverse().map((s, revIdx) => { const si = ex.sets.length - 1 - revIdx; return `<div class="swipe-wrap" data-ei="${ei}" data-si="${si}">
            <div class="swipe-del">删除</div>
            <div class="set-tbl-row swipe-content">
              <div class="s-num">${si + 1}</div>
              <div class="s-val">${s.weight}</div>
              <div class="s-val">${s.reps}</div>
              <div style="text-align:center"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ok)" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg></div>
            </div>
          </div>`; }).join('')}
        </div>
      </div>`;
    }).join('')}
    <div style="height:72px"></div>
  `;

  // 底部悬浮操作栏（固定在页面底部，始终可见）
  // 渲染前先移除上一次遗留的 fab，避免重复 id 元素堆积导致 getElementById 拿到失效节点
  const staleActiveFab = document.getElementById('activeTrainingFab');
  if (staleActiveFab) staleActiveFab.remove();

  const fab = document.createElement('div');
  fab.id = 'activeTrainingFab';
  fab.style.cssText = 'position:fixed;bottom:0;left:0;right:0;z-index:100;display:flex;gap:10px;padding:12px 16px 20px;background:var(--bg);border-top:1px solid var(--bd);box-shadow:0 -4px 16px rgba(0,0,0,.12);';
  fab.innerHTML = `
    <button class="btn btn-outline" id="btnAddMore" style="flex:1;padding:12px;font-size:14px;border-radius:var(--r-m)">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg> 加动作
    </button>
    <button class="btn btn-primary" id="btnFinish" style="flex:2;padding:12px;font-size:14px;border-radius:var(--r-m)">完成训练</button>
  `;
  document.body.appendChild(fab);

  // 离开此页面时清除悬浮栏
  const removeFab = () => { const el = document.getElementById('activeTrainingFab'); if (el) el.remove(); };

  fab.querySelector('#btnAddMore').addEventListener('click', () => {
    removeFab();
    S.selectedBodyPart = S.currentTraining.bodyPart;
    S.pendingExercises = [];
    S.exerciseSearch = '';
    S.exerciseFilter = 'recommended';
    S.trainingScreen = 'selectExercise';
    onStateChange();
  });
  fab.querySelector('#btnFinish').addEventListener('click', () => {
    removeFab();
    finishTraining(S);
  });

  container.querySelectorAll('#restPicker .rest-pick').forEach(btn => btn.addEventListener('click', () => {
    S.restSeconds = parseInt(btn.dataset.sec);
    container.querySelectorAll('#restPicker .rest-pick').forEach(b => b.classList.toggle('active', b === btn));
    onStateChange();
  }));

  container.querySelector('#btnStartRest').addEventListener('click', () => {
    if (window._audioCtx) window._audioCtx.resume().catch(() => {});
    showRestTimerOverlay(S.restSeconds || 90);
  });

  container.querySelectorAll('.s-check-btn').forEach(btn => {
    btn.addEventListener('click', () => addSet(parseInt(btn.dataset.ei), S));
  });
  container.querySelectorAll('[data-apply-suggestion]').forEach(button => {
    button.addEventListener('click', () => {
      const exerciseIndex = parseInt(button.dataset.applySuggestion);
      const exercise = S.currentTraining.exercises[exerciseIndex];
      const suggestion = getProgressionSuggestion(getLastExercisePerformance(S.trainingRecords, exercise.name));
      if (!suggestion.canApply) return;
      const weightInput = container.querySelector(`#w-${exerciseIndex}`);
      const repsInput = container.querySelector(`#r-${exerciseIndex}`);
      if (weightInput) weightInput.value = suggestion.weight;
      if (repsInput) repsInput.value = suggestion.reps;
    });
  });
  ct.exercises.forEach((ex, ei) => {
    const wI = container.querySelector(`#w-${ei}`);
    const rI = container.querySelector(`#r-${ei}`);
    if (wI) wI.addEventListener('keydown', e => { if (e.key === 'Enter') addSet(ei, S); });
    if (rI) rI.addEventListener('keydown', e => { if (e.key === 'Enter') addSet(ei, S); });
  });
  container.querySelectorAll('.swipe-wrap').forEach(wrap => {
    const content = wrap.querySelector('.swipe-content');
    let startX = 0, currentX = 0, swiping = false;
    const ei = parseInt(wrap.dataset.ei), si = parseInt(wrap.dataset.si);
    content.addEventListener('touchstart', e => { startX = e.touches[0].clientX; currentX = 0; swiping = true; }, { passive: true });
    content.addEventListener('touchmove', e => {
      if (!swiping) return;
      const dx = e.touches[0].clientX - startX;
      currentX = Math.min(0, Math.max(-80, dx));
      content.style.transform = `translateX(${currentX}px)`;
    }, { passive: true });
    content.addEventListener('touchend', () => {
      swiping = false;
      if (currentX < -40) {
        content.style.transform = 'translateX(-72px)';
        wrap.querySelector('.swipe-del').onclick = () => deleteSet(ei, si, S);
      } else {
        content.style.transform = 'translateX(0)';
      }
    });
  });
  if (S.trainingTimerActive && !S._timerInterval) {
    S._timerInterval = setInterval(() => {
      const el = container.querySelector('#trainingTime');
      if (el && S.trainingTimerActive) {
        const e = Math.floor((Date.now() - S.trainingTimerStart) / 1000) + (S.trainingTimerElapsed || 0);
        el.textContent = fmtTime(e);
      }
    }, 1000);
  }
}

function renderTrainingSummary(container, S) {
  // 确保切换到 summary 时清除悬浮栏（finishTraining 已 removeFab，这里兜底）
  const fab = document.getElementById('activeTrainingFab');
  if (fab) fab.remove();
  const selFab = document.getElementById('exerciseSelectFab');
  if (selFab) selFab.remove();

  const ct = S.currentTraining;
  if (!ct) { S.trainingScreen = 'home'; onStateChange(); return; }
  const summary = aiPostWorkout(ct, S);
  container.innerHTML = `
    <div class="text-center mb-16">
      <div style="font-size:48px;margin-bottom:8px">
        <svg width="48" height="48" viewBox="0 0 32 32" fill="none" stroke="var(--acc)" stroke-width="1.5" stroke-linecap="round" style="display:inline"><circle cx="16" cy="16" r="14" opacity=".2"/><path d="M16 8v8l5 5"/></svg>
      </div>
      <div class="section-title" style="font-size:20px;margin-bottom:4px">训练完成！</div>
      <div class="text-muted">${fmtDuration(summary.duration)} · ${getBodyPartName(S, ct.bodyPart)}</div>
    </div>
    <div class="stat-grid" style="grid-template-columns:1fr 1fr;margin-bottom:16px">
      <div class="stat-card"><div class="stat-val">${fmtVol(summary.vol)}</div><div class="stat-label">总训练量 (kg)</div></div>
      <div class="stat-card"><div class="stat-val">${ct.exercises.reduce((t, e) => t + e.sets.length, 0)}</div><div class="stat-label">总组数</div></div>
    </div>
    <div class="ai-card">
      <div class="ai-header"><svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1l1.5 3.5L13 6l-3.5 1.5L8 11 6.5 7.5 3 6l3.5-1.5L8 1z"/></svg> AI 训练总结</div>
      <div class="ai-body">
        ${summary.comp ? summary.comp + '<br>' : ''}
        ${summary.prText ? summary.prText + '<br>' : ''}
        ${summary.motto}
      </div>
    </div>
    <div class="input-group">
      <label>训练笔记</label>
      <textarea class="input-field" id="trainingNotes" placeholder="记录今天的训练感受...">${escapeHtml(ct.notes || '')}</textarea>
    </div>
    <button class="btn btn-primary btn-block mt-16" id="btnSaveTraining">保存训练记录</button>
    <button class="btn btn-ghost btn-block mt-8" id="btnDiscardTraining" style="color:var(--err)">放弃本次记录</button>
  `;
  container.querySelector('#btnSaveTraining').addEventListener('click', () => {
    ct.notes = container.querySelector('#trainingNotes').value;
    ct._updatedAt = new Date().toISOString();
    delete ct.prefillFromHistory;
    S.trainingRecords.push(ct);
    queueUpsert('training_records', ct.id, ct).catch(e => console.warn('[Sync] Queue training failed:', e));
    S.currentTraining = null;
    S.trainingTimerActive = false;
    S.trainingTimerElapsed = 0;
    S.trainingTimerStart = null;
    if (S._timerInterval) { clearInterval(S._timerInterval); S._timerInterval = null; }
    onStateChange();
  });
  container.querySelector('#btnDiscardTraining').addEventListener('click', async () => {
    const ok = await showConfirm('确定放弃本次训练记录？', { confirm: '放弃', danger: true });
    if (ok) {
      S.currentTraining = null;
      S.trainingTimerActive = false;
      S.trainingTimerElapsed = 0;
      S.trainingTimerStart = null;
      if (S._timerInterval) { clearInterval(S._timerInterval); S._timerInterval = null; }
      onStateChange();
    }
  });
}

function addSet(ei, S) {
  const wI = document.querySelector(`#w-${ei}`);
  const rI = document.querySelector(`#r-${ei}`);
  const w = parseFloat(wI?.value);
  const r = parseInt(rI?.value);
  if (!w || !r || w <= 0 || r <= 0) return;
  S.currentTraining.exercises[ei].sets.push({ weight: w, reps: r });
  onStateChange();
}

function deleteSet(ei, si, S) {
  S.currentTraining.exercises[ei].sets.splice(si, 1);
  onStateChange();
}

async function finishTraining(S) {
  const ct = S.currentTraining;
  if (!ct) return;
  const totalSets = ct.exercises.reduce((t, ex) => t + ex.sets.length, 0);
  if (totalSets === 0) {
    const ok = await showConfirm('你还没有记录任何组数据，确定要完成训练吗？');
    if (!ok) return;
  }
  S.trainingTimerActive = false;
  if (S._timerInterval) { clearInterval(S._timerInterval); S._timerInterval = null; }
  ct.duration = S.trainingTimerStart
    ? (S.trainingTimerElapsed || 0) + Math.floor((Date.now() - S.trainingTimerStart) / 1000)
    : (S.trainingTimerElapsed || 0);
  ct.totalVolume = calcVolume(ct.exercises);
  S.trainingScreen = 'summary';
  onStateChange();
}

function showRestTimerOverlay(seconds) {
  const existing = document.getElementById('timerOverlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.className = 'timer-overlay';
  overlay.id = 'timerOverlay';

  const circumference = 2 * Math.PI * 90;
  let remaining = seconds;

  overlay.innerHTML = `
    <div class="timer-label">REST TIMER</div>
    <div class="timer-circle">
      <svg viewBox="0 0 200 200">
        <circle class="track" cx="100" cy="100" r="90"/>
        <circle class="progress" cx="100" cy="100" r="90" stroke-dasharray="${circumference}" stroke-dashoffset="0"/>
      </svg>
      <div class="timer-text">
        <div style="font-size:14px;color:var(--t2);font-weight:500">准备</div>
        <div id="timerCountdown" style="font-size:52px;font-weight:700;line-height:1;color:var(--t1);font-variant-numeric:tabular-nums">${remaining}</div>
        <div style="font-size:12px;color:var(--t3);margin-top:4px">组间${seconds}秒</div>
      </div>
    </div>
    <button class="btn btn-outline btn-block" id="timerSkip" style="max-width:200px;margin-top:8px">跳过</button>
  `;

  const progressCircle = overlay.querySelector('.progress');
  const countdownEl = overlay.querySelector('#timerCountdown');
  const skipBtn = overlay.querySelector('#timerSkip');

  function update() {
    const pct = remaining / seconds;
    const offset = circumference * (1 - pct);
    progressCircle.setAttribute('stroke-dashoffset', offset);
    countdownEl.textContent = remaining;
  }

  update();

  skipBtn.addEventListener('click', () => {
    clearInterval(interval);
    overlay.remove();
  });

  document.body.appendChild(overlay);

  const interval = setInterval(() => {
    remaining--;
    if (remaining <= 0) {
      clearInterval(interval);
      try {
        if (!window._audioCtx) window._audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const ctx = window._audioCtx;
        ctx.resume().then(() => {
          const o = ctx.createOscillator(), g = ctx.createGain();
          o.connect(g); g.connect(ctx.destination);
          o.frequency.value = 880; g.gain.value = 0.3;
          o.start(); o.stop(ctx.currentTime + 0.15);
        }).catch(() => {});
      } catch (e) {}
      setTimeout(() => overlay.remove(), 500);
      return;
    }
    update();
  }, 1000);
}

function showAddExerciseModal(S, stateChanged) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = 'modalOverlay';
  overlay.innerHTML = `<div class="modal">
    <div class="modal-handle"></div>
    <h3>添加自定义动作</h3>
    <div class="input-group"><label>动作名称</label><input class="input-field" id="customExName" placeholder="输入动作名称"></div>
    <div class="input-group"><label>类型</label>
      <div style="display:flex;gap:8px">
        <button class="btn btn-sm" id="typeM" style="flex:1;border:1.5px solid var(--bd);color:var(--t2)">器械</button>
        <button class="btn btn-sm" id="typeF" style="flex:1;border:1.5px solid var(--bd);color:var(--t2)">自由</button>
      </div>
    </div>
    <div style="display:flex;gap:8px;margin-top:16px">
      <button class="btn btn-ghost" style="flex:1" id="cancelCustom">取消</button>
      <button class="btn btn-primary" style="flex:1" id="saveCustom">添加</button>
    </div>
  </div>`;
  document.body.appendChild(overlay);
  let selType = 'free';
  const typeM = overlay.querySelector('#typeM');
  const typeF = overlay.querySelector('#typeF');
  function selectType(t) {
    selType = t;
    typeM.style.borderColor = t === 'machine' ? 'var(--acc)' : 'var(--bd)';
    typeM.style.color = t === 'machine' ? 'var(--acc)' : 'var(--t2)';
    typeF.style.borderColor = t === 'free' ? 'var(--acc)' : 'var(--bd)';
    typeF.style.color = t === 'free' ? 'var(--acc)' : 'var(--t2)';
  }
  typeM.addEventListener('click', () => selectType('machine'));
  typeF.addEventListener('click', () => selectType('free'));
  selectType('free');
  overlay.querySelector('#cancelCustom').addEventListener('click', () => overlay.remove());
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
  overlay.querySelector('#saveCustom').addEventListener('click', () => {
    const name = overlay.querySelector('#customExName').value.trim();
    if (!name) return;
    const custom = { id: genId(), bodyPart: S.selectedBodyPart, name, type: selType, _updatedAt: new Date().toISOString() };
    S.customExercises.push(custom);
    queueUpsert('custom_exercises', custom.id, custom).catch(e => console.warn('[Sync] Queue custom exercise failed:', e));
    // Auto-select the newly created exercise and switch to "全部" tab so it's immediately visible
    if (!S.pendingExercises) S.pendingExercises = [];
    if (!S.pendingExercises.find(p => p.name === name)) {
      S.pendingExercises.push({ name, type: selType });
    }
    S.exerciseFilter = 'all';
    overlay.remove();
    stateChanged();
  });
}

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}

function getPR(S, name) {
  let max = 0;
  S.trainingRecords.forEach(r => {
    r.exercises.forEach(ex => { if (ex.name === name) ex.sets.forEach(s => { if (s.weight > max) max = s.weight; }); });
  });
  return max;
}

function getPRBefore(S, name, excludeId) {
  let max = 0;
  S.trainingRecords.forEach(r => {
    if (r.id !== excludeId) r.exercises.forEach(ex => { if (ex.name === name) ex.sets.forEach(s => { if (s.weight > max) max = s.weight; }); });
  });
  return max;
}

function getBodyPartName(S, id) {
  const bp = BODY_PARTS.find(b => b.id === id);
  return bp ? bp.name : id;
}

function showOnboarding() {
  const steps = [
    { num: 1, title: '选择部位', desc: '点击胸、背、腿等部位卡片，选择今天要训练的目标肌肉群', icon: '🏋️' },
    { num: 2, title: '选择动作', desc: '从器械或自由训练列表中，挑选 3-5 个动作组成今天的训练计划', icon: '📋' },
    { num: 3, title: '开始训练', desc: '记录每组的重量和次数，组间休息可使用计时器功能', icon: '⏱️' },
    { num: 4, title: '完成保存', desc: '训练结束后添加笔记，AI 会自动生成训练总结', icon: '✅' }
  ];
  let currentStep = 0;
  const overlay = document.createElement('div');
  overlay.className = 'onboarding-overlay';
  overlay.id = 'onboardingOverlay';
  function renderStep() {
    const step = steps[currentStep];
    const isLast = currentStep === steps.length - 1;
    const dotsHtml = steps.map((_, i) => `<div class="onboard-dot" data-i="${i}"></div>`).join('');
    overlay.innerHTML = `
      <div class="onboarding-card">
        <h3>欢迎使用 FitTracker Pro</h3>
        <p class="onboard-sub">${currentStep + 1} / ${steps.length}</p>
        <div class="onboard-step" style="min-width:unset;margin-bottom:20px">
          <div style="font-size:40px;margin-bottom:12px">${step.icon}</div>
          <div class="step-num" style="margin:0 auto 12px">${step.num}</div>
          <div class="step-title">${step.title}</div>
          <div class="step-desc">${step.desc}</div>
        </div>
        <div class="onboard-dots">${dotsHtml}</div>
        <button class="btn btn-primary btn-block" id="btnOnboardNext" style="margin-top:16px">
          ${isLast ? '开始体验 🚀' : '下一步'}
        </button>
      </div>
    `;
    overlay.querySelectorAll('.onboard-dot').forEach((dot, i) => {
      dot.style.background = i === currentStep ? 'var(--acc)' : 'var(--bd2)';
      dot.style.width = i === currentStep ? '18px' : '6px';
      dot.style.borderRadius = '3px';
      dot.style.transition = 'all .25s ease';
    });
    overlay.querySelector('#btnOnboardNext').addEventListener('click', () => {
      if (isLast) {
        localStorage.setItem('fittracker_welcome_shown', '1');
        overlay.remove();
        const startBtn = document.getElementById('btnStartTraining');
        if (startBtn) {
          startBtn.style.animation = 'pulse 1s ease 2';
          startBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      } else {
        currentStep++;
        renderStep();
      }
    });
  }
  renderStep();
  document.body.appendChild(overlay);
  overlay.addEventListener('click', e => {
    if (e.target === overlay) {
      localStorage.setItem('fittracker_welcome_shown', '1');
      overlay.remove();
    }
  });
}
