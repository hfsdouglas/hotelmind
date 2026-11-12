---
name: refactor
description: Run an autonomous, behavior-preserving refactor in HotelMind - context scouting, safety-net tests, refactor, then code review with fix loop. Use when the user wants to restructure, clean up or realign existing code with the project rules (`/refactor <target and goal>`).
argument-hint: "Describe what to refactor and why (file, folder, domain or rule to align with)"
user-invocable: true
---

# Refactor pipeline

Refactor request from the user:

```text
$ARGUMENTS
```

If empty, ask the user what to refactor and stop. Reply in the user's
language. Subagents cannot spawn subagents, so **you** run every step and hand
each agent the previous agent's output. A refactor **never changes observable
behavior**: no new features, no API/contract changes, no schema changes. If
the goal requires any of those, stop and tell the user to use `/feature`.
Never commit. Do not ask the user anything except the final commit offer.

## Step 1 — Context (`context-giver`, haiku, read-only)

Spawn `context-giver` with the request. Ask it specifically for: the files in
scope and their dependents (who imports them), existing specs/E2E covering
them, the reference pattern the code should follow (sibling code or rule in
`.claude/rules/`), and the related `specs/NNN-*`. Keep the brief as
`CONTEXT`.

## Step 2 — Safety net (`qa-tester`)

Spawn `qa-tester` with the request and `CONTEXT`. Goal: pin the **current**
behavior of the code in scope. It must:

- list which behaviors are already covered and run only those specs (they
  must be Green);
- add characterization tests for uncovered behavior in scope (including
  tenancy cases), also Green against the current code;
- not touch production code; not weaken or delete existing tests.

If an existing test is already failing before the refactor, record it as
`PRE-EXISTING FAILURE`; do not let later steps hide it. Keep the report as
`SAFETY_NET` (files, exact commands to run, results).

## Step 3 — Refactor (`fullstack-specialist`)

Spawn `fullstack-specialist` with the request, `CONTEXT`, `SAFETY_NET` and
these rules: small, incremental steps; run the `SAFETY_NET` commands after
each step; keep them Green; do not edit, weaken or delete those tests (only
update imports/paths when files move, and say so); follow
`.claude/rules/*` and the package `CLAUDE.md`; run Biome on changed files and
`pnpm --filter <pkg> typecheck` at the end; no behavior change. Ask for its
standard report.

## Step 4 — Sync specs (`software-project-specialist`)

Spawn `software-project-specialist` with the request, `CONTEXT` (related
`specs/NNN-*`), the `fullstack-specialist` report and the diff summary
(`git diff --stat`, renamed/moved files). Instruct it to update the
affected features' artifacts so they describe the code as it now is, without
running the Spec Kit pipeline:

- `plan.md`, `data-model.md`, `research.md`, `contracts/`: paths, file and
  module names, structure and design decisions that changed;
- `tasks.md`: fix file paths in existing tasks; do **not** add, remove or
  re-open tasks (no `speckit-converge`);
- `spec.md`: only wording that referenced renamed concepts; requirements and
  acceptance scenarios stay as they are. If the refactor revealed that a
  requirement is actually wrong or different, do not edit it: report it as
  `SPEC_DRIFT` for the user;
- if no spec relates to the refactored code, say so and change nothing.

Ask for a list of files updated and any `SPEC_DRIFT`.

## Step 5 — Review (`code-reviewer`, read-only)

Spawn `code-reviewer` on the working-tree diff (code **and** specs) with the
request, and ask it to check in particular that behavior is unchanged, tests
were not weakened, the goal was actually met, and the specs match the code.
If the verdict is:

- `APPROVE` → Step 6.
- `CHANGES REQUESTED` → re-spawn `fullstack-specialist` with the findings
  (and `SAFETY_NET`), then Step 4 again if code moved, then `code-reviewer`. At most **2** fix rounds;
  after that, report the remaining findings instead of looping.

## Step 6 — Final check and wrap-up

Re-run the `SAFETY_NET` commands once yourself (single run, never the whole
suite, never watch). Report to the user: what was refactored, files changed
per package, safety-net results before and after, pre-existing failures,
specs updated, any `SPEC_DRIFT`, reviewer verdict and any open findings. Then ask: "Would you like me to
create a commit for these changes?" Commit only after explicit approval
(Conventional Commits, type `refactor`, per `CLAUDE.md`).
