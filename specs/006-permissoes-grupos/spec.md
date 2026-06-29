# Feature Specification: Gestão de Permissões por Grupos de Usuários

**Feature Branch**: `006-permissoes-grupos`

**Created**: 2026-06-29

**Status**: Draft

**Input**: User description: "Gestão de permissões baseada em grupos, com CRUD de grupos e usuários, rotas por hotel e menu lateral dinâmico"

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Administrador gerencia grupos de acesso (Priority: P1)

O administrador do hotel precisa criar grupos de usuários (ex: "Recepcionista", "Governança") e definir quais módulos/recursos cada grupo pode acessar. Isso determina o que cada colaborador vê no sistema.

**Why this priority**: É o núcleo da feature. Sem grupos configurados, não há permissões para atribuir nem menu dinâmico a exibir. Todo o restante da feature depende desse fluxo.

**Independent Test**: Pode ser testado criando um grupo, vinculando rotas a ele e verificando que apenas as rotas selecionadas aparecem no grupo salvo.

**Acceptance Scenarios**:

1. **Given** o administrador está autenticado, **When** acessa a listagem de grupos, **Then** vê uma tabela paginada (50 por página padrão) com nome, descrição, status e ações de editar/deletar.
2. **Given** o administrador clica em "Novo Grupo", **When** preenche nome e descrição e salva, **Then** o grupo aparece na listagem com status ativo.
3. **Given** o administrador edita um grupo, **When** seleciona rotas por módulo via checkboxes e salva, **Then** as rotas vinculadas ao grupo são persistidas corretamente.
4. **Given** o administrador tenta deletar um grupo que tem usuários vinculados, **When** confirma a exclusão, **Then** recebe mensagem de erro informando que o grupo possui usuários e a exclusão é bloqueada.
5. **Given** o administrador tenta deletar um grupo sem usuários vinculados, **When** confirma a exclusão, **Then** o grupo é removido e a listagem é atualizada.

---

### User Story 2 — Administrador gerencia usuários do hotel (Priority: P2)

O administrador precisa criar e editar usuários do hotel, atribuindo-os a um ou mais grupos para definir seus níveis de acesso.

**Why this priority**: Depende dos grupos (P1) para ser completo, mas entrega valor independente: sem esse fluxo, não é possível atribuir grupos aos usuários.

**Independent Test**: Pode ser testado criando um usuário, atribuindo grupos a ele e verificando que o usuário aparece na listagem com os grupos corretos.

**Acceptance Scenarios**:

1. **Given** o administrador acessa a listagem de usuários, **Then** vê tabela paginada com nome, e-mail, CPF, grupos e ação de editar (sem opção de deletar).
2. **Given** o administrador cria um novo usuário, **When** preenche todos os campos e seleciona um ou mais grupos, **Then** o usuário é criado e aparece na listagem.
3. **Given** o administrador edita um usuário existente, **When** altera os grupos vinculados e salva, **Then** os grupos do usuário são atualizados.
4. **Given** o administrador tenta acessar a opção de deletar usuário, **Then** a ação não existe — usuários não podem ser excluídos.

---

### User Story 3 — Menu lateral carregado dinamicamente no login (Priority: P3)

Ao fazer login, o usuário recebe exatamente os módulos e recursos que seus grupos permitem, e o menu lateral exibe apenas esses itens — sem itens estáticos fixos no código.

**Why this priority**: Depende de usuários vinculados a grupos com rotas configuradas (P1 + P2). É o resultado visível ao usuário final de toda a feature.

**Independent Test**: Pode ser testado fazendo login com um usuário vinculado a um grupo com rotas específicas e verificando que o menu exibe apenas os módulos/recursos daquele grupo.

**Acceptance Scenarios**:

1. **Given** um usuário vinculado ao grupo "Administrador" (com acesso a todos os módulos), **When** faz login, **Then** o menu exibe Dashboard, Reservas, Quartos, Grupos e Usuários.
2. **Given** um usuário vinculado ao grupo "Recepcionista" (apenas Reservas), **When** faz login, **Then** o menu exibe somente o módulo Reservas.
3. **Given** um usuário sem nenhum grupo vinculado, **When** faz login, **Then** o menu é exibido vazio (sem itens de navegação).
4. **Given** o usuário está logado, **When** o administrador altera as rotas do grupo desse usuário e o usuário faz login novamente, **Then** o menu reflete as novas permissões.

