// ===== Shared Helpers =====
// Common utility functions used across views

export const genId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

export const today = () => new Date().toISOString().slice(0, 10);

export function fmtDate(d) { const p = d.split('-'); return `${p[1]}月${p[2]}日`; }

export function fmtDateFull(d) { const p = d.split('-'); return `${p[0]}年${p[1]}月${p[2]}日`; }

export function fmtDuration(s) { const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60); return h > 0 ? `${h}小时${m}分钟` : `${m}分钟`; }

export function fmtTime(s) { const m = Math.floor(s / 60), sec = s % 60; return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`; }

export function fmtVol(v) { if (v === 0) return '0'; if (v >= 10000) return (v / 1000).toFixed(0) + 'k'; if (v >= 1000) return (v / 1000).toFixed(1) + 'k'; return Math.round(v).toString(); }

export function calcVolume(exercises) {
  return exercises.reduce((t, ex) => t + ex.sets.reduce((st, s) => st + s.weight * s.reps, 0), 0);
}
