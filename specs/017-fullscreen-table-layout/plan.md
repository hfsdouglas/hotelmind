# Implementation Plan: Tabelas em Tela Cheia com Rolagem Interna, Cabeçalho Fixo e Paginação no Rodapé

**Branch**: `017-fullscreen-table-layout` | **Date**: 2026-11-03 | **Spec**: [spec.md](file:///home/douglas/www/hotelmind/specs/017-fullscreen-table-layout/spec.md)

**Input**: Feature specification from `/specs/017-fullscreen-table-layout/spec.md`

## Summary

Padronizar as páginas de listagem e pesquisa dos módulos de `web` e `admin`:
1. Expansão de `AppLayout`, `ListPageLayout` e `PagedDataTable` para ocupar 100% da altura da viewport (`flex flex-1 flex-col min-h-0`).
2. Tabela de dados (`Table`) com container de rolagem vertical interna (`overflow-auto flex-1`), cabeçalho congelado (`sticky top-0 bg-background z-10 shadow-[0_1px_0_0_hsl(var(--border))]`) e células de cabeçalho opacas.
3. Fixação da barra de paginação (`DataTablePagination`) no rodapé da área de trabalho (`mt-auto shrink-0 border-t bg-background py-2 px-4`).
4. Redução da quantidade padrão de linhas do esqueleto de suspense (`SearchResultsSuspense`) para 8 linhas.
5. Suporte à atualização atômica de múltiplos parâmetros na URL (`setParams`) no hook `usePaginacao`, redefinindo a página para 1 em alterações de filtros.

## Technical Context

**Language/Version**: TypeScript 5.8 (React 19 em `packages/web` e `packages/admin`)

**Primary Dependencies**: React 19, Tailwind CSS 4, Lucide React, Vitest + Testing Library

**Storage**: N/A (parâmetros de estado sincronizados na URL via `react-router-dom`)

**Testing**: Vitest + `@testing-library/react` em `packages/web` e `packages/admin`

**Target Platform**: Navegadores web modernos em monitores de alta e baixa resolução

**Project Type**: Frontend compartilhado em monorepo

**Performance Goals**: Zero Layout Shift perceptível (CLS < 0.05) durante carregamento de skeletons; rolagem a 60fps sem repaints globais de página

**Constraints**: `snake_case` compulsório; Biome para linting e formatação; compatibilidade idêntica entre `packages/web` e `packages/admin`

**Scale/Scope**: Componentes `Table`, `ListPageLayout`, `PagedDataTable`, `DataTablePagination`, `SearchResultsSuspense`, `usePaginacao` e layouts `AppLayout`

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Contract-First Development**: ✅ Pass — Não altera contratos de backend; os contratos de metadados de paginação (`meta: { pagina, limite, total, ultima_pagina }`) são integralmente respeitados.
- **II. Clean Architecture & Strict Layer Boundaries**: ✅ Pass — Componentes de UI de apresentação desacoplados de regras de transporte HTTP.
- **III. SOLID Principles**: ✅ Pass — `ListPageLayout` provê estrutura visual; `PagedDataTable` gerencia a tabela e paginação; `usePaginacao` encapsula a sincronização da URL.
- **IV. Explicit over Implicit**: ✅ Pass — Parâmetros de paginação e filtros são explícitos na URL e tipados em `PaginacaoParams`.
- **V. Low Coupling, High Cohesion**: ✅ Pass — `Table` e `DataTable` permanecem genéricos e agnósticos quanto ao tipo de entidade exibida.
- **VI. Clean Code**: ✅ Pass — Nomenclatura descritiva, ausência de magic numbers e formatação Biome.
- **VII. Testability by Design**: ✅ Pass — Suítes de testes automatizados cobrem `PagedDataTable`, `usePaginacao`, filtros e ações de paginação.

## Project Structure

### Documentation (this feature)

```text
specs/017-fullscreen-table-layout/
├── plan.md              # Este arquivo
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── checklists/
│   └── requirements.md  # Checklist de validação
└── tasks.md             # Phase 2 output
```

### Source Code

```text
packages/
├── admin/src/
│   ├── components/
│   │   ├── data-table/
│   │   │   ├── data_table.tsx
│   │   │   ├── data_table_pagination.tsx
│   │   │   ├── list_page_layout.tsx
│   │   │   ├── paged_data_table.tsx
│   │   │   └── search_results_suspense.tsx
│   │   └── ui/table.tsx
│   └── pages/_layouts/app.tsx
└── web/src/
    ├── components/
    │   ├── data-table/
    │   │   ├── data_table.tsx
    │   │   ├── data_table_pagination.tsx
    │   │   ├── list_page_layout.tsx
    │   │   ├── paged_data_table.tsx
    │   │   └── search_results_suspense.tsx
    │   └── ui/table.tsx
    ├── hooks/usePaginacao.ts
    └── pages/_layouts/app.tsx
```
