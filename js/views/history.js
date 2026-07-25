// ===== History View =====

import { BODY_PARTS } from '../exercises.js';
import { fmtDateFull, fmtDuration, fmtVol, calcVolume } from '../helpers.js';
import { escapeHtml } from '../html.js';
import { showUndoToast } from '../toast.js';
import { queueDelete, queueUpsert } from '../sync.js';

export function renderHistory(container, S, stateChanged) {
  container.innerHTML = `
    <div class="section-title" style="font-size:22px;margin-bottom:4px">历史</div>
    <p class="text-muted mb-16">回顾你的健身旅程</p>
    <div id="historyContent"></div>
  `;
  renderTrainingHistory(container.querySelector('#historyContent'), S, stateChanged);
}

function renderTrainingHistory(container, S, stateChanged) {
  const recs = [...S.trainingRecords].reverse();
  const filters = ['all', ...BODY_PARTS.map(b => b.id)];
  const filtered = S.historyFilter === 'all' ? recs : recs.filter(r => r.bodyPart === S.historyFilter);

  container.innerHTML = `
    <div class="filter-bar">
      ${filters.map(f => `<div class="filter-chip${S.historyFilter === f ? ' active' : ''}" data-filter="${f}">${f === 'all' ? '全部' : getBodyPartName(f)}</div>`).join('')}
    </div>
    ${filtered.length === 0 ? emptyState() : filtered.map(r => `
      <div class="history-card" id="hc-${r.id}">
        <div class="history-card-header" data-toggle="${r.id}">
          <div class="hc-left">
            <div class="hc-date">${fmtDateFull(r.date)}${r.duration ? ` · ${fmtDuration(r.duration)}` : ''}</div>
            <div class="hc-title">${getBodyPartName(r.bodyPart)}训练</div>
          </div>
          <div class="hc-right">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>
          </div>
        </div>
        <div class="hc-detail">
          ${r.exercises.map(ex => `
            <div style="margin-bottom:10px">
              <div class="flex-between"><span class="text-sm fw-700">${escapeHtml(ex.name)}</span><span class="badge ${ex.type === 'machine' ? 'badge-machine' : 'badge-free'} text-xs">${ex.type === 'machine' ? '器械' : '自由'}</span></div>
              ${ex.sets.map((s, i) => `<div class="set-row"><div class="set-num">${i + 1}</div><div class="set-info"><strong>${s.weight}kg</strong> <span>× ${s.reps}次</span></div></div>`).join('')}
            </div>
          `).join('')}
          ${r.notes ? `<div class="hc-notes">${escapeHtml(r.notes)}</div>` : ''}
          <button class="btn btn-danger btn-sm mt-8" data-del-training="${r.id}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg> 删除记录
          </button>
        </div>
      </div>
    `).join('')}
  `;

  container.querySelectorAll('.filter-chip').forEach(el => el.addEventListener('click', () => {
    S.historyFilter = el.dataset.filter;
    renderTrainingHistory(container, S, stateChanged);
  }));

  container.querySelectorAll('[data-toggle]').forEach(el => el.addEventListener('click', () => {
    const card = container.querySelector(`#hc-${el.dataset.toggle}`);
    if (card) card.classList.toggle('expanded');
  }));

  container.querySelectorAll('[data-del-training]').forEach(btn => btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const id = btn.dataset.delTraining;
    const idx = S.trainingRecords.findIndex(r => r.id === id);
    if (idx === -1) return;
    const removed = S.trainingRecords.splice(idx, 1)[0];
    queueDelete('training_records', id).catch(err => console.warn('[Sync] Queue training delete failed:', err));
    stateChanged();
    showUndoToast('已删除训练记录', () => {
      removed._updatedAt = new Date().toISOString();
      S.trainingRecords.splice(idx, 0, removed);
      queueUpsert('training_records', id, removed).catch(err => console.warn('[Sync] Queue training restore failed:', err));
      stateChanged();
    });
  }));
}

function emptyState() {
  return `<div class="empty">
    <div class="empty-state-svg"><svg viewBox="0 0 80 80" fill="none" stroke="var(--acc)" stroke-width="1.5" stroke-linecap="round"><rect x="20" y="30" width="40" height="6" rx="3" opacity=".3"/><line x1="22" y1="26" x2="22" y2="40" stroke-width="2" opacity=".3"/><line x1="58" y1="26" x2="58" y2="40" stroke-width="2" opacity=".3"/></svg></div>
    <p>还没有训练记录</p>
  </div>`;
}

function getBodyPartName(id) {
  const bp = BODY_PARTS.find(b => b.id === id);
  return bp ? bp.name : id;
}
