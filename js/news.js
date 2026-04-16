// ===== Health News Database =====
// 20 health tips across 4 categories

export const HEALTH_NEWS = [
  { type: 'training', title: '渐进超负荷的 5 种方式', content: '增加重量、次数、组数、缩短休息时间、改善动作质量。不要只盯着重量！' },
  { type: 'training', title: '离心收缩的重要性', content: '下落阶段控制 3-4 秒，能造成更多肌纤维微损伤，促进肌肉生长。' },
  { type: 'training', title: '训练频率 vs 容量', content: '每个肌群每周训练 2 次效果最佳。单次训练容量控制在 10-20 组。' },
  { type: 'training', title: '复合动作优先', content: '先做深蹲、硬拉、卧推等多关节动作，再做孤立动作。' },
  { type: 'training', title: '力竭训练的科学', content: '不必每组都力竭。建议最后一组做到技术力竭即可。' },
  { type: 'diet', title: '蛋白质摄入法则', content: '增肌期每日 1.6-2.2g/kg，减脂期 2.2-2.7g/kg。分散到 3-5 餐。' },
  { type: 'diet', title: '碳水化合物的时机', content: '训练前后是黄金窗口。训练前慢碳，训练后快碳。' },
  { type: 'diet', title: '健康脂肪不能少', content: '每日脂肪占总热量 20-30%，优选橄榄油、坚果、鱼油。' },
  { type: 'diet', title: '水分与运动表现', content: '脱水 2% 就会影响力量。训练期间每 15 分钟补水 150-200ml。' },
  { type: 'diet', title: '睡前营养策略', content: '睡前 30 分钟摄入酪蛋白（希腊酸奶），提供整晚氨基酸供应。' },
  { type: 'recovery', title: '睡眠是最佳补剂', content: '每晚 7-9 小时高质量睡眠。生长激素在深度睡眠期分泌。' },
  { type: 'recovery', title: '主动恢复日', content: '低强度有氧、泡沫轴放松、动态拉伸。促进血液循环。' },
  { type: 'recovery', title: '筋膜放松科学', content: '每个部位滚压 30-60 秒，找到痛点停留并深呼吸。' },
  { type: 'recovery', title: '压力管理', content: '长期高皮质醇会分解肌肉。冥想、深呼吸有效降低压力。' },
  { type: 'recovery', title: '冷热疗法', content: '冷水浴减少炎症，桑拿促进生长激素。交替效果更佳。' },
  { type: 'supplement', title: '肌酸使用指南', content: '每日 3-5g 一水肌酸，无需冲击期。配合充足饮水。' },
  { type: 'supplement', title: '咖啡因提升表现', content: '训练前 30-60 分钟摄入 3-6mg/kg，提升力量和耐力。' },
  { type: 'supplement', title: '乳清 vs 植物蛋白', content: '乳清吸收快适合训练后。植物蛋白氨基酸谱更完整。' },
  { type: 'supplement', title: 'β-丙氨酸作用', content: '缓冲乳酸堆积。每日 3-5g 分次服用，连续 4 周见效。' },
  { type: 'supplement', title: '维生素 D 与力量', content: '70% 人群缺乏维 D。每日 2000-5000IU 提升睾酮水平。' }
];

export function getWeeklyNews() {
  const now = new Date();
  const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
  const weekKey = `week_${weekStart.toISOString().slice(0, 10)}`;
  let savedNews = [];
  try {
    const stored = localStorage.getItem('fittracker_weekly_news');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.weekKey === weekKey) savedNews = parsed.news || [];
    }
  } catch (e) {}
  if (savedNews.length > 0) return savedNews;
  const count = 3 + Math.floor(Math.random() * 3);
  const shuffled = [...HEALTH_NEWS].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, count);
  try { localStorage.setItem('fittracker_weekly_news', JSON.stringify({ weekKey, news: selected })); } catch (e) {}
  return selected;
}
