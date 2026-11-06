---
name: sync-agent-instructions
description: >-
  Use this skill to synchronize Antigravity instructions (.agents/rules/,
  .agents/skills/, .agents/agents/) whenever one or more CLAUDE.md files are
  updated in the HotelMind monorepo.
---

# Sync Agent Instructions Skill

This skill synchronizes Antigravity rules, skills, and agents with updates made to the authoritative `CLAUDE.md` files of HotelMind.

## Reference Sources & Target Mappings

### Authoritative Sources (`CLAUDE.md` files)
- `CLAUDE.md`: Global monorepo rules, workspace layout, naming, Biome, and git commit policies.
- `packages/api/CLAUDE.md`: Backend architecture, Fastify, Prisma, PostgreSQL, Zod, and TDD.
- `packages/admin/CLAUDE.md`: Admin frontend architecture, multi-tenant scoping, layouts, and tests.
- `packages/web/CLAUDE.md`: Hotel operations web frontend, components, suspense, and pagination.

### Antigravity Targets
- `.agents/rules/`: Permanent constraints and standards (`architecture.md`, `coding-standards.md`, `database.md`, `multi-tenancy.md`, `testing.md`, `git-commits.md`).
- `.agents/skills/`: On-demand execution procedures (`api-development`, `frontend-development`, `database-management`, `crud-development`, `speckit`, `sync-agent-instructions`).
- `.agents/agents/`: Specialized subagent personas (`fullstack-specialist.md`, `code-reviewer.md`).

---

## 9-Step Synchronization Procedure

When requested to synchronize instructions (e.g., "Sincronize as instruções do Antigravity com os CLAUDE.md", "Atualizei o CLAUDE.md da API"):

### Step 1: Detect Modified Sources
- Run the change detection helper if available:
  ```bash
  node .agents/skills/sync-agent-instructions/scripts/detect_changes.mjs
  ```
- Or inspect Git diffs directly:
  ```bash
  git diff HEAD -- CLAUDE.md packages/*/CLAUDE.md
  ```
- If git is not clean or files are uncommitted, inspect `git status` and compare directly with target files.

### Step 2: Semantic Analysis
- Identify semantic changes in each modified `CLAUDE.md`:
  - What architectural invariant changed?
  - Was a new naming convention or rule added?
  - Was an existing rule modified, relaxed, or tightened?
  - Was an obsolete pattern deprecated or removed?

### Step 3: Classification
Classify each semantic change:
- **Nova regra** (New rule)
- **Regra modificada** (Modified rule)
- **Regra removida** (Removed rule)
- **Mudança arquitetural** (Architectural shift)
- **Alteração de procedimento** (Procedure update)
- **Alteração de convenção** (Convention change)

### Step 4: Identify Affected Antigravity Targets
Map the classification to the specific target files:
- Architectural or naming changes -> `.agents/rules/architecture.md` or `.agents/rules/coding-standards.md`.
- Database or Prisma patterns -> `.agents/rules/database.md` and `.agents/skills/database-management/SKILL.md`.
- Multi-tenant query rules -> `.agents/rules/multi-tenancy.md`.
- Testing changes -> `.agents/rules/testing.md`.
- Workflow changes -> `.agents/skills/<relevant-skill>/SKILL.md`.
- Role responsibilities -> `.agents/agents/<relevant-agent>.md`.

### Step 5: Check Redundancy & Deduplication
- Ensure the instruction is NOT already covered in another target rule or skill.
- Maintain single source of truth: do not duplicate identical text across multiple rules.

### Step 6: Determine Minimal Diff Set
- Formulate the smallest set of edits needed in `.agents/` to reflect the semantic change.
- Never rewrite or copy entire `CLAUDE.md` documents into `.agents/`.

### Step 7: Present Plan or Request Confirmation
- For high-impact or ambiguous changes (e.g. removing established constraints, major architectural shifts), present a concise plan to the user before editing.
- For clear, localized, low-risk rule synchronizations, proceed directly.

### Step 8: Apply Updates
- Edit or create the affected target files in `.agents/rules/`, `.agents/skills/`, or `.agents/agents/`.
- Preserve all existing valid rules and metadata frontmatter.

### Step 9: Validate & Report
- Confirm consistent formatting and valid frontmatter.
- Produce the final synchronization summary report.

---

## Mandatory Guardrails

- **NEVER** copy a `CLAUDE.md` file wholesale into `.agents/`.
- **NEVER** modify `CLAUDE.md` during execution of this skill.
- **NEVER** modify `.gemini/mcp_config.json`.
- **NEVER** modify application source code, packages, or tests.
- **NEVER** execute git commits.
- **NEVER** re-introduce `AGENTS.md` files.

---

## Final Report Format

Always output the completion table:

| Arquivo | Ação | Motivo |
|---|---|---|
| `.agents/rules/<file>.md` | Atualizado / Criado / Sem alteração | <Breve justificativa> |
| `.agents/skills/<skill>/SKILL.md` | Atualizado / Criado / Sem alteração | <Breve justificativa> |

Include:
1. `CLAUDE.md` files analyzed.
2. Semantic changes identified.
3. Updated files.
4. Unchanged files.
5. Any discrepancies requiring user decision.
