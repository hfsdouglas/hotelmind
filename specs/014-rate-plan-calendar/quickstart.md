# Quickstart — Gestão de Tarifários e Calendário de Tarifação

## 1. Aplicar alterações de banco de dados e seeds

A partir da raiz do monorepo:

```bash
pnpm --filter api db:generate
pnpm --filter api db:migrate
pnpm --filter api db:seed
```

A migration cria a tabela `tarifarios` com tipos `NUMERIC(12,2)` e `DATE`, habilita a extensão `btree_gist` e adiciona a constraint de exclusão `tarifarios_sem_sobreposicao_ativa_excl` para impedir sobreposição de períodos ativos no mesmo `(hotel_id, categoria_quarto_id)`. O seed registra as rotas do módulo `Tarifários` no hotel de desenvolvimento e permissões do grupo Administrador.

## 2. Executar os serviços em desenvolvimento

```bash
pnpm --filter api dev
pnpm --filter web dev
```

## 3. Roteiro de Validação Funcional (End-to-End)

1. **Listagem (`/tarifarios`)**:
   - Autenticar como usuário do hotel (`douglas@furnaspark.com.br` / `senha123`).
   - Acessar `/tarifarios` e verificar título "Tarifários", botão "Novo tarifário", filtros por categoria e situação, e estados de carregamento/vazio/listagem.
2. **Cadastro e Seleção no Calendário (`/tarifarios/novo`)**:
   - Selecionar a categoria `Suítes Luxo`, informar nome `Baixa Temporada Março` e valor da diária `200.00`.
   - Clicar no dia `01/03/2027` e no dia `31/03/2027` no calendário mensal.
   - Confirmar que os campos de data exibem `2027-03-01` e `2027-03-31` (vigência efetiva inclusiva), que os dias intermediários aparecem destacados e que ao salvar o payload envia `data_inicio = "2027-03-01"` e `data_fim = "2027-04-01"`.
3. **Período Consecutivo e Prevenção de Conflitos**:
   - Abrir `/tarifarios/novo`, selecionar `Suítes Luxo` e verificar que março/2027 aparece ocupado no calendário e exibe os detalhes de `Baixa Temporada Março` ao interagir.
   - Tentar selecionar `15/03/2027` até `15/04/2027`: verificar indicação visual de conflito e bloqueio com erro amigável (HTTP `409` se enviado à API).
   - Selecionar `01/04/2027` até `30/04/2027` (consecutivo): confirmar que o cadastro é concluído com sucesso.
4. **Edição sem conflito próprio (`/tarifarios/:id/editar`)**:
   - Abrir a edição de `Baixa Temporada Março`, verificar que o período atual (`01/03/2027` a `31/03/2027`) está selecionado sem acusar conflito consigo mesmo, alterar o valor para `220.00` e salvar.
5. **Desativação e Reativação**:
   - Desativar um tarifário ativo confirmando no diálogo de confirmação; verificar que ele permanece listado como inativo e que o seu período deixa de bloquear um novo tarifário ativo.
   - Tentar reativar o tarifário antigo quando já houver outro tarifário ativo no período e confirmar o bloqueio por conflito (`409`).

## 4. Validação Automatizada

```bash
pnpm --filter api test
pnpm --filter web test
pnpm --filter web build
```

Os testes da API validam schemas Zod, use cases (criação, edição sem conflito próprio, ativação, desativação, listagem, consulta do calendário e cálculo do menor valor por noite), isolamento de tenant e constraint de exclusão / condição de corrida (`409`). Os testes web validam renderização da listagem, formulário, calendário mensal (2 cliques, reinício quando data final < inicial, navegação entre meses, sincronização bidirecional com inputs e identificação de conflitos) e fluxos de mutação.
