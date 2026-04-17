// ===== Data Management =====
// Import/export logic shared across views

import { getState, setState } from './db.js';
import { today } from './helpers.js';

export function doExport(S) {
  const data = {
    version: 2,
    exportedAt: new Date().toISOString(),
    profile: S.profile,
    trainingRecords: S.trainingRecords,
    bodyRecords: S.bodyRecords,
    customExercises: S.customExercises,
    restSeconds: S.restSeconds,
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `fittracker_backup_${today()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function doImport(file, S, stateChanged) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    try {
      const data = JSON.parse(ev.target.result);
      if (confirm('导入数据将覆盖当前所有记录，确定继续？')) {
        S.profile = data.profile || {};
        S.trainingRecords = data.trainingRecords || [];
        S.bodyRecords = data.bodyRecords || [];
        S.customExercises = data.customExercises || [];
        S.restSeconds = data.restSeconds || 90;
        stateChanged();
        alert('导入成功！');
      }
    } catch (err) {
      alert('文件格式错误');
    }
  };
  reader.readAsText(file);
}
