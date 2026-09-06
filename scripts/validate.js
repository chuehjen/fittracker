#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

function read(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8');
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function validateNoDietUi() {
  const profile = read('js/views/profile.js');
  assert(profile.includes('weightRecords'), 'profile must use simplified weightRecords');
  assert(!fs.existsSync(path.join(root, 'js/views/record.js')), 'diet/body metrics record view should not exist');
  assert(!/饮食|体脂/.test(profile), 'profile should not expose diet or body-fat UI');
}

function validatePwa() {
  const index = read('index.html');
  const sw = read('service-worker.js');
  assert(!index.includes('unregister()'), 'index.html must not unregister service workers');
  assert(!sw.includes('unregister()'), 'service-worker.js must not self-destruct');
  assert(sw.includes('ignoreSearch: true'), 'service worker should match cached app shell despite cache-busting query strings');
  assert(sw.includes('./data/exercise_catalog.json'), 'service worker should cache curated exercise catalog');
}

function validateCatalog() {
  const catalog = JSON.parse(read('data/exercise_catalog.json'));
  assert(catalog.source.mediaExcluded === true, 'catalog must explicitly exclude media');
  assert(catalog.exercises.length === 150, 'catalog should contain 150 curated exercises');
  for (const item of catalog.exercises) {
    assert(!('image' in item) && !('gif_url' in item), `catalog item ${item.id} must not include media`);
    assert(item.id && item.nameEn && item.bodyPart && item.equipment, `catalog item ${item.id} missing required fields`);
    assert(Array.isArray(item.stepsZh) && item.stepsZh.length > 0, `catalog item ${item.id} missing zh steps`);
  }
}

function validateSync() {
  const sync = read('js/sync.js');
  const training = read('js/views/training.js');
  const history = read('js/views/history.js');
  const profile = read('js/views/profile.js');
  assert(sync.includes('mapLocalToCloudRow'), 'sync mapper must exist');
  assert(training.includes("queueUpsert('training_records'"), 'training saves must queue upserts');
  assert(training.includes("queueUpsert('custom_exercises'"), 'custom exercises must queue upserts');
  assert(history.includes("queueDelete('training_records'"), 'history deletes must queue soft deletes');
  assert(profile.includes("queueUpsert('body_records'"), 'weight records must sync through body_records');
}

function validateSyncDataIntegrity() {
  const sync = read('js/sync.js');
  const schema = read('supabase-schema.sql');
  assert(!sync.includes("select('*').eq('deleted', false)"), 'sync pull must include soft-deleted rows');
  assert(sync.includes('if (c.deleted)'), 'sync merge must apply remote soft deletions');
  assert(sync.includes('notes: c.notes ||'), 'sync pull must retain training notes');
  assert(sync.includes('notes: data.notes || null'), 'sync push must send training notes');
  assert(sync.includes("table === 'training_records' && /notes|column/i"), 'training sync must tolerate a schema awaiting the notes migration');
  assert(schema.includes('ALTER TABLE training_records ADD COLUMN IF NOT EXISTS notes TEXT'), 'schema must migrate existing projects for synced training notes');
}

function validateAddMoreFallback() {
  const training = read('js/views/training.js');
  const app = read('js/app.js');
  assert(training.includes('S.selectedBodyPart || S.currentTraining?.bodyPart'), 'add-more exercise screen must fall back to currentTraining.bodyPart');
  assert(training.includes('S.selectedBodyPart = S.currentTraining.bodyPart'), 'add-more button must restore selectedBodyPart from active training');
  assert(app.includes('S.selectedBodyPart = S.currentTraining.bodyPart'), 'app restore must preserve selected body part for active training');
}

function validateCrossBodyPartAddMore() {
  const training = read('js/views/training.js');
  const history = read('js/views/history.js');
  const ai = read('js/ai.js');
  const achievements = read('js/achievements.js');
  const charts = read('js/charts.js');
  const css = read('css/style.css');
  assert(training.includes('exerciseBodyPartBar'), 'add-more exercise screen must expose body-part switching');
  assert(training.includes('S.selectedBodyPart = chip.dataset.part'), 'body-part switch must update selectedBodyPart');
  assert(training.includes('S.pendingExercises.push({ name, type, bodyPart: bp })'), 'pending exercises must preserve their selected body part');
  assert(training.includes('getRecordBodyParts(r).includes(bp)'), 'exercise recommendations must recognize multi-part sessions');
  assert(history.includes('getRecordBodyParts(r).includes(S.historyFilter)'), 'history filters must recognize multi-part sessions');
  assert(ai.includes('getRecordBodyParts(r).forEach(bodyPart =>'), 'AI insights must recognize multi-part sessions');
  assert(achievements.includes('getRecordBodyParts(r).includes(bp)'), 'all-parts achievement must recognize multi-part sessions');
  assert(charts.includes('getRecordBodyParts(r).includes(bp.id)'), 'body-part chart must recognize multi-part sessions');
  assert(css.includes('.exercise-bodypart-chip.active'), 'body-part switcher must have an active style');
}

function validateTrainingGuidance() {
  const training = read('js/views/training.js');
  const guidance = read('js/training_guidance.js');
  const detail = read('js/exercise_detail.js');
  const css = read('css/style.css');
  const sw = read('service-worker.js');
  assert(guidance.includes("id: 'beginner-full-body-a'"), 'guidance must include beginner full-body template A');
  assert(guidance.includes("id: 'beginner-full-body-b'"), 'guidance must include beginner full-body template B');
  assert(guidance.includes("id: 'beginner-upper-machine'"), 'guidance must include upper-body machine template');
  assert(guidance.includes("mode: 'consider-load'"), 'progression must avoid inventing a concrete load increase');
  assert(training.includes('startTrainingFromRecord'), 'training home must support reusing a previous workout');
  assert(training.includes('renderTemplateSelect'), 'training view must render template selection');
  assert(training.includes('data-apply-suggestion'), 'active training must support applying a progression suggestion');
  assert(detail.includes('新手安全卡'), 'exercise detail must render the safety card');
  assert(css.includes('.progression-hint') && css.includes('.safety-card'), 'guidance UI must have styles');
  assert(sw.includes('./js/training_guidance.js'), 'service worker must cache the guidance module');
}

validateNoDietUi();
validatePwa();
validateCatalog();
validateSync();
validateSyncDataIntegrity();
validateAddMoreFallback();
validateCrossBodyPartAddMore();
validateTrainingGuidance();

console.log('Validation passed');
