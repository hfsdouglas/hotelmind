# Quickstart & Validation Guide: Gestão de Regimes de Alimentação e Associação Obrigatória aos Tarifários

## 1. Pré-requisitos

- Banco de dados PostgreSQL rodando com as migrações aplicadas (`pnpm --filter api db:migrate`).
- Dependências instaladas (`pnpm install`).

## 2. Execução dos Testes Automatizados

```bash
# Testes de Casos de Uso e Rotas de Regimes de Alimentação na API
pnpm --filter api test run src/core/usecases/regimes_alimentacao/regimes_alimentacao_use_cases.spec.ts src/routes/regimes_alimentacao/regimes_alimentacao_routes.spec.ts

# Testes de Casos de Uso de Tarifários com validação do Regime de Alimentação
pnpm --filter api test run src/core/usecases/tarifarios/tarifarios_use_cases.spec.ts

# Testes das Páginas de Regimes de Alimentação no Frontend
pnpm --filter web test run src/pages/app/regimes_alimentacao/regimes_alimentacao_pages.spec.tsx

# Testes das Páginas de Tarifários no Frontend (formulário com seleção de regime)
pnpm --filter web test run src/pages/app/tarifarios/tarifarios_pages.spec.tsx

# Testes do componente SaveButton em Web e Admin
pnpm --filter web test run src/components/forms/save_button.spec.tsx
pnpm --filter admin test run src/components/forms/save_button.spec.tsx
```

## 3. Roteiro de Validação Manual

1. **Cadastro de Novo Regime de Alimentação**:
   - Acesse `/regimes_alimentacao`.
   - Clique em "Novo regime".
   - Preencha o nome (ex.: "Pensão Completa"), escolha uma cor no seletor de cores e preencha a descrição.
   - Clique em "Salvar": confirme o estado de loading e o redirecionamento para a listagem com a nova linha e badge colorida.
2. **Edição e Desativação Segura**:
   - Na listagem de regimes, clique no botão de editar da linha criada.
   - Altere a situação para "Desativado" e clique em "Salvar".
   - O diálogo de confirmação "Desativar regime de alimentação?" deve ser exibido.
   - Confirme a desativação e verifique o badge "Desativado" na listagem.
3. **Obrigatoriedade no Formulário de Tarifários**:
   - Acesse `/tarifarios/novo`.
   - Verifique que o campo "Regime de alimentação" é exibido com lista dos regimes ativos.
   - Preencha os demais campos e tente submeter sem selecionar um regime: o formulário deve impedir o envio com erro de validação.
   - Selecione o regime e conclua o salvamento. Na listagem de tarifários, a badge do regime com sua respectiva cor deve ser exibida.
