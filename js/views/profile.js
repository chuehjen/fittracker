// ===== Profile View =====
// Stats, charts, AI weekly report, data management, AI config

import { aiWeeklyReport, getApiConfig, setApiConfig } from '../ai.js';
import { renderCharts } from '../charts.js';
import { calcVolume, fmtVol } from '../helpers.js';
import { doExport, doImport } from '../data.js';

export function renderProfile(container, S, stateChanged) {
  const totalTrainings = S.trainingRecords.length;
  const totalVolume = S.trainingRecords.reduce((t, r) => t + calcVolume(r.exercises), 0);
  const totalDuration = S.trainingRecords.reduce((t, r) => t + (r.duration || 0), 0);
  const report = aiWeeklyReport(S);
  const apiConfig = getApiConfig();

  container.innerHTML = `
    <div class="profile-header">
      <div class="avatar" id="avatarBtn">
        ${S.profile.avatar ? `<img src="${S.profile.avatar}">` : `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-7 8-7s8 3 8 7"/></svg>`}
        <input type="file" accept="image/*" id="avatarInput" style="display:none">
      </div>
      <div class="profile-info">
        <h2 id="profileNameDisplay">${S.profile.name || '点击设置昵称'}</h2>
        <p>坚持训练，超越自我</p>
      </div>
      <button class="btn btn-ghost btn-sm" id="editProfileBtn">编辑</button>
    </div>
    <div class="stat-grid">
      <div class="stat-card"><div class="stat-val">${totalTrainings}</div><div class="stat-label">总训练次数</div></div>
      <div class="stat-card"><div class="stat-val">${fmtVol(totalVolume)}</div><div class="stat-label">总训练量 (kg)</div></div>
      <div class="stat-card"><div class="stat-val">${Math.round(totalDuration / 3600)}</div><div class="stat-label">总时长 (h)</div></div>
    </div>
    <div class="ai-card">
      <div class="ai-header"><svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1l1.5 3.5L13 6l-3.5 1.5L8 11 6.5 7.5 3 6l3.5-1.5L8 1z"/></svg> ${report.title}</div>
      <div class="ai-body">${report.body}</div>
    </div>

    <!-- AI Config Section -->
    <div class="ai-config-card">
      <h4><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg> AI 智能增强</h4>
      <p>填入 Claude API Key 启用真正的 AI 训练建议和饮食分析（可选）</p>
      <div class="flex-between mb-8">
        <span class="ai-status ${apiConfig.enabled ? 'online' : 'offline'}">
          <span class="ai-status-dot"></span>
          ${apiConfig.enabled ? 'AI 已启用' : '规则引擎'}
        </span>
      </div>
      <div class="input-group" style="margin-bottom:8px">
        <input type="password" class="input-field" id="apiKeyInput" placeholder="sk-ant-..." value="${apiConfig.apiKey || ''}" style="font-size:12px">
      </div>
      <button class="btn btn-sm ${apiConfig.enabled ? 'btn-primary' : 'btn-outline'}" id="toggleApiBtn" style="width:100%">
        ${apiConfig.enabled ? '停用 AI' : '启用 AI'}
      </button>
    </div>

    <!-- Charts -->
    <div id="charts">
      <div class="chart-container"><h3>体重/体脂趋势</h3><div class="chart-wrap"><canvas id="weightChart"></canvas></div><div class="chart-fallback" id="weightFallback" style="display:none">数据不足以显示图表</div></div>
      <div class="chart-container"><h3>训练频次</h3><div class="chart-wrap"><canvas id="freqChart"></canvas></div></div>
      <div class="chart-container"><h3>部位训练分布</h3><div class="chart-wrap" style="height:240px"><canvas id="distChart"></canvas></div></div>
      <div class="chart-container">
        <div class="flex-between mb-8"><h3 style="margin:0">动作进步曲线</h3>
          <select class="input-field" id="progressSelect" style="width:auto;padding:6px 10px;font-size:13px">${getExerciseOptions(S)}</select>
        </div>
        <div class="chart-wrap"><canvas id="progressChart"></canvas></div>
        <div class="chart-fallback" id="progressFallback" style="display:none">选择动作查看进步曲线</div>
      </div>
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

  // Avatar
  container.querySelector('#avatarBtn').addEventListener('click', () => container.querySelector('#avatarInput').click());
  container.querySelector('#avatarInput').addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => { S.profile.avatar = ev.target.result; stateChanged(); };
    reader.readAsDataURL(file);
  });

  // Edit profile
  container.querySelector('#editProfileBtn').addEventListener('click', () => {
    showProfileModal(S, stateChanged);
  });

  // AI config
  container.querySelector('#toggleApiBtn').addEventListener('click', () => {
    const apiKey = container.querySelector('#apiKeyInput').value.trim();
    if (!apiKey || apiKey.length <= 5) {
      setApiConfig({ apiKey: '', enabled: false, model: 'claude-sonnet-4-6-20250514' });
    } else {
      setApiConfig({ apiKey, enabled: !apiConfig.enabled, model: 'claude-sonnet-4-6-20250514' });
    }
    stateChanged();
  });

  // Charts
  setTimeout(() => renderCharts(container, S), 100);

  // Export/Import
  container.querySelector('#btnExport').addEventListener('click', () => doExport(S));
  container.querySelector('#importFile').addEventListener('change', e => doImport(e.target.files[0], S, stateChanged));
}

function showProfileModal(S, stateChanged) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `<div class="modal">
    <div class="modal-handle"></div>
    <h3>编辑个人信息</h3>
    <div class="input-group"><label>昵称</label><input class="input-field" id="editName" value="${S.profile.name || ''}" placeholder="输入你的昵称"></div>
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

function getExerciseOptions(S) {
  const allEx = new Set();
  S.trainingRecords.forEach(r => r.exercises.forEach(ex => allEx.add(ex.name)));
  if (allEx.size === 0) return '<option value="">无数据</option>';
  return [...allEx].map(e => `<option value="${e}">${e}</option>`).join('');
}
