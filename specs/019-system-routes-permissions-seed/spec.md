# Feature Specification: Catálogo e Sincronização Idempotente de Rotas e Permissões do Sistema

**Feature Branch**: `019-system-routes-permissions-seed`

**Created**: 2026-11-03

**Status**: Draft

**Input**: User description: "Criar um mecanismo dedicado, seguro e idempotente de seed e sincronização de rotas do sistema para os módulos de Quartos, Tarifários, Usuários e Grupos (além de Dashboard e Reservas), garantindo que rotas oficiais sejam criadas ou atualizadas, rotas obsoletas desativadas, e que todos os hotéis cadastrados e seus respectivos grupos de Administrador recebam as permissões de acesso às novas rotas automaticamente, com suporte a comando CLI independente."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Sincronização Segura e Idempotente do Catálogo de Rotas (Priority: P1)

Como engenheiro de operações ou desenvolvedor subindo uma nova versão da API ou executando migrações, quero rodar a sincronização do seed de rotas a qualquer momento (em desenvolvimento ou produção) sem risco de duplicar rotas, apagar dados operacionais existentes ou corromper vínculos de permissões já configurados.

**Why this priority**: A base de permissões e navegação do sistema depende do catálogo de rotas. Se o script não for idempotente, execuções repetidas criam registros duplicados ou falham por violação de unicidade.

**Independent Test**: Executar o script de seed de rotas pela primeira vez em um banco limpo e verificar que as rotas base são criadas; executar o mesmo script uma segunda e terceira vez consecutivas e constatar que o número total de rotas permanece o mesmo e nenhuma duplicidade ou exceção é gerada.

**Acceptance Scenarios**:

1. **Given** que o catálogo `BASE_ROUTES` define as rotas oficiais dos módulos, **When** o seed de rotas é executado em um banco onde as rotas ainda não existem, **Then** todas as rotas são inseridas com status ativo (`ativo: true`), respectivo módulo, recurso, ícone e ordem de exibição.
2. **Given** que uma rota já existe no banco de dados, **When** o seed é reexecutado com atributos atualizados (ex.: nome do recurso ou ordem), **Then** a rota existente é atualizada preservando seu identificador original e vínculos de permissões.
3. **Given** que rotas antigas deixaram de fazer parte do catálogo oficial, **When** o script é executado, **Then** as rotas ausentes do catálogo são marcadas como inativas (`ativo: false`), sem serem excluídas fisicamente da base.

---

### User Story 2 - Associação Automática de Novas Rotas aos Hotéis e Grupos de Administrador (Priority: P1)

Como gestor de um hotel com a conta "Administrador", quero que novas rotas e recursos disponibilizados na plataforma sejam automaticamente vinculados ao meu hotel e ao grupo Administrador, para que novos módulos fiquem imediatamente acessíveis aos administradores sem exigir intervenção manual no banco de dados.

**Why this priority**: Evita que atualizações de software deixem módulos invisíveis ou bloqueados para administradores existentes após deploy.

**Independent Test**: Ter hotéis e grupos "Administrador" já cadastrados no banco, executar o seed de rotas e verificar nas tabelas de relacionamento (`RotaHotel` e `GrupoRota`) que todas as rotas ativas do catálogo foram associadas aos hotéis e aos grupos administrativos sem criar registros redundantes.

**Acceptance Scenarios**:

1. **Given** múltiplos hotéis cadastrados no banco de dados, **When** o seed de rotas é executado, **Then** todas as rotas ativas são associadas a cada um dos hotéis em `RotaHotel`, ignorando duplicidades já existentes (`skipDuplicates: true`).
2. **Given** que existem grupos chamados "Administrador" vinculados aos hotéis, **When** o seed sincroniza as permissões, **Then** todas as rotas ativas são vinculadas a esses grupos em `GrupoRota`, garantindo acesso total imediato.
3. **Given** hotéis que já possuíam parte das rotas vinculadas, **When** o seed executa, **Then** apenas as novas rotas faltantes são adicionadas, mantendo as permissões prévias intactas.

---

### User Story 3 - Execução via Comando CLI Dedicado (Priority: P2)

Como mantenedor do sistema, quero dispor de um comando CLI na raiz do monorepo (`pnpm db:seed:routes`) e no pacote da API (`pnpm --filter api db:seed:routes`), para sincronizar rapidamente as rotas do sistema de forma isolada, sem precisar rodar todo o seed de dados fake de negócio.

**Why this priority**: Permite que rotas e permissões sejam atualizadas em ambientes produtivos ou de homologação sem reinserir dados de teste (como usuários ou reservas fictícias).

**Independent Test**: Executar `pnpm db:seed:routes` no terminal e observar o log informando as rotas sincronizadas, rotas obsoletas desativadas e a contagem de hotéis atualizados com sucesso.

