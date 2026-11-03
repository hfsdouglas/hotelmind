# Data Model: Melhorias na Visualização e Seleção de Datas do Calendário de Tarifários

## 1. Tipos de Estado de Interface (`packages/web`)

Esta funcionalidade opera sobre o modelo de `Tarifario` com `datas: string[]` já estabelecido em `@hotelmind/contracts` e `packages/api`, adicionando estruturas de estado e funções puras de calendário no frontend.

### 1.1. `CalendarMonthsViewCount`

Representa a quantidade de meses consecutivos exibidos simultaneamente no calendário.

| Valor | Descrição |
|---|---|
| `1` | Exibe somente o mês de referência atual (valor padrão inicial) |
| `3` | Exibe 3 meses consecutivos a partir do mês de referência |
| `6` | Exibe 6 meses consecutivos a partir do mês de referência |
| `12` | Exibe 12 meses consecutivos a partir do mês de referência |

### 1.2. `CalendarBulkSelectMode`

Representa o filtro de dia da semana aplicado sobre os dias disponíveis dos meses atualmente visíveis.

| Valor | Rótulo na UI | Regra (`Date.getUTCDay()`) |
|---|---|---|
| `'all'` | `Selecionar todos os dias` | Todos os dias disponíveis (`0` a `6` — Domingo a Sábado) |
| `'weekdays'` | `Selecionar dias da semana` | Segunda a Sexta-feira disponíveis (`1` a `5`) |
| `'weekends'` | `Selecionar fim de semana` | Sábados e Domingos disponíveis (`0` e `6`) |

### 1.3. `VisibleCalendarMonth`

Representa cada mês renderizado na janela ativa do calendário.

| Campo | Tipo | Descrição |
|---|---|---|
| `year` | `number` | Ano civil completo (ex.: `2027`) |
| `month_zero_based` | `number` | Mês de `0` (Janeiro) a `11` (Dezembro) |
| `cells` | `CalendarMonthCell[]` | Células da grade mensal (incluindo dias do próprio mês com `is_current_month: true` e células de preenchimento semanal com `is_current_month: false`) |

## 2. Invariantes e Regras de Negócio

1. **Preservação na troca de visualização e navegação**: Alterar `CalendarMonthsViewCount` (`1`, `3`, `6`, `12`) ou avançar/recuar períodos altera apenas a janela `VisibleCalendarMonth[]` renderizada, mantendo `selectedDates: string[]` intacto.
2. **Substituição na seleção em massa**: Acionar qualquer `CalendarBulkSelectMode` (`'all'`, `'weekdays'`, `'weekends'`) substitui `selectedDates` pelo conjunto de datas disponíveis (`is_current_month === true` e não ocupadas por outro tarifário ativo da mesma categoria) pertencentes exclusivamente aos `VisibleCalendarMonth[]` atualmente exibidos.
3. **Ajuste individual pós-seleção em massa**: Após uma seleção em massa, clicar em qualquer célula de dia continua alternando (`toggle_date_selection`) aquela data específica em `selectedDates`.
4. **Sem salvamento automático**: Nenhuma interação de visualização ou seleção em massa dispara mutações HTTP nem altera o campo `valor_diaria`.
