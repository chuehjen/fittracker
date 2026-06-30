# Technical Design: Exercise Selection Optimization

## Current Implementation

Relevant files:

- `js/views/training.js`
  - `renderSelectExercise`
  - `addExerciseToTraining`
  - `showAddExerciseModal`
- `js/exercises.js`
  - `BODY_PARTS`
  - `EXERCISES`
  - `EX_META`
- `css/style.css`
  - `.ex-grid`
  - `.ex-card`
  - badges and training screen styles

Current behavior:

- `renderSelectExercise` builds `machine` and `free` arrays.
- Each exercise card immediately calls `addExerciseToTraining`.
- `addExerciseToTraining` creates `S.currentTraining` if needed and navigates to active training.

## Architecture Constraints

- Keep vanilla JavaScript ES Modules.
- Do not introduce a build step.
- Do not introduce new external dependencies.
- Keep all logic client-side.
- Do not change Supabase schema.
- Preserve current local-first IndexedDB persistence model.
- Avoid touching unrelated tabs/views.

## Proposed Implementation Shape

### 1. Expand Exercise Metadata

Add a new export in `js/exercises.js`:

```js
export const EXERCISE_DETAILS = {
  '平板杠铃卧推': {
    equipment: 'barbell',
    target: '胸部主项',
    level: 'intermediate',
    tags: ['主项', '推'],
    reason: '适合作为胸部训练的第一个主项'
  }
};
```

Keep `EXERCISES` and `EX_META` for backward compatibility.

Add helper:

```js
export function getExerciseDetail(name, fallbackType) {
  return {
    equipment: fallbackType === 'machine' ? 'machine' : 'other',
    target: '',
    level: 'intermediate',
    tags: [],
    reason: '',
    ...(EXERCISE_DETAILS[name] || {}),
  };
}
```

Why: this avoids rewriting the existing exercise database immediately while enabling richer UI.

### 2. Add Local Selection State

Inside `renderSelectExercise`, derive selected exercise ids/names from:

- `S.currentTraining.exercises` when active training exists;
- a transient `S.pendingExercises` array for new selection.

Recommended state shape:

```js
S.pendingExercises = [
  { name: '平板杠铃卧推', type: 'free' }
];
```

This is transient UI state but can safely persist through `saveState` only if needed. Prefer not to persist it unless implementation is simpler.

Alternative: keep module-level `pendingSelection`. This avoids persistence but is easier to lose on render. Use state only if re-render requires stability.

### 3. Build Exercise View Models

Add helper in `training.js` or a new small module later:

```js
function getExerciseOptionsForBodyPart(S, bp) {
  const base = EXERCISES[bp] || { machine: [], free: [] };
  const custom = (S.customExercises || []).filter(e => e.bodyPart === bp);
  return [
    ...base.machine.map(name => toExerciseOption(name, 'machine', S)),
    ...base.free.map(name => toExerciseOption(name, 'free', S)),
    ...custom.map(e => toExerciseOption(e.name, e.type, S, true)),
  ];
}
```

Each option should include:

- `name`
- `type`
- `equipment`
- `target`
- `level`
- `tags`
- `tip`
- `lastSetText`
- `recommendReason`
- `isRecommended`
- `isSelected`
- `isLocked`

### 4. Recommendation Helper

Add deterministic helper:

```js
function getRecommendedExercises(options, S, bp) {
  // Return ranked option names.
}
```

Suggested scoring:

- +30 if exercise was used in the last same-body-part workout.
- +20 if exercise is tagged `主项` and user has selected fewer than 1 main exercise.
- +15 if level is `beginner` and user has fewer than 5 total training records.
- +10 if equipment diversifies current recommendation set.
- -10 if the same exercise was already selected and locked.

MVP can simply return top 3.

### 5. Search and Filter State

Add fields:

```js
S.exerciseSearch = S.exerciseSearch || '';
S.exerciseFilter = S.exerciseFilter || 'recommended';
```

Possible filters:

- `recommended`
- `all`
- equipment values: `dumbbell`, `barbell`, `machine`, `cable`, `bodyweight`, `smith`
- `recent`
- `beginner`

Filter display labels:

