# Research: Route DI Ownership

## Decision 1: Composition root for route dependencies

**Decision**: Each route plugin instantiates its own use cases and repositories
at the top of the plugin body.

**Rationale**: The route is the only module that knows which use case it needs
and how to wire it. Plugin/router files have no domain intent — they only
configure the framework. Moving composition into the plugin layer creates hidden
coupling and a non-obvious dependency graph.

**Alternatives considered**:
- Factory function with parameter injection (current, rejected): `setRoutes` becomes
  a dependency injector, which is not its responsibility.
- Server-level composition (rejected): same problem, even further from the domain.
- IoC container (rejected): overkill for this scale; adds a framework dependency.

---

## Decision 2: Test isolation approach for routes after removing factory pattern

**Decision**: Use Vitest `vi.mock` to replace `@/db/repositories` and `@/db/client`
at the module level before the route plugin is imported.

**Rationale**: The route now calls `new UserRepository(db)` directly. To supply
in-memory fakes, the test must intercept the module-level import, not a constructor
parameter. `vi.mock` is the standard Vitest mechanism for this — it is hoisted
before any imports in the test file, so the route plugin receives mocked constructors.

**Alternatives considered**:
- Keep factory pattern for testability (rejected): the factory was the violation
  being corrected; reverting for tests defeats the purpose.
- Real database in tests (rejected): violates Principle VII — no test should require
  a running database.
- Fastify `decorate` for test injection (rejected): would require the route to read
  dependencies from `app` rather than its own scope — implicit, not explicit.

---

## Decision 3: `vi.fn().mockImplementation(() => instance)` closure pattern

**Decision**: Declare `userRepo` and `hotelRepo` in outer scope; assign fresh
instances in `beforeEach`; reference them inside `mockImplementation` callbacks.

**Rationale**: `vi.mock` factory is called once per test file, not per test.
To get fresh, seedable repos per test, the mock must return the current value
of the outer variable — a closure reference. Assigning a new instance in
`beforeEach` updates what the constructor returns on the next `new` call.

**Alternatives considered**:
- Single shared repo instance (rejected): state leaks between tests.
- `vi.mocked(...).mockReturnValue(...)` in `beforeEach` (equivalent): slightly
  more verbose; closure pattern is cleaner.
