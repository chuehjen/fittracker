# Test Cases: Exercise Selection Optimization

## Test Environment

Run locally:

```bash
node serve.js
```

Open:

```text
http://localhost:9000
```

Recommended viewport:

- mobile width around 390px;
- desktop browser is acceptable for functional smoke testing.

## Functional Tests

### TC-001 First-Time User Sees Recommendations

Precondition:

- Clear app data or use a fresh browser profile.

Steps:

1. Open app.
2. Start training.
3. Choose `胸`.
4. Observe exercise selection screen.

Expected:

- Title is `添加胸部动作`.
- Helper copy explains selecting 3-5 exercises.
- `推荐` filter is active by default.
- At least 2 recommended exercises are visible.
- Each visible recommended exercise has a reason or contextual line.

### TC-002 Search by Exercise Name

Steps:

1. Go to `添加胸部动作`.
2. Search `卧推`.

Expected:

- Results include relevant bench press exercises.
- Irrelevant exercises are hidden.
- Search is instant or updates after input without submitting.

### TC-003 Search by Equipment

Steps:

1. Go to `添加背部动作`.
2. Search `哑铃`.

Expected:

- Results include dumbbell exercises, such as `哑铃单臂划船`.
- Results contain equipment label or matching context.

### TC-004 Filter by Equipment

Steps:

1. Go to any body part with dumbbell exercises.
2. Tap `哑铃` chip.

Expected:

- Only dumbbell exercises are shown.
- Active chip style is visible.
- Bottom CTA state is unchanged.

### TC-005 Multi-Select Before Start

Steps:

1. Go to `添加胸部动作`.
2. Select 3 exercises.

Expected:

- Each selected row clearly shows selected state.
- Bottom CTA says `已选 3 个 · 开始训练`.
- App does not navigate to active training until CTA is tapped.

### TC-006 Start Training With Selected Exercises

Steps:

1. Select 3 chest exercises.
2. Tap bottom CTA.

Expected:

- Active training screen opens.
- All 3 exercises are present.
- Each exercise starts with empty sets.
- Training timer starts.

### TC-007 No Selection CTA Disabled

Steps:

1. Go to `添加腿部动作`.
2. Do not select any exercise.

Expected:

- CTA is disabled or visually inactive.
- Tapping it does not start training.

### TC-008 Toggle Selection

Steps:

1. Select an exercise.
2. Tap the same exercise again.

Expected:

- Exercise becomes unselected.
- Selected count decreases by 1.

### TC-009 Add More During Active Training

Steps:

1. Start a workout with 2 exercises.
2. On active training screen, tap `加动作`.
3. Select 1 new exercise.
4. Tap CTA.

Expected:

- Existing 2 exercises remain.
- New exercise is appended.
- Existing logged exercises are not removed.
- App returns to active training.

### TC-010 Existing Exercises Are Locked In Add-More Flow

Precondition:

- User is in active training with at least 1 exercise.

Steps:

1. Tap `加动作`.
2. Find an already selected exercise.
3. Try to deselect it.

Expected:

- Existing exercise cannot be removed from this flow, or user sees a clear disabled/locked state.

### TC-011 Empty Search State

Steps:

1. Search an impossible string, such as `zzzz`.

Expected:

- Empty state appears.
- Empty state offers `创建自定义动作`.
- No broken layout.

### TC-012 Create Custom Exercise From Selection

Steps:

1. Go to `添加肩部动作`.
2. Tap `创建自定义动作`.
3. Create a custom exercise.

Expected:

- Custom exercise appears in the selection list.
- Custom exercise can be selected.
- Starting training includes the custom exercise.

### TC-013 Returning User Sees Last Performance

Precondition:

- User has a saved training record containing `平板杠铃卧推` with sets.

Steps:

1. Start chest training.
2. View `平板杠铃卧推`.

Expected:

- Exercise row shows previous best or last performance, such as `上次 60kg x 8`.

### TC-014 Recommendation Uses History

Precondition:

- User has previous chest training records.

Steps:

1. Start chest training.
2. Observe recommendations.

Expected:

- At least one recommendation reflects previous exercise usage or complementary training logic.
- Reason is understandable.

### TC-015 Import/Export Unchanged

Steps:

1. Export data.
2. Import the exported file.

Expected:

- Import/export still works.
- Exercise metadata UI changes do not alter saved training record shape.

## Regression Tests

### RT-001 Save Training

Steps:

1. Start a training session from selected exercises.
2. Add one set to each exercise.
3. Finish training.
4. Save training.
5. Open history.

Expected:

- Training record appears in history.
- Volume calculation is correct.

### RT-002 Discard Training

Steps:

1. Start a training session.
2. Finish training.
3. Tap discard.

Expected:

- Current training is cleared.
- No history record is added.

### RT-003 Rest Timer Still Works

Steps:

1. Start training.
2. Tap rest timer start.

Expected:

- Rest timer overlay appears.
- Countdown works.
- Skip works.

### RT-004 Body Record Unchanged

Steps:

1. Open Record tab.
2. Save body weight or diet note.

Expected:

- Body record saves as before.

### RT-005 Profile Charts Still Render

Steps:

1. Open Profile tab.

Expected:

- Profile renders without console errors.
- Charts either render or show fallback if Chart.js fails.

## Visual Checks

### VC-001 Mobile Layout

Viewport:

- 390px width.

Expected:

- Search input fits.
- Filter chips scroll horizontally if needed.
- Exercise row text does not overflow.
- Sticky CTA does not cover final list row.

### VC-002 Long Exercise Names

Use exercises such as:

- `保加利亚分腿蹲`
- `哑铃集中弯举`
- `罗马尼亚硬拉`

Expected:

- Text wraps or truncates cleanly.
- Plus/check button stays aligned.

### VC-003 Empty State

Expected:

- Empty search state is readable.
- Custom exercise CTA is visible.

## Basic Console Check

During all key flows, verify:

- no uncaught JavaScript errors;
- no broken module imports;
- no Supabase sync errors caused by local selection UI.
