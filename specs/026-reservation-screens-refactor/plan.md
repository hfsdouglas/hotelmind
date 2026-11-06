# Implementation Plan: Refatoração das Telas de Reservas (Consulta e Nova Reserva)

**Branch**: `026-reservation-screens-refactor` | **Date**: 2026-11-05 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/026-reservation-screens-refactor/spec.md`

## Summary

Harmonização visual e ergonômica das telas de reservas do frontend (`packages/web/src/pages/app/reservas/index.tsx` e `nova.tsx`), tomando como referência o padrão já validado e consolidado das telas de orçamentos (`packages/web/src/pages/app/reservas/orcamentos/`). A refatoração abrange a unificação de tokens de tema (eliminando cores estáticas hardcoded), o alinhamento dimensional de controles de filtro com a barra de busca, a introdução de ícones auxiliares nos inputs, o cálculo com banner de confirmação de diárias, e o refinamento dos cards de seleção e valor total.

## Technical Context

**Language/Version**: TypeScript 5.7+ (Strict Mode), React 19

**Primary Dependencies**: Vite, Tailwind CSS, shadcn/ui, Lucide React, React Hook Form, Zod, TanStack Query

**Storage**: N/A (Frontend view layer refactoring; consome API Fastify e `@hotelmind/contracts`)

**Testing**: Vitest, React Testing Library, jsdom

**Target Platform**: Navegadores Web Modernos (Desktop & Mobile responsivo)

**Project Type**: Web Application Frontend (`packages/web`)

**Performance Goals**: Tempo de resposta interativo instantâneo (<50ms para feedback de datas/diárias no formulário)

**Constraints**: Preservar 100% das regras de negócio existentes (verificação de disponibilidade, bloqueio de conflito por modal, máscaras de telefone, paginação e contratos)

**Scale/Scope**: 2 páginas principais (`/reservas` e `/reservas/nova`) e seus testes associados

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio Constitucional | Status | Justificativa / Conformidade |
|---|---|---|
| **I. Contract-First Development** | ✅ PASS | Tipos e contratos de dados consumidos diretamente de `@hotelmind/contracts`. Não há quebra ou criação de novos contratos de API. |
| **II. Clean Architecture & Strict Layer Boundaries** | ✅ PASS | Modificações restritas à camada de apresentação frontend (`packages/web/src/pages/app/reservas`). Nenhuma lógica de infraestrutura ou banco violada. |
| **III. SOLID Principles** | ✅ PASS | Responsabilidades de formulário, listagem e apresentação mantidas coesas e segregadas. |
| **IV. Explicit over Implicit** | ✅ PASS | Uso explícito de tokens de Design System e componentes compartilhados, sem efeitos colaterais mágicos ou asserções inseguras. |
| **V. Low Coupling, High Cohesion** | ✅ PASS | Componentes dependem exclusivamente de seus hooks de serviço e contratos públicos. |
| **VI. Clean Code** | ✅ PASS | Convenção `snake_case` preservada em todos os arquivos e identificadores. Remoção de estilos redundantes e código morto. |
| **VII. Testability by Design** | ✅ PASS | Cobertura integral com testes de renderização e comportamento via Vitest/Testing Library. |
| **Component Location Rule** | ✅ PASS | Nenhuma pasta de componentes criada em `pages/`. Todos os subcomponentes reaproveitam `src/components/` global. |

## Project Structure

### Documentation (this feature)

```text
specs/026-reservation-screens-refactor/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
│   └── ui-contracts.md  # Definição dos contratos de componentes e rotas
└── checklists/
    └── requirements.md  # Checklist de qualidade da especificação
```

### Source Code (repository root)

```text
packages/web/
├── src/
│   ├── components/       # Componentes compartilhados UI e tabelas
│   │   ├── forms/        # CrudFormLayout
│   │   ├── data-table/   # ListPageLayout, PagedDataTable, SearchBar
│   │   ├── ui/           # Button, Input, Badge, DatePicker, etc.
│   │   └── reservas/     # ModalConflitoReserva
│   └── pages/
│       └── app/
│           └── reservas/
│               ├── index.tsx          # Tela de listagem/consulta de reservas (Refatoração de filtros e tabela)
│               ├── index.spec.tsx     # Teste de renderização da listagem
│               ├── nova.tsx           # Tela de nova reserva (Refatoração de passos, inputs e alinhamento)
│               ├── nova.spec.tsx      # Testes do formulário de nova reserva
│               └── reservas_pages.spec.tsx # Testes integrados de páginas de reservas
```

**Structure Decision**: A implementação ajustará diretamente os arquivos de página de reservas existentes sem violar a regra de localização de componentes, mantendo total simetria com as páginas de orçamentos correspondentes.

## Complexity Tracking

*Nenhuma violação constitucional identificada. A refatoração simplifica e padroniza a interface.*
