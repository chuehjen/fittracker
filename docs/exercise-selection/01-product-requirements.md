# Product Requirements: Exercise Selection Optimization

## Background

FitTracker Pro currently lets users choose a body part, then choose an exercise from two flat groups: machine and free weight. This works for a small library, but the decision experience is too thin:

- users cannot search or filter;
- tapping an exercise immediately moves them into the active training screen;
- the page does not explain why an exercise is useful;
- existing training history does not help selection;
- the visual hierarchy gives similar weight to icon, type badge, exercise name, and tip.

Competitor research suggests the category expectation is moving from "show me exercises" to "help me choose fast and explain why." Strong and Hevy emphasize fast workout logging, custom exercises, exercise instructions, previous values, and exercise filtering. Fitbod and JEFIT go further with personalized recommendations based on goals, available equipment, experience, performance history, and recovery state.

## Product Goal

Turn the exercise selection screen from an exercise card gallery into a fast workout-building decision page.

Target user outcome:

> A user can choose 3-5 suitable exercises within 15 seconds and understand why the first recommended exercises are suggested.

## Target Users

- Beginner lifter: needs guidance and simple language.
- Consistent gym user: wants fast selection, recent exercise memory, and fewer taps.
- Returning user with history: benefits from "last used" and "recommended" signals.
- User in a crowded gym: needs quick alternatives by available equipment.

## Non-Goals

- Do not build a full AI workout generator.
- Do not expand to a 1,000+ exercise database in this iteration.
- Do not add video demos in this iteration.
- Do not redesign the whole training flow.
- Do not change Supabase schema.
- Do not require network access for recommendation logic.

## User Stories

1. As a user starting chest training, I want to quickly see recommended chest exercises so I do not need to think from scratch.
2. As a user in the gym, I want to filter by equipment so I can pick what is currently available.
3. As a user who remembers part of an exercise name, I want to search it directly.
4. As a returning user, I want to see my last performance for an exercise so I can choose with context.
5. As a beginner, I want plain-language labels like target area, equipment, and difficulty.
6. As a user building a workout, I want to select multiple exercises before entering the active training page.
7. As a user who cannot find an exercise, I want to create a custom exercise without leaving the flow.

## Proposed Experience

### Screen Title

Current:

- `{Body Part} - 选择动作`

Proposed:

- `添加{部位}动作`

Examples:

- `添加胸部动作`
- `添加背部动作`

### Header Copy

Add compact helper copy:

- `建议选择 3-5 个动作，可训练中继续添加`

If user already has selected exercises in current training:

- `已选 {N} 个动作，可继续补充`

### Page Structure

1. Header
   - Back button
   - Title
   - Helper copy

2. Search
   - Placeholder: `搜索动作、器械或训练重点`
   - Searches exercise name, equipment, target area, and tags.

3. Recommendation Strip
   - Shows 2-3 recommended exercises for the selected body part.
   - Each item includes a short reason.
   - If there is no history, recommendations should still work using beginner-friendly defaults.

4. Filter Chips
   - `推荐`
   - `全部`
   - equipment filters, depending on available exercises:
     - `哑铃`
     - `杠铃`
     - `固定器械`
     - `龙门架`
     - `自重`
   - optional context filters:
     - `新手友好`
     - `最近练过`

5. Exercise List
   - Prefer a single-column list on mobile for readability.
   - Each item:
     - exercise name;
     - compact tags: target, equipment, difficulty;
     - one contextual sentence: recommendation reason, last performance, or concise cue;
     - right-side plus/check button.

6. Sticky Bottom Action
   - If no exercise is selected: disabled text `请选择动作`
   - If selected: `已选 {N} 个 · 开始训练`
   - Secondary text can be omitted to keep the UI compact.

7. Custom Exercise Entry
   - Keep an explicit button: `创建自定义动作`
   - If search has no results, show:
     - `没找到这个动作？`
     - `创建自定义动作`

## Interaction Rules

