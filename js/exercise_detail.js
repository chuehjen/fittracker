// ===== Exercise Detail Drawer =====
// Bottom sheet showing exercise demo images, muscle groups, and Chinese instructions.
// Data source: js/exercise_db.js (mapped from yuhonas/free-exercise-db)

import {
  getExerciseDetail,
  getMuscleLabel,
  getLevelLabel,
  getEquipmentLabel,
} from './exercise_db.js';
import { getSafetyCard } from './training_guidance.js';

function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function showExerciseDetailDrawer(name) {
  const detail = getExerciseDetail(name);
  if (!detail) return;
  const safetyCard = getSafetyCard(name);

  // Remove any existing drawer
  document.querySelectorAll('.ex-detail-overlay').forEach(el => el.remove());

  const overlay = document.createElement('div');
  overlay.className = 'ex-detail-overlay';

  const primary = (detail.muscles_primary || []).map(m => getMuscleLabel(m));
  const secondary = (detail.muscles_secondary || []).map(m => getMuscleLabel(m));
  const equipLabel = getEquipmentLabel(detail.equipment);
  const levelLabel = getLevelLabel(detail.level);
  const imgs = (detail.images || []).map(p => `img/exercises/${p}`);

  overlay.innerHTML = `
    <div class="ex-detail-sheet">
      <div class="ex-detail-handle"></div>
      <div class="ex-detail-header">
        <div class="ex-detail-title">${escapeHtml(name)}</div>
        <button class="ex-detail-close" aria-label="关闭">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>
      <div class="ex-detail-body">
        ${safetyCard ? `
          <section class="safety-card" aria-label="新手安全卡">
            <div class="safety-card-title">新手安全卡</div>
            <div class="safety-card-section">
              <strong>关键姿势</strong>
              <ul>${safetyCard.cues.map(cue => `<li>${escapeHtml(cue)}</li>`).join('')}</ul>
            </div>
            <div class="safety-card-section"><strong>常见错误</strong><p>${escapeHtml(safetyCard.commonMistake)}</p></div>
            <div class="safety-card-section safety-stop"><strong>立即停止</strong><p>${escapeHtml(safetyCard.stopSignal)}</p></div>
            <p class="safety-card-disclaimer">仅供训练参考，不替代医疗诊断或专业指导。</p>
          </section>
        ` : ''}
        ${imgs.length > 0 ? `
          <div class="ex-detail-image-wrap">
            <img class="ex-detail-image" src="${imgs[0]}" alt="${escapeHtml(name)}" loading="lazy" />
            ${imgs.length > 1 ? `
              <button class="ex-detail-nav ex-detail-nav-prev" aria-label="上一张">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M15 18l-6-6 6-6"/></svg>
              </button>
              <button class="ex-detail-nav ex-detail-nav-next" aria-label="下一张">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 18l6-6-6-6"/></svg>
              </button>
              <div class="ex-detail-dots">
                ${imgs.map((_, i) => `<span class="ex-detail-dot${i === 0 ? ' active' : ''}"></span>`).join('')}
              </div>
            ` : ''}
          </div>
        ` : ''}

        <div class="ex-detail-tags">
          ${equipLabel ? `<span class="ex-detail-tag">${escapeHtml(equipLabel)}</span>` : ''}
          ${levelLabel ? `<span class="ex-detail-tag">${escapeHtml(levelLabel)}</span>` : ''}
        </div>

        ${primary.length > 0 ? `
          <div class="ex-detail-section-label">主要肌群</div>
          <div class="ex-detail-chips">
            ${primary.map(m => `<span class="ex-detail-chip ex-detail-chip-primary">${escapeHtml(m)}</span>`).join('')}
          </div>
        ` : ''}

        ${secondary.length > 0 ? `
          <div class="ex-detail-section-label">协同肌群</div>
          <div class="ex-detail-chips">
            ${secondary.map(m => `<span class="ex-detail-chip">${escapeHtml(m)}</span>`).join('')}
          </div>
        ` : ''}

        ${(detail.steps && detail.steps.length > 0) ? `
          <div class="ex-detail-section-label">动作步骤</div>
          <ol class="ex-detail-steps">
            ${detail.steps.map(s => `<li>${escapeHtml(s)}</li>`).join('')}
          </ol>
        ` : ''}
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  // Trigger enter animation on next frame
  requestAnimationFrame(() => overlay.classList.add('is-open'));

  // Image carousel state
  let idx = 0;
  const imgEl = overlay.querySelector('.ex-detail-image');
  const dots = overlay.querySelectorAll('.ex-detail-dot');
  function setImg(i) {
    if (!imgs.length) return;
    idx = (i + imgs.length) % imgs.length;
    if (imgEl) imgEl.src = imgs[idx];
    dots.forEach((d, di) => d.classList.toggle('active', di === idx));
  }
  overlay.querySelector('.ex-detail-nav-prev')?.addEventListener('click', () => setImg(idx - 1));
  overlay.querySelector('.ex-detail-nav-next')?.addEventListener('click', () => setImg(idx + 1));
  // Also tap image to advance
  imgEl?.addEventListener('click', () => setImg(idx + 1));

  function close() {
    overlay.classList.remove('is-open');
    overlay.classList.add('is-closing');
    setTimeout(() => overlay.remove(), 200);
    document.removeEventListener('keydown', onEsc);
  }

  function onEsc(e) {
    if (e.key === 'Escape') close();
  }

  overlay.querySelector('.ex-detail-close').addEventListener('click', close);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });
  document.addEventListener('keydown', onEsc);
}
