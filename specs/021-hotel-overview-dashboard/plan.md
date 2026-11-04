# Implementation Plan: Painel de Visão Geral Operacional e Métricas Hoteleiras

**Branch**: `021-hotel-overview-dashboard` | **Date**: 2026-11-03 | **Spec**: [spec.md](file:///home/douglas/www/hotelmind/specs/021-hotel-overview-dashboard/spec.md)

**Input**: Feature specification from `/specs/021-hotel-overview-dashboard/spec.md`

## Summary

Implementar a página de Visão Geral (dashboard operacional) do hotel (`packages/web`), oferecendo visão consolidada das métricas operacionais do empreendimento em tempo real:
1. 8 cartões de indicadores (KPIs): Total de Pessoas, Total de Crianças, Taxa de Ocupação, Reservas Confirmadas, Check-ins Hoje, Check-outs Hoje, Quartos Ocupados e Quartos Disponíveis.
2. Painel de distribuição "Pessoas por Regime de Alimentação" com barras de porcentagem e contagem de hóspedes por plano alimentar.
3. Painel de "Distribuição por Tipo de Quarto" com contadores em destaque de unidades ocupadas por categoria habitacional.
4. Seletor de data interativo acoplado a `Popover` e componente reutilizável `Calendar` com suporte a seleção de mês e ano via `Select` (`captionLayout="dropdown"`).
5. Hook `usePageTitle` para atualização e sincronização contínua do título da aba no navegador.
6. Suíte de testes unitários para a página e para o componente de calendário (`visao_geral.spec.tsx` e `calendar.spec.tsx`).

## Technical Context

**Language/Version**: TypeScript 5.8 (React 19 no pacote `packages/web`)

**Primary Dependencies**: React 19, Vite 6, Tailwind CSS 4, Lucide React, Radix UI Popover / Select, react-day-picker, date-fns, Vitest + Testing Library

**Storage**: Mock client-side reativo calculado sobre a data selecionada (preparado para integração futura com endpoints de agregação analítica da API)

**Testing**: Vitest + `@testing-library/react` (`packages/web`)

**Target Platform**: Navegadores web modernos (desktop e mobile responsivo)

**Project Type**: Web application dentro de monorepo (`packages/web`)

**Performance Goals**: Renderização do painel em < 200ms e recálculo das métricas na troca de data em < 50ms

**Constraints**: Nomenclatura rigorosamente em `snake_case` para arquivos, schemas e hooks; conformidade com Biome (2 espaços, 80 colunas, aspas simples, sem ponto e vírgula)

**Scale/Scope**: Componente de página `visao_geral.tsx`, rotas em `routes.tsx`, componente de UI `calendar.tsx`, hook `use_document_title.ts` e suítes de testes

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Contract-First Development**: ✅ Pass — Tipos e interfaces de dados do dashboard mapeados em `DashboardData`.
- **II. Clean Architecture & Strict Layer Boundaries**: ✅ Pass — Componentes de UI desacoplados de regras de cálculo e formatação de datas.
- **III. SOLID Principles**: ✅ Pass — Componentes com responsabilidade única: `Calendar` para navegação mensal, `PageHeader` para cabeçalho e `VisaoGeral` para agregação das seções.
- **IV. Explicit over Implicit**: ✅ Pass — Parâmetros de data e filtros passados explicitamente sem singletons ocultos.
- **V. Low Coupling, High Cohesion**: ✅ Pass — O componente `Calendar` é reutilizável por qualquer módulo da aplicação.
- **VI. Clean Code**: ✅ Pass — Nomenclatura clara em `snake_case`, conformidade estrita com o linter Biome.
- **VII. Testability by Design**: ✅ Pass — Cobertura com testes unitários em Vitest para renderização de cards e acionamento de dropdowns no calendário.

## Project Structure

### Documentation (this feature)

```text
specs/021-hotel-overview-dashboard/
├── plan.md              # Este arquivo
├── checklists/
│   └── requirements.md  # Checklist de validação da especificação
└── spec.md              # Especificação de requisitos funcionais
```

### Source Code

```text
packages/web/src/
├── components/
│   ├── page_header.tsx
│   └── ui/
│       ├── calendar.tsx
│       ├── calendar.spec.tsx
│       └── popover.tsx
├── hooks/
│   └── use_document_title.ts
├── pages/app/
│   ├── dashboard.tsx
│   └── dashboard/
│       ├── index.tsx
│       ├── visao-geral.tsx
│       ├── visao_geral.tsx
│       └── visao_geral.spec.tsx
└── routes.tsx
```