### Multi-Select

- Tapping an exercise toggles selected state.
- Selected state should be visually obvious:
  - check icon;
  - accent border;
  - muted add button replaced by selected state.
- The page should not immediately navigate to active training when selecting an exercise.
- User enters active training only by tapping the bottom CTA.

### Existing Active Training

If the user comes from active training and taps "加动作":

- current selected exercises should start with exercises already in `S.currentTraining.exercises`;
- CTA should say `已选 {N} 个 · 返回训练`;
- newly selected exercises are added to existing training;
- deselecting an already logged exercise should be disabled or require a clear delete flow later. For this iteration, do not allow deselecting exercises already in active training.

### Search

- Search should be client-side and instant.
- Empty query shows recommendation/all list based on active filter.
- Query should match:
  - exercise name;
  - equipment;
  - target area;
  - type;
  - tags.

### Filters

- Default filter: `推荐`.
- `推荐` should show ranked recommendations plus any highly relevant exercises.
- `全部` should show all exercises for selected body part.
- Equipment filters should only show if matching exercises exist.
- Selecting search should not clear active filter unless implementation complexity requires it; if complexity is high, search may override filters in MVP.

### Recommendation Logic

Lightweight recommendation only. No remote AI call.

Signals, in priority order:

1. If user has no history:
   - prioritize beginner-friendly and common compound/isolation mix;
   - show reasons such as `适合作为胸部主项` or `新手容易上手`.

2. If user has history:
   - prioritize exercises recently used for that body part;
   - add one complementary movement pattern if possible;
   - avoid recommending only the same equipment type;
   - show last performance when available.

3. If selected body part has not been trained recently:
   - use reason: `这个部位最近训练较少，适合今天补上`.

### Copy Style

Use practical gym language. Avoid over-marketing.

Preferred:

- `主练上胸`
- `哑铃 · 中等`
- `上次 22.5kg x 8`
- `适合作为第一个胸部主项`

Avoid:

- `极致燃脂塑形`
- `打造完美身材`
- `王牌黄金动作`

## Content Model Requirements

Current exercise data only has `name`, `type`, and `tip`. Add metadata gradually.

Minimum new fields:

- `equipment`: `machine | dumbbell | barbell | cable | bodyweight | smith | other`
- `target`: short Chinese label, such as `上胸`, `背阔肌`, `股四头肌`
- `level`: `beginner | intermediate | advanced`
- `tags`: array of Chinese strings, such as `["主项", "推", "稳定"]`
- `reason`: default recommendation sentence

Optional later fields:

- `movement`: push, pull, squat, hinge, isolation, core
- `alternatives`
- `riskNote`
- `defaultSets`
- `defaultReps`

## Visual Direction

Keep the existing black/green FitTracker Pro identity, but reduce visual noise.

Recommendations:

- Use single-column exercise rows for the final selection list.
- Use compact chips rather than large badges.
- Keep plus/check action on the right.
- Use less saturated color for type/equipment tags.
- Put the important text first: exercise name, then context.
- Keep tap targets at least 44px high.

## Acceptance Criteria

- User can search exercises on the select exercise screen.
- User can filter exercises by at least `推荐`, `全部`, and available equipment.
- User can select multiple exercises before starting training.
- Bottom CTA shows selected count.
- Starting training creates or updates `S.currentTraining`.
- Existing training records, body records, sync behavior, and history screen are unchanged.
- Existing custom exercise creation remains available.
- First-time user sees useful recommendations without history.
- Returning user sees last performance or history-informed reasons when possible.
- Empty search state supports creating a custom exercise.
- UI remains usable on a 390px wide mobile viewport.

## Decision Points for Owner

- Should the first implementation use single-column rows only, or keep two-column cards for `推荐`?
- Should existing active-training exercises be locked in the selection page?
- Should custom exercises be eligible for recommendations immediately?
- Should recommendations favor compound exercises first or recently repeated exercises first?
