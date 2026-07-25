// ===== Data Management =====
// Import/export logic shared across views

import { getState, setState } from './db.js';
import { today } from './helpers.js';
import { showConfirm } from './toast.js';

export function doExport(S) {
  const data = {
    version: 2,
    exportedAt: new Date().toISOString(),
    profile: S.profile,
    trainingRecords: S.trainingRecords,
    weightRecords: S.weightRecords || [],
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
  reader.onload = async (ev) => {
    try {
      const data = JSON.parse(ev.target.result);
      const ok = await showConfirm('导入数据将覆盖当前所有记录，确定继续？', { confirm: '导入', danger: true });
      if (ok) {
        S.profile = data.profile || {};
        S.trainingRecords = data.trainingRecords || [];
        S.weightRecords = data.weightRecords || (data.bodyRecords || []).filter(r => r.weight);
        S.customExercises = data.customExercises || [];
        S.restSeconds = data.restSeconds || 90;
        stateChanged();
      }
    } catch (err) {
      await showConfirm('文件格式错误，请检查后重试', { confirm: '知道了', cancel: '关闭' });
    }
  };
  reader.readAsText(file);
}
