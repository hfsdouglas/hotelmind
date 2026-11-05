# Database & Prisma Rules

## ORM & Technology

- **Prisma** is the exclusive ORM, paired with **PostgreSQL**.
- Raw SQL is forbidden unless Prisma cannot express the query.
- Only repository implementations (`core/repositories/<domain>/implementation/`) may use Prisma. Routes and use cases must never import or reference the Prisma client.

## Schema Modeling Standards

- **Field Naming**: All database schema fields MUST use Portuguese (`pt-BR`) in `snake_case`.
- **Table Naming**: Models use PascalCase mapped to Portuguese pluralized snake_case table names via `@@map("tabela_em_portugues")`.
- **Primary Keys**: Always UUID strings with `@default(uuid())`.
- **Audit Timestamps**: Every business model must include:
  - `created_at DateTime @default(now())`
  - `updated_at DateTime @updatedAt`
- **Indexing**: All foreign keys (`hotel_id`, relation IDs) and frequently queried/filtered columns MUST declare `@@index`.
- **Cascades**: Use `onDelete: Cascade` where child records have no independent lifecycle without the parent.

## Integrity & Deletion Policies

- **Conflict on Delete**: When a DELETE request targets a resource with active dependent records, return **HTTP 409 Conflict** with an informative message. Never delete silently or cascade beyond the database schema.
- **`grupos_ids` Pattern**: The `User` model stores access group IDs as a comma-separated string in `grupos_ids` (`String? @db.Text`) without a pivot table. Membership checks must match exact IDs within comma boundaries (`WHERE grupos_ids = id OR grupos_ids LIKE '<id>,%' OR grupos_ids LIKE '%,<id>' OR grupos_ids LIKE '%,<id>,%'`).
