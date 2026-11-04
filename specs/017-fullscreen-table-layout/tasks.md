---
description: "Task list for fullscreen table layout, internal scroll, sticky header and bottom pagination"
---

# Tasks: Tabelas em Tela Cheia com Rolagem Interna, Cabeçalho Fixo e Paginação no Rodapé

**Input**: Design documents from `/specs/017-fullscreen-table-layout/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [quickstart.md](./quickstart.md)

## Phase 1: Setup & Core Table Primitives

- [X] T001 Atualizar `Table` e `TableHeader` em `packages/web/src/components/ui/table.tsx` para incluir `overflow-auto`, `containerClassName`, posicionamento `sticky top-0 z-10 bg-background` e `shadow-[0_1px_0_0_hsl(var(--border))]`.
- [X] T002 [P] Atualizar `Table` e `TableHeader` em `packages/admin/src/components/ui/table.tsx` espelhando a mesma estilização e isolamento de fundo.

## Phase 2: User Story 1 - Tabela em Tela Cheia e Rolagem Interna (Priority: P1)

- [X] T003 Ajustar `AppLayout` (`packages/web/src/pages/_layouts/app.tsx` e `packages/admin/src/pages/_layouts/app.tsx`) definindo `<main>` como `relative flex min-h-0 flex-1 flex-col overflow-y-auto p-6`.
- [X] T004 Atualizar `ListPageLayout` (`packages/web/src/components/data-table/list_page_layout.tsx` e `packages/admin`) para aplicar `className="flex flex-1 flex-col gap-6 min-h-0"` e fixar o cabeçalho e filtros com `shrink-0`.
- [X] T005 Configurar `PagedDataTable` para delegar altura total para a tabela com `flex flex-1 flex-col min-h-0`.

## Phase 3: User Story 2 - Paginação Fixada no Rodapé (Priority: P1)

- [X] T006 Ancorar `DataTablePagination` na base de `PagedDataTable` com `className="mt-auto"` e estilização com borda superior divisória (`border-t bg-background py-2 px-4`).
- [X] T007 [P] Garantir que `DataTablePagination` preserve os controles de página anterior, próxima, seletor de limite e contador em ambas as aplicações.

## Phase 4: User Story 3 & 4 - Skeletons e Atualização Atômica de Filtros (Priority: P2)

- [X] T008 Reduzir a quantidade padrão de linhas de `SearchResultsSuspense` para 8 linhas padrão em `packages/web` e `packages/admin`.
- [X] T009 Implementar `setParams` no hook `packages/web/src/hooks/usePaginacao.ts` para atualizações atômicas em lote com limpeza automática de `pagina` para 1.
- [X] T010 Atualizar o botão "Limpar filtros" da tela de tarifários (`packages/web/src/pages/app/tarifarios/index.tsx`) para acionar `setParams` e limpar filtros em uma única transição.
- [X] T011 [P] Executar testes automatizados de regressão em `web` e `admin` via `quickstart.md`.
