# Feature Specification: Gestão de Regimes de Alimentação e Associação Obrigatória aos Tarifários

**Feature Branch**: `022-meal-plans-management`

**Created**: 2026-11-03

**Status**: Draft

**Input**: User description: "Implementar o cadastro e gestão completa de Regimes de Alimentação (ex.: Café da Manhã, Meia Pensão, Pensão Completa, All Inclusive) por hotel, incluindo seletor de cores para identificação visual, controle de situação (Ativado/Desativado), listagem paginada com busca, formulários de criação e edição com botão Salvar padronizado, e tornar o vínculo com o regime de alimentação obrigatório em todos os cadastros e cálculos de tarifários da plataforma."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Cadastro e Manutenção de Regimes de Alimentação (Priority: P1)

Como gestor do hotel, quero cadastrar, listar e editar os regimes de alimentação oferecidos pelo estabelecimento (informando nome, descrição opcional, cor de identificação e status ativo/inativo), para que a operação e os tarifários possam categorizar corretamente os pacotes de refeições incluídos nas diárias.

**Why this priority**: O regime de alimentação é um dos pilares essenciais da precificação hoteleira. Sem esse cadastro, não é possível diferenciar diárias simples de diárias com refeições inclusas.

**Independent Test**: Acessar o menu "Regimes de Alimentação" (`/regimes_alimentacao`), clicar em "Novo regime", preencher nome ("Meia Pensão"), selecionar uma cor no paleta/color picker, preencher descrição e salvar com o botão padronizado. Verificar que o registro aparece na listagem com sua badge colorida e permite edição subsequente.

**Acceptance Scenarios**:

1. **Given** que o usuário acessa `/regimes_alimentacao/novo`, **When** preenche um nome válido, escolhe uma cor na paleta predefinida ou via código hexadecimal e clica em "Salvar", **Then** o regime é persistido na base vinculado ao hotel do usuário e redireciona para a listagem com mensagem de sucesso.
2. **Given** que o usuário tenta cadastrar um regime com nome já existente no mesmo hotel, **When** submete o formulário, **Then** o sistema bloqueia com mensagem de conflito ("Já existe um regime de alimentação com este nome").
3. **Given** um regime de alimentação existente, **When** o usuário acessa `/regimes_alimentacao/:id/editar`, altera seu nome, cor ou descrição e salva, **Then** as alterações são gravadas e refletidas imediatamente nas listagens e formulários dependentes.

---

### User Story 2 - Ativação e Desativação Segura de Regimes de Alimentação (Priority: P1)

Como gestor, quero desativar regimes de alimentação que o hotel não oferece mais sem perder o histórico financeiro e de reservas passadas, com um modal de confirmação ao tentar desativar um plano na edição.

**Why this priority**: Garante integridade referencial: planos descontinuados não devem ser excluídos fisicamente, preservando dados de tarifários e relatórios passados.

**Independent Test**: Na página de edição de um regime de alimentação, alternar o campo de situação de "Ativado" para "Desativado" e submeter o formulário; verificar a exibição da janela de confirmação alertando sobre a desativação e constatar a alteração do status após confirmação.

**Acceptance Scenarios**:

1. **Given** um regime de alimentação atualmente ativo, **When** o usuário seleciona "Desativado" na tela de edição e clica em "Salvar", **Then** um diálogo de confirmação (`AlertDialog`) é exibido alertando que o regime não será mais disponibilizado para novos tarifários.
2. **Given** a confirmação da desativação no modal, **When** o usuário confirma, **Then** o status é alterado para inativo (`ativo = false`) e o regime deixa de aparecer como opção ativa para novos tarifários.
3. **Given** um regime inativo, **When** o usuário seleciona "Ativado" na tela de edição e salva, **Then** o regime é reativado imediatamente sem necessidade de confirmação destrutiva.

---

### User Story 3 - Obrigatoriedade do Regime de Alimentação nos Tarifários (Priority: P1)

Como responsável pela precificação do hotel, quero que o formulário de cadastro e edição de tarifários exija obrigatoriamente a seleção de um regime de alimentação ativo, e que a listagem de tarifários exiba o nome do regime com sua cor correspondente, para que a equipe saiba com exatidão o que está incluso em cada tarifa cadastrada.

