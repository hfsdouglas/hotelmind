# Phase 1 Data Model: Melhorias de usabilidade e ajustes no calendário de tarifários

**Feature**: `016-calendar-usability-improvements`
**Date**: 2026-11-02

> Esta feature atua exclusivamente na camada de apresentação e regras de seleção do cliente web (`packages/web`). Não há alterações de schema de banco de dados ou contratos de rede (`packages/.contracts`).

## 1. Regras de Classificação de Dias da Hotelaria

Em `packages/web/src/schemas/tarifario.schema.ts`:

| Modo (`CalendarBulkSelectMode`) | Dias da semana incluídos (`Date.getUTCDay()`) | Descrição na Hotelaria |
|---|---|---|
| `'all'` | `0, 1, 2, 3, 4, 5, 6` (Domingo a Sábado) | Todos os dias disponíveis nos meses visíveis |
| `'weekdays'` | `0, 1, 2, 3, 4` (Domingo a Quinta-feira) | Dias de semana na hotelaria (exclui Sexta e Sábado) |
| `'weekends'` | `5, 6` (Sexta-feira e Sábado) | Fim de semana na hotelaria (apenas Sexta e Sábado) |

## 2. Estado de Período Inicial do Calendário (`viewed_month`)

Em `packages/web/src/components/tarifarios/tarifario_calendar.tsx`:

| Campo | Tipo | Regra |
|---|---|---|
| `viewed_month.month` | `number` (`0` a `11`) | Controlado diretamente pelo seletor de mês (`Janeiro` a `Dezembro`) e pelos botões de seta (`± months_count`). |
| `viewed_month.year` | `number` (ex.: `2021` a `2036`) | Controlado diretamente pelo seletor de ano e atualizado automaticamente quando a navegação por setas cruza a virada de ano. |
| `months_count` | `1 \| 3 \| 6 \| 12` | Quantidade de meses consecutivos renderizados a partir de `viewed_month`. |
| `selectedDates` | `string[]` (`YYYY-MM-DD`) | Preservado integralmente ao alterar mês, ano, quantidade de meses exibidos ou navegar pelas setas. |
