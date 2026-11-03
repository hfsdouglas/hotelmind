# Implementation Plan: Melhorias de usabilidade e ajustes no calendário de tarifários

**Branch**: `016-calendar-usability-improvements` | **Date**: 2026-11-02 | **Spec**: [spec.md](file:///home/douglas/www/hotelmind/specs/016-calendar-usability-improvements/spec.md)

**Input**: Feature specification from `/specs/016-calendar-usability-improvements/spec.md`

## Summary

Realizar melhorias de usabilidade e correções visuais e funcionais no módulo de tarifários (`packages/web`):
1. Adequar a classificação dos dias às convenções da hotelaria nas ações de seleção em massa (**Fim de semana**: sexta-feira e sábado; **Dias da semana**: domingo a quinta-feira) em todas as visualizações (`1`, `3`, `6` e `12` meses).
2. Corrigir a apresentação visual do texto e indicadores de datas selecionadas nas células do calendário e no resumo/contador para evitar cortes, quebras inadequadas ou sobreposições em qualquer visualização ou resolução.
3. Substituir o botão `"Mês atual"` por seletores diretos de **mês e ano**, navegando imediatamente para o período escolhido e preservando a seleção atual e a quantidade de meses exibidos.
4. Remover os textos dos botões de navegação de período anterior e próximo período, mantendo apenas os ícones de seta para a esquerda e para a direita.
5. Corrigir e padronizar o dropdown `"Mais filtros"` na página de pesquisa de tarifários (`/tarifarios`) para exibir integralmente os filtros de categoria e situação sem cortes ou fechamentos inesperados.
6. Remover os links de navegação (breadcrumbs `Tarifários / Novo tarifário` e `Tarifários / Editar tarifário`) das páginas de inclusão e edição de tarifários.

## Technical Context

**Language/Version**: TypeScript 5.8 (React 19 no pacote `packages/web`)

**Primary Dependencies**: React 19, Vite 6, Tailwind CSS 4, Lucide React, Radix UI Select / Slot, Vitest + Testing Library

**Storage**: N/A (alterações restritas à interface e lógica de seleção em `packages/web`; persistência em PostgreSQL via API permanece inalterada)

**Testing**: Vitest + `@testing-library/react` (`packages/web`)

**Target Platform**: Navegadores web modernos (desktop e mobile responsivo)

**Project Type**: Web application dentro de monorepo (`packages/web`)

**Performance Goals**: Atualização instantânea (< 16ms) ao trocar mês/ano no seletor, alternar entre 1/3/6/12 meses ou aplicar seleção em massa

**Constraints**: Seguir estritamente `snake_case` para funções, variáveis e arquivos; formatação Biome (2 espaços, linha de 80 colunas, aspas simples, sem ponto e vírgula)

**Scale/Scope**: 6 arquivos em `packages/web` (`tarifario.schema.ts`, `tarifario_calendar.tsx`, `tarifario_calendar_day.tsx`, `tarifario_period_summary.tsx`, `tarifario_form.tsx`, `pages/app/tarifarios/index.tsx`, `ui/popover.tsx`) e respectivas suítes de testes

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Contract-First Development**: ✅ Pass — Os contratos compartilhados em `packages/.contracts` (`datas: string[]`) permanecem inalterados e continuam sendo a única fonte de verdade.
- **II. Clean Architecture & Strict Layer Boundaries**: ✅ Pass — A regra pura de classificação hoteleira dos dias da semana fica isolada em `packages/web/src/schemas/tarifario.schema.ts`, desacoplada da renderização de componentes React.
- **III. SOLID Principles**: ✅ Pass — Cada componente (`TarifarioCalendar`, `TarifarioCalendarDay`, `TarifarioPeriodSummary`, `TarifarioForm`, `TarifariosPage`) mantém responsabilidade única e clara.
- **IV. Explicit over Implicit**: ✅ Pass — A seleção de mês e ano e a classificação de dias da semana/fim de semana recebem parâmetros explícitos sem efeitos colaterais ocultos.
- **V. Low Coupling, High Cohesion**: ✅ Pass — Nenhuma dependência cruzada indevida introduzida.
- **VI. Clean Code**: ✅ Pass — Nomenclatura em `snake_case`, constantes nomeadas para dias da semana/meses e código formatado com Biome.
- **VII. Testability by Design**: ✅ Pass — Funções utilitárias e componentes possuem testes unitários e de integração em Vitest + Testing Library cobrindo todos os cenários.

## Project Structure

### Documentation (this feature)

```text
specs/016-calendar-usability-improvements/
├── plan.md              # Este arquivo (/speckit-plan)
├── research.md          # Phase 0 output (/speckit-plan)
├── data-model.md        # Phase 1 output (/speckit-plan)
├── quickstart.md        # Phase 1 output (/speckit-plan)
├── contracts/           # Phase 1 output (/speckit-plan)
│   └── calendar_usability.md
└── tasks.md             # Phase 2 output (/speckit-tasks)
```

### Source Code (repository root)

```text
packages/
├── .contracts/
│   └── src/
│       └── tarifarios.ts
└── web/
    └── src/
        ├── components/
        │   ├── ui/
        │   │   └── popover.tsx
        │   └── tarifarios/
        │       ├── tarifario_calendar.tsx
        │       ├── tarifario_calendar.spec.tsx
        │       ├── tarifario_calendar_day.tsx
        │       ├── tarifario_period_summary.tsx
        │       └── tarifario_form.tsx
        ├── pages/
        │   └── app/
        │       └── tarifarios/
        │           ├── index.tsx
        │           ├── novo.tsx
        │           ├── [id]/editar.tsx
        │           └── tarifarios_pages.spec.tsx
        └── schemas/
            ├── tarifario.schema.ts
            └── tarifario.schema.spec.ts
```

**Structure Decision**: Manter toda a implementação concentrada no pacote `packages/web`, atualizando a função pura `compute_bulk_selection_dates` em `src/schemas/tarifario.schema.ts`, os componentes de calendário e formulário em `src/components/tarifarios/` e a listagem em `src/pages/app/tarifarios/index.tsx`.

## Complexity Tracking

Nenhuma violação da Constituição.
