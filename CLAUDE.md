# Hotel Management System

A hotel management system built as a monorepo with a microservices architecture.

## Package Manager

pnpm with workspaces. Workspace packages are declared in the root `package.json`.

## Monorepo Layout

All apps and services live under `packages/`. When creating a new app or service, place it as a new directory under `packages/`.

```
packages/
  api/    # HTTP server / backend API (gateway or primary service)
  web/    # Front-end web application
```

## Architecture

The system is designed around microservices. Each service is an independent package under `packages/` with its own responsibilities and deployment lifecycle. Services communicate over the network rather than sharing in-process code.

When adding a new service, create it as a new package under `packages/` and treat it as an autonomous unit.

## Tooling

- **Biome** — linting and formatting (config: `biome.json`)
  - 2-space indentation, 80-char line width
  - Single quotes, no semicolons (asNeeded)

## Git Commit Policy

### Commit Approval Required

Before creating, suggesting, or executing any git commit, always ask for explicit user approval.

Never assume a commit should be created automatically.

Required question:

> Would you like me to create a commit for these changes?

Only proceed after receiving a clear affirmative response from the user.

### Commit Message Standard

All commit messages must follow the Conventional Commits specification:

```text
<type>(<scope>): <description>
```

Examples:

```text
feat(auth): add JWT authentication
fix(api): handle invalid token validation
refactor(users): simplify profile update flow
docs(readme): update installation instructions
test(auth): add login integration tests
```

### Allowed Types

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Formatting or style changes only
- `refactor`: Code restructuring without behavior changes
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `build`: Build system or dependency changes
- `ci`: CI/CD changes
- `chore`: Maintenance tasks
- `revert`: Revert a previous commit

### Commit Quality Rules

- Keep commits atomic and focused on a single logical change.
- Do not combine unrelated changes in the same commit.
- Use clear and concise descriptions.
- Write commit messages in the imperative mood.
- Verify tests and linting before proposing a commit.

### Workflow

1. Complete the requested changes.
2. Summarize what was modified.
3. Ask for commit approval.
4. If approved, generate a Conventional Commit message.
5. Create the commit only after approval.
