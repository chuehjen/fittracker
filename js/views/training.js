// ===== Training View =====
// Home → Select Body Part → Select Exercise → Active Training → Summary

import { BODY_PARTS, BODY_PART_ICONS, EXERCISES, getExMeta } from '../exercises.js';
import { getWeeklyNews } from '../news.js';
import { ACHIEVEMENTS, getUnlockedAchievements } from '../achievements.js';
import { aiPreWorkout, aiPostWorkout } from '../ai.js';
import { createTimerManager } from '../timer.js';

// Empty state SVG
const EMPTY_TRAINING = `<div class="empty-state-svg"><svg viewBox="0 0 80 80" fill="none" stroke="#00f3ff" stroke-width="1.5" stroke-linecap="round"><rect x="20" y="30" width="40" height="6" rx="3" opacity=".3"/><line x1="22" y1="26" x2="22" y2="40" stroke-width="2" opacity=".3"/><line x1="58" y1="26" x2="58" y2="40" stroke-width="2" opacity=".3"/><circle cx="40" cy="20" r="4" opacity=".4"/><path d="M36 24v8" stroke-width="2"/><path d="M38 28l-6 6M42 28l6 6" stroke-width="1.5"/></svg></div>`;

let timerManager = null;
let onStateChange = null;
let currentRender = null;

export function renderTraining(container, S, stateChanged) {
  onStateChange = stateChanged;
  currentRender = () => renderTraining(container, S, stateChanged);
  timerManager = createTimerManager(S);
  const screens = {
    home: renderTrainingHome,
    selectPart: renderSelectPart,
    selectExercise: renderSelectExercise,
    active: renderActiveTraining,
    summary: renderTrainingSummary
  };
  const fn = screens[S.trainingScreen] || screens.home;
  fn(container, S);
}

function renderTrainingHome(container, S) {
  const ai = aiPreWorkout(S);
  const news = getWeeklyNews();
  const unlocked = getUnlockedAchievements(S);

  container.innerHTML = `
    <div class="cyber-header">
      <div class="title">FITTRACKER PRO</div>
      <div class="subtitle">CYBER EDITION · 记录每一次进化</div>
    </div>
    <div class="ai-card ai-pulse">
      <div class="ai-header"><svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1l1.5 3.5L13 6l-3.5 1.5L8 11 6.5 7.5 3 6l3.5-1.5L8 1z"/></svg> ${ai.title}</div>
      <div class="ai-body">${ai.body}</div>
    </div>
    <button class="btn btn-primary btn-block" id="btnStartTraining" style="padding:16px;font-size:17px;border-radius:var(--r-l);margin-bottom:16px">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg> 开始训练
    </button>
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
  `;

  container.querySelector('#btnStartTraining').addEventListener('click', () => {
    S.trainingScreen = 'selectPart';
    onStateChange();
  });
}

function renderRecentTraining(S) {
  const recent = S.trainingRecords.slice(-3).reverse();
  if (recent.length === 0) return '';
  return `<div class="mt-16"><div class="section-title" style="font-size:15px">最近训练</div>
    ${recent.map(r => `
      <div class="card" style="padding:12px 14px;display:flex;align-items:center;justify-content:space-between">
        <div><div class="text-sm fw-700">${getBodyPartName(S, r.bodyPart)}</div><div class="text-xs text-muted">${fmtDate(r.date)} · ${fmtDuration(r.duration || 0)}</div></div>
        <div class="badge badge-accent">${fmtVol(calcVolume(r.exercises))} kg</div>
      </div>
    `).join('')}</div>`;
}

