---
name: check-missing-tests
description: Check which HotelMind source files (api, web, admin) lack tests and hand the findings to the qa-tester agent. Use when asked to verify test coverage gaps, find untested files, or "check missing tests".
---

# Check missing tests

Optional arguments: a package (`api`, `web`, `admin`) to restrict the scan, and
`--orphans` to also list existing specs outside the tested scope (candidates
for removal; never delete them without the user's approval). Default: all
three packages, gaps only.

## Steps

1. Spawn the `tests-finder` agent (Agent tool, `subagent_type:
   "tests-finder"`). Prompt it with the scope (argument or "all
   packages", plus a request for the orphans section if `--orphans` was given) and ask for its standard report. Do not scan files yourself.
2. Show the user the report: per-package counts and the list of untested
   files. If it says `No test gaps found.`, say so and stop.
3. Ask the user whether to have QA write the missing tests, and for which
   packages/files (default: all listed). Do not proceed without that answer.
4. On approval, spawn the `qa-tester` agent with this context:
   - the exact gap list approved (paths + kind + hint);
   - reminders: TDD, tenancy cases, no tests for `components/ui/*`, snake_case,
     run only the new specs (never the full suite, never watch), Biome on
     changed files, do not commit;
   - ask for its standard report.
   Independent packages may be given to separate `qa-tester` runs in parallel.
5. Summarize the QA report for the user: files created, test results, and
   anything left untested. Offer to create a commit (only commit on explicit
   approval).
