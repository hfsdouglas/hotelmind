# Implementation Plan: Suspense em Páginas de Pesquisa

**Branch**: `013-suspense-search-pages` | **Date**: 2026-11-02 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/013-suspense-search-pages/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Adotar um padrão de resultados com React Suspense em todas as oito páginas atuais de pesquisa/filtro. Cada aplicação terá componentes locais equivalentes: uma fronteira Suspense somente para resultados, skeletons alinhados às tabelas, status acessível não bloqueante e transições que preservam os resultados anteriores enquanto a consulta mais recente resolve.

## Technical Context

<!--
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript 5.x com React 19 e JSX

**Primary Dependencies**: Vite, TanStack Query 5, React Router, Tailwind CSS, Vitest, React Testing Library, MSW

**Storage**: N/A; consultas existentes e parâmetros de URL permanecem inalterados

**Testing**: Vitest + React Testing Library; typecheck/build via TypeScript e Vite

**Target Platform**: Navegadores suportados pelas aplicações Vite `admin` e `web`

**Project Type**: Monorepo com duas aplicações frontend web independentes

**Performance Goals**: Não adicionar chamadas de API; manter a resposta visual imediata dos controles e preservar o último resultado resolvido durante refetch

**Constraints**: Suspense restrito à área de resultados; controles e foco permanecem disponíveis; skeletons e status devem ser acessíveis; cada aplicação mantém sua implementação local equivalente; nomes de arquivos seguem `snake_case`

**Scale/Scope**: Oito páginas existentes: quatro em `admin` e quatro em `web`; sem alteração de API, contratos de dados, banco ou páginas não pesquisáveis

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Before Phase 0

- **I. Contract-First Development**: PASS — não há contrato de serviço ou payload alterado; o contrato comportamental de UI será documentado em `contracts/search-suspense.md` e não será colocado em `packages/.contracts`, que é type-only.
- **II. Clean Architecture & Strict Layer Boundaries**: PASS — a mudança fica nas camadas de componentes/páginas frontend; chamadas continuam nos serviços existentes.
- **III. SOLID**: PASS — a fronteira, skeleton e status terão responsabilidades separadas; páginas apenas compõem e orquestram.
- **IV. Explicit over Implicit**: PASS — estados de pending, busy e status serão explícitos nas props/fluxos; nenhum singleton ou configuração nova será introduzido.
- **V. Low Coupling, High Cohesion**: PASS — `admin` e `web` mantêm implementações locais equivalentes, sem acoplamento runtime entre pacotes.
- **VI. Clean Code**: PASS — novos arquivos e símbolos seguirão convenções do projeto; lógica repetida será limitada aos adapters locais necessários pelos dois `DataTable` diferentes.
- **VII. Testability by Design**: PASS — componentes e páginas terão testes isolados com React Testing Library; serviços e handlers existentes permanecem nas bordas.

## Project Structure

### Documentation (this feature)

```text
specs/013-suspense-search-pages/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)
<!--
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
packages/admin/src/
├── components/
│   ├── data-table/
│   │   ├── data_table.tsx                 # existing table adapter
│   │   ├── search_results_suspense.tsx    # local boundary/status/skeleton composition
│   │   └── search_results_suspense.spec.tsx
│   └── ui/
│       └── skeleton.tsx                   # local primitive if required by implementation
├── hooks/
│   └── usePaginacao.ts                    # transition-aware URL updates
└── pages/app/
    ├── hoteis/index.tsx
    ├── rotas/index.tsx
    ├── administradores/index.tsx
    └── suporte/index.tsx

packages/web/src/
├── components/
│   ├── data-table/
│   │   ├── data_table.tsx                 # existing table adapter
│   │   ├── search_results_suspense.tsx    # local boundary/status/skeleton composition
│   │   └── search_results_suspense.spec.tsx
│   └── ui/
│       └── skeleton.tsx                   # local primitive if required by implementation
├── hooks/
│   └── usePaginacao.ts                    # transition-aware URL updates
└── pages/app/
    ├── grupos/index.tsx
    ├── usuarios/index.tsx
    ├── categorias_quartos/index.tsx
    └── quartos/index.tsx
```

**Structure Decision**: Manter a implementação dentro de cada aplicação, junto aos componentes `data-table` e ao hook de paginação já usados pelas páginas. Separar o shell de filtros dos filhos de resultados permite que a fronteira Suspense cubra somente os resultados. O contrato comportamental comum fica documentado em `contracts/search-suspense.md`, sem criar um pacote compartilhado.

## Implementation Phases

### Phase 0: Research

Consolidar as decisões de Suspense, transições React 19, TanStack Query 5, skeletons e status acessível em [research.md](./research.md).

### Phase 1: Design

Usar [data-model.md](./data-model.md) para os estados temporários e [contracts/search-suspense.md](./contracts/search-suspense.md) para manter paridade entre aplicações. Validar com [quickstart.md](./quickstart.md).

### Post-design Constitution Check

- **I / II**: PASS — nenhuma interface de serviço ou camada de domínio foi alterada; toda a lógica permanece em componentes/hooks frontend e serviços existentes.
- **III / IV / V / VI**: PASS — boundary, skeleton/status e páginas têm responsabilidades explícitas; implementações locais evitam acoplamento entre pacotes.
- **VII**: PASS — o plano exige testes do boundary/status e regressão dos oito fluxos com dados resolvidos, vazios e erros tratados.
- **Complexity**: PASS — não há violação constitucional; nenhum item entra em Complexity Tracking.

## Complexity Tracking

No constitution violations identified; no complexity exception is required.
