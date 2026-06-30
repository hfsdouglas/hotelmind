# Quickstart / Validation Guide: API Package Structural Alignment

**Feature**: 007-api-structure-align
**Date**: 2026-06-30 (v2)

---

## Prerequisites

- pnpm installed
- PostgreSQL running and `DATABASE_URL` set in `packages/api/.env`
- Working from the monorepo root

## Validation Steps

### Step 1: TypeScript compilation passes

```bash
cd packages/api && pnpm tsc --noEmit
```

**Expected**: Zero errors. Any error indicates a broken import path.

---

### Step 2: All tests pass

```bash
cd packages/api && pnpm test
```

**Expected**: All `.spec.ts` files pass. Confirms all in-memory fakes are reachable at their new paths and all plugin imports resolve.

---

### Step 3: No references to old `db/repositories` paths remain

```bash
grep -r "@/db/repositories" packages/api/src
```

**Expected**: Zero results.

---

### Step 4: No references to old `db/client` path remain

```bash
grep -r "@/db/client" packages/api/src
```

**Expected**: Zero results.

---

### Step 5: No references to old flat contract paths remain

```bash
grep -r "@/core/repositories/grupo_repository\|@/core/repositories/usuario_repository\|@/core/repositories/hotel_repository\|@/core/repositories/user_repository\|@/core/repositories/rota_repository\|@/core/repositories/administrator_repository\|@/core/repositories/admin_hotel_repository\|@/core/repositories/admin_rota_repository" packages/api/src
```

**Expected**: Zero results.

---

### Step 6: No hyphenated plugin filenames remain

```bash
ls packages/api/src/plugins/ | grep -
```

**Expected**: Zero results (empty output).

---

### Step 7: `db/` contains only `seeds/`

```bash
find packages/api/src/db -type f | grep -v seeds
```

**Expected**: Zero results — no files outside `db/seeds/`.

---

### Step 8: `core/repositories/index.ts` is populated

```bash
grep "export" packages/api/src/core/repositories/index.ts | wc -l
```

**Expected**: 8 or more lines (one export per domain).

---

### Step 9: `lib/prisma.ts` exists

```bash
ls packages/api/src/lib/prisma.ts
```

**Expected**: File exists.

---

### Step 10: Dev server starts without errors

```bash
cd packages/api && pnpm dev
```

**Expected**: Server binds to its port with no import resolution errors in the output.

---

## What NOT to validate here

- No new API endpoints — do not test for new routes
- No database schema changes — do not run migrations
- No behavioral changes — existing integration tests cover correctness
