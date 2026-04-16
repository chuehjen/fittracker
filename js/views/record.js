// ===== Record View =====
// Body weight, body fat, diet logging + edit support

import { aiDietFeedback } from '../ai.js';

export function renderRecord(container, S, stateChanged) {
  const recent = S.bodyRecords.slice(-5).reverse();

  container.innerHTML = `
    <div class="section-title" style="font-size:22px;margin-bottom:4px">记录</div>
    <p class="text-muted mb-16">体重 · 体脂 · 饮食</p>
    <div class="card" id="recordFormCard">
      <div class="input-group"><label>日期</label><input type="date" class="input-field" id="recDate" value="${today()}"></div>
      <div style="display:flex;gap:12px">
        <div class="input-group" style="flex:1"><label>体重 (kg)</label><input type="number" class="input-field" id="recWeight" placeholder="如 75.5" inputmode="decimal" step="0.1"></div>
        <div class="input-group" style="flex:1"><label>体脂 (%)</label><input type="number" class="input-field" id="recFat" placeholder="如 15.0" inputmode="decimal" step="0.1"></div>
      </div>
      <div class="input-group"><label>饮食补给</label><textarea class="input-field" id="recDiet" placeholder="训练后的补给，如：蛋白粉一杯、鸡胸肉 200g..." style="min-height:60px"></textarea></div>
      <button class="btn btn-primary btn-block" id="btnSaveRecord">保存记录</button>
    </div>
    <div id="dietFeedback">${S.lastDietFeedback ? `<div class="ai-card"><div class="ai-header"><svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1l1.5 3.5L13 6l-3.5 1.5L8 11 6.5 7.5 3 6l3.5-1.5L8 1z"/></svg> 饮食点评</div><div class="ai-body">${S.lastDietFeedback}</div></div>` : ''}</div>
    ${recent.length > 0 ? `
      <div class="section-title" style="font-size:15px;margin-top:20px">最近记录</div>
      ${recent.map(r => `
        <div class="card" style="padding:12px 14px">
          <div class="flex-between">
            <span class="text-sm fw-700">${fmtDate(r.date)}</span>
            <div style="display:flex;gap:8px;align-items:center">
              ${r.weight ? `<span class="badge badge-accent">${r.weight}kg</span>` : ''}
              ${r.bodyFat ? `<span class="badge badge-warn">${r.bodyFat}%</span>` : ''}
              <button class="btn-ghost btn-sm edit-record-btn" data-id="${r.id}" style="padding:2px 6px;color:var(--acc)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
              <button class="btn-ghost btn-sm del-record-btn" data-id="${r.id}" style="padding:2px 6px;color:var(--err)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
              </button>
            </div>
          </div>
          ${r.diet ? `<div class="text-xs text-muted mt-8">${r.diet}</div>` : ''}
        </div>
      `).join('')}
    ` : ''}
  `;

  container.querySelector('#btnSaveRecord').addEventListener('click', () => {
    const date = container.querySelector('#recDate').value;
    const weight = parseFloat(container.querySelector('#recWeight').value) || null;
    const bodyFat = parseFloat(container.querySelector('#recFat').value) || null;
    const diet = container.querySelector('#recDiet').value.trim();
    if (!weight && !bodyFat && !diet) { alert('请至少填写一项'); return; }
    const rec = { id: genId(), date, weight, bodyFat, diet };
    S.bodyRecords.push(rec);
    const feedback = aiDietFeedback(rec, S);
    S.lastDietFeedback = feedback || '';
    stateChanged();
  });

  // Delete buttons
  container.querySelectorAll('.del-record-btn').forEach(btn => btn.addEventListener('click', () => {
    if (!confirm('确定删除？')) return;
    S.bodyRecords = S.bodyRecords.filter(r => r.id !== btn.dataset.id);
    stateChanged();
  }));

  // Edit buttons
  container.querySelectorAll('.edit-record-btn').forEach(btn => btn.addEventListener('click', () => {
    const rec = S.bodyRecords.find(r => r.id === btn.dataset.id);
    if (!rec) return;
    showEditRecordModal(rec, S, stateChanged);
  }));
}

function showEditRecordModal(rec, S, stateChanged) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `<div class="modal">
    <div class="modal-handle"></div>
    <h3>编辑记录</h3>
    <div class="input-group"><label>日期</label><input type="date" class="input-field" id="editRecDate" value="${rec.date}"></div>
    <div style="display:flex;gap:12px">
      <div class="input-group" style="flex:1"><label>体重 (kg)</label><input type="number" class="input-field" id="editRecWeight" placeholder="如 75.5" inputmode="decimal" step="0.1" value="${rec.weight || ''}"></div>
      <div class="input-group" style="flex:1"><label>体脂 (%)</label><input type="number" class="input-field" id="editRecFat" placeholder="如 15.0" inputmode="decimal" step="0.1" value="${rec.bodyFat || ''}"></div>
    </div>
    <div class="input-group"><label>饮食补给</label><textarea class="input-field" id="editRecDiet" placeholder="训练后的补给..." style="min-height:60px">${rec.diet || ''}</textarea></div>
    <div style="display:flex;gap:8px">
      <button class="btn btn-ghost" style="flex:1" id="cancelEditRec">取消</button>
      <button class="btn btn-primary" style="flex:1" id="saveEditRec">保存</button>
    </div>
  </div>`;
  document.body.appendChild(overlay);

  overlay.querySelector('#cancelEditRec').addEventListener('click', () => overlay.remove());
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
  overlay.querySelector('#saveEditRec').addEventListener('click', () => {
    rec.date = overlay.querySelector('#editRecDate').value;
    rec.weight = parseFloat(overlay.querySelector('#editRecWeight').value) || null;
    rec.bodyFat = parseFloat(overlay.querySelector('#editRecFat').value) || null;
    rec.diet = overlay.querySelector('#editRecDiet').value.trim();
    overlay.remove();
    stateChanged();
  });
}

const today = () => new Date().toISOString().slice(0, 10);
const fmtDate = d => { const p = d.split('-'); return `${p[1]}月${p[2]}日`; };
const genId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