---

### User Story 4 — Pesquisa e paginação nas listagens (Priority: P4)

O administrador pode pesquisar, filtrar, paginar e ordenar os resultados nas listagens de grupos e usuários. O estado da pesquisa é preservado na URL para fácil compartilhamento.

**Why this priority**: Melhora significativamente a usabilidade em hotéis com muitos usuários/grupos, mas não bloqueia as funcionalidades principais.

**Independent Test**: Pode ser testado digitando um termo na busca e verificando que a URL atualiza com o parâmetro, a listagem filtra e a paginação funciona corretamente.

**Acceptance Scenarios**:

1. **Given** a listagem tem mais de 50 registros, **When** o administrador chega à página, **Then** vê 50 resultados por padrão e controles de paginação (primeira, anterior, próxima, última).
2. **Given** o administrador digita um termo e clica em "Pesquisar", **When** a busca é executada, **Then** a URL é atualizada com os parâmetros de busca e os resultados filtrados são exibidos.
3. **Given** o administrador clica no cabeçalho de uma coluna, **When** a ordenação é aplicada, **Then** os resultados são reordenados e o indicador visual de ordenação aparece na coluna.
4. **Given** o administrador clica em "Mais filtros", **When** o painel abre, **Then** filtros adicionais (ex: status) são exibidos abaixo da barra de pesquisa.
5. **Given** o administrador copia a URL com parâmetros de pesquisa e abre em outra aba, **Then** a pesquisa e a paginação são restauradas automaticamente.

---

### Edge Cases

- O que acontece quando um grupo é editado e suas rotas são alteradas — usuários já logados com sessão ativa não percebem a mudança até o próximo login.
- O que acontece quando todas as rotas de um grupo são removidas — o menu do usuário fica vazio após o próximo login.
- O que acontece quando um hotel não tem nenhuma rota configurada em `rotas_hoteis` — a tela de configuração de grupo exibe lista vazia de rotas disponíveis.
- O que acontece quando `busca` é enviada com caracteres especiais — o sistema deve tratar a entrada e não quebrar a consulta.
- O que acontece ao tentar criar um grupo com nome duplicado dentro do mesmo hotel — o sistema retorna erro de conflito.
- O que acontece ao tentar criar um usuário com e-mail, CPF ou celular já existentes — o sistema retorna erro de conflito com campo identificado.

---

## Requirements *(mandatory)*

### Functional Requirements

**Banco de dados — novos modelos**

- **FR-001**: O sistema DEVE criar o modelo `Grupo` com campos: id, created_at, updated_at, hotel_id (FK Hotel), grupo (varchar 100), descricao (texto opcional), status (char 1, padrão 'S'); com índice em hotel_id e grupo, e restrição unique em (hotel_id, grupo).
- **FR-002**: O sistema DEVE criar o modelo `Rota` com campos: id, created_at, updated_at, modulo (varchar 100), recurso (varchar 100), rota (varchar 255), icone (varchar 50, opcional), ordem (inteiro, padrão 0), ativo (booleano, padrão true).
- **FR-003**: O sistema DEVE criar o modelo `RotaHotel` (tabela pivot) com campos: id, created_at, updated_at, hotel_id (FK Hotel), rota_id (FK Rota); com restrição unique em (hotel_id, rota_id) e índice em hotel_id.
- **FR-004**: O sistema DEVE criar o modelo `GrupoRota` (tabela pivot) com campos: id, created_at, updated_at, grupo_id (FK Grupo), rota_id (FK Rota); com restrição unique em (grupo_id, rota_id).
- **FR-005**: O modelo `User` DEVE receber o campo `grupos_ids` (texto, opcional) para armazenar IDs de grupos separados por vírgula, sem tabela pivot.

**CRUD de Grupos**

- **FR-006**: O sistema DEVE expor endpoint de listagem de grupos com suporte a paginação, pesquisa por texto e ordenação por query params, retornando objeto `meta` com pagina, limite, total e ultima_pagina.
- **FR-007**: O sistema DEVE expor endpoints para criar, buscar por ID e atualizar grupos.
- **FR-008**: O sistema DEVE bloquear a exclusão de um grupo quando houver usuários com esse grupo_id em seu campo grupos_ids, retornando status 409 com mensagem descritiva.
- **FR-009**: Todas as operações de grupos DEVEM ser filtradas por hotel_id extraído do JWT autenticado — nunca do corpo da requisição.

