// ===== Achievement System =====
// 8 achievement badges with SVG icons (replacing emoji)

const ALL_BODY_PARTS = ['chest', 'back', 'legs', 'shoulders', 'arms', 'core'];

const ACH_SVG = {
  first_train: `<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="17,4 10,18 17,18 15,28 22,14 15,14"/></svg>`,
  train_3days: `<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 28c0-6 4-10 4-16"/><path d="M20 28c0-6-4-10-4-16"/><path d="M8 28h16"/><path d="M13 16c-1-3-1-5 0-7"/><path d="M19 16c1-3 1-5 0-7"/></svg>`,
  train_7days: `<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="16" cy="16" r="12"/><circle cx="16" cy="16" r="6"/><circle cx="16" cy="16" r="1.5" fill="currentColor"/></svg>`,
  train_30days: `<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 26l4-8 4 4 4-10 4 6 4-4"/><path d="M6 26h20"/><circle cx="10" cy="10" r="2" fill="none"/><path d="M10 12v4"/><path d="M8 12h4"/></svg>`,
  total_10: `<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 8h16v8c0 5-4 8-8 12-4-4-8-7-8-12V8z"/><path d="M12 8V6a4 4 0 018 0v2"/><line x1="16" y1="28" x2="16" y2="22"/></svg>`,
  total_50: `<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="16" cy="18" r="8"/><path d="M12 10V6h8v4"/><path d="M12 10H8l-1-3"/><path d="M20 10h4l1-3"/><path d="M16 26v2"/><circle cx="16" cy="18" r="3" opacity=".3"/></svg>`,
  volume_100k: `<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 28l8-12 4 4 8-12 4 6"/><path d="M4 28h24"/><path d="M12 16l2-2 4 4"/></svg>`,
  all_parts: `<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4l-2 4H6v20h20V8H18l-2-4z"/><path d="M12 28V18h8v10"/><path d="M6 8h20"/></svg>`
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
