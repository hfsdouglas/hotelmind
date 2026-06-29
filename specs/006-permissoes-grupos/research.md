# Research: Gestão de Permissões por Grupos

**Feature**: 006-permissoes-grupos
**Date**: 2026-06-29

Sem NEEDS CLARIFICATION no spec — todas as decisões de design foram especificadas explicitamente.
Este arquivo documenta as decisões e rationale para referência futura.

---

## Decisão 1: grupos_ids como string CSV no User, sem tabela pivot

**Decision**: O campo `grupos_ids` no modelo `User` armazena IDs de grupos como string separada por vírgula (ex: `"uuid1,uuid2"`), sem tabela pivot.

**Rationale**: Simplicidade operacional para o escopo atual. Hotéis raramente terão usuários em dezenas de grupos. A spec explicitamente proibiu tabela pivot para este caso.

**Alternatives considered**: Tabela pivot `user_grupos` — rejeitada por adicionar complexidade sem benefício real no escopo atual. JSON array — rejeitado por inconsistência com o padrão definido.

**Constraints**: Validação de integridade referencial (garantir que IDs pertencem ao mesmo hotel) é feita no nível de aplicação, no use case de criação/atualização de usuário.

---

## Decisão 2: Rotas como dado global, ativadas por hotel via rotas_hoteis

**Decision**: A tabela `rotas` é global (sem hotel_id). Cada hotel ativa suas rotas contratadas via tabela pivot `rotas_hoteis`. Grupos vinculam rotas via `grupos_rotas`.

**Rationale**: Permite que novas rotas do sistema sejam adicionadas globalmente e ativadas por hotel sem duplicação. Facilita controle de contratação de módulos.

**Alternatives considered**: Rotas com hotel_id direto — rejeitado porque criaria duplicação de dados e dificultaria a adição de novos módulos.

---

## Decisão 3: Menu dinâmico carregado no payload de login, sem endpoint separado

**Decision**: As rotas do usuário são incluídas no payload do `POST /auth/login`, calculadas na hora do login e armazenadas na sessão do cliente (localStorage + AuthContext).

**Rationale**: Evita request adicional ao carregar a aplicação. A sessão já existe no localStorage; adicionar `rotas` segue o mesmo padrão dos dados de `user` e `hotel`. Mudanças de permissão só afetam a sessão no próximo login — comportamento documentado como assumption no spec.

**Alternatives considered**: Endpoint `GET /auth/me/rotas` chamado ao montar o AppLayout — rejeitado por adicionar latência no carregamento e complexidade desnecessária.

---

## Decisão 4: Cálculo das rotas do usuário no LoginUseCase

**Decision**: O `LoginUseCase` recebe um novo repositório `IRotaRepository` com método `findRotasParaUsuario(hotelId, grupoIds)`. Esse método executa a query composta (rotas_hoteis ∩ grupos_rotas ∩ rotas.ativo = true) e retorna as rotas ordenadas por `ordem`.

**Rationale**: Mantém a lógica de negócio no use case (Clean Architecture). O repositório abstrai a query complexa de join.

**Alternatives considered**: Adicionar o método ao `IUserRepository` — rejeitado por misturar responsabilidades de domínio.

---

## Decisão 5: Paginação via Prisma com skip/take

**Decision**: Paginação implementada com `skip = (pagina - 1) * limite` e `take = limite` no Prisma, com `count` separado para o `meta.total`.

**Rationale**: Padrão offset-based é suficiente para os volumes esperados (hotéis com centenas de usuários/grupos). Cursor-based seria necessário apenas para tabelas com milhões de registros.

---

## Decisão 6: Componentes DataTable sem biblioteca externa de tabela

**Decision**: `DataTable` implementado com HTML `<table>` nativo + Tailwind + shadcn/ui, sem TanStack Table ou react-table.

**Rationale**: O escopo dos CRUDs é simples (poucas colunas, sem agrupamento avançado, sem virtual scroll). Evita dependência externa desnecessária. Ordenação por coluna é implementada manualmente via estado + query param.

**Alternatives considered**: TanStack Table — rejeitado por complexidade além do necessário para este escopo.

---

## Decisão 7: Ícones Lucide resolvidos via mapa estático no Sidebar

**Decision**: Um objeto `ICON_MAP: Record<string, ElementType>` no Sidebar mapeia nomes string (ex: `"LayoutDashboard"`) para componentes Lucide importados. Ícone não encontrado usa `LayoutGrid` como fallback.

**Rationale**: Tree-shaking garante que só os ícones importados chegam ao bundle. A lista de ícones possíveis é pequena e conhecida em tempo de build.

---

## Decisão 8: Bloqueio de delete de grupo com 409 Conflict

**Decision**: `DELETE /grupos/:id` verifica se algum usuário tem o `grupo_id` no campo `grupos_ids` via `LIKE '%uuid%'` ou busca por array parseado no Prisma. Retorna 409 se houver dependência.

**Rationale**: 409 Conflict é o status HTTP semanticamente correto para "recurso não pode ser deletado por existir dependência". A verificação no banco garante consistência mesmo com requests concorrentes.

**Implementation note**: A query `WHERE grupos_ids LIKE '%<id>%'` pode ter falsos positivos em IDs com substrings comuns, mas como UUIDs são únicos e longos, o risco é desprezível. Alternativa: parsear no app — mas introduz N+1. Solução: usar `WHERE grupos_ids = '<id>' OR grupos_ids LIKE '<id>,%' OR grupos_ids LIKE '%,<id>' OR grupos_ids LIKE '%,<id>,%'` para correspondência exata de UUID.
