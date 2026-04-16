// ===== History View =====
// Training history with filters + body records with edit

import { BODY_PARTS } from '../exercises.js';

export function renderHistory(container, S, stateChanged) {
  container.innerHTML = `
    <div class="section-title" style="font-size:22px;margin-bottom:4px">历史</div>
    <p class="text-muted mb-16">回顾你的健身旅程</p>
    <div class="sub-tabs">
      <div class="sub-tab${S.historySubTab === 'training' ? ' active' : ''}" data-sub="training">训练历史</div>
      <div class="sub-tab${S.historySubTab === 'body' ? ' active' : ''}" data-sub="body">体重/饮食</div>
    </div>
    <div id="historyContent"></div>
  `;

  container.querySelectorAll('.sub-tab').forEach(el => el.addEventListener('click', () => {
    S.historySubTab = el.dataset.sub;
    renderHistoryContent(container, S, stateChanged);
    container.querySelectorAll('.sub-tab').forEach(t => t.classList.toggle('active', t.dataset.sub === S.historySubTab));
  }));

  renderHistoryContent(container, S, stateChanged);
}

function renderHistoryContent(container, S, stateChanged) {
  const contentEl = container.querySelector('#historyContent');
  if (S.historySubTab === 'training') {
    renderTrainingHistory(contentEl, S, stateChanged);
  } else {
    renderBodyHistory(contentEl, S, stateChanged);
  }
}

function renderTrainingHistory(container, S, stateChanged) {
  const recs = [...S.trainingRecords].reverse();
  const filters = ['all', ...BODY_PARTS.map(b => b.id)];
  const filtered = S.historyFilter === 'all' ? recs : recs.filter(r => r.bodyPart === S.historyFilter);

  container.innerHTML = `
    <div class="filter-bar">
      ${filters.map(f => `<div class="filter-chip${S.historyFilter === f ? ' active' : ''}" data-filter="${f}">${f === 'all' ? '全部' : getBodyPartName(f)}</div>`).join('')}
    </div>
    ${filtered.length === 0 ? emptyState('training') : filtered.map(r => {
      const vol = calcVolume(r.exercises);
      return `<div class="history-card" id="hc-${r.id}">
        <div class="history-card-header" data-toggle="${r.id}">
          <div class="hc-left">
            <div class="hc-date">${fmtDateFull(r.date)}${r.duration ? ` · ${fmtDuration(r.duration)}` : ''}</div>
            <div class="hc-title">${getBodyPartName(r.bodyPart)}训练</div>
          </div>
          <div class="hc-right">
            <div class="hc-vol">${fmtVol(vol)} kg</div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
          </div>
        </div>
        <div class="hc-detail">
          ${r.exercises.map(ex => `<div style="margin-bottom:10px">
            <div class="flex-between"><span class="text-sm fw-700">${ex.name}</span><span class="badge ${ex.type === 'machine' ? 'badge-machine' : 'badge-free'} text-xs">${ex.type === 'machine' ? '器械' : '自由'}</span></div>
            ${ex.sets.map((s, i) => `<div class="set-row"><div class="set-num">${i + 1}</div><div class="set-info"><strong>${s.weight}kg</strong> <span>× ${s.reps}次</span></div></div>`).join('')}
          </div>`).join('')}
          ${r.photo ? `<img class="hc-photo" src="${r.photo}" onclick="event.stopPropagation();viewPhoto('${r.id}')">` : ''}
          ${r.notes ? `<div class="hc-notes">${r.notes}</div>` : ''}
          <button class="btn btn-danger btn-sm mt-8" data-del-training="${r.id}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg> 删除记录
          </button>
        </div>
      </div>`;
    }).join('')}
  `;

  // Filter chips
  container.querySelectorAll('.filter-chip').forEach(el => el.addEventListener('click', () => {
    S.historyFilter = el.dataset.filter;
    renderTrainingHistory(container, S, stateChanged);
  }));

  // Toggle expand
  container.querySelectorAll('[data-toggle]').forEach(el => el.addEventListener('click', () => {
    const card = container.querySelector(`#hc-${el.dataset.toggle}`);
    if (card) card.classList.toggle('expanded');
  }));

  // Delete training record
  container.querySelectorAll('[data-del-training]').forEach(btn => btn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!confirm('确定删除这条训练记录？')) return;
    S.trainingRecords = S.trainingRecords.filter(r => r.id !== btn.dataset.delTraining);
    stateChanged();
  }));
}