**Why this priority**: Uma diária sem regime de alimentação definido gera dúvidas operacionais na recepção e no restaurante no momento do check-in do hóspede.

**Independent Test**: Abrir o formulário de novo tarifário, tentar salvar sem selecionar um regime de alimentação e verificar o erro de validação obrigatória; selecionar um regime ("Café da Manhã"), preencher os demais campos obrigatórios (nome, categoria, diária, datas) e salvar com sucesso, verificando a badge do regime com cor personalizada na listagem.

**Acceptance Scenarios**:

1. **Given** o formulário de criação ou edição de tarifário, **When** o usuário não seleciona um regime de alimentação, **Then** o formulário impede o envio exibindo a mensagem "Regime de alimentação é obrigatório".
2. **Given** um tarifário salvo com regime de alimentação, **When** o usuário consulta a listagem de tarifários (`/tarifarios`), **Then** a tabela exibe uma coluna ou identificador visual com o nome do regime acompanhado de indicador com sua cor configurada.
3. **Given** o cálculo de tarifas pela API (`calcular_tarifa_reserva_use_case`), **When** um tarifário é recuperado e aplicado, **Then** o objeto retornado contém o `regime_alimentacao_id` e os dados do regime vinculado.

---

### User Story 4 - Padronização do Botão de Salvar e Componente Color Picker (Priority: P2)

Como usuário preenchendo formulários do sistema, quero encontrar o mesmo botão "Salvar" padronizado (com ícone de disquete, feedback de carregamento durante envio e tipografia uniforme) em todos os formulários da aplicação (web e admin), além de um componente intuitivo de seleção de cores com paleta de tons recomendados e campo hexadecimal livre.

**Why this priority**: A consistência de botões e seletores reduz a curva de aprendizado e melhora a percepção de qualidade do software.

**Independent Test**: Avaliar os formulários de cadastro de regimes, categorias, quartos, administradores e rotas, confirmando a presença do componente `SaveButton` com estados normal e carregando (`Salvando...`), e testar o `ColorPicker` escolhendo cores predefinidas ou inserindo códigos hexadecimais manuais.

**Acceptance Scenarios**:

1. **Given** qualquer formulário baseado em `CrudFormLayout` (em `web` ou `admin`), **When** o botão de ação principal é renderizado, **Then** ele utiliza o componente `SaveButton` exibindo ícone `Save` (disquete) e texto "Salvar".
2. **Given** que o usuário submete o formulário, **When** a requisição assíncrona está em andamento, **Then** o botão `SaveButton` fica desabilitado exibindo o spinner de carregamento e o texto "Salvando...".
3. **Given** o componente `ColorPicker`, **When** renderizado, **Then** apresenta botões circulares com 8 cores predefinidas (azul, esmeralda, violeta, âmbar, rosa, céu, laranja, ardósia) e um campo de texto para entrada livre de código hexadecimal (`#RRGGBB`).

---

### Edge Cases

- **Exclusão de regime com tarifários vinculados**: O sistema não deve permitir exclusão física de regimes de alimentação existentes para preservar a integridade referencial do banco de dados (restringindo a exclusão via chave estrangeira ou desativação lógica).
- **Inativação de regime usado em tarifários vigentes**: Tarifários já criados continuam funcionando normalmente e exibindo o regime vinculado no histórico, porém o regime desativado não deve ser selecionável para novas criações.
- **Códigos hexadecimais inválidos**: O `ColorPicker` e o schema de validação devem validar o formato hexadecimal (`^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$`), rejeitando strings arbitrárias.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O pacote `packages/.contracts` DEVE definir a interface `RegimeAlimentacao` e os tipos de criação, edição e listagem (`CreateRegimeAlimentacaoData`, `UpdateRegimeAlimentacaoData`, `RegimesAlimentacaoFiltros`, `RegimesAlimentacaoListaResposta`).
- **FR-002**: A interface `Tarifario` no contrato compartilhado DEVE incluir a propriedade obrigatória `regime_alimentacao_id: string` e a propriedade opcional `regime_alimentacao?: RegimeAlimentacao`.
- **FR-003**: A API DEVE disponibilizar as entidades de domínio, repositórios (PostgreSQL e InMemory) e casos de uso completos para Regimes de Alimentação:
  - `CriarRegimeAlimentacaoUseCase` (com verificação de duplicidade por hotel e nome normalizado);
  - `EditarRegimeAlimentacaoUseCase`;
  - `BuscarRegimeAlimentacaoUseCase`;
  - `ListarRegimesAlimentacaoUseCase` (com paginação e busca textual);
  - `AtivarRegimeAlimentacaoUseCase` e `DesativarRegimeAlimentacaoUseCase`.
