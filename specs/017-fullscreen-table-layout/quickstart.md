# Quickstart & Validation Guide: Tabelas em Tela Cheia com Rolagem Interna, Cabeçalho Fixo e Paginação no Rodapé

## 1. Pré-requisitos

- Dependências instaladas (`pnpm install`).

## 2. Execução dos Testes Automatizados

```bash
# Testes de paginação e suspense em Web
pnpm --filter web test run src/components/data-table/data_table_pagination.spec.tsx src/components/data-table/search_results_suspense.spec.tsx

# Testes de paginação e tabela em Admin
pnpm --filter admin test run src/components/data-table/data_table_pagination.spec.tsx src/components/data-table/data_table.spec.tsx

# Teste de páginas integradas de tarifários com limpeza de filtros em lote
pnpm --filter web test run src/pages/app/tarifarios/tarifarios_pages.spec.tsx
```

## 3. Roteiro de Validação Visual

1. **Rolagem Interna com Cabeçalho Fixo**:
   - Acesse qualquer listagem (ex.: `/quartos`, `/tarifarios` ou no admin `/hoteis`).
   - Se houver mais de 10 registros, role a lista verticalmente.
   - Constatar que apenas as linhas da tabela se movem; o título da página e a barra de cabeçalho da tabela permanecem fixos no topo com fundo sólido e borda nítida.
2. **Paginação Fixada no Rodapé**:
   - Observe a barra de paginação na base da tela.
   - Em uma página com poucos registros (ex.: 2 itens), a paginação permanece ancorada no rodapé inferior sem subir.
3. **Limpeza de Filtros Atômica**:
   - Na tela de tarifários, abra "Mais filtros", selecione uma categoria e uma situação.
   - Clique em "Limpar filtros": ambos os parâmetros devem sumir da URL instantaneamente sem piscar a página.
