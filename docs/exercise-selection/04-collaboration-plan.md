# Collaboration Plan: Codex + Claude Code

## Goal

Allow Codex and Claude Code to work on the same FitTracker Pro optimization without overwriting each other's changes or making conflicting design decisions.

## Recommended Division of Work

### Product Owner

User makes final product decisions:

- approve or revise the product requirements;
- choose any open decision points;
- decide whether implementation proceeds now or after Claude Code's current changes land.

### Codex

Recommended Codex ownership:

- product requirements;
- technical design;
- test cases;
- final code review after Claude Code implements;
- targeted fixes if review finds issues.

### Claude Code

Recommended Claude Code ownership:

- implementation of the approved design;
- CSS and UI buildout;
- local manual verification;
- first pass bug fixes.

This split reduces merge conflicts because only one agent should own implementation files at a time.

## File Ownership During Implementation

If Claude Code is currently editing product code, Codex should avoid editing these files until Claude's work is complete:

- `js/views/training.js`
- `js/exercises.js`
- `css/style.css`

Codex can safely edit:

- `docs/exercise-selection/*`
- review comments
- follow-up test notes

If Codex later implements, Claude Code should pause edits to:

- `js/views/training.js`
- `js/exercises.js`
- `css/style.css`

## Handoff Contract

Before implementation starts, the implementing agent should confirm:

- using `docs/exercise-selection/01-product-requirements.md` as product source of truth;
- using `docs/exercise-selection/02-technical-design.md` as technical source of truth;
- testing against `docs/exercise-selection/03-test-cases.md`;
- not changing Supabase schema;
- not adding dependencies or build steps.

## Suggested Implementation Sequence

1. Claude Code reads the docs.
2. Claude Code implements in one focused branch or local change set.
3. Claude Code reports changed files and known gaps.
4. Codex reviews the diff against product requirements and test cases.
5. Codex either approves, leaves review findings, or makes targeted fixes with user approval.

## Git Hygiene

- Check `git status --short --branch` before starting.
- Keep docs and implementation in separate commits if committing.
- Do not format unrelated files.
- Do not rewrite existing training records or schema.
- Avoid broad refactors of the training view until after this feature is stable.

## Conflict Avoidance Rules

- Only one agent edits `training.js` at a time.
- Only one agent edits `style.css` at a time.
- If both agents need `exercises.js`, split work:
  - one adds metadata schema and helpers;
  - the other only consumes those helpers after merge.
- If conflict appears, prefer the version that preserves current working training flow, then reapply UI polish.

## Review Checklist

Codex review should check:

- Does the page support search, filter, multi-select, and sticky CTA?
- Does starting training preserve the old saved record shape?
- Does add-more flow preserve existing active exercises?
- Are recommendation reasons deterministic and understandable?
- Is custom exercise creation still reachable?
- Does mobile layout stay readable?
- Did implementation avoid new dependencies?

## Communication Format

When one agent hands off to the other, use this format:

```text
Status:
- Done:
- Not done:
- Changed files:
- Known issues:
- Tests run:
- Needs decision:
```

## Current Recommendation

Let Claude Code implement after reading these docs. Codex should then review the resulting diff before any final commit. This is the lowest-conflict workflow because the implementation touches a small set of shared frontend files.