**Acceptance Scenarios**:

1. **Given** o terminal no diretório raiz do projeto, **When** o comando `pnpm db:seed:routes` é disparado, **Then** o script `routes_seed.ts` é executado com as variáveis de ambiente carregadas (`dotenv`), exibindo logs claros de progresso e encerrando com código 0.
2. **Given** a execução do seed principal completo (`pnpm --filter api db:seed`), **When** o processo é disparado, **Then** ele reutiliza o mesmo catálogo e função de sincronização `seedRoutes` mantendo consistência absoluta.

---

### Edge Cases

- **Banco de dados sem hotéis cadastrados**: O script de rotas deve concluir com sucesso criando as rotas no catálogo global, informando no log que 0 hotéis foram afetados, sem lançar erro.
- **Hotel sem grupo Administrador criado**: O script deve vincular as rotas ao hotel em `RotaHotel` e prosseguir normalmente sem falhar na etapa de grupos.
- **Caminho de rota com caracteres especiais ou formatação inconsistente**: Cada rota deve possuir caminho único e padronizado iniciando por barra `/`, com validação em teste automatizado para assegurar unicidade.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE manter um catálogo oficial `BASE_ROUTES` no pacote da API com a lista canônica de rotas do sistema, especificando `modulo`, `recurso`, `rota`, `icone` e `ordem`.
- **FR-002**: O catálogo DEVE contemplar no mínimo as rotas:
  - Dashboard: `/` (ordem 0)
  - Quartos: `/quartos/novo` (ordem 10), `/quartos` (ordem 11), `/categorias_quartos` (ordem 12)
  - Tarifários: `/tarifarios/novo` (ordem 20), `/tarifarios` (ordem 21)
  - Usuários: `/usuarios/novo` (ordem 30), `/usuarios` (ordem 31)
  - Grupos: `/grupos/novo` (ordem 40), `/grupos` (ordem 41)
- **FR-003**: A função `seedRoutes` DEVE verificar a existência de cada rota pelo campo `rota` e realizar atualização (`update`) se existir ou inserção (`create`) se for nova, definindo `ativo = true`.
- **FR-004**: A função `seedRoutes` DEVE desativar (`ativo = false`) em lote quaisquer rotas persistidas no banco cujo caminho não conste em `BASE_ROUTES`.
- **FR-005**: Para cada hotel registrado no banco, o seed DEVE identificar as rotas ainda não vinculadas em `RotaHotel` e realizar inserção em lote com proteção contra duplicatas.
- **FR-006**: Para cada grupo com nome "Administrador" de cada hotel, o seed DEVE identificar as rotas ainda não vinculadas em `GrupoRota` e inseri-las em lote com proteção contra duplicatas.
- **FR-007**: O `package.json` raiz e o `packages/api/package.json` DEVEM conter o script `db:seed:routes` apontando para a execução de `src/db/seeds/routes_seed.ts`.
- **FR-008**: O arquivo `packages/api/src/db/seeds/routes_seed.spec.ts` DEVE conter testes unitários automatizados validando a integridade do catálogo `BASE_ROUTES`, a unicidade dos caminhos de rota e o comportamento idempotente de `seedRoutes`.

### Key Entities

- **Rota**: Registro de recurso e endpoint do sistema contendo `id`, `modulo`, `recurso`, `rota`, `icone`, `ordem` e `ativo`.
- **RotaHotel**: Tabela associativa entre um `Hotel` e uma `Rota`, indicando que o módulo está habilitado para o estabelecimento.
- **GrupoRota**: Tabela associativa entre um `Grupo` de permissão e uma `Rota`, concedendo acesso aos usuários daquele grupo.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: O script `db:seed:routes` executa de ponta a ponta em menos de 5 segundos para bases com até 50 hotéis.
- **SC-002**: A execução repetida por 10 vezes consecutivas de `seedRoutes` produz exatamente o mesmo número de registros em `Rota`, `RotaHotel` e `GrupoRota` sem qualquer falha ou duplicação.
- **SC-003**: 100% dos caminhos cadastrados no catálogo `BASE_ROUTES` são únicos (zero colisões de rotas).
- **SC-004**: 100% dos testes da suíte `routes_seed.spec.ts` passam com sucesso.

## Assumptions

- O schema do Prisma possui as entidades `Rota`, `Hotel`, `RotaHotel`, `Grupo` e `GrupoRota` devidamente modeladas e migradas.
- O grupo administrativo padrão dos hotéis possui a denominação textual `"Administrador"`.
- A sincronização de rotas pode ser executada tanto em ambiente local quanto em pipelines de CI/CD ou deploys de produção.
