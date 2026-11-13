# Implementation Plan: Seleção de Reserva e Check-in pelo Calendário

**Branch**: `032-reservation-selection-checkin` | **Date**: 2026-11-12 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/032-reservation-selection-checkin/spec.md`

## Summary

No calendário (`web`), o clique numa barra passa a selecionar a reserva (anel azul com espaço transparente). Uma barra de ações com "Nova Reserva" (`CalendarPlus`), "Check-in" (`BellRing`) e "Detalhes" (`Info`) age sobre a seleção. O check-in abre um modal com dados e observações da reserva, verifica fichas FNRH pendentes e oferece preenchê-las (opcional), chama o endpoint existente `PATCH /reservas/:id/status` e, se escolhido, navega para `/reservas/:id?fnrh=pendente`, que abre o modal de ficha. Reservas em check-in e suítes com check-in ficam laranja (novo token), manutenção vira ardósia, um tooltip rico mostra o resumo da reserva. O view model do calendário deixa de descartar dados e de usar códigos numéricos. A API não muda: ganha testes de caracterização do endpoint de status (inclusive isolamento entre hotéis). Contratos não mudam.

## Technical Context

**Language/Version**: TypeScript (strict), Node (api), React 18 + Vite (web)

**Primary Dependencies**: web: Tailwind + shadcn/ui (Radix Tooltip, Dialog), Lucide, TanStack Query, Axios, React Router, Sonner, date-fns. api: Fastify, Zod, Prisma

**Storage**: N/A (sem mudança; PostgreSQL existente)

**Testing**: Vitest + React Testing Library + MSW (web), Playwright E2E with MSW worker (`VITE_E2E_MOCKS=true`), Vitest with in-memory repositories + `app.inject` (api)

**Target Platform**: browser desktop (recepção)

**Project Type**: pnpm monorepo web application (`packages/web`, `packages/api`, `packages/.contracts`)

**Performance Goals**: seleção e tooltip sem atraso perceptível (tooltip 300 ms de delay intencional); até 250 reservas x ~30 dias renderizadas sem regressão

**Constraints**: multi-tenant estrito (hotel do JWT); sem números mágicos; componentes em `src/components/reservas/`; texto pt-BR

**Scale/Scope**: 1 página principal alterada, 2 páginas ajustadas, 6 componentes novos, 2 hooks novos, 4 módulos `lib` novos, 0 endpoints novos

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|---|---|---|
| I. Contract-First | PASS | Nenhum tipo compartilhado novo; web usa `Reserva`, `Hospede`, `Quarto`, `ConfiguracaoCama`, `TIPOS_CAMA`, `ReservaStatus`, `ChangeReservaStatusPayload` de `@hotelmind/contracts`. View models locais ficam em `web/src/types/` (são do front, não compartilhados). |
| II. Clean Architecture | PASS | API inalterada. Web: regras puras em `lib/`, dados/mutação em `hooks/`, componentes apresentacionais, página só compõe. |
| III. SOLID | PASS | Hook de seleção de reserva separado do hook de período (SRP); modais/barra recebem callbacks (DIP). |
| IV. Explicit | PASS | `hoje` injetado no modal; sem `as` fora de fronteira; erros classificados explicitamente. |
| V. Low coupling | PASS | Comunicação web→api só via HTTP existente. |
| VI. Clean code | PASS | Remove `status_code` 0/1/2 e dados de pagamento inventados; constantes de rótulos; arquivos snake_case. |
| VII. Testability / TDD | PASS | Ordem de tarefas tests-first; MSW para HTTP; in-memory repos na API. |
| Multi-tenancy | PASS | Corpo do PATCH só com `status`; teste de rota garante 404 cross-hotel. |

Post-design re-check: PASS (sem violações; Complexity Tracking vazio).

## Project Structure

### Documentation (this feature)

```text
specs/032-reservation-selection-checkin/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── api_alterar_status.md
│   └── ui_components.md
├── checklists/requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
packages/api/src/
├── core/usecases/reservas/alterar_status_reserva_use_case.spec.ts   # NEW (characterization)
└── routes/reservas/reservas_routes.spec.ts                          # + PATCH /reservas/:id/status cases