function renderSelectPart(container, S) {
  container.innerHTML = `
    <div class="flex-between mb-16">
      <div class="section-title" style="margin:0">选择训练部位</div>
      <button class="btn btn-ghost btn-sm" id="btnBackHome">取消</button>
    </div>
    <div class="bp-grid">${BODY_PARTS.map(bp => `
      <div class="bp-card" data-part="${bp.id}">
        ${BODY_PART_ICONS[bp.icon]}
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

function renderSelectExercise(container, S) {
  const bp = S.selectedBodyPart;
  const base = EXERCISES[bp] || { machine: [], free: [] };
  const custom = (S.customExercises || []).filter(e => e.bodyPart === bp);
  const machine = [...base.machine.map(n => ({ name: n, type: 'machine' })), ...custom.filter(e => e.type === 'machine')];
  const free = [...base.free.map(n => ({ name: n, type: 'free' })), ...custom.filter(e => e.type === 'free')];

  function exCard(e, type) {
    const m = getExMeta(e.name);
    const badgeCls = type === 'machine' ? 'badge-machine' : 'badge-free';
    const badgeTxt = type === 'machine' ? '器械' : '自由';
    return `<div class="ex-card" data-name="${e.name}" data-type="${type}">
      <div class="ex-add"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg></div>
      <span class="ex-badge badge ${badgeCls} text-xs">${badgeTxt}</span>
      <div class="ex-icon">${m.icon || ''}</div>
      <div class="ex-name">${e.name}</div>
      ${m.tip ? `<div class="ex-tip">${m.tip}</div>` : ''}
    </div>`;
  }

  container.innerHTML = `
    <div class="flex-between mb-16">
      <div class="section-title" style="margin:0">${getBodyPartName(S, bp)} - 选择动作</div>
      <button class="btn btn-ghost btn-sm" id="btnBackPart">返回</button>
    </div>
    <div class="text-sm text-muted mb-8" style="display:flex;align-items:center;gap:4px"><span class="badge badge-machine">器械</span> 器械训练</div>
    <div class="ex-grid">${machine.map(e => exCard(e, 'machine')).join('')}</div>
    <div class="text-sm text-muted mb-8 mt-16" style="display:flex;align-items:center;gap:4px"><span class="badge badge-free">自由</span> 自由训练</div>
    <div class="ex-grid">${free.map(e => exCard(e, 'free')).join('')}</div>
    <button class="btn btn-outline btn-block btn-sm mt-16" id="btnAddCustom">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg> 自定义动作
    </button>
  `;

  container.querySelector('#btnBackPart').addEventListener('click', () => {
    S.trainingScreen = 'selectPart';
    onStateChange();
  });

  container.querySelector('#btnAddCustom').addEventListener('click', () => showAddExerciseModal(S, onStateChange));

  container.querySelectorAll('.ex-card').forEach(el => el.addEventListener('click', (e) => {
    addExerciseToTraining(el.dataset.name, el.dataset.type, S);
  }));
}

function addExerciseToTraining(name, type, S) {
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
  if (!S.currentTraining.exercises.find(e => e.name === name)) {
    S.currentTraining.exercises.push({ name, type, sets: [] });
  }
  // Switch to active training screen
  S.trainingScreen = 'active';
  onStateChange();
}

function renderActiveTraining(container, S) {
  if (!S.currentTraining) { S.trainingScreen = 'home'; onStateChange(); return; }
  const ct = S.currentTraining;
  const elapsed = S.trainingTimerActive
    ? Math.floor((Date.now() - S.trainingTimerStart) / 1000) + (S.trainingTimerElapsed || 0)
    : (S.trainingTimerElapsed || 0);

  container.innerHTML = `
    <div style="margin-bottom:14px">
      <div class="flex-between">
        <div class="text-sm text-muted">${getBodyPartName(S, ct.bodyPart)}训练中</div>
        <div style="display:flex;gap:6px">
          <button class="btn btn-outline btn-sm" id="btnAddMore" style="padding:5px 10px;font-size:12px">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg> 动作
          </button>
          <button class="btn btn-primary btn-sm" id="btnFinish" style="padding:5px 12px;font-size:12px">完成</button>
        </div>
      </div>
      <div class="training-timer" id="trainingTime" style="font-size:32px;margin-top:2px">${fmtTime(elapsed)}</div>
      <div class="rest-bar">
        <span class="text-xs text-muted">组间休息</span>
        <div style="display:flex;gap:4px" id="restPicker">
          ${[30, 60, 90, 120, 180].map(s => `<button class="rest-pick${S.restSeconds === s ? ' active' : ''}" data-sec="${s}">${s >= 60 && s % 60 === 0 ? s / 60 + 'min' : s + 's'}</button>`).join('')}
        </div>
        <button class="rest-start-btn" id="btnRestTimer"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="5,3 19,12 5,21"/></svg>开始</button>
      </div>
    </div>
    ${ct.exercises.map((ex, ei) => {
      const pr = getPR(S, ex.name);
      const currentMax = ex.sets.length > 0 ? Math.max(...ex.sets.map(s => s.weight)) : 0;
      const isPR = currentMax > 0 && currentMax > getPRBefore(S, ex.name, ct.id) && getPRBefore(S, ex.name, ct.id) > 0;
      const nextNum = ex.sets.length + 1;
      const lastW = ex.sets.length > 0 ? ex.sets[ex.sets.length - 1].weight : '';
      const lastR = ex.sets.length > 0 ? ex.sets[ex.sets.length - 1].reps : '';
      return `<div class="card" style="padding:12px">
        <div class="flex-between mb-8">
          <div>
            <span class="fw-700">${ex.name}</span>
            <span class="badge ${ex.type === 'machine' ? 'badge-machine' : 'badge-free'} text-xs" style="margin-left:6px">${ex.type === 'machine' ? '器械' : '自由'}</span>
            ${isPR ? '<span class="badge badge-success text-xs" style="margin-left:4px">PR!</span>' : ''}
          </div>
          ${pr > 0 ? `<span class="text-xs text-muted">PR: ${pr}kg</span>` : ''}
        </div>
        <div class="set-tbl">
          <div class="set-tbl-hd"><span>组别</span><span>KG</span><span>次数</span><span></span></div>
          ${ex.sets.map((s, si) => `<div class="swipe-wrap" data-ei="${ei}" data-si="${si}">
            <div class="swipe-del">删除</div>
            <div class="set-tbl-row swipe-content">
              <div class="s-num">${si + 1}</div>
              <div class="s-val">${s.weight}</div>
              <div class="s-val">${s.reps}</div>
              <div style="text-align:center"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00ff88" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg></div>
            </div>
          </div>`).join('')}
          <div class="set-tbl-row">
            <div class="s-num">${nextNum}</div>
            <input type="number" placeholder="kg" id="w-${ei}" inputmode="decimal" step="0.5" value="${lastW}">
            <input type="number" placeholder="次数" id="r-${ei}" inputmode="numeric" value="${lastR}">
            <button class="s-check-btn" data-ei="${ei}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg></button>
          </div>
        </div>
      </div>`;
    }).join('')}
  `;

  // Event bindings
  container.querySelector('#btnAddMore').addEventListener('click', () => {
    S.trainingScreen = 'selectExercise';
    onStateChange();
  });

  container.querySelector('#btnFinish').addEventListener('click', () => finishTraining(S));

  // Rest picker
  container.querySelectorAll('#restPicker .rest-pick').forEach(btn => btn.addEventListener('click', () => {
    S.restSeconds = parseInt(btn.dataset.sec);
    container.querySelectorAll('#restPicker .rest-pick').forEach(b => b.classList.toggle('active', b === btn));
    onStateChange();
  }));

  // Rest timer
  container.querySelector('#btnRestTimer').addEventListener('click', () => {
    showRestTimerOverlay(S.restSeconds || 90);
  });

  // Add set buttons
  container.querySelectorAll('.s-check-btn').forEach(btn => {
    btn.addEventListener('click', () => addSet(parseInt(btn.dataset.ei), S));
  });

  // Enter key to add set
  ct.exercises.forEach((ex, ei) => {
    const wI = container.querySelector(`#w-${ei}`);
    const rI = container.querySelector(`#r-${ei}`);
    if (wI) wI.addEventListener('keydown', e => { if (e.key === 'Enter') addSet(ei, S); });
    if (rI) rI.addEventListener('keydown', e => { if (e.key === 'Enter') addSet(ei, S); });
  });

  // Swipe to delete
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

  // Training timer update
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
  const ct = S.currentTraining;
  if (!ct) { S.trainingScreen = 'home'; onStateChange(); return; }
  const summary = aiPostWorkout(ct, S);

  container.innerHTML = `
    <div class="text-center mb-16">
      <div style="font-size:48px;margin-bottom:8px">
        <svg width="48" height="48" viewBox="0 0 32 32" fill="none" stroke="#00f3ff" stroke-width="1.5" stroke-linecap="round" style="display:inline"><circle cx="16" cy="16" r="14" opacity=".2"/><path d="M16 8v8l5 5"/></svg>
      </div>
      <div class="section-title" style="font-size:20px;margin-bottom:4px">训练完成！</div>
      <div class="text-muted">${fmtDuration(summary.duration)} · ${getBodyPartName(S, ct.bodyPart)}</div>
    </div>
    <div class="stat-grid" style="grid-template-columns:1fr 1fr;margin-bottom:16px">
      <div class="stat-card"><div class="stat-val">${fmtVol(summary.vol)}</div><div class="stat-label">总训练量 (kg)</div></div>
      <div class="stat-card"><div class="stat-val">${ct.exercises.reduce((t, e) => t + e.sets.length, 0)}</div><div class="stat-label">总组数</div></div>
    </div>
    <div class="ai-card ai-pulse">
      <div class="ai-header"><svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1l1.5 3.5L13 6l-3.5 1.5L8 11 6.5 7.5 3 6l3.5-1.5L8 1z"/></svg> AI 训练总结</div>
      <div class="ai-body">
        ${summary.comp ? summary.comp + '<br>' : ''}
        ${summary.prText ? summary.prText + '<br>' : ''}
        ${summary.motto}
      </div>
    </div>
    <div class="input-group">
      <label>训练笔记</label>
      <textarea class="input-field" id="trainingNotes" placeholder="记录今天的训练感受...">${ct.notes || ''}</textarea>
    </div>
    <div class="input-group">
      <label>训练拍照</label>
      <div style="display:flex;gap:8px;align-items:center">
        <label class="btn btn-outline btn-sm" style="cursor:pointer">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg> 拍照/选择
          <input type="file" accept="image/*" capture="environment" id="trainingPhoto" style="display:none">
        </label>
        ${ct.photo ? `<img src="${ct.photo}" style="width:48px;height:48px;border-radius:var(--r-s);object-fit:cover">` : '<span class="text-sm text-muted">未添加照片</span>'}
      </div>
    </div>
    <button class="btn btn-primary btn-block mt-16" id="btnSaveTraining">保存训练记录</button>
    <button class="btn btn-ghost btn-block mt-8" id="btnDiscardTraining" style="color:var(--err)">放弃本次记录</button>
  `;

  container.querySelector('#trainingPhoto').addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => { ct.photo = ev.target.result; currentRender && currentRender(); };
    reader.readAsDataURL(file);
  });

  container.querySelector('#btnSaveTraining').addEventListener('click', () => {
    ct.notes = container.querySelector('#trainingNotes').value;
    S.trainingRecords.push(ct);
    S.currentTraining = null;
    S.trainingTimerActive = false;
    S.trainingTimerElapsed = 0;
    S.trainingTimerStart = null;
    if (S._timerInterval) { clearInterval(S._timerInterval); S._timerInterval = null; }
    onStateChange();
  });

  container.querySelector('#btnDiscardTraining').addEventListener('click', () => {
    if (confirm('确定放弃本次训练记录？')) {
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

function finishTraining(S) {
  const ct = S.currentTraining;
  if (!ct) return;
  const totalSets = ct.exercises.reduce((t, ex) => t + ex.sets.length, 0);
  if (totalSets === 0) {
    if (!confirm('你还没有记录任何组数据，确定要完成训练吗？')) return;
  }
  S.trainingTimerActive = false;
  if (S._timerInterval) { clearInterval(S._timerInterval); S._timerInterval = null; }
  ct.duration = S.trainingTimerElapsed || 0;
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

  skipBtn.addEventListener('click', () => {
    clearInterval(interval);
    overlay.remove();
  });

  const interval = setInterval(() => {
    remaining--;
    if (remaining <= 0) {
      clearInterval(interval);
      // Play beep
      try {
        if (!window._audioCtx) window._audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const ctx = window._audioCtx;
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.frequency.value = 880; g.gain.value = 0.3;
        o.start(); o.stop(ctx.currentTime + 0.15);
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
    S.customExercises.push({ bodyPart: S.selectedBodyPart, name, type: selType });
    overlay.remove();
    stateChanged();
  });
}

// ===== Helpers =====
function calcVolume(exercises) {
  return exercises.reduce((t, ex) => t + ex.sets.reduce((st, s) => st + s.weight * s.reps, 0), 0);
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

const genId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const today = () => new Date().toISOString().slice(0, 10);
const fmtDate = d => { const p = d.split('-'); return `${p[1]}月${p[2]}日`; };
const fmtDuration = s => { const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60); return h > 0 ? `${h}小时${m}分钟` : `${m}分钟`; };
const fmtTime = s => { const m = Math.floor(s / 60), sec = s % 60; return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`; };
const fmtVol = v => { if (v === 0) return '0'; if (v >= 10000) return (v / 1000).toFixed(0) + 'k'; if (v >= 1000) return (v / 1000).toFixed(1) + 'k'; return Math.round(v).toString(); };
