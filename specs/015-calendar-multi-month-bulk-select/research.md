# Phase 0 Research: Melhorias na Visualização e Seleção de Datas do Calendário de Tarifários

## 1. Visualização Multi-Mês Responsiva (1, 3, 6 e 12 meses)

- **Decision**: Adicionar o estado `months_count: 1 | 3 | 6 | 12` (padrão `1`) ao componente `TarifarioCalendar` (controlado via seletor de visualização de meses) e uma função pura `get_visible_months(start_year, start_month_zero_based, count)` em `packages/web/src/schemas/tarifario.schema.ts` que gera os `count` meses consecutivos usando aritmética UTC (`Date.UTC(start_year, start_month + index, 1)`).
- **Rationale**:
  - Usar `Date.UTC` evita bugs de fuso horário ou horário de verão na transição de meses e virada de ano (ex.: Outubro/2026 → Setembro/2027).
  - Quando `months_count === 1`, o calendário ocupa largura total (`grid-cols-1`); quando `months_count > 1` (`3`, `6`, `12`), os meses são dispostos em grade responsiva (`grid-cols-1 lg:grid-cols-2 xl:grid-cols-3`), mantendo legibilidade das células de cada dia sem comprimir os rótulos de ocupação.
- **Alternatives considered**:
  - Renderizar 12 meses sempre em 4 colunas fixas: rejeitado porque em telas médias (`md`/`lg`) as células com checkbox e badge de ocupação ficariam estreitas demais.
  - Utilizar biblioteca externa de date-picker multi-mês: rejeitado porque o calendário de tarifários já possui células customizadas com estado de checkbox, inspeção de tarifários ocupados e destaque de conflito.

## 2. Navegação Proporcional à Quantidade de Meses Visíveis

- **Decision**: Quando o usuário clica nos controles de período anterior ou próximo período com `months_count` meses visíveis (`1`, `3`, `6` ou `12`), a janela avança ou recua exatamente `months_count` meses (`navigate_to(viewed_month.year, viewed_month.month ± months_count)`).
- **Rationale**: Atende diretamente ao requisito *"A navegação entre períodos anteriores e posteriores deverá respeitar a quantidade de meses selecionada"*, permitindo paginar trimestre a trimestre (3 meses), semestre a semestre (6 meses) ou ano a ano (12 meses) sem repetição de meses já exibidos.
- **Alternatives considered**:
  - Deslocar sempre 1 mês independentemente do modo de visualização: rejeitado por violar o comportamento esperado especificado na seção 1.

## 3. Ações de Seleção em Massa nos Meses Visíveis

- **Decision**: Implementar a função pura `compute_bulk_selection_dates` em `packages/web/src/schemas/tarifario.schema.ts` recebendo:
  - `visible_months: Array<{ year: number; month_zero_based: number }>`
  - `mode: 'all' | 'weekdays' | 'weekends'`
  - `occupied_periods: PeriodoTarifarioCalendario[]`
  - `exclude_tarifario_id?: string`
  A função percorre apenas os dias pertencentes aos meses visíveis (`is_current_month === true`), filtra datas que não estejam ocupadas por outro tarifário ativo (`period.ativo && period.id !== exclude_tarifario_id`), aplica o filtro de dia da semana UTC (`getUTCDay()`: `1..5` para `weekdays`, `0` ou `6` para `weekends`, `0..6` para `all`) e retorna o novo array ordenado de datas (`YYYY-MM-DD`), **substituindo** a seleção anterior (`onReplaceSelection(next_dates)`).
- **Rationale**:
  - Ignorar células de preenchimento (`is_current_month === false`) garante que clicar em "Selecionar todos os dias" em Março selecione apenas `2027-03-01..2027-03-31`, sem incluir dias de Fevereiro ou Abril que aparecem apenas para fechar a grade semanal.
  - Excluir datas já ocupadas por outros tarifários ativos atende ao requisito *"Selecionar todas as datas disponíveis nos meses atualmente exibidos"*, evitando que o usuário gere conflitos acidentais ao aplicar seleção em massa.
  - Manter a lógica em função pura em `tarifario.schema.ts` permite testes unitários rápidos e determinísticos.
- **Alternatives considered**:
  - Somar a seleção em massa à seleção anterior em vez de substituir: rejeitado pois o requisito 3 determina explicitamente que *"As ações de seleção em massa deverão substituir a seleção atual"*.
