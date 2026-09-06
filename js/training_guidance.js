// ===== Training Guidance =====
// Offline-first helpers for templates, conservative progression, and form safety.

import { getExerciseDetail as getExerciseDetailData } from './exercise_db.js';

export const TRAINING_TEMPLATES = [
  {
    id: 'beginner-full-body-a',
    name: '新手全身 A',
    description: '第一次器械训练，从稳定、易上手的动作开始。',
    duration: '约 30–40 分钟',
    primaryBodyPart: 'legs',
    exercises: [
      { name: '腿举机', type: 'machine', bodyPart: 'legs' },
      { name: '器械推胸', type: 'machine', bodyPart: 'chest' },
      { name: '高位下拉', type: 'machine', bodyPart: 'back' },
      { name: '平板支撑', type: 'free', bodyPart: 'core' },
    ],
  },
  {
    id: 'beginner-full-body-b',
    name: '新手全身 B',
    description: '和全身 A 交替，练习不同的基础动作模式。',
    duration: '约 30–40 分钟',
    primaryBodyPart: 'legs',
    exercises: [
      { name: '史密斯深蹲', type: 'machine', bodyPart: 'legs' },
      { name: '坐姿划船', type: 'machine', bodyPart: 'back' },
      { name: '器械肩推', type: 'machine', bodyPart: 'shoulders' },
      { name: '死虫式', type: 'free', bodyPart: 'core' },
    ],
  },
  {
    id: 'beginner-upper-machine',
    name: '上肢器械入门',
    description: '时间有限时的上肢基础训练，优先稳定与动作控制。',
    duration: '约 25–35 分钟',
    primaryBodyPart: 'chest',
    exercises: [
      { name: '器械推胸', type: 'machine', bodyPart: 'chest' },
      { name: '高位下拉', type: 'machine', bodyPart: 'back' },
      { name: '器械肩推', type: 'machine', bodyPart: 'shoulders' },
      { name: '绳索下压', type: 'machine', bodyPart: 'arms' },
    ],
  },
];

export function getLastExercisePerformance(records, exerciseName) {
  const ordered = [...(records || [])].sort((a, b) => {
    const aTime = new Date(a._updatedAt || a.date || 0).getTime();
    const bTime = new Date(b._updatedAt || b.date || 0).getTime();
    return bTime - aTime;
  });

  for (const record of ordered) {
    const exercise = (record.exercises || []).find(item => item.name === exerciseName);
    const validSets = (exercise?.sets || []).filter(set => Number(set.weight) > 0 && Number(set.reps) > 0);
    if (validSets.length > 0) {
      const lastSet = validSets[validSets.length - 1];
      return { weight: Number(lastSet.weight), reps: Number(lastSet.reps), date: record.date };
    }
  }
  return null;
}

export function getProgressionSuggestion(lastSet) {
  if (!lastSet) {
    return {
      lastText: '',
      goalText: '先用能稳定控制动作的轻重量试做。',
      weight: null,
      reps: null,
      mode: 'start-light',
      canApply: false,
    };
  }

  const lastText = `上次 ${lastSet.weight}kg × ${lastSet.reps}`;
  if (lastSet.reps < 8) {
    return {
      lastText,
      goalText: `本次目标：保持 ${lastSet.weight}kg，优先完成 8 次。`,
      weight: lastSet.weight,
      reps: 8,
      mode: 'reach-eight',
      canApply: true,
    };
  }
  if (lastSet.reps < 12) {
    return {
      lastText,
      goalText: `本次目标：${lastSet.weight}kg × ${lastSet.reps + 1}。`,
      weight: lastSet.weight,
      reps: lastSet.reps + 1,
      mode: 'add-rep',
      canApply: true,
    };
  }
  return {
    lastText,
    goalText: `已稳定完成 ${lastSet.reps} 次；确认动作稳定后，可按器械最小档位小幅加重。`,
    weight: lastSet.weight,
    reps: lastSet.reps,
    mode: 'consider-load',
    canApply: true,
  };
}

function getCommonMistake(name) {
  if (/深蹲|腿举|箭步|分腿蹲/.test(name)) return '膝盖保持与脚尖同向，避免塌腰、弹震或用惯性反弹。';
  if (/卧推|推胸|肩推/.test(name)) return '避免耸肩、过度下放或完全锁死肘关节。';
  if (/下拉|划船|飞鸟|面拉/.test(name)) return '避免用腰部甩动；先稳定肩胛，再有控制地完成拉动。';
  if (/弯举|下压|臂屈伸/.test(name)) return '避免大臂前后摆动借力，重量不稳时先降低负重。';
  if (/平板支撑|死虫|卷腹|转体|举腿/.test(name)) return '避免塌腰、憋气或用惯性摆动完成次数。';
  return '避免借力、快速反弹或在无法控制轨迹时继续加重量。';
}

export function getSafetyCard(name) {
  const detail = getExerciseDetailData(name);
  if (!detail) return null;
  return {
    cues: (detail.steps || []).slice(0, 3),
    commonMistake: getCommonMistake(name),
    stopSignal: '如出现关节刺痛、眩晕、麻木或无法控制动作轨迹，请立即停止，并向现场专业人员求助。',
  };
}
