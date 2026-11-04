# Quickstart & Validation Guide: Catálogo e Sincronização Idempotente de Rotas e Permissões do Sistema

## 1. Pré-requisitos

- Banco de dados PostgreSQL configurado e acessível via `DATABASE_URL`.
- Dependências instaladas (`pnpm install`).

## 2. Execução dos Testes Automatizados

```bash
# Executa a suíte de testes de integridade e idempotência do seed de rotas
pnpm --filter api test run src/db/seeds/routes_seed.spec.ts
```

## 3. Execução do Script via CLI

```bash
# Executa o seed de rotas a partir da raiz do monorepo
pnpm db:seed:routes

# Ou diretamente pelo pacote da API
pnpm --filter api db:seed:routes
```

## 4. Validação no Banco de Dados

1. Consulte a tabela de rotas e verifique a contagem de rotas ativas:
   ```sql
   SELECT modulo, recurso, rota, ativo, ordem FROM rotas ORDER BY ordem ASC;
   ```
2. Verifique se todas as rotas ativas estão vinculadas a cada hotel:
   ```sql
   SELECT h.nome_fantasia, count(rh.rota_id) as total_rotas
   FROM hoteis h
   LEFT JOIN rotas_hoteis rh ON rh.hotel_id = h.id
   GROUP BY h.nome_fantasia;
   ```
3. Verifique se o grupo "Administrador" de cada hotel possui todas as rotas:
   ```sql
   SELECT g.grupo, count(gr.rota_id) as total_rotas
   FROM grupos g
   LEFT JOIN grupos_rotas gr ON gr.grupo_id = g.id
   WHERE g.grupo = 'Administrador'
   GROUP BY g.grupo;
   ```