packages/web/src/
├── index.css                                  # tokens selection-*, status-checkin*, maintenance slate
├── types/calendario_reserva.ts                # NEW view model types + label maps
├── lib/
│   ├── calendario_reserva.ts (+ .spec.ts)     # NEW map_reserva_to_calendario, derive_suite_status, map_quarto_to_room
│   ├── reserva_status.ts (+ .spec.ts)         # NEW labels, avaliar_check_in, is_check_in_antecipado
│   ├── fnrh.ts (+ .spec.ts)                   # NEW fichas_pendentes, primeira_ficha_pendente
│   └── camas.ts (+ .spec.ts)                  # NEW formatar_camas
├── contexts/reservations_context.tsx (+spec)  # Reservation re-exported from types/calendario_reserva.ts
├── hooks/
│   ├── use_reserva_selecionada.ts (+ .spec.tsx)  # NEW
│   └── use_check_in_reserva.ts (+ .spec.tsx)     # NEW
├── components/reservas/
│   ├── reservation_cell.tsx (+spec)           # selection ring, aria-pressed, checkin theme, rich tooltip
│   ├── calendar_day_cell.tsx (+spec)          # forwards selectedReservationId / isDragging
│   ├── reserva_resumo_card.tsx (+spec)        # NEW
│   ├── calendario_barra_acoes.tsx (+spec)     # NEW
│   ├── modal_check_in_reserva.tsx (+spec)     # NEW
│   ├── modal_detalhes_reserva.tsx (+spec)     # NEW (extracted from calendario.tsx)
│   ├── suite_status_indicator.tsx (+spec)     # NEW (extracted from calendario.tsx)
│   └── reserva_status_badge.tsx (+spec)       # NEW (extracted from reservas/index.tsx and [id]/index.tsx)
├── pages/app/reservas/
│   ├── calendario.tsx                          # wiring; mapping moved to lib
│   ├── calendario.spec.tsx                     # updated
│   ├── calendario_selecao.spec.tsx             # updated (bar click selects, not opens)
│   ├── calendario_check_in.spec.tsx            # NEW page spec
│   ├── [id]/index.tsx                          # ?fnrh=pendente, ReservaStatusBadge
│   ├── detalhe_fnrh_pendente.spec.tsx          # NEW detail page spec (?fnrh=pendente, check-in badge), MSW only
│   └── index.tsx                               # ReservaStatusBadge
├── tests/utils/make_calendario_reservation.ts # NEW test builder for the view model
├── mocks/
│   ├── reservas/reservas_handlers.ts           # fixtures RES-0001..4 + PATCH status handler
│   └── quartos/quartos_handlers.ts             # camas casal+solteiro on 101
└── tests/reservas/
    ├── calendario_selecao.e2e.ts               # updated (bar click selects)
    ├── calendario_selecao_reserva.e2e.ts       # NEW US1
    ├── calendario_check_in.e2e.ts              # NEW US2 (+ US7 body assertion)
    ├── calendario_check_in_fnrh.e2e.ts         # NEW US3
    ├── calendario_detalhes_reserva.e2e.ts      # NEW US4
    ├── calendario_resumo_reserva.e2e.ts        # NEW US5
    └── calendario_status_cores.e2e.ts          # NEW US6
packages/web/tailwind.config.ts                 # status.checkin, status.checkin-foreground, selection-ring
```

**Structure Decision**: Feature lives in `packages/web` following `.claude/rules/front-end.md` (components in `src/components/reservas/`, hooks in `src/hooks/`, pure logic in `src/lib/`, view models in `src/types/`). `packages/api` receives tests only. `packages/.contracts` untouched.

## Design Notes

1. **Mapping** (`lib/calendario_reserva.ts`): `map_reserva_to_calendario(reserva: Reserva, quarto: Quarto | undefined): Reservation` and `map_quarto_to_room(quarto, reservas): Room` replace the inline `useMemo` bodies in `calendario.tsx` (L715-817). Filtering by `STATUS_EXIBIDOS_NO_CALENDARIO` stays.
2. **Selection** (`use_reserva_selecionada`): regions = `[gridRef, actionsBarRef]`; `paused = novaReservaOpen || detalhesOpen || checkInOpen`; `idsVisiveis = reservations.map(r => r.id)`. Page glue: `onSelectReservation(r)` → `clear()` (range) + `selecionar(r.id)`; `onRangeStart` → `limpar()` then `startDrag`; date navigation handlers call both clears. `useCalendarRangeSelection.paused` no longer depends on the reservation selection.
3. **Check-in flow** (page): `opcaoRef` keeps the chosen `OpcaoCheckIn`; `useCheckInReserva({ onSucesso: () => { setCheckInOpen(false); if (opcao === 'preencher_fnrh') navigate(`/reservas/${id}?fnrh=pendente`) }, onNaoEncontrada: () => { setCheckInOpen(false); limpar() }, onTransicaoInvalida: () => setCheckInOpen(false) })`. `hoje` passed from the page's `today`.
4. **Detail page** `fnrh=pendente`: effect after `reserva` loads, guarded by `useRef`, sets `hospedeEmEdicao(primeira_ficha_pendente(reserva.hospedes ?? []))` mapped back to the full `ReservaHospede` and deletes the param with `replace: true`.
5. **Styling**: tokens and classes per research R8/R9. Selection ring clipping verified by US1 E2E (first row bounding box inside grid viewport) and adjusted with cell padding if needed.
6. **Tooltip**: `Tooltip delayDuration={300}`; `open={tooltipDisabled ? false : undefined}`.
7. **Tests to update** (behavior change from spec 031): `reservation_cell.spec.tsx`, `calendar_day_cell.spec.tsx`, `contexts/reservations_context.spec.tsx` (new view model), `calendario.spec.tsx`, `calendario_selecao.spec.tsx` (scenario "click on bar opens details" → "selects"), `calendario_selecao.e2e.ts` (same).

## Complexity Tracking

No violations.
