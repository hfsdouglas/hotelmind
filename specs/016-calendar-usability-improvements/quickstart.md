# Quickstart & Validation Guide: Melhorias de usabilidade e ajustes no calendário de tarifários

**Feature**: `016-calendar-usability-improvements`
**Date**: 2026-11-02

## Pré-requisitos

- Node.js + `pnpm` instalados no workspace raiz (`/home/douglas/www/hotelmind`).
- Dependências instaladas (`pnpm install`).

## Comandos de Verificação Automatizada

1. **Executar testes unitários de schema e utilitários do calendário**:
   ```bash
   pnpm --filter web exec vitest run src/schemas/tarifario.schema.spec.ts
   ```
   - Verifica que `compute_bulk_selection_dates` seleciona Sexta e Sábado para `'weekends'` e Domingo a Quinta para `'weekdays'` em visualizações de `1`, `3`, `6` e `12` meses.

2. **Executar testes de componente do calendário de tarifários**:
   ```bash
   pnpm --filter web exec vitest run src/components/tarifarios/tarifario_calendar.spec.tsx
   ```
   - Verifica a ausência do botão `"Mês atual"`, o funcionamento do seletor de mês e ano preservando datas selecionadas, os botões de navegação apenas com ícones de seta, a classificação hoteleira de dias da semana/fim de semana e a exibição do texto/contador de datas selecionadas.

3. **Executar testes das páginas de pesquisa, criação e edição de tarifários**:
   ```bash
   pnpm --filter web exec vitest run src/pages/app/tarifarios/tarifarios_pages.spec.tsx
   ```
   - Verifica o funcionamento do dropdown `"Mais filtros"` na página de pesquisa de tarifários e a ausência de breadcrumbs nas páginas de inclusão e edição.

4. **Executar lint e formatação (Biome)**:
   ```bash
   pnpm --filter web check
   ```

5. **Executar build de produção da aplicação web**:
   ```bash
   pnpm --filter web build
   ```
