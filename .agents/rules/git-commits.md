# Git Commit Policy

## Mandatory Commit Approval

Before creating, suggesting, or executing any git commit, **always ask for explicit user approval**.

Never assume a commit should be created automatically.

**Required question:**
> Would you like me to create a commit for these changes?

Only proceed after receiving a clear affirmative response from the user.

## Conventional Commits Specification

All commit messages must follow the Conventional Commits specification:
```text
<type>(<scope>): <description>
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

## Commit Identity Rules

The agent must always use the Git repository's configured identity.
- **Never** manually set `user.name` or `user.email`.
- **Never** override commit author information.
- **Never** use AI-related identities (e.g. "Claude", "AI assistant", "bot").
- **Never** add `Co-Authored-By` trailers with AI identities.
- **Never** use `--author` flag.
- **Validation**: Ensure both `user.name` and `user.email` are configured in local repository or global git config. If missing, ask the user to configure them.

## Commit Quality
- Atomic and focused on a single logical change.
- Imperative mood, concise description.
- Verify tests and linting before proposing a commit.
