# Quickstart & Validation Guide: Gestão de Permissões por Grupos

**Feature**: 006-permissoes-grupos
**Date**: 2026-06-29

---

## Pré-requisitos

- PostgreSQL rodando e `DATABASE_URL` configurado
- `pnpm install` executado na raiz do monorepo
- API rodando: `cd packages/api && pnpm dev`
- Web rodando: `cd packages/web && pnpm dev`

---

## Setup: Banco de dados

```bash
# 1. Gerar e aplicar a migration (após alterar schema.prisma)
cd packages/api
pnpm prisma migrate dev --name add_grupos_rotas_permissions

# 2. Rodar o seed com os novos dados
pnpm prisma db seed
```

**Verificação após seed**:
```sql
SELECT COUNT(*) FROM rotas;           -- deve retornar 9
SELECT COUNT(*) FROM rotas_hoteis;    -- deve retornar 9
SELECT COUNT(*) FROM grupos;          -- deve retornar 1 ("Administrador")
SELECT COUNT(*) FROM grupos_rotas;    -- deve retornar 9
SELECT grupos_ids FROM users WHERE email = 'admin@hotelmind.com.br';  -- deve retornar o UUID do grupo
```

---

## Cenário 1: Login com menu dinâmico (P3)

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@hotelmind.com.br","senha":"senha123"}' \
  -c cookies.txt
```

**Verificar na resposta**:
- `rotas` é um array com 9 itens (todas as rotas do grupo Administrador)
- Cada item tem `modulo`, `recurso`, `rota`, `icone`, `ordem`
- `user.grupos_ids` está preenchido com o UUID do grupo Administrador

**No navegador**:
- Após login, o Sidebar deve exibir: Dashboard, Reservas (com sub-itens), Quartos (com sub-itens), Usuários e Grupos
- Nenhum item estático fixo deve aparecer — tudo vem da sessão

---

## Cenário 2: CRUD de Grupos (P1)

### Criar grupo

```bash
curl -X POST http://localhost:3000/grupos \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "grupo": "Recepcionista",
    "descricao": "Acesso à recepção",
    "status": "S",
    "rota_ids": []
  }'
# Esperado: 201 com o grupo criado
```

### Listar grupos com paginação

```bash
curl "http://localhost:3000/grupos?pagina=1&limite=50" -b cookies.txt
# Esperado: 200 com data[] e meta{pagina,limite,total,ultima_pagina}
```

### Buscar por texto

```bash
curl "http://localhost:3000/grupos?busca=recepc" -b cookies.txt
# Esperado: apenas grupos com "recepc" no nome
```

### Editar grupo com rotas

```bash
# Primeiro listar as rotas disponíveis
curl http://localhost:3000/rotas -b cookies.txt

# Atualizar grupo com rotas selecionadas (substituir <uuid> pelos IDs reais)
curl -X PUT http://localhost:3000/grupos/<id-grupo> \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"rota_ids": ["<uuid-rota-reservas>", "<uuid-rota-reservas-nova>"]}'
# Esperado: 200 com grupo atualizado e rotas
```

### Tentar deletar grupo com usuário vinculado

```bash
# Vincular o recepcionista a um usuário primeiro (via POST /usuarios ou PUT /usuarios/:id)
# Depois tentar deletar o grupo
curl -X DELETE http://localhost:3000/grupos/<id-grupo-recepcionista> -b cookies.txt
# Esperado: 409 "Este grupo possui usuários vinculados e não pode ser excluído."
```

### Deletar grupo sem usuários

```bash
# Criar um grupo temporário sem usuários
curl -X POST http://localhost:3000/grupos ... -d '{"grupo":"Temp",...}'
# Deletar
curl -X DELETE http://localhost:3000/grupos/<id-temp> -b cookies.txt
# Esperado: 204 sem body
```

---

## Cenário 3: CRUD de Usuários (P2)

### Criar usuário com grupo

```bash
curl -X POST http://localhost:3000/usuarios \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "nome_completo": "Maria Recepcionista",
    "email": "maria@hotel.com",
    "senha": "senha123",
    "nascimento": "1995-05-15",
    "genero": "Feminino",
    "celular": "11988887777",
    "cpf": "98765432100",
    "grupos_ids": "<id-grupo-recepcionista>"
  }'
# Esperado: 201 com usuário criado (sem senha na resposta)
```

### Verificar que não existe opção de deletar

```bash
curl -X DELETE http://localhost:3000/usuarios/<id> -b cookies.txt
# Esperado: 404 ou 405 (rota não existe)
```

### Listar usuários

```bash
curl "http://localhost:3000/usuarios?busca=maria" -b cookies.txt
# Esperado: usuário Maria listado com grupos_ids preenchido
```

---

## Cenário 4: Pesquisa e paginação (P4)

### Via URL no navegador

1. Acessar `/grupos` — URL deve ter `?pagina=1&limite=50`
2. Digitar "admin" no campo de busca e clicar em "Pesquisar" — URL atualiza para `?busca=admin&pagina=1&limite=50`
3. Copiar a URL e colar em nova aba — a mesma pesquisa deve ser restaurada
4. Mudar limite para 100 — URL atualiza para `?limite=100`
5. Clicar em cabeçalho da coluna "Grupo" — URL atualiza com `?ordenar_por=grupo&direcao=asc`
6. Clicar novamente — URL atualiza com `?direcao=desc`
7. Clicar em "Mais filtros" — painel de filtros aparece abaixo da barra de busca
8. Selecionar status "Inativo" — URL atualiza com `?status=N`

### Navegação de paginação

- Com mais de 50 grupos: controles "Primeira", "◀ Anterior", "Próxima ▶", "Última" aparecem
- Clicar "Última" → vai para a última página
- Clicar "Primeira" → volta para página 1
- Número de página e total de resultados são exibidos corretamente

---

## Testes automatizados

```bash
# Executar todos os testes da API
cd packages/api && pnpm test

# Verificar type checking
pnpm typecheck

# Lint
pnpm lint
```

**Cobertura obrigatória**:
- `core/entities/grupo.spec.ts` — testa `is_ativo`, `create()`
- `core/usecases/grupos/criar_grupo_use_case.spec.ts` — testa criação e conflito de nome
- `core/usecases/grupos/deletar_grupo_use_case.spec.ts` — testa bloqueio 409
- `core/usecases/login_use_case.spec.ts` — testa que rotas são incluídas na resposta
- `routes/grupos/grupos_routes.spec.ts` — testa todos os endpoints via Fastify inject
- `routes/usuarios/usuarios_routes.spec.ts` — testa todos os endpoints
