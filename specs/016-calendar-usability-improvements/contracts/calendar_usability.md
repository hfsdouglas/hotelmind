# UI & Component Contract: TarifarioCalendar, TarifarioForm e TarifariosPage

**Feature**: `016-calendar-usability-improvements`
**Date**: 2026-11-02

## 1. `compute_bulk_selection_dates` (`packages/web/src/schemas/tarifario.schema.ts`)

- **`mode: 'weekends'`**:
  - Retorna todas as datas `YYYY-MM-DD` pertencentes aos meses em `visible_months` cujo dia da semana em UTC seja **Sexta-feira (`5`)** ou **Sábado (`6`)** e que não estejam ocupadas por outro tarifário ativo.
- **`mode: 'weekdays'`**:
  - Retorna todas as datas `YYYY-MM-DD` pertencentes aos meses em `visible_months` cujo dia da semana em UTC seja **Domingo (`0`)**, **Segunda-feira (`1`)**, **Terça-feira (`2`)**, **Quarta-feira (`3`)** ou **Quinta-feira (`4`)** e que não estejam ocupadas por outro tarifário ativo.
- **`mode: 'all'`**:
  - Retorna todas as datas `YYYY-MM-DD` disponíveis nos meses visíveis (`0` a `6`).

## 2. Controles de Navegação de `TarifarioCalendar` (`packages/web/src/components/tarifarios/tarifario_calendar.tsx`)

| Controle | Test ID / Aria Label | Comportamento |
|---|---|---|
| Botão Período Anterior | `data-testid="calendar-prev-period"`, `aria-label="Período anterior"` | Exibe **somente o ícone** de seta para a esquerda (`ChevronLeft`), sem texto visível. Recua `months_count` meses preservando `selectedDates`. |
| Seletor de Mês | `data-testid="calendar-select-month"`, `aria-label="Selecionar mês"` | Lista os 12 meses (`Janeiro` a `Dezembro`). Ao selecionar, navega imediatamente para o mês escolhido mantendo o ano atual e `months_count`. |
| Seletor de Ano | `data-testid="calendar-select-year"`, `aria-label="Selecionar ano"` | Lista anos disponíveis. Ao selecionar, navega imediatamente para o ano escolhido mantendo o mês atual e `months_count`. |
| Botão Próximo Período | `data-testid="calendar-next-period"`, `aria-label="Próximo período"` | Exibe **somente o ícone** de seta para a direita (`ChevronRight`), sem texto visível. Avança `months_count` meses preservando `selectedDates`. |

> O botão `"Mês atual"` deixa de existir, sendo substituído pelo seletor de mês e ano.

## 3. Apresentação das Datas Selecionadas (`TarifarioCalendarDay` e `TarifarioPeriodSummary`)

- Nas células do calendário (`TarifarioCalendarDay`), o indicador de seleção e o rótulo de estado não devem sofrer cortes inadequados nem sobrepor o número do dia, o badge `"Hoje"` ou a faixa de ocupação em nenhuma das visualizações (`1`, `3`, `6` ou `12` meses).
- O contador `data-testid="calendar-selected-count"` e o resumo `data-testid="period-summary-selected"` devem exibir a quantidade exata de datas selecionadas e formatar a lista de datas de forma responsiva (`break-words`, sem overflow horizontal).

## 4. Dropdown "Mais filtros" em `TarifariosPage` (`packages/web/src/pages/app/tarifarios/index.tsx`)

- Botão de acionamento: `<Button variant="outline">Mais filtros</Button>` dentro de `PopoverTrigger`.
- Ao clicar no botão, abre `PopoverContent` alinhado ao botão, sem cortes visuais (`z-50`, largura mínima adequada), contendo:
  - Filtro de **Categoria de quarto** (`aria-label="Filtrar por categoria"`).
  - Filtro de **Situação** (`aria-label="Filtrar por situação"`).
  - Ação para limpar filtros ativos quando aplicável.

## 5. Remoção de Breadcrumbs em `TarifarioForm` (`packages/web/src/components/tarifarios/tarifario_form.tsx`)

- O elemento `<nav aria-label="Breadcrumb">Tarifários / {title}</nav>` deve ser removido de `TarifarioForm`, garantindo que nem `/tarifarios/novo` nem `/tarifarios/:id/editar` exibam breadcrumbs.
