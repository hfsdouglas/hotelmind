# Phase 0 Research: Catálogo e Sincronização Idempotente de Rotas e Permissões do Sistema

## 1. Idempotência e Desativação Lógica de Rotas Obsoletas

- **Decision**: Em vez de truncar ou deletar registros da tabela `rotas`, iterar sobre `BASE_ROUTES` fazendo `findFirst({ where: { rota: item.rota } })` e executando `update` ou `create` com `ativo: true`. Em seguida, desativar (`updateMany({ where: { rota: { notIn: basePaths }, ativo: true }, data: { ativo: false } })`) as rotas ausentes do catálogo oficial.
- **Rationale**:
  - A exclusão física de rotas quebra chaves estrangeiras em `rotas_hoteis` e `grupos_rotas` de hotéis já em produção.
  - A desativação lógica preserva logs de auditoria e configurações históricas de segurança, apenas ocultando a rota da navegação.
- **Alternatives considered**:
  - `deleteMany({ where: { ... } })`: rejeitado por risco de perda de integridade referencial em cascata.

## 2. Propagação Automática para Hotéis e Grupos de Administrador

- **Decision**: Buscar todos os hotéis da base (`client.hotel.findMany`), identificar rotas ainda não vinculadas na tabela associativa `RotaHotel` e inseri-las com `createMany({ skipDuplicates: true })`. Repetir o processo para os grupos cujo nome seja `"Administrador"` vinculando as rotas em `GrupoRota`.
- **Rationale**:
  - Elimina a necessidade de scripts manuais de concessão de permissão após cada deploy que introduza novas rotas.
  - O uso de `skipDuplicates: true` impede violação de chave primária composta `[hotel_id, rota_id]` e `[grupo_id, rota_id]`.
- **Alternatives considered**:
  - Inserir um a um dentro de loops aninhados com `try/catch`: rejeitado por lentidão excessiva em bases com muitos hotéis.

## 3. Ponto de Entrada CLI Isolado (`is_direct_run`)

- **Decision**: Permitir que `routes_seed.ts` seja executado diretamente via terminal (`tsx routes_seed.ts`) através da checagem de `process.argv[1]`, além de poder ser importado como função (`seedRoutes`) pelo seed geral `index.ts`.
- **Rationale**:
  - Em ambientes de produção, engenheiros de DevOps podem rodar apenas a sincronização de rotas com `pnpm db:seed:routes` sem rodar o seed massivo de dados fakes de desenvolvimento.
