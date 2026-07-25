#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const sourcePath = process.env.EXERCISES_DATASET_JSON
  || path.resolve(__dirname, '../../exercises-dataset/data/exercises.json');
const outPath = path.resolve(__dirname, '../data/exercise_catalog.json');

const BODY_PART_MAP = {
  chest: 'chest',
  back: 'back',
  shoulders: 'shoulders',
  'upper arms': 'arms',
  'lower arms': 'arms',
  'upper legs': 'legs',
  'lower legs': 'legs',
  waist: 'core',
};

const EQUIPMENT_MAP = {
  'body weight': 'bodyweight',
  dumbbell: 'dumbbell',
  cable: 'cable',
  barbell: 'barbell',
  kettlebell: 'kettlebell',
  band: 'band',
  'resistance band': 'band',
  'smith machine': 'smith',
  'leverage machine': 'machine',
  assisted: 'machine',
  'sled machine': 'machine',
  'ez barbell': 'barbell',
  weighted: 'other',
  'stability ball': 'other',
  'medicine ball': 'other',
};

const QUOTA = {
  chest: 25,
  back: 25,
  legs: 30,
  shoulders: 25,
  arms: 25,
  core: 20,
};

function cleanZhStep(step) {
  return String(step)
    .replace(/重复所需的重复次数。?/g, '按计划次数重复。')
    .replace(/重复所需的次数。?/g, '按计划次数重复。')
    .replace(/所需的重复次数/g, '计划次数')
    .replace(/带子/g, '弹力带')
    .replace(/正手握住/g, '掌心向前握住')
    .replace(/\s+/g, ' ')
    .trim();
}

function scoreExercise(item) {
  let score = 0;
  if (['body weight', 'dumbbell', 'cable', 'barbell', 'leverage machine', 'smith machine'].includes(item.equipment)) score += 20;
  if (!/[()]/.test(item.name)) score += 10;
  if (!/alternate|reverse|behind|single leg|one arm|side pov|back pov/i.test(item.name)) score += 6;
  if (/bench press|deadlift|squat|row|pulldown|curl|extension|raise|plank|crunch|push-up|pull-up|lunge/i.test(item.name)) score += 10;
  if ((item.instruction_steps?.zh || []).length >= 4) score += 5;
  return score;
}

function main() {
  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Missing source dataset: ${sourcePath}`);
  }

  const source = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
  const normalized = source
    .map(item => {
      const bodyPart = BODY_PART_MAP[item.body_part];
      const equipment = EQUIPMENT_MAP[item.equipment];
      if (!bodyPart || !equipment) return null;
      const stepsZh = (item.instruction_steps?.zh || []).map(cleanZhStep).filter(Boolean);
      if (stepsZh.length === 0) return null;
      return {
        id: `ext-${item.id}`,
        source: 'hasaneyldrm/exercises-dataset',
        sourceId: item.id,
        nameEn: item.name,
        bodyPart,
        equipment,
        target: item.target,
        secondaryMuscles: item.secondary_muscles || [],
        stepsZh,
        score: scoreExercise(item),
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score || a.nameEn.localeCompare(b.nameEn));

  const picked = [];
  for (const bodyPart of Object.keys(QUOTA)) {
    picked.push(...normalized
      .filter(item => item.bodyPart === bodyPart)
      .slice(0, QUOTA[bodyPart]));
  }

  const payload = {
    version: 1,
    generatedAt: source
      .map(item => item.created_at)
      .filter(Boolean)
      .sort()
      .at(-1),
    source: {
      repository: 'https://github.com/hasaneyldrm/exercises-dataset',
      license: 'MIT for non-media data and instruction text',
      mediaExcluded: true,
    },
    exercises: picked.map(({ score, ...item }) => item),
  };

  fs.writeFileSync(outPath, `${JSON.stringify(payload, null, 2)}\n`);
  console.log(`Wrote ${payload.exercises.length} exercises to ${outPath}`);
}

main();
