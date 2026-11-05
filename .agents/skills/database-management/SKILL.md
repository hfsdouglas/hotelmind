---
name: database-management
description: >-
  Use this skill when modifying the Prisma schema, creating or applying migrations,
  updating seeds, indexing database fields, or handling database integrity and
  multi-tenant relationships in packages/api.
---

# Database Management Procedure

Step-by-step workflow for database modeling, migrations, and schema maintenance.

## Database Modeling Standards

- **Field Names**: Portuguese (`pt-BR`) in `snake_case`.
- **Table Mapping**: PascalCase model name with `@@map("tabela_plural_snake_case")`.
- **Primary Keys**: `id String @id @default(uuid())`.
- **Auditing**: `created_at DateTime @default(now())` and `updated_at DateTime @updatedAt`.
- **Multi-Tenancy**: Every business model MUST have `hotel_id String` with `@@index([hotel_id])`.
- **Indexes**: All foreign keys and query search fields must have `@@index`.
- **Cascades**: Use `onDelete: Cascade` for child records tied directly to parent lifecycle.

## Step-by-Step Workflow

### 1. Schema Modification
- Open `packages/api/prisma/schema.prisma`.
- Add or modify models respecting all modeling standards above.
- Ensure bidirectional relations are properly declared on both sides.

### 2. Generating & Applying Migrations
- Check database connectivity via environment configuration (`DATABASE_URL`).
- Run Prisma migration generation:
  ```bash
  pnpm --filter api exec prisma migrate dev --name <migration_description_in_snake_case>
  ```
- Review the generated SQL in `packages/api/prisma/migrations/<timestamp>_<name>/migration.sql`.

### 3. Updating Application Code & In-Memory Fakes
- Generate the updated Prisma client:
  ```bash
  pnpm --filter api exec prisma generate
  ```
- Update domain entities in `packages/api/src/core/entities/` to reflect new attributes.
- Update in-memory repository fakes in `packages/api/src/core/repositories/<domain>/in-memory/` so unit tests match the updated model structure.
- Update production repository implementations in `packages/api/src/core/repositories/<domain>/implementation/`.

### 4. Seeds & Fixtures (Optional)
- If new baseline data or permissions are required, update scripts in `packages/api/src/db/seeds/`.
- Ensure seeds use idempotent operations (`upsert` or check existence before `create`).

### 5. Verification
- Run backend unit and integration tests:
  ```bash
  pnpm --filter api test
  ```
