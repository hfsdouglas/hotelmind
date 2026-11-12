---
name: feature
description: Run the full autonomous feature pipeline for HotelMind from a use case - context scouting, Spec Kit spec/plan/tasks, tests first, then implementation. Use when the user describes a new feature or use case to build (`/feature <use case>`).
argument-hint: "Describe the use case / feature"
user-invocable: true
---

# Feature pipeline

Use case from the user:

```text
$ARGUMENTS
```

If empty, ask the user for the use case and stop. Reply to the user in their
language. Subagents cannot spawn subagents, so **you** run every step and hand
each agent the previous agent's output. Never commit. Do not ask the user
anything except in Step 3 (clarification) and the final commit offer.

## Step 1 — Context (`context-giver`, haiku, read-only)

Spawn `context-giver` with the use case verbatim. Keep its brief as
`CONTEXT`.

## Step 2 — Specification (`software-project-specialist`)

Spawn `software-project-specialist` with the use case, `CONTEXT`, and the
instruction to run `speckit-specify` → `speckit-plan` → `speckit-tasks` and
return its standard report. Read its `STATUS`:

- `READY` → go to Step 4.
- `NEEDS_HUMAN` → Step 3.

## Step 3 — Clarification (only human touchpoint)

Ask the user the returned questions with `AskUserQuestion` (batches of up to 4;
put the recommended option first). Then resume the same agent with
`SendMessage` (answers verbatim, instruction: encode them in `spec.md`,
finish plan and tasks, return the standard report). If it blocks again on a
new question, repeat once; otherwise treat as `READY`.

## Step 4 — Tests first (`qa-tester`)

Spawn `qa-tester` in feature mode with `FEATURE_DIR`, the test tasks and the
summary from the specialist's report. Ask it for its standard report. Tests
must exist and be Red for the right reason. If it reports a spec gap that
blocks testing, send that gap back to `software-project-specialist` once,
then re-run QA.

## Step 5 — Implementation (`fullstack-specialist`)

Spawn `fullstack-specialist` with `FEATURE_DIR`, the production tasks, the QA
report (files created, how to run them) and the instruction to run
`speckit-implement` until the tests are Green, Biome and typecheck pass, and
return its standard report. If it fails or leaves tasks open, re-spawn it
once with the failures as input.

## Step 6 — Wrap-up

Report to the user: feature dir, user stories, assumptions taken, files per
package, test results, open items or failures (with the exact output). Then
ask: "Would you like me to create a commit for these changes?" Commit only
after explicit approval, following the Conventional Commits rules in
`CLAUDE.md`.
