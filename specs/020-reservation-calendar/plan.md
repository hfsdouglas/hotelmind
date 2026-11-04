# Implementation Plan: Mapa e Calendário Visual de Ocupação de Reservas por Quarto

**Branch**: `020-reservation-calendar` | **Date**: 2026-11-03 | **Spec**: [spec.md](file:///home/douglas/www/hotelmind/specs/020-reservation-calendar/spec.md)

**Input**: Feature specification from `/specs/020-reservation-calendar/spec.md`

## Summary

Implementar a página de rack e calendário de reservas (`packages/web`):
1. **Grade matricial temporal**: Quartos no eixo vertical com coluna fixa (`sticky left-0 bg-background z-20 w-[120px]`) e dias consecutivos no eixo horizontal com cabeçalho fixo (`sticky top-0 z-20 bg-muted`), destacando a coluna do dia corrente.
2. **Cálculo responsivo de dias visíveis**: Cálculo dinâmico baseado na largura útil da tela (mínimo de 15 dias) sem exigir scroll horizontal forçado.
3. **Células de reserva inteligentes (`ReservationCell`)**: Representação de check-in (metade direita `w-1/2 right-0`), noite intermediária (largura total `w-full`) e check-out (metade esquerda `w-1/2 left-0`), com convivência de saídas e entradas consecutivas na mesma célula.
4. **Navegação de datas**: Controles para avançar/recuar 1 dia e 15 dias, e seletores diretos de mês (`Select`) e ano (`Input type="number"`).
5. **Modal de detalhes (`Dialog`)**: Exibição completa de dados cadastrais do hóspede, quarto, datas, pagamento e notas.
6. **Isolamento de camada**: Propriedade CSS `isolate` para evitar conflito de empilhamento z-index com a barra lateral retrátil.
7. **Seed de rotas**: Registro das rotas do módulo de Reservas em `routes_seed.ts`.

## Technical Context

**Language/Version**: TypeScript 5.8 (React 19 no pacote `packages/web`)

**Primary Dependencies**: React 19, Tailwind CSS 4, date-fns (com `pt-BR`), Lucide React, Radix UI Dialog / Tooltip / Select, Vitest + Testing Library

**Storage**: Mock em memória estruturado via `ReservationsProvider` (preparado para consumo de endpoints REST de reservas)

**Testing**: Vitest + `@testing-library/react` (`packages/web`)

**Target Platform**: Navegadores web modernos (resoluções desktop e telas largas de recepção)

**Project Type**: Módulo frontend em monorepo

**Performance Goals**: Renderização da grade em < 300ms para até 30 quartos e 30 dias; resposta de clique de modal < 100ms

**Constraints**: `snake_case` compulsório; Biome para linting e formatação; isolamento rigoroso de CSS z-index

**Scale/Scope**: `calendario.tsx`, `reservation_cell.tsx`, `page_header.tsx`, `reservations_context.tsx`, `dialog.tsx`, `tooltip.tsx`, `routes.tsx` e `routes_seed.ts`

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Contract-First Development**: ✅ Pass — Tipagem de `Reservation` e `Room` estruturada no contexto de reservas.
- **II. Clean Architecture & Strict Layer Boundaries**: ✅ Pass — Componentes de apresentação desacoplados da gestão de estado em `reservations_context.tsx`.
- **III. SOLID Principles**: ✅ Pass — `ReservationCell` é responsável apenas por desenhar a barra da reserva na célula; `Calendario` agrega a grade e navegação.
- **IV. Explicit over Implicit**: ✅ Pass — Cálculo de dias visíveis e separação de reservas por data são funções puras e explícitas.
- **V. Low Coupling, High Cohesion**: ✅ Pass — Componentes primitivos de UI (`Dialog`, `Tooltip`) permanecem desacoplados do domínio de reservas.
- **VI. Clean Code**: ✅ Pass — Funções descritivas, nomenclatura em `snake_case` e formatação Biome.
- **VII. Testability by Design**: ✅ Pass — `calendario.spec.tsx` valida a renderização e o fluxo de abertura do modal de detalhes.

## Project Structure

### Documentation (this feature)

```text
specs/020-reservation-calendar/
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
packages/web/src/
├── components/
│   ├── page_header.tsx
│   ├── reservation_cell.tsx
│   └── ui/
│       ├── dialog.tsx
│       └── tooltip.tsx
├── contexts/
│   └── reservations_context.tsx
├── pages/app/reservas/
│   ├── calendario.tsx
│   ├── calendario.spec.tsx
│   └── index.tsx
└── routes.tsx
```
