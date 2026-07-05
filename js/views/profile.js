// ===== Profile View =====
// Stats, AI weekly report, data management, cloud sync

import { aiWeeklyReport } from '../ai.js';
import { renderCharts } from '../charts.js';
import { doExport, doImport } from '../data.js';

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function showToast(msg, type = 'ok') {
  const existing = document.getElementById('profileToast');
  if (existing) existing.remove();
  const colors = { ok: 'var(--ok)', err: 'var(--err)', warn: 'var(--warn)' };
  const toast = document.createElement('div');
  toast.id = 'profileToast';
  toast.textContent = msg;
  toast.style.cssText = `
    position:fixed;bottom:calc(var(--tab-h) + 16px);left:50%;transform:translateX(-50%);
    background:var(--card);border:1px solid ${colors[type] || 'var(--bd)'};
    color:${colors[type] || 'var(--t1)'};padding:10px 20px;border-radius:var(--r-f);
    font-size:13px;font-weight:500;z-index:999;white-space:nowrap;
    box-shadow:0 4px 20px rgba(0,0,0,.4);animation:fadeIn .2s ease;
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

export function renderProfile(container, S, stateChanged) {
  const totalTrainings = S.trainingRecords.length;
  const totalDuration = S.trainingRecords.reduce((t, r) => t + (r.duration || 0), 0);
  const isEmpty = totalTrainings === 0;
  const report = aiWeeklyReport(S);

  container.innerHTML = `
    <div class="profile-header">
      <div class="avatar" id="avatarBtn">
        ${S.profile.avatar ? `<img src="${S.profile.avatar}">` : `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-7 8-7s8 3 8 7"/></svg>`}
        <input type="file" accept="image/*" id="avatarInput" style="display:none">
      </div>
      <div class="profile-info">
        <h2 id="profileNameDisplay">${escapeHtml(S.profile.name || '点击设置昵称')}</h2>
        <p>坚持训练，超越自我</p>
      </div>
      <button class="btn btn-ghost btn-sm" id="editProfileBtn">编辑</button>
    </div>
    ${isEmpty ? `
    <div class="card" style="text-align:center;padding:24px 16px;border:1.5px dashed var(--bd2)">
      <div style="font-size:32px;margin-bottom:8px">🏋️</div>
      <div style="font-weight:700;margin-bottom:4px">还没有训练记录</div>
      <div style="font-size:13px;color:var(--t2)">点击「训练」开始你的第一次记录</div>
    </div>` : `
    <div class="stat-grid" style="grid-template-columns:1fr 1fr">
      <div class="stat-card"><div class="stat-val">${totalTrainings}</div><div class="stat-label">总训练次数</div></div>
      <div class="stat-card"><div class="stat-val">${Math.round(totalDuration / 3600)}</div><div class="stat-label">总时长 (h)</div></div>
    </div>`}
    <div class="ai-card">
      <div class="ai-header"><svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1l1.5 3.5L13 6l-3.5 1.5L8 11 6.5 7.5 3 6l3.5-1.5L8 1z"/></svg> ${report.title}</div>
      <div class="ai-body">${report.body}</div>
    </div>

    <div class="sync-card">
      <h4><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z"/></svg> 云端同步</h4>
      ${renderSyncSection(S)}
    </div>

    <div id="charts">
      <div class="chart-container"><h3>部位训练分布</h3><div class="chart-wrap" style="height:240px"><canvas id="distChart"></canvas></div></div>
    </div>
    <div class="divider"></div>
    <div class="section-title" style="font-size:15px">数据管理</div>
    <div style="display:flex;gap:8px;margin-bottom:80px">
      <button class="btn btn-outline btn-sm" style="flex:1" id="btnExport">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg> 导出数据
      </button>
      <label class="btn btn-outline btn-sm" style="flex:1;cursor:pointer">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg> 导入数据
        <input type="file" accept=".json" id="importFile" style="display:none">
      </label>
    </div>
  `;

  container.querySelector('#avatarBtn').addEventListener('click', () => container.querySelector('#avatarInput').click());
  container.querySelector('#avatarInput').addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => { S.profile.avatar = ev.target.result; stateChanged(); };
    reader.readAsDataURL(file);
  });

  container.querySelector('#editProfileBtn').addEventListener('click', () => showProfileModal(S, stateChanged));

  setupSyncHandlers(container, S, stateChanged);

  setTimeout(() => renderCharts(container, S), 100);

  container.querySelector('#btnExport').addEventListener('click', () => doExport(S));
  container.querySelector('#importFile').addEventListener('change', e => doImport(e.target.files[0], S, stateChanged));
}

function renderSyncSection(S) {
  if (!S.user) {
    return `
      <p class="sync-desc">登录账号以云端同步你的数据</p>
      <div style="display:flex;gap:8px;margin-bottom:8px">
        <input class="input-field" id="loginEmail" placeholder="邮箱" type="email" style="flex:1">
        <button class="btn btn-sm btn-outline" id="sendMagicLinkBtn">发送登录链接</button>
      </div>
      <div class="sync-link-sent" id="linkSentMsg" style="display:none">
        <p style="font-size:12px;color:var(--t2)">✅ 已发送，请检查邮箱并点击确认链接完成登录</p>
        <p style="font-size:12px;color:var(--t3);margin-top:4px">如未自动登录，请刷新此页面</p>
      </div>
    `;
  }

  const syncLabel = S.syncStatus === 'idle' ? '已同步'
    : S.syncStatus === 'pushing' || S.syncStatus === 'pulling' ? '同步中...'
    : S.syncStatus === 'error' ? '同步失败'
    : '未登录';
  const syncColor = S.syncStatus === 'idle' ? '#32CD32'
    : S.syncStatus === 'pushing' || S.syncStatus === 'pulling' ? '#FFD700'
    : S.syncStatus === 'error' ? '#FF4444'
    : '#888';
  const syncTime = S.lastSyncTime ? new Date(S.lastSyncTime).toLocaleTimeString() : '从未';

  return `
    <div class="flex-between">
      <div>
        <div class="sync-email">${S.user.email}</div>
        <div class="sync-status" style="color:${syncColor}">
          <span class="sync-dot" style="background:${syncColor}"></span>
          ${syncLabel}
        </div>
        <div class="sync-time">上次同步: ${syncTime}</div>
      </div>
    </div>
    <div style="display:flex;gap:8px">
      <button class="btn btn-sm btn-outline" style="flex:1" id="manualSyncBtn">手动同步</button>
      <button class="btn btn-sm btn-ghost" style="flex:1" id="signOutBtn">登出</button>
    </div>
  `;
}

function setupSyncHandlers(container, S, stateChanged) {
  const sync = window._syncActions || {};

  const sendBtn = container.querySelector('#sendMagicLinkBtn');
  if (sendBtn) {
    sendBtn.addEventListener('click', async () => {
      const email = container.querySelector('#loginEmail').value.trim();
      if (!email) { showToast('请输入邮箱地址', 'warn'); return; }
      sendBtn.disabled = true;
      sendBtn.innerHTML = '<span class="btn-spinner"></span> 发送中...';
      try {
        await sync.sendMagicLink(email);
        const msg = container.querySelector('#linkSentMsg');
        if (msg) msg.style.display = 'block';
        sendBtn.textContent = '✅ 已发送';
        showToast('登录链接已发送，请检查邮箱', 'ok');
        if (typeof window._startAuthPolling === 'function') window._startAuthPolling();
      } catch (e) {
        sendBtn.disabled = false;
        sendBtn.textContent = '发送登录链接';
        const msg = e.message || '';
        showToast(msg.includes('rate limit') ? '发送太频繁，请稍后再试' : '发送失败: ' + msg, 'err');
      }
    });
  }

  const syncBtn = container.querySelector('#manualSyncBtn');
  if (syncBtn) syncBtn.addEventListener('click', () => sync.manualSync());

  const signOutBtn = container.querySelector('#signOutBtn');
  if (signOutBtn) signOutBtn.addEventListener('click', () => sync.signOut());
}

function showProfileModal(S, stateChanged) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `<div class="modal">
    <div class="modal-handle"></div>
    <h3>编辑个人信息</h3>
    <div class="input-group"><label>昵称</label><input class="input-field" id="editName" value="${escapeHtml(S.profile.name || '')}" placeholder="输入你的昵称"></div>
    <div style="display:flex;gap:8px">
      <button class="btn btn-ghost" style="flex:1" id="cancelEdit">取消</button>
      <button class="btn btn-primary" style="flex:1" id="saveEdit">保存</button>
    </div>
  </div>`;
  document.body.appendChild(overlay);
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
  overlay.querySelector('#cancelEdit').addEventListener('click', () => overlay.remove());
  overlay.querySelector('#saveEdit').addEventListener('click', () => {
    S.profile.name = overlay.querySelector('#editName').value.trim();
    overlay.remove();
    stateChanged();
  });
}
