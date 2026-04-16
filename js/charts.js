// ===== Charts Module =====
// Chart.js wrapper with fallback for CDN failure

import { BODY_PARTS } from './exercises.js';

export function renderCharts(container, S) {
  const chartLoadFailed = window._chartLoadFailed;

  if (chartLoadFailed || typeof Chart === 'undefined') {
    // Fallback: show text stats instead of charts
    showChartFallback(container, S);
    return;
  }

  renderWeightChart(container, S);
  renderFreqChart(container, S);
  renderDistChart(container, S);
  renderProgressChart(container, S);
}

function renderWeightChart(container, S) {
  const canvas = container.querySelector('#weightChart');
  if (!canvas) return;

  const weightData = (S.bodyRecords || []).filter(r => r.weight).sort((a, b) => a.date.localeCompare(b.date));
  const fallback = container.querySelector('#weightFallback');

  if (weightData.length === 0) {
    canvas.style.display = 'none';
    if (fallback) fallback.style.display = 'block';
    return;
  }

  if (fallback) fallback.style.display = 'none';
  canvas.style.display = 'block';

  new Chart(canvas.getContext('2d'), {
    type: 'line',
    data: {
      labels: weightData.map(d => fmtDate(d.date)),
      datasets: [{
        label: '体重 (kg)',
        data: weightData.map(d => d.weight),
        borderColor: '#00f3ff',
        backgroundColor: 'rgba(0,243,255,.1)',
        tension: .4,
        fill: true
      }]
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { color: 'rgba(34,51,68,.5)' }, ticks: { color: '#8899aa' } }, y: { grid: { color: 'rgba(34,51,68,.5)' }, ticks: { color: '#8899aa' } } } }
  });
}

function renderFreqChart(container, S) {
  const canvas = container.querySelector('#freqChart');
  if (!canvas) return;

  const last7Days = [...Array(7)].map((_, i) => {
    const d = new Date(); d.setDate(d.getDate() - i); return d.toISOString().slice(0, 10);
  }).reverse();
  const freqData = last7Days.map(date => (S.trainingRecords || []).filter(r => r.date === date).length);

  new Chart(canvas.getContext('2d'), {
    type: 'bar',
    data: {
      labels: last7Days.map(d => { const p = d.split('-'); return `${p[1]}/${p[2]}`; }),
      datasets: [{
        label: '训练次数',
        data: freqData,
        backgroundColor: 'rgba(0,243,255,.5)',
        borderRadius: 4
      }]
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false }, ticks: { color: '#8899aa' } }, y: { grid: { color: 'rgba(34,51,68,.5)' }, ticks: { color: '#8899aa' }, beginAtZero: true } } }
  });
}

function renderDistChart(container, S) {
  const canvas = container.querySelector('#distChart');
  if (!canvas) return;

  const partDist = BODY_PARTS.map(bp => ({
    name: bp.name,
    count: (S.trainingRecords || []).filter(r => r.bodyPart === bp.id).length
  }));

  new Chart(canvas.getContext('2d'), {
    type: 'doughnut',
    data: {
      labels: partDist.map(p => p.name),
      datasets: [{
        data: partDist.map(p => p.count),
        backgroundColor: ['#00f3ff', '#00ff88', '#ffcc00', '#ff3366', '#a78bfa', '#fb923c']
      }]
    },
    options: { responsive: true, maintainAspectRatio: false, cutout: '60%', plugins: { legend: { position: 'right', labels: { color: '#8899aa' } } } }
  });
}

function renderProgressChart(container, S) {
  const canvas = container.querySelector('#progressChart');
  if (!canvas) return;

  const select = container.querySelector('#progressSelect');
  if (!select) return;

  const selectedEx = select.value;
  const fallback = container.querySelector('#progressFallback');

  if (!selectedEx) {
    canvas.style.display = 'none';
    if (fallback) fallback.style.display = 'block';
    return;
  }

  if (fallback) fallback.style.display = 'none';
  canvas.style.display = 'block';

  const exRecords = (S.trainingRecords || []).filter(r => r.exercises.some(ex => ex.name === selectedEx)).sort((a, b) => a.date.localeCompare(b.date));
  const progressData = exRecords.map(r => {
    const ex = r.exercises.find(e => e.name === selectedEx);
    return ex ? Math.max(...ex.sets.map(s => s.weight)) : 0;
  });

  new Chart(canvas.getContext('2d'), {
    type: 'line',
    data: {
      labels: exRecords.map(d => fmtDate(d.date)),
      datasets: [{
        label: selectedEx + ' PR',
        data: progressData,
        borderColor: '#00ff88',
        backgroundColor: 'rgba(0,255,136,.1)',
        tension: .4,
        fill: true
      }]
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { color: 'rgba(34,51,68,.5)' }, ticks: { color: '#8899aa' } }, y: { grid: { color: 'rgba(34,51,68,.5)' }, ticks: { color: '#8899aa' } } } }
  });

  select.addEventListener('change', () => {
    setTimeout(() => renderCharts(container, S), 50);
  });
}

function showChartFallback(container, S) {
  const weightData = (S.bodyRecords || []).filter(r => r.weight);
  const totalTrainings = (S.trainingRecords || []).length;
  const totalVolume = S.trainingRecords.reduce((t, r) => t + calcVolume(r.exercises), 0);

  ['weightChart', 'freqChart', 'distChart', 'progressChart'].forEach(id => {
    const el = container.querySelector(`#${id}`);
    if (el) {
      const wrap = el.parentElement;
      el.style.display = 'none';
      const fb = document.createElement('div');
      fb.className = 'chart-fallback';
      fb.innerHTML = `<div style="margin-top:8px">
        ${id === 'weightChart' ? `体重记录: ${weightData.length} 条` : ''}
        ${id === 'freqChart' ? `总训练次数: ${totalTrainings}` : ''}
        ${id === 'distChart' ? `总训练量: ${fmtVol(totalVolume)} kg` : ''}
        ${id === 'progressChart' ? `图表需 Chart.js 加载` : ''}
      </div>`;
      wrap.appendChild(fb);
    }
  });
}

function fmtDate(d) { const p = d.split('-'); return `${p[1]}月${p[2]}日`; }

function calcVolume(exercises) {
  return exercises.reduce((t, ex) => t + ex.sets.reduce((st, s) => st + s.weight * s.reps, 0), 0);
}

function fmtVol(v) {
  if (v === 0) return '0';
  if (v >= 10000) return (v / 1000).toFixed(0) + 'k';
  if (v >= 1000) return (v / 1000).toFixed(1) + 'k';
  return Math.round(v).toString();
}
