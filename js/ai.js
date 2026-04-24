// ===== AI Analysis Engine =====
// OpenRouter-powered AI with automatic free-model failover

import { BODY_PARTS } from './exercises.js';
import { calcVolume } from './helpers.js';

// ===== OpenRouter Configuration =====
const OR_API_KEY = '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';

const FREE_MODELS = [
  'google/gemini-2.0-flash-lite',
  'qwen/qwen-2.5-72b-instruct',
  'meta-llama/llama-3.3-70b-instruct',
];

const SYSTEM_PROMPT = '你是一个专业的健身教练和营养顾问。用简短的中文回答，使用 <strong> 标签强调重点。回答控制在100字以内。';

let _currentModel = null;

export async function claudeAnalyze(prompt, systemPrompt) {
  for (const model of FREE_MODELS) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OR_API_KEY}`,
          'HTTP-Referer': 'https://fittracker-pro.surge.sh',
          'X-Title': 'FitTracker Pro',
        },
        body: JSON.stringify({
          model,
          max_tokens: 512,
          system: systemPrompt || SYSTEM_PROMPT,
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      if (!response.ok) {
        if (response.status === 429 || response.status >= 500) continue;
        return null;
      }

      const data = await response.json();
      const text = data.choices?.[0]?.message?.content;
      if (text) {
        if (_currentModel !== model) {
          _currentModel = model;
          console.log(`[AI] Model: ${model}`);
        }
        return text;
      }
    } catch {
      continue;
    }
  }

  return null;
}

export function getApiConfig() {
  return {
    enabled: true,
    model: _currentModel || FREE_MODELS[0],
  };
}

// Keep setApiConfig as no-op for backward compat
export function setApiConfig() {}

// ===== Rule-Based Fallback Engine =====

export function aiPreWorkout(state) {
  const recs = state.trainingRecords || [];
  const recent = recs.slice(-14);

  if (recent.length === 0) {
    return { title: '开始你的健身之旅', body: '还没有训练记录。选择一个部位开始吧！建议从大肌群（胸、背、腿）开始。' };
  }

  const partCount = {};
  const lastPart = {};
  recent.forEach(r => {
    partCount[r.bodyPart] = (partCount[r.bodyPart] || 0) + 1;
    if (!lastPart[r.bodyPart] || r.date > lastPart[r.bodyPart]) lastPart[r.bodyPart] = r.date;
  });

  const allParts = BODY_PARTS.map(b => b.id);
  const neglected = allParts.filter(p => !partCount[p]);
  if (neglected.length > 0) {
    const bp = neglected[0];
    return { title: '系统建议', body: `你最近没有训练过<strong>${getBodyPartName(bp)}</strong>，今天练一下吧！` };
  }

  const sorted = allParts.sort((a, b) => (lastPart[a] || '') > (lastPart[b] || '') ? 1 : -1);
  const suggest = sorted[0];
  const lastDate = lastPart[suggest];
  const days = lastDate ? Math.floor((new Date() - new Date(lastDate)) / 86400000) : 999;
  return { title: '今日推荐', body: `距离上次练<strong>${getBodyPartName(suggest)}</strong>已经${days}天了，建议今天安排${getBodyPartName(suggest)}训练。` };
}

export function aiPostWorkout(record, state) {
  const vol = calcVolume(record.exercises);
  const prevSame = (state.trainingRecords || []).filter(r =>
    r.bodyPart === record.bodyPart && r.id !== record.id
  ).sort((a, b) => b.date.localeCompare(a.date));

  let comp = '';
  if (prevSame.length > 0) {
    const prevVol = calcVolume(prevSame[0].exercises);
    const diff = vol - prevVol;
    const pct = prevVol > 0 ? Math.round(diff / prevVol * 100) : 0;
    if (diff > 0) comp = `训练量比上次提升了<strong>${pct}%</strong>`;
    else if (diff < 0) comp = `训练量比上次减少了<strong>${Math.abs(pct)}%</strong>`;
    else comp = '训练量与上次持平';
  }

  let prList = [];
  record.exercises.forEach(ex => {
    const maxW = Math.max(...ex.sets.map(s => s.weight));
    const prevMax = getPRBefore(ex.name, record.id, state);
    if (maxW > prevMax && prevMax > 0) prList.push(ex.name);
  });

  const prText = prList.length > 0 ? `恭喜突破 PR！<strong>${prList.join('、')}</strong>` : '';
  const msgs = ['每一次训练都在让你变得更强。', '坚持就是胜利，你做到了！', '汗水不会辜负你的努力。'];
  return { vol, comp, prText, motto: msgs[Math.floor(Math.random() * msgs.length)], duration: record.duration };
}

function getPRBefore(name, excludeId, state) {
  let max = 0;
  (state.trainingRecords || []).forEach(r => {
    if (r.id !== excludeId) r.exercises.forEach(ex => {
      if (ex.name === name) ex.sets.forEach(s => { if (s.weight > max) max = s.weight; });
    });
  });
  return max;
}

export function getPR(exerciseName, state) {
  let max = 0;
  (state.trainingRecords || []).forEach(r => {
    r.exercises.forEach(ex => {
      if (ex.name === exerciseName) ex.sets.forEach(s => { if (s.weight > max) max = s.weight; });
    });
  });
  return max;
}

export function getPRBeforeLocal(name, excludeId, state) {
  let max = 0;
  (state.trainingRecords || []).forEach(r => {
    if (r.id !== excludeId) r.exercises.forEach(ex => {
      if (ex.name === name) ex.sets.forEach(s => { if (s.weight > max) max = s.weight; });
    });
  });
  return max;
}

export function aiDietFeedback(bodyRec, state) {
  const diet = (bodyRec.diet || '').toLowerCase();
  const todayTraining = (state.trainingRecords || []).filter(r => r.date === bodyRec.date);
  if (!diet) return null;
  let tips = [];
  const hasProtein = /(蛋白|鸡胸|牛肉|鱼|虾|蛋|奶)/.test(diet);
  const hasCarb = /(碳水|米饭|面|香蕉|红薯|燕麦)/.test(diet);
  if (todayTraining.length > 0) {
    if (!hasProtein) tips.push('今天有训练但蛋白质摄入不足，建议补充。');
    if (!hasCarb) tips.push('训练后适当补充碳水化合物。');
  } else {
    tips.push('休息日可以适当控制碳水摄入量。');
  }
  return tips.join(' ');
}

export function aiWeeklyReport(state) {
  const now = new Date();
  const weekAgo = new Date(now - 7 * 86400000);
  const weekStr = weekAgo.toISOString().slice(0, 10);
  const weekRecs = (state.trainingRecords || []).filter(r => r.date >= weekStr);

  if (weekRecs.length === 0) return { title: '本周 AI 周报', body: '本周还没有训练记录，开始行动吧！' };

  let report = [];
  report.push(`本周训练了<strong>${weekRecs.length}次</strong>。`);
  const partCounts = {};
  weekRecs.forEach(r => { partCounts[r.bodyPart] = (partCounts[r.bodyPart] || 0) + 1; });
  const untrained = BODY_PARTS.filter(b => !partCounts[b.id]).map(b => b.name);
  if (untrained.length > 0) report.push(`未训练部位：<strong>${untrained.join('、')}</strong>`);
  return { title: '本周 AI 周报', body: report.join('<br>') };
}

function getBodyPartName(id) {
  const bp = BODY_PARTS.find(b => b.id === id);
  return bp ? bp.name : id;
}
