# Quickstart: Seleção de Reserva e Check-in pelo Calendário

## Prerequisites

- `pnpm install` at repo root; Playwright chromium installed in `packages/web` (see `.claude/rules/front-end.md`).
- MSW fixtures (`packages/web/src/mocks/reservas/reservas_handlers.ts`) contain, in suites 101/102 around 2026-12-01..2026-12-10 (E2E clock fixed at 2026-12-01):
  - see the fixture table at the top of `tasks.md`: RES-0101 `confirmada` 2/2 fichas, obs "Chegada tardia"; RES-0102 `confirmada` 0/2 fichas (`pendente` + `rascunho`); RES-0103 `a_confirmar`; RES-0104 `check_in`
  - Suite 101 with camas `casal x1`, `solteiro x1`. (Codes RES-0001..0003 in spec.md Independent Tests are illustrative.)

## Validate

API characterization (no production change expected):

```bash
pnpm --filter api exec vitest run src/core/usecases/reservas/alterar_status_reserva_use_case.spec.ts src/routes/reservas/reservas_routes.spec.ts
```

Expect: 200 `confirmada → check_in`, 422 `a_confirmar → check_in`, 404 for another hotel's reservation (status unchanged), 401 without token.

Web unit/integration (only the files of this feature):

```bash
pnpm --filter web exec vitest run src/lib/calendario_reserva.spec.ts src/lib/reserva_status.spec.ts src/lib/fnrh.spec.ts src/lib/camas.spec.ts \
  src/hooks/use_reserva_selecionada.spec.tsx src/hooks/use_check_in_reserva.spec.tsx \
  src/components/reservas src/pages/app/reservas
```

E2E:

```bash
pnpm --filter web exec playwright test src/tests/reservas/calendario_*.e2e.ts
```

## Manual check (`pnpm --filter web dev`, `/reservas/calendario`)

1. Click a reservation bar: no modal, blue ring with transparent gap on all its bars (light and dark theme; first row not clipped).
2. Hover a bar: large summary card with guests, beds, people, values, observations.
3. Select RES-0101 → "Check-in" (bell) → modal shows data + "Chegada tardia" → confirm → bar and suite dot orange, toast.
4. Select RES-0102 → "Check-in" → pending warning → "Fazer check-in e preencher FNRHs" → lands on `/reservas/<id>` with "Editar ficha" open for position 1; URL loses `?fnrh=pendente`.
5. Select any → "Detalhes" → real data, "Abrir reserva" link.
6. `/reservas` list: check-in badge orange.
7. Biome: `pnpm biome check packages/web packages/api`.