**CRUD de Usuários**

- **FR-010**: O sistema DEVE expor endpoint de listagem de usuários com suporte a paginação, pesquisa por texto e ordenação por query params, retornando objeto `meta`.
- **FR-011**: O sistema DEVE expor endpoints para criar, buscar por ID e atualizar usuários.
- **FR-012**: O sistema NÃO DEVE expor endpoint de exclusão de usuários.
- **FR-013**: A criação de usuário DEVE armazenar a senha com hash seguro.
- **FR-014**: Ao criar ou editar usuário, o campo `grupos_ids` DEVE aceitar lista de IDs de grupos do mesmo hotel.

**Rotas do hotel**

- **FR-015**: O sistema DEVE expor endpoint `GET /rotas` que retorna apenas as rotas ativas vinculadas ao hotel da sessão (via `rotas_hoteis`), para uso na configuração de grupos.

**Menu dinâmico no login**

- **FR-016**: A resposta do endpoint de login DEVE incluir o array `rotas` contendo as rotas liberadas para o usuário logado (union das rotas dos grupos do usuário, interseccionadas com as `rotas_hoteis` do hotel).
- **FR-017**: Cada item do array `rotas` DEVE conter: modulo, recurso, rota, icone (opcional) e ordem.

**Paginação padrão**

- **FR-018**: Todos os endpoints de listagem DEVEM aceitar os query params: `pagina` (padrão 1), `limite` (padrão 50, máximo 250), `busca` (opcional), `ordenar_por` (opcional), `direcao` ('asc'|'desc', padrão 'asc').
- **FR-019**: Todos os endpoints de listagem DEVEM retornar objeto `meta` com: pagina, limite, total, ultima_pagina.

**Seeds**

- **FR-020**: O seed DEVE inserir as rotas base do sistema: Dashboard, Reservas/Listar, Reservas/Nova, Quartos/Listar, Quartos/Novo, Grupos e Usuários.
- **FR-021**: O seed DEVE vincular todas as rotas ao hotel de teste via `rotas_hoteis`.
- **FR-022**: O seed DEVE criar o grupo "Administrador" para o hotel de teste, vincular todas as rotas a ele via `grupos_rotas`, e atualizar o usuário admin com o `grupos_ids` apontando para esse grupo.

**Frontend — componentes reutilizáveis**

- **FR-023**: O sistema DEVE disponibilizar componente `DataTable` genérico com colunas configuráveis e ordenação por cabeçalho.
- **FR-024**: O sistema DEVE disponibilizar componente `DataTablePagination` com controles de primeira página, anterior, próxima e última, além de seletor de limite (50/100/250).
- **FR-025**: O sistema DEVE disponibilizar componente `SearchBar` (input de texto + botão pesquisar).
- **FR-026**: O sistema DEVE disponibilizar componente `FilterPanel` colapsável, oculto por padrão, que abre abaixo da barra de pesquisa ao clicar.
- **FR-027**: O sistema DEVE disponibilizar componente `ResultCount` que exibe o total de resultados retornados.
- **FR-028**: O hook `usePaginacao` DEVE ler e escrever os parâmetros de paginação/pesquisa nos query params da URL via React Router.

**Frontend — Páginas de Grupos**

- **FR-029**: A listagem de grupos DEVE exibir SearchBar, FilterPanel com filtro de status, ResultCount, DataTable (colunas: Grupo, Descrição, Status, Ações) e DataTablePagination.
- **FR-030**: Os formulários de criação e edição de grupos DEVEM seguir o padrão de validação com React Hook Form + Zod.
- **FR-031**: O formulário de edição DEVE exibir as rotas disponíveis do hotel agrupadas por módulo, com checkboxes para seleção.

**Frontend — Páginas de Usuários**

- **FR-032**: A listagem de usuários DEVE exibir SearchBar, ResultCount, DataTable (colunas: Nome, E-mail, CPF, Grupos, Ações) e DataTablePagination — sem botão de deletar.
- **FR-033**: Os formulários de criação e edição de usuários DEVEM incluir campo multiselect para seleção de grupos do hotel.

**Frontend — Menu dinâmico**