```js
const EQUIPMENT_LABELS = {
  machine: '固定器械',
  dumbbell: '哑铃',
  barbell: '杠铃',
  cable: '龙门架',
  bodyweight: '自重',
  smith: '史密斯',
  other: '其他',
};
```

### 6. Render Flow

Replace the current `renderSelectExercise` body with:

1. build options;
2. compute recommendations;
3. apply search/filter;
4. render header/search/filter/list/sticky CTA;
5. attach event handlers.

Important: event handlers must re-render using `onStateChange()` after changing selection/filter/search.

### 7. Start Training CTA

Add function:

```js
function startTrainingWithSelectedExercises(S) {
  if (!S.currentTraining) {
    S.currentTraining = {
      id: genId(),
      date: today(),
      bodyPart: S.selectedBodyPart,
      exercises: [],
      duration: 0,
      photo: '',
      notes: '',
      totalVolume: 0
    };
    S.trainingTimerActive = true;
    S.trainingTimerStart = Date.now();
    S.trainingTimerElapsed = 0;
  }

  for (const item of S.pendingExercises || []) {
    if (!S.currentTraining.exercises.find(e => e.name === item.name)) {
      S.currentTraining.exercises.push({ name: item.name, type: item.type, sets: [] });
    }
  }

  S.pendingExercises = [];
  S.trainingScreen = 'active';
  onStateChange();
}
```

For active training add-more flow:

- seed `pendingExercises` from existing exercises only for display;
- lock existing exercises;
- only add newly selected exercises on CTA.

### 8. Last Performance Helper

Add helper:

```js
function getLastPerformanceText(S, exerciseName) {
  const records = [...(S.trainingRecords || [])].reverse();
  for (const record of records) {
    const exercise = record.exercises.find(e => e.name === exerciseName);
    if (!exercise || !exercise.sets.length) continue;
    const best = exercise.sets.reduce((max, set) =>
      set.weight > max.weight ? set : max, exercise.sets[0]);
    return `上次 ${best.weight}kg x ${best.reps}`;
  }
  return '';
}
```

### 9. CSS Additions

Add new classes instead of heavily mutating existing `.ex-card` styles:

- `.exercise-select-header`
- `.exercise-search`
- `.exercise-filter-bar`
- `.exercise-chip`
- `.exercise-list`
- `.exercise-row`
- `.exercise-row.selected`
- `.exercise-row.locked`
- `.exercise-row-main`
- `.exercise-row-meta`
- `.exercise-row-context`
- `.exercise-select-action`
- `.exercise-sticky-cta`

Keep old `.ex-grid` and `.ex-card` until migration is complete to avoid breaking other screens.

### 10. Data Compatibility

Existing training record exercise shape:

```js
{ name, type, sets: [] }
```

Do not change this shape in this iteration. Metadata should only affect selection UI.

## Implementation Steps

1. Add `EXERCISE_DETAILS`, labels, and `getExerciseDetail` in `js/exercises.js`.
2. Add helper functions in `js/views/training.js`.
3. Replace `renderSelectExercise` UI.
4. Replace direct card click behavior with toggle selection.
5. Add sticky CTA behavior.
6. Add CSS classes.
7. Manual smoke test core training flow.
8. Verify no unrelated git changes.

## Risks and Mitigations

Risk: selection state is lost across renders.

- Mitigation: store `pendingExercises`, `exerciseSearch`, and `exerciseFilter` on `S`.

Risk: active training "add more" lets user remove existing exercises accidentally.

- Mitigation: mark existing exercises as locked in the selection list.

Risk: page becomes too busy.

- Mitigation: keep one contextual line only; details can come later.

Risk: custom exercises lack metadata.

- Mitigation: use type-based fallback equipment and show `自定义` tag.

Risk: service worker/cache causes stale UI in deployed GitHub Pages.

- Current app unregisters service workers and clears caches. Keep the existing cache-busting script version if needed.

## Done Definition

- Product acceptance criteria from `01-product-requirements.md` pass.
- No console errors during start training flow.
- Existing save/discard/history flow still works.
- Export/import still works.
- Cloud sync code is not modified.
- No new dependency or build command is required.
