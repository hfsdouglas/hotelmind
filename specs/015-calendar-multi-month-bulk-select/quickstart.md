# Quickstart & Validation Guide: Melhorias na Visualização e Seleção de Datas do Calendário de Tarifários

## 1. Pré-requisitos

- Dependências instaladas na raiz do monorepo (`pnpm install`).

## 2. Execução dos Testes Automatizados

```bash
# Testes unitários das funções de múltiplos meses e seleção em massa + componente de calendário e páginas
pnpm --filter web exec vitest run src/schemas/tarifario.schema.spec.ts src/components/tarifarios/tarifario_calendar.spec.tsx src/pages/app/tarifarios/tarifarios_pages.spec.tsx

# Build de produção do frontend
pnpm --filter web exec vite build
```

## 3. Cenários de Validação Manual

1. **Alternância de visualização (1, 3, 6 e 12 meses)**:
   - Acesse `/tarifarios/novo`.
   - Verifique que o calendário inicia exibindo `1 mês`.
   - Clique em `3 meses`, `6 meses` e `12 meses` e confirme que a quantidade de grades mensais consecutivas muda imediatamente sem perder datas já marcadas.
   - Clique em `Período anterior` / `Próximo período` e verifique que o calendário avança ou recua a quantidade de meses ativa (`1`, `3`, `6` ou `12`).
2. **Seleção em massa**:
   - Clique em `Selecionar todos os dias`: todas as datas disponíveis dos meses exibidos ficam marcadas.
   - Clique em `Selecionar dias da semana`: a seleção é substituída apenas pelas datas disponíveis de segunda a sexta-feira dos meses exibidos.
   - Clique em `Selecionar fim de semana`: a seleção é substituída apenas pelos sábados e domingos disponíveis dos meses exibidos.
3. **Ajuste individual e contador**:
   - Após aplicar uma seleção em massa, clique em um dia marcado para desmarcá-lo e em um dia desmarcado para marcá-lo, observando a atualização imediata do contador de datas selecionadas.
