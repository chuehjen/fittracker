// ===== Achievement System =====
// 8 achievement badges with SVG icons (replacing emoji)

const ALL_BODY_PARTS = ['chest', 'back', 'legs', 'shoulders', 'arms', 'core'];

const ACH_SVG = {
  first_train: `<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="16" cy="16" r="12"/><circle cx="16" cy="16" r="4" fill="currentColor" opacity=".3"/><line x1="16" y1="4" x2="16" y2="8"/><line x1="16" y1="24" x2="16" y2="28"/></svg>`,
  train_3days: `<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4v6l-4-2M16 4v6l4-2"/><path d="M10 8h12l2 18H8l2-18z"/><line x1="12" y1="14" x2="20" y2="14"/></svg>`,
  train_7days: `<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4L4 12l12 8 12-8-12-8z"/><path d="M4 20l12 8 12-8"/><path d="M4 16l12 8 12-8"/></svg>`,
  train_30days: `<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4l3 9h10l-8 6 3 9-8-6-8 6 3-9-8-6h10z"/></svg>`,
  total_10: `<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 16h6l-4 8"/><path d="M26 16h-6l4 8"/><path d="M12 16h8"/><circle cx="16" cy="10" r="6" opacity=".3"/><path d="M12 26h8"/></svg>`,
  total_50: `<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="8" width="20" height="18" rx="3"/><path d="M10 16h4l-3 6"/><path d="M22 16h-4l3 6"/><line x1="16" y1="8" x2="16" y2="4"/></svg>`,
  volume_100k: `<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4v12"/><path d="M16 16l-6 12"/><path d="M16 16l6 12"/><path d="M6 28h20"/><path d="M10 22h12"/></svg>`,
  all_parts: `<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="16" cy="10" r="4"/><path d="M16 14v8"/><path d="M12 18l4-4 4 4"/><path d="M12 22l4 4 4-4"/><path d="M16 26v2"/></svg>`
};

export const ACHIEVEMENTS = [
  { id: 'first_train', name: '初出茅庐', desc: '完成第一次训练', icon: ACH_SVG.first_train },
  { id: 'train_3days', name: '三日新秀', desc: '连续训练 3 天', icon: ACH_SVG.train_3days },
  { id: 'train_7days', name: '一周战士', desc: '连续训练 7 天', icon: ACH_SVG.train_7days },
  { id: 'train_30days', name: '月度传奇', desc: '连续训练 30 天', icon: ACH_SVG.train_30days },
  { id: 'total_10', name: '十次突破', desc: '累计完成 10 次训练', icon: ACH_SVG.total_10 },
  { id: 'total_50', name: '五十强者', desc: '累计完成 50 次训练', icon: ACH_SVG.total_50 },
  { id: 'volume_100k', name: '百吨勇士', desc: '单次训练量突破 100 吨', icon: ACH_SVG.volume_100k },
  { id: 'all_parts', name: '全面发展', desc: '六大肌群都有训练记录', icon: ACH_SVG.all_parts }
];

export function checkConsecutiveDays(records, days) {
  if (records.length < days) return false;
  const dates = [...records].map(r => r.date).sort().reverse();
  let consecutive = 1;
  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1]), curr = new Date(dates[i]);
    const diff = (prev - curr) / (1000 * 60 * 60 * 24);
    if (diff === 1) consecutive++; else if (diff > 1) break;
  }
  return consecutive >= days;
}

export function calcVolume(exercises) {
  return exercises.reduce((t, ex) => t + ex.sets.reduce((st, s) => st + s.weight * s.reps, 0), 0);
}

export function getUnlockedAchievements(state) {
  const unlocked = [];
  const recs = state.trainingRecords || [];

  for (const ach of ACHIEVEMENTS) {
    switch (ach.id) {
      case 'first_train':
        if (recs.length >= 1) unlocked.push(ach.id);
        break;
      case 'train_3days':
        if (checkConsecutiveDays(recs, 3)) unlocked.push(ach.id);
        break;
      case 'train_7days':
        if (checkConsecutiveDays(recs, 7)) unlocked.push(ach.id);
        break;
      case 'train_30days':
        if (checkConsecutiveDays(recs, 30)) unlocked.push(ach.id);
        break;
      case 'total_10':
        if (recs.length >= 10) unlocked.push(ach.id);
        break;
      case 'total_50':
        if (recs.length >= 50) unlocked.push(ach.id);
        break;
      case 'volume_100k':
        if (recs.some(r => calcVolume(r.exercises) >= 100000)) unlocked.push(ach.id);
        break;
      case 'all_parts':
        if (ALL_BODY_PARTS.every(bp => recs.some(r => r.bodyPart === bp))) unlocked.push(ach.id);
        break;
    }
  }
  return unlocked;
}

export function saveAchievements(unlockedIds) {
  try { localStorage.setItem('fittracker_achievements', JSON.stringify(unlockedIds)); } catch (e) {}
}

export function loadAchievements() {
  try {
    const data = localStorage.getItem('fittracker_achievements');
    return data ? JSON.parse(data) : [];
  } catch (e) { return []; }
}

export { ACH_SVG };
