# Quickstart: Validação de Tarifários por Parceiro Comercial

Este guia descreve os passos práticos para validar ponta a ponta a funcionalidade de tarifários vinculados a parceiros comerciais, filtragem em orçamentos e reservas, e organização dos seeds.

## 1. Pré-Requisitos e Preparação

Certifique-se de que o banco de dados PostgreSQL do ambiente de desenvolvimento esteja em execução.

Execute as migrações e a geração do cliente Prisma:
```bash
pnpm --filter api db:migrate
pnpm --filter api db:generate
```

## 2. Validação da Estrutura Modular de Seeds

### Cenário 2.1: Execução do Seed de Produção (Rotas)
O seed de rotas de produção deve rodar de maneira isolada sem depender de dados de teste:
```bash
pnpm --filter api db:seed:routes
```
- **Resultado Esperado**: O console reporta sucesso no cadastro/sincronização de rotas ativas do sistema, sem criar hotéis fictícios ou parceiros de teste.

### Cenário 2.2: Execução do Seed de Desenvolvimento (Massa de Testes)
Executar o conjunto completo de sementes separadas por contexto:
```bash
pnpm --filter api db:seed
```
- **Resultado Esperado**:
  - Pelo menos 5 parceiros comerciais de tipos variados são criados (`CVC Viagens`, `Booking.com Corporate`, `Decolar.com`, `Petrobras Corporativo`, `Vale S.A.`).
  - Categorias de quartos, regimes e tarifários públicos e de parceiros são criados nos respectivos contextos modulares.

## 3. Validação Automatizada de Testes (TDD)

Executar os testes unitários e de integração das rotas e use cases atualizados:
```bash
pnpm --filter api test src/core/usecases/tarifarios
pnpm --filter api test src/core/usecases/orcamentos
pnpm --filter api test src/core/usecases/reservas
pnpm --filter api test src/routes/tarifarios
pnpm --filter api test src/routes/orcamentos
pnpm --filter api test src/routes/reservas
```

Testes de frontend (Web):
```bash
pnpm --filter web test src/components/tarifarios
pnpm --filter web test src/pages/app/reservas/orcamentos
pnpm --filter web test src/pages/app/reservas
```

## 4. Validação Manual na Interface Web

### Cenário 4.1: Cadastro de Tarifário Vinculado a Parceiro
1. Acesse o menu **Tarifários > Novo Tarifário**.
2. Selecione uma Categoria de Quarto (ex.: "Suítes Luxo") e um Regime (ex.: "Pensão Completa").
3. No campo **Parceiro Comercial**, selecione "Petrobras Corporativo".
4. Selecione as datas de vigência no calendário e preencha o valor da diária negociada (ex.: R$ 320,00).
5. Clique em **Salvar**.
6. **Verificação**: Na listagem e no calendário, confirme que a tarifa aparece identificada com a tag/nome do parceiro comercial.

### Cenário 4.2: Elaboração de Orçamento Restrito por Parceiro
1. Acesse **Reservas > Novo Orçamento**.
2. No campo **Parceiro Comercial**, selecione "Petrobras Corporativo".
3. Preencha as datas de check-in e check-out coincidentes com as datas cadastradas no Cenário 4.1.
4. **Verificação**:
   - As opções de acomodações (suítes) exibem apenas as categorias que possuem tarifário ativo para a Petrobras. Categorias sem tarifário para o parceiro aparecem desabilitadas/indisponíveis.
   - O valor total calculado reflete estritamente a tarifa de R$ 320,00 por noite do parceiro.
5. Alterne o campo **Parceiro Comercial** para "Nenhum (Tarifa Pública Balcão)".
6. **Verificação**: O catálogo de suítes se atualiza imediatamente para exibir as categorias e valores da tarifa pública padrão.

### Cenário 4.3: Criação de Reserva com Parceiro Comercial
1. Acesse **Reservas > Nova Reserva**.
2. Selecione o parceiro "Petrobras Corporativo", o período e a quantidade de hóspedes.
3. Observe o campo de seleção de Suíte (Quarto): apenas quartos pertencentes a categorias precificadas para o parceiro são elegíveis.
4. Conclua a reserva e confirme que o valor total e o histórico registram o parceiro comercial e o tarifário contratado.