- **FR-004**: A tabela `regimes_alimentacao` no PostgreSQL DEVE conter as colunas `id`, `hotel_id`, `nome`, `descricao`, `cor`, `ativo`, `created_at` e `updated_at`, com índice único composto em `[hotel_id, nome]`.
- **FR-005**: A tabela `tarifarios` DEVE possuir chave estrangeira `regime_alimentacao_id` referenciando `regimes_alimentacao(id)` com restrição `RESTRICT` e índice para consultas de performance.
- **FR-006**: A API DEVE expor as rotas HTTP de CRUD sob o prefixo `/regimes_alimentacao` (`POST /`, `GET /`, `GET /:id`, `PUT /:id`, `PATCH /:id/ativar`, `PATCH /:id/desativar`), devidamente protegidas por autenticação e validação Zod.
- **FR-007**: O seed de rotas do sistema (`routes_seed.ts`) DEVE registrar as rotas de Regimes de Alimentação:
  - `/regimes_alimentacao/novo` (recurso: 'Cadastrar', icone: 'Utensils', ordem: 23);
  - `/regimes_alimentacao` (recurso: 'Consultar', icone: 'Utensils', ordem: 24);
  E garantir a criação dos 4 regimes padrão (Café da Manhã, Meia Pensão, Pensão Completa e All Inclusive) com cores distintas para cada hotel.
- **FR-008**: O frontend (`packages/web`) DEVE disponibilizar as páginas:
  - `/regimes_alimentacao`: listagem com `ListPageLayout`, `PagedDataTable`, badge com cor e link de edição;
  - `/regimes_alimentacao/novo`: formulário de cadastro com nome, descrição, seletor `ColorPicker` e situação;
  - `/regimes_alimentacao/:id/editar`: formulário de edição com diálogo de confirmação para desativação.
- **FR-009**: O componente `TarifarioForm` DEVE conter um campo de seleção (`Select`) obrigatório para escolha do regime de alimentação entre as opções ativas do hotel.
- **FR-010**: O componente `SaveButton` DEVE ser implementado e padronizado nas aplicações `web` e `admin`, integrando ícone `Save`, suporte a `isLoading` com spinner e texto configurável.

### Key Entities

- **RegimeAlimentacao**: Unidade de plano alimentar oferecido pelo hotel contendo `id`, `hotel_id`, `nome`, `descricao`, `cor` (hexadecimal), `ativo`, `created_at` e `updated_at`.
- **Tarifario**: Registro de precificação diária que vincula uma categoria de quarto a um período e a um `RegimeAlimentacao` obrigatório.
- **SaveButton**: Componente de botão de submissão unificado para formulários CRUD.
- **ColorPicker**: Componente de interface para escolha visual de cores por presets temáticos ou entrada hexadecimal direta.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% dos novos cadastros e edições de tarifários exigem a seleção de um regime de alimentação válido antes de submeter.
- **SC-002**: A criação ou edição de um regime de alimentação é confirmada e persistida em menos de 200ms.
- **SC-003**: 100% dos testes unitários e de integração de regimes de alimentação na API (`regimes_alimentacao_use_cases.spec.ts`, `regimes_alimentacao_routes.spec.ts`) e no frontend (`regimes_alimentacao_pages.spec.tsx`, `tarifarios_pages.spec.tsx`) passam com sucesso.
- **SC-004**: O seletor de cores atualiza a pré-visualização instantaneamente (< 16ms) em qualquer evento de clique ou digitação.

## Assumptions

- Cada hotel gerencia sua própria lista de regimes de alimentação, garantindo independência operacional.
- O campo cor armazena valores em formato hexadecimal (#RRGGBB) compatível com renderização direta no navegador.
- Migrações do banco de dados asseguram que tarifários legados recebam um regime padrão associado antes de aplicar a restrição de obrigatoriedade `NOT NULL`.
