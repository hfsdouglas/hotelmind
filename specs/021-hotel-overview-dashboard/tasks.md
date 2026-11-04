---
description: "Task list for hotel overview dashboard and operational metrics"
---

# Tasks: Painel de Visão Geral Operacional e Métricas Hoteleiras

**Input**: Design documents from `/specs/021-hotel-overview-dashboard/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [quickstart.md](./quickstart.md)

## Phase 1: Setup & UI Calendar Components

- [X] T001 Implementar o componente `Calendar` em `packages/web/src/components/ui/calendar.tsx` com suporte a `captionLayout="dropdown"` e selects customizados com Radix UI.
- [X] T002 Implementar hook `usePageTitle` em `packages/web/src/hooks/use_document_title.ts` para sincronização de `document.title`.
- [X] T003 [P] Criar testes unitários para o componente `Calendar` em `packages/web/src/components/ui/calendar.spec.tsx`.

## Phase 2: User Story 1 - Métricas Principais (KPIs)

- [X] T004 Criar o componente de página `VisaoGeral` em `packages/web/src/pages/app/dashboard/visao_geral.tsx` integrando `PageHeader` com título e descrição.
- [X] T005 Renderizar a primeira linha de 4 cartões de KPIs: Total de Pessoas, Total de Crianças, Taxa de Ocupação e Reservas Confirmadas.
- [X] T006 Renderizar a segunda linha de 4 cartões de fluxo: Check-ins Hoje, Check-outs Hoje, Quartos Ocupados e Quartos Disponíveis.

## Phase 3: User Story 2 - Distribuições por Regime e Categoria de Quarto

- [X] T007 Implementar a seção "Pessoas por Regime de Alimentação" com barras de progresso proporcionais para Café da Manhã, Meia Pensão, Pensão Completa e Sem Refeição.
- [X] T008 Implementar a grade de "Distribuição por Tipo de Quarto" com contadores em cartões individuais para cada categoria habitacional.

## Phase 4: User Story 3 & 4 - Popover de Data, Rotas e Testes

- [X] T009 Conectar o botão acionador no cabeçalho com `Popover` contendo o `Calendar`, atualizando o estado de data e recalculando as métricas ao selecionar um dia.
- [X] T010 Mapear rotas `/dashboard/visao-geral`, `/dashboard` e `/dashboard/index` em `packages/web/src/routes.tsx`.
- [X] T011 [P] Criar testes unitários e de renderização da página em `packages/web/src/pages/app/dashboard/visao_geral.spec.tsx`.
- [X] T012 [P] Executar testes automatizados da suíte via `quickstart.md`.
