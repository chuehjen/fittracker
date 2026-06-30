// ===== Charts Module =====
// Chart.js wrapper — dynamically loads CDN on first render

import { BODY_PARTS } from './exercises.js';
import { fmtDate } from './helpers.js';

const chartInstances = {};
let chartLoaded = false;
let chartLoading = false;

async function ensureChart() {
  if (chartLoaded) return true;
  if (chartLoading) {
    while (chartLoading && typeof Chart === 'undefined') {
      await new Promise(r => setTimeout(r, 50));
    }
    return !!chartLoaded;
  }
  chartLoading = true;
  try {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js';
    await new Promise((resolve, reject) => {
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
    chartLoaded = true;
    return true;
  } catch (e) {
    console.warn('[Charts] Failed to load Chart.js:', e);
    return false;
  } finally {
    chartLoading = false;
  }
}

export async function renderCharts(container, S) {
  const ok = await ensureChart();
  if (!ok) return;

  renderFreqChart(container, S);
  renderDistChart(container, S);
  renderProgressChart(container, S);
}

function destroyChart(id) {
  if (chartInstances[id]) {
    chartInstances[id].destroy();
    delete chartInstances[id];
  }
}

function storeChart(id, chart) {
  chartInstances[id] = chart;
}

function renderFreqChart(container, S) {
  const canvas = container.querySelector('#freqChart');
  if (!canvas) return;
  destroyChart('freq');

  const last7Days = [...Array(7)].map((_, i) => {
    const d = new Date(); d.setDate(d.getDate() - i); return d.toISOString().slice(0, 10);
  }).reverse();
  const freqData = last7Days.map(date => (S.trainingRecords || []).filter(r => r.date === date).length);

  const chart = new Chart(canvas.getContext('2d'), {
    type: 'bar',
    data: {
      labels: last7Days.map(d => { const p = d.split('-'); return `${p[1]}/${p[2]}`; }),
      datasets: [{
        label: '训练次数',
        data: freqData,
        backgroundColor: 'rgba(50,205,50,.5)',
        borderRadius: 4
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { color: '#888' } },
        y: { grid: { color: 'rgba(42,42,42,.6)' }, ticks: { color: '#888' }, beginAtZero: true }
      }
    }
  });
  storeChart('freq', chart);
}

function renderDistChart(container, S) {
  const canvas = container.querySelector('#distChart');
  if (!canvas) return;
  destroyChart('dist');

  const partDist = BODY_PARTS.map(bp => ({
    name: bp.name,
    count: (S.trainingRecords || []).filter(r => r.bodyPart === bp.id).length
  }));

  const chart = new Chart(canvas.getContext('2d'), {
    type: 'doughnut',
    data: {
      labels: partDist.map(p => p.name),
      datasets: [{
        data: partDist.map(p => p.count),
        backgroundColor: BODY_PARTS.map(bp => bp.color)
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false, cutout: '60%',
      plugins: { legend: { position: 'right', labels: { color: '#888' } } }
    }
  });
  storeChart('dist', chart);
}

function renderProgressChart(container, S) {
  const canvas = container.querySelector('#progressChart');
  if (!canvas) return;
  destroyChart('progress');

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

  const exRecords = (S.trainingRecords || [])
    .filter(r => r.exercises.some(ex => ex.name === selectedEx))
    .sort((a, b) => a.date.localeCompare(b.date));

  const progressData = exRecords.map(r => {
    const ex = r.exercises.find(e => e.name === selectedEx);
    return ex ? Math.max(...ex.sets.map(s => s.weight)) : 0;
  });

  const chart = new Chart(canvas.getContext('2d'), {
    type: 'line',
    data: {
      labels: exRecords.map(d => fmtDate(d.date)),
      datasets: [{
        label: selectedEx + ' PR',
        data: progressData,
        borderColor: '#32CD32',
        backgroundColor: 'rgba(50,205,50,.1)',
        tension: .4,
        fill: true
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color: 'rgba(42,42,42,.6)' }, ticks: { color: '#888' } },
        y: { grid: { color: 'rgba(42,42,42,.6)' }, ticks: { color: '#888' } }
      }
    }
  });
  storeChart('progress', chart);

  select.addEventListener('change', () => {
    setTimeout(() => renderCharts(container, S), 50);
  });
}
