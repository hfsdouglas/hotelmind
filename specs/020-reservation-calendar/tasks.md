---
description: "Task list for reservation calendar and room occupancy grid"
---

# Tasks: Mapa e Calendário Visual de Ocupação de Reservas por Quarto

**Input**: Design documents from `/specs/020-reservation-calendar/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [quickstart.md](./quickstart.md)

## Phase 1: Setup & UI Primitives

- [X] T001 Implementar componentes primitivos `Dialog` em `packages/web/src/components/ui/dialog.tsx` e `Tooltip` em `packages/web/src/components/ui/tooltip.tsx`.
- [X] T002 Implementar `PageHeader` em `packages/web/src/components/page_header.tsx`.
- [X] T003 Criar `ReservationsProvider` e hook `useReservations` em `packages/web/src/contexts/reservations_context.tsx`.

## Phase 2: User Story 1 & 2 - Grade Matricial e Células Meio a Meio

- [X] T004 Criar componente `ReservationCell` em `packages/web/src/components/reservation_cell.tsx` com renderização de meia-célula para check-in (`right-0 w-1/2`), check-out (`left-0 w-1/2`) e diária intermediária (`w-full`).
- [X] T005 Implementar a tabela matricial do calendário em `packages/web/src/pages/app/reservas/calendario.tsx` com cabeçalho congelado no topo e quartos fixados à esquerda com indicadores de status por cor e tooltip.
- [X] T006 Implementar lógica de convivência não colidente de check-in e check-out consecutivos no mesmo quarto e dia.

## Phase 3: User Story 3 - Navegação e Cálculo Responsivo de Dias

- [X] T007 Implementar barra de ferramentas de data com seletores de mês, ano, avanço/recuo de 1 dia e 15 dias.
- [X] T008 Implementar cálculo dinâmico de quantidade de dias visíveis com base na largura da viewport e listener de `resize`.

## Phase 4: User Story 4 & 5 - Modal de Detalhes, Barra de Ações e Isolamento CSS

- [X] T009 Conectar clique em célula de reserva para abrir o modal `Dialog` com seções completas de hóspede, hospedagem, pagamento e observações.
- [X] T010 Adicionar barra de rodapé com atalho de "Nova Reserva" (`Plus` com tooltip).
- [X] T011 Aplicar propriedade CSS `isolate` e ajustes de z-index na `Sidebar` e `AppLayout` para sobreposição fluida do menu.
- [X] T012 Atualizar rotas em `packages/web/src/routes.tsx` e registrar rotas de Reservas em `packages/api/src/db/seeds/routes_seed.ts`.
- [X] T013 [P] Criar testes unitários e de integração em `packages/web/src/pages/app/reservas/calendario.spec.tsx`.
- [X] T014 [P] Executar validação automatizada via `quickstart.md`.
