# Implementation Plan: Dados Dinâmicos no Calendário de Reservas e Listagem de Quartos

**Branch**: `030-reservation-calendar-dynamic-data` | **Date**: 2026-11-07 | **Spec**: [spec.md](file:///home/douglas/www/hotelmind/specs/030-reservation-calendar-dynamic-data/spec.md)

**Input**: Feature specification from `/specs/030-reservation-calendar-dynamic-data/spec.md`

## Summary

Substituir os dados estáticos (`mockRooms` e `mockReservations`) da página do calendário de reservas (`packages/web/src/pages/app/reservas/calendario.tsx`) por integração dinâmica via TanStack Query:
1. **Listagem de quartos**: Obter quartos dinamicamente via `quartosService.list` (`identificacao`, `categoria.nome`), calculando o indicador operacional de status (`bloqueado`, `ocupado` ou `disponivel`).
2. **Listagem de reservas**: Obter reservas dinamicamente via `reservasService.list`.
3. **Filtro restritivo de status**: Exibir estritamente reservas com status `a_confirmar`, `confirmada` e `check_in`. Omitir rigorosamente `cancelada`, `check_out` e `no_show`.
4. **Preservação de estilos visuais**: Manter as 2 representações visuais existentes nas barras de reserva (`check_in` com `bg-primary`, `confirmada` e `a_confirmar` com `bg-primary/50`).
5. **Preservação delicada da experiência visual**: Manter 100% da responsividade, layout de colunas responsivas sem barra de rolagem forçada, cabeçalho sticky `z-20`, coluna fixa esquerda `z-10`, canto sticky `z-30`, contexto de isolamento CSS `isolate`, controles de navegação e modal `Dialog` de detalhes da hospedagem.

## Technical Context

**Language/Version**: TypeScript 5.8 / React 19 no pacote `packages/web`

**Primary Dependencies**: TanStack Query (`useQuery`), date-fns (`pt-BR`), Lucide React, Radix UI Dialog / Tooltip / Select, Vitest + Testing Library

**Storage**: PostgreSQL / Prisma ORM via backend Fastify (`packages/api`), consumido por `@hotelmind/contracts` e `axios`

**Testing**: Vitest + `@testing-library/react` (`packages/web`)

**Target Platform**: Navegadores desktop modernos (resoluções padrão e monitores ultrawide de recepção)

**Project Type**: Frontend web SPA em monorepo

**Performance Goals**: Carregamento da grade com dados reais em < 250ms com cacheamento suave do TanStack Query

**Constraints**: Preservação estrita das classes Tailwind, sem alteração de UX/UI existente; isolamento CSS `isolate` mantido; Biome para formatação

## Constitution Check

- **I. Contract-First Development**: ✅ Pass — Utilização dos tipos contratuais `Quarto` e `Reserva` de `@hotelmind/contracts`.
- **II. Clean Architecture & Strict Layer Boundaries**: ✅ Pass — Serviços de API (`quartosService`, `reservasService`) isolados dos componentes visuais.
- **III. SOLID Principles**: ✅ Pass — `ReservationCell` continua exclusivamente responsável pela renderização da célula; `Calendario` gerencia grade e navegação temporal.
- **IV. Explicit over Implicit**: ✅ Pass — Filtro de status e cálculo de status do quarto expressos de forma declarativa e pura.
- **V. Low Coupling, High Cohesion**: ✅ Pass — Injeção de dependências limpa via TanStack Query.
- **VI. Clean Code**: ✅ Pass — Nomenclatura clara em `pt-BR`/`snake_case`, remoção completa de dead code mockado.
- **VII. Testability by Design**: ✅ Pass — `calendario.spec.tsx` atualizado e expandido cobrindo integração com queries e filtros de status.

## Project Structure

### Documentation (this feature)

```text
specs/030-reservation-calendar-dynamic-data/
├── plan.md              # Este arquivo
├── research.md          # Pesquisa técnica e decisões de arquitetura
├── data-model.md        # Mapeamento de dados e contratos
├── quickstart.md        # Guia rápido de verificação e testes
└── tasks.md             # Tarefas ordenadas por dependência
```

### Source Code

```text
packages/web/src/
├── api/
│   ├── quartos.service.ts
│   └── reservas.service.ts
├── components/
│   ├── reservation_cell.tsx
│   └── ui/
│       ├── dialog.tsx
│       └── tooltip.tsx
├── contexts/
│   └── reservations_context.tsx
└── pages/app/reservas/
    ├── calendario.tsx
    └── calendario.spec.tsx
```

## Complexity Tracking

Nenhuma violação constitucional.
