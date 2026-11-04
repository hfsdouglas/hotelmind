# Quickstart & Validation Guide: Painel de Visão Geral Operacional e Métricas Hoteleiras

## 1. Pré-requisitos

- Dependências instaladas (`pnpm install`).

## 2. Execução dos Testes Automatizados

```bash
# Executa os testes unitários do componente Calendar e da página Visão Geral
pnpm --filter web test run src/components/ui/calendar.spec.tsx src/pages/app/dashboard/visao_geral.spec.tsx
```

## 3. Roteiro de Validação Manual

1. **Acesso à Visão Geral**:
   - Acesse `/dashboard` ou `/dashboard/visao-geral`.
   - Confirme que o título da aba do navegador é alterado para "Visão Geral".
   - Verifique que os 8 cartões de métricas principais (Total de Pessoas, Crianças, Taxa de Ocupação, Reservas Confirmadas, Check-ins, Check-outs, Quartos Ocupados e Quartos Livres) são exibidos com valores e legendas.
2. **Distribuições de Alimentação e Quartos**:
   - Verifique o cartão "Pessoas por Regime de Alimentação": confira as barras de progresso proporcionais para Café da Manhã, Meia Pensão, Pensão Completa e Sem Refeição.
   - Verifique o cartão "Distribuição por Tipo de Quarto": confira os blocos com o número de quartos ocupados para cada categoria.
3. **Seleção de Data com Popover**:
   - Clique no botão com a data no cabeçalho.
   - No calendário aberto dentro do popover, mude o mês ou ano usando os menus dropdown.
   - Selecione um dia: o popover se fecha e as métricas operacionais recalculam para o dia selecionado.