- **FR-034**: O `AuthContext` DEVE armazenar o array de `rotas` recebido no login junto com os dados da sessão.
- **FR-035**: O `Sidebar` DEVE renderizar itens de navegação exclusivamente a partir das rotas da sessão, agrupados por módulo e ordenados por `ordem` — sem itens estáticos fixos no código.
- **FR-036**: Os ícones dos módulos DEVEM ser resolvidos dinamicamente a partir de um mapa de nomes Lucide para componentes de ícone.

**Contratos compartilhados**

- **FR-037**: O pacote `.contracts` DEVE exportar o tipo `RotaMenu` com campos: modulo, recurso, rota, icone (opcional), ordem.
- **FR-038**: O contrato `LoginResponse` DEVE ser atualizado para incluir o campo `rotas: RotaMenu[]`.
- **FR-039**: O contrato `AuthUser` DEVE ser atualizado para incluir `grupos_ids?: string`.

**Documentação**

- **FR-040**: O `CLAUDE.md` da API DEVE ser atualizado com: padrão de paginação (query params e shape do meta), regra de retornar 409 para exclusão com dependências, e convenção do campo grupos_ids.
- **FR-041**: O `CLAUDE.md` do Web DEVE ser atualizado com: documentação dos componentes DataTable, padrão de query params / hook usePaginacao, e regra do menu Sidebar ser sempre dinâmico.

### Key Entities

- **Grupo**: Conjunto nomeado de permissões pertencente a um hotel. Possui status ativo/inativo e lista de rotas vinculadas.
- **Rota**: Módulo/recurso do sistema disponível para contratação (ex: "Reservas / Listar reservas"). Dados globais, não pertencem a um hotel específico.
- **RotaHotel**: Vínculo entre um hotel e uma rota, representando o que o hotel contratou/ativou.
- **GrupoRota**: Vínculo entre um grupo e uma rota, representando o que o grupo pode acessar dentro do hotel.
- **Usuário**: Colaborador do hotel, vinculado a um ou mais grupos via campo texto (ids separados por vírgula).

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Um administrador consegue criar um grupo, vincular rotas a ele e atribuir o grupo a um usuário em menos de 3 minutos no total.
- **SC-002**: Após o login, o menu lateral reflete exatamente as rotas dos grupos do usuário — sem rotas a mais nem a menos.
- **SC-003**: A listagem de grupos ou usuários com 200 registros retorna e renderiza em menos de 2 segundos.
- **SC-004**: A URL da listagem com filtros ativos permite reproduzir exatamente a mesma pesquisa quando compartilhada com outro usuário.
- **SC-005**: 100% dos endpoints de listagem retornam o objeto `meta` com informações corretas de paginação.
- **SC-006**: A tentativa de excluir um grupo com usuários vinculados é bloqueada em 100% dos casos, com mensagem de erro clara.
- **SC-007**: Nenhum dado de um hotel vaza para consultas de outro hotel em qualquer endpoint.

---

## Assumptions

- O campo `grupos_ids` no `User` armazena apenas IDs de grupos do mesmo hotel. A validação de integridade referencial entre hotéis é feita no nível de aplicação, não via constraint de banco.
- As rotas base do sistema (Dashboard, Reservas, Quartos, Grupos, Usuários) são definidas globalmente na tabela `rotas` e ativadas por hotel via `rotas_hoteis`. Novas rotas não são criadas pela interface — são gerenciadas diretamente no banco/seed.
- Um usuário sem nenhum grupo vinculado (`grupos_ids` nulo ou vazio) acessa o sistema com menu vazio — sem bloqueio de login.
- A sessão JWT não é invalidada quando as permissões do grupo são alteradas. O novo conjunto de permissões só é aplicado no próximo login.
- Ícones são identificados por nome de string (ex: `"LayoutDashboard"`) e resolvidos no frontend via mapa estático de componentes Lucide. Ícones não cadastrados na tabela `rotas` usam um ícone padrão genérico.
- A feature não implementa controle de acesso por rota no frontend (guarda de rota); o menu dinâmico é informativo. Controle de acesso granular por endpoint é escopo futuro.
- O limite máximo de resultados por página é 250. Exportação de dados em lote é escopo futuro.
- O multiselect de grupos no formulário de usuário exibe todos os grupos ativos do hotel (sem paginação), pois assume-se que hotéis não terão mais que algumas dezenas de grupos.