function renderBodyHistory(container, S, stateChanged) {
  const recs = [...S.bodyRecords].reverse();

  container.innerHTML = recs.length === 0
    ? emptyState('body')
    : recs.map(r => `
      <div class="card" style="padding:12px 14px">
        <div class="flex-between">
          <span class="text-sm fw-700">${fmtDateFull(r.date)}</span>
          <div style="display:flex;gap:6px;align-items:center">
            ${r.weight ? `<span class="badge badge-accent">${r.weight}kg</span>` : ''}
            ${r.bodyFat ? `<span class="badge badge-warn">${r.bodyFat}%</span>` : ''}
            <button class="btn-ghost btn-sm edit-body-btn" data-id="${r.id}" style="padding:2px 6px;color:var(--acc)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button class="btn-ghost btn-sm del-body-btn" data-id="${r.id}" style="padding:2px 6px;color:var(--err)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
            </button>
          </div>
        </div>
        ${r.diet ? `<div class="text-xs text-muted mt-8">${r.diet}</div>` : ''}
      </div>
    `).join('');

  // Edit buttons
  container.querySelectorAll('.edit-body-btn').forEach(btn => btn.addEventListener('click', () => {
    const rec = S.bodyRecords.find(r => r.id === btn.dataset.id);
    if (!rec) return;
    showEditBodyModal(rec, S, stateChanged);
  }));

  // Delete buttons
  container.querySelectorAll('.del-body-btn').forEach(btn => btn.addEventListener('click', () => {
    if (!confirm('确定删除？')) return;
    S.bodyRecords = S.bodyRecords.filter(r => r.id !== btn.dataset.id);
    stateChanged();
  }));
}

function showEditBodyModal(rec, S, stateChanged) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `<div class="modal">
    <div class="modal-handle"></div>
    <h3>编辑记录</h3>
    <div class="input-group"><label>日期</label><input type="date" class="input-field" id="editBodyDate" value="${rec.date}"></div>
    <div style="display:flex;gap:12px">
      <div class="input-group" style="flex:1"><label>体重 (kg)</label><input type="number" class="input-field" id="editBodyWeight" placeholder="如 75.5" inputmode="decimal" step="0.1" value="${rec.weight || ''}"></div>
      <div class="input-group" style="flex:1"><label>体脂 (%)</label><input type="number" class="input-field" id="editBodyFat" placeholder="如 15.0" inputmode="decimal" step="0.1" value="${rec.bodyFat || ''}"></div>
    </div>
    <div class="input-group"><label>饮食补给</label><textarea class="input-field" id="editBodyDiet" placeholder="训练后的补给..." style="min-height:60px">${rec.diet || ''}</textarea></div>
    <div style="display:flex;gap:8px">
      <button class="btn btn-ghost" style="flex:1" id="cancelEditBody">取消</button>
      <button class="btn btn-primary" style="flex:1" id="saveEditBody">保存</button>
    </div>
  </div>`;
  document.body.appendChild(overlay);

  overlay.querySelector('#cancelEditBody').addEventListener('click', () => overlay.remove());
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
  overlay.querySelector('#saveEditBody').addEventListener('click', () => {
    rec.date = overlay.querySelector('#editBodyDate').value;
    rec.weight = parseFloat(overlay.querySelector('#editBodyWeight').value) || null;
    rec.bodyFat = parseFloat(overlay.querySelector('#editBodyFat').value) || null;
    rec.diet = overlay.querySelector('#editBodyDiet').value.trim();
    overlay.remove();
    stateChanged();
  });
}

window.viewPhoto = function(id) {
  // Will be called from inline onclick
  const rec = (window._appState || {}).trainingRecords || [];
  const found = rec.find(r => r.id === id);
  if (!found || !found.photo) return;
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.style.alignItems = 'center';
  overlay.innerHTML = `<img src="${found.photo}" style="max-width:90%;max-height:80vh;border-radius:var(--r-l);object-fit:contain">`;
  overlay.addEventListener('click', () => overlay.remove());
  document.body.appendChild(overlay);
};

function emptyState(type) {
  if (type === 'training') {
    return `<div class="empty">
      <div class="empty-state-svg"><svg viewBox="0 0 80 80" fill="none" stroke="#00f3ff" stroke-width="1.5" stroke-linecap="round"><rect x="20" y="30" width="40" height="6" rx="3" opacity=".3"/><line x1="22" y1="26" x2="22" y2="40" stroke-width="2" opacity=".3"/><line x1="58" y1="26" x2="58" y2="40" stroke-width="2" opacity=".3"/></svg></div>
      <p>还没有训练记录</p>
    </div>`;
  }
  return `<div class="empty">
    <div class="empty-state-svg"><svg viewBox="0 0 80 80" fill="none" stroke="#00f3ff" stroke-width="1.5" stroke-linecap="round"><circle cx="40" cy="30" r="12" opacity=".3"/><path d="M28 30c0 10 6 20 12 20s12-10 12-20" opacity=".3"/><line x1="40" y1="50" x2="40" y2="65" stroke-width="2"/></svg></div>
    <p>还没有体重/饮食记录</p>
  </div>`;
}

function getBodyPartName(id) {
  const bp = BODY_PARTS.find(b => b.id === id);
  return bp ? bp.name : id;
}

function calcVolume(exercises) {
  return exercises.reduce((t, ex) => t + ex.sets.reduce((st, s) => st + s.weight * s.reps, 0), 0);
}

const fmtDateFull = d => { const p = d.split('-'); return `${p[0]}年${p[1]}月${p[2]}日`; };
const fmtDuration = s => { const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60); return h > 0 ? `${h}小时${m}分钟` : `${m}分钟`; };
const fmtVol = v => { if (v === 0) return '0'; if (v >= 10000) return (v / 1000).toFixed(0) + 'k'; if (v >= 1000) return (v / 1000).toFixed(1) + 'k'; return Math.round(v).toString(); };
