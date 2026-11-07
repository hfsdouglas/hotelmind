# Feature Specification: Tarifários Vinculados a Parceiros Comerciais

**Feature Branch**: `027-partner-rate-plans`

**Created**: 2026-11-06

**Status**: Draft

**Input**: User description: "O usuário deve conseguir criar tarifários vinculados à um parceiro comercial. Essa mudança implica em orçamentos e reservas. Ou seja, para criar uma reserva/orçamento onde o parceiro comercial é indicado, deve ser apresentada apenas as tarifas e suítes disponíveis para ele. Para testes, crie pelo menos 5 parceiros comerciais via seed. É importante que os seeds sejam separados por contexto/pasta. O seed de rotas é um seed utilizado em produção."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Cadastro e Gestão de Tarifário Vinculado a Parceiro (Priority: P1)

Como gestor de reservas ou administrador do hotel, quero vincular um tarifário específico a um parceiro comercial (como uma agência, operadora ou empresa corporativa) para disponibilizar condições comerciais e valores negociados exclusivamente para aquele parceiro.

**Why this priority**: É a base do modelo tarifário B2B/corporativo. Sem a capacidade de associar uma tarifa a um parceiro comercial, nenhuma das regras restritivas subsequentes em orçamentos e reservas pode ser aplicada.

**Independent Test**: Pode ser testado de ponta a ponta criando um novo tarifário selecionando um parceiro comercial ativo, salvando e verificando se o vínculo persiste e se o tarifário aparece filtrado pelo parceiro.

**Acceptance Scenarios**:

1. **Given** que o usuário está no formulário de criação/edição de tarifário e existem parceiros comerciais cadastrados, **When** o usuário escolhe um parceiro comercial e salva o tarifário, **Then** o tarifário é salvo vinculado àquele parceiro comercial específico.
2. **Given** que o usuário está cadastrando um tarifário público/balcão padrão, **When** o campo de parceiro comercial não é preenchido (deixado vazio/opcional), **Then** o tarifário é salvo como público geral (sem parceiro vinculado).
3. **Given** a listagem ou consulta de tarifários, **When** o usuário filtra por parceiro comercial ou visualiza os detalhes, **Then** a identificação do parceiro comercial vinculado é exibida claramente.

---

### User Story 2 - Orçamento com Restrição de Tarifas e Suítes por Parceiro (Priority: P1)

Como atendente ou operador de vendas, ao elaborar um orçamento para um parceiro comercial, quero selecionar o parceiro para que o sistema me apresente estritamente as tarifas e categorias de suítes negociadas e disponíveis para ele.

**Why this priority**: Evita a cotação com tarifas públicas indevidas ou categorias de quartos não autorizadas para aquele parceiro, assegurando o cumprimento dos acordos comerciais.

**Independent Test**: Criar um orçamento informando um parceiro comercial que possui tarifas cadastradas apenas para determinadas categorias de quartos e datas; confirmar que apenas essas categorias e tarifas são listadas para seleção e cálculo de diárias.

**Acceptance Scenarios**:

1. **Given** o formulário de criação de orçamento, **When** o usuário seleciona um parceiro comercial específico, **Then** o catálogo de categorias de quartos e opções de tarifas disponíveis para seleção é imediatamente filtrado, exibindo apenas as suítes e tarifas associadas àquele parceiro para o período informado.
2. **Given** um parceiro comercial selecionado no orçamento que não possui tarifas vigentes para o período informado, **When** o usuário busca as tarifas/suítes, **Then** o sistema exibe alerta claro informando indisponibilidade de tarifas para o parceiro naquele período e impede o cálculo com valores padrão.
3. **Given** a elaboração de orçamento sem parceiro comercial (cliente avulso/direto), **When** o campo parceiro permanece desmarcado, **Then** apenas as tarifas e categorias públicas/padrão (não vinculadas a parceiros exclusivos) são disponibilizadas.
4. **Given** um orçamento salvo com parceiro comercial, **When** visualizado internamente ou exportado, **Then** exibe a identificação do parceiro vinculado e o detalhamento correto das diárias calculadas.

---

### User Story 3 - Reserva com Restrição de Tarifas e Suítes por Parceiro (Priority: P1)

Como recepcionista ou operador de reservas, ao registrar uma reserva vinculada a um parceiro comercial, quero que o sistema disponibilize apenas as tarifas e as suítes (quartos físicos pertencentes às categorias com tarifário ativo) elegíveis para aquele parceiro.

**Why this priority**: Garante integridade operacional no momento da reserva definitiva, impedindo alocação em quartos fora do pacote comercial acordado e assegurando cobrança correta.

**Independent Test**: Iniciar uma reserva indicando um parceiro comercial e conferir se apenas quartos/suítes com tarifas vigentes para o parceiro são exibidos e precificados.

**Acceptance Scenarios**:

1. **Given** o formulário de criação ou edição de reserva, **When** o usuário seleciona um parceiro comercial, **Then** as opções de acomodação (suítes/quartos) e regimes de alimentação ficam restritas àquelas cobertas pelos tarifários exclusivos do parceiro no período.
2. **Given** que o usuário troca o parceiro comercial ou desmarca o parceiro durante a edição da reserva, **When** a alteração ocorre, **Then** o sistema alerta sobre a necessidade de recalcular as diárias e revalidar a suíte selecionada.
3. **Given** uma reserva originada de um orçamento com parceiro, **When** convertida em reserva, **Then** mantém a fidelidade das tarifas do parceiro e suíte acordada.

---

### User Story 4 - Consulta de Tarifários e Calendário Segmentado por Parceiro (Priority: P2)

Como gestor de revenue ou gerente de hospedagem, quero filtrar a visão em calendário e a listagem de tarifários por parceiro comercial para monitorar a disponibilidade de preços acordados ao longo do ano.

**Why this priority**: Melhora a visibilidade do gestor na gestão de contratos e sazonalidades de cada operadora/empresa.

**Independent Test**: Acessar o calendário de tarifários, aplicar o filtro de um parceiro comercial específico e verificar que apenas as datas e valores desse parceiro são renderizados.

**Acceptance Scenarios**:

1. **Given** a tela de calendário ou listagem de tarifários, **When** o usuário seleciona um filtro por parceiro comercial, **Then** apenas os tarifários vinculados àquele parceiro são apresentados na grade ou na listagem.
2. **Given** o filtro de tarifários padrão/públicos, **When** selecionado "Apenas Tarifas Públicas", **Then** os tarifários corporativos de parceiros são ocultados da visualização.

---

### User Story 5 - Infraestrutura de Seeds Modular por Contexto e Carga de Testes (Priority: P2)

Como desenvolvedor ou analista de qualidade executando o sistema localmente ou em ambiente de testes, quero executar seeds separados por contexto/pasta, mantendo o seed de rotas de produção estritamente isolado e contando com pelo menos 5 parceiros comerciais para validação contínua.

**Why this priority**: Mantém a governança de dados limpa, permitindo que a produção execute apenas seeds de sistema (rotas/permissões) enquanto ambientes de desenvolvimento e teste possam semear parceiros, tarifas e hotéis sem poluir artefatos produtivos.

**Independent Test**: Executar individualmente o comando de seed de produção (verificando que apenas rotas e dados de sistema essenciais são gerados) e o comando de desenvolvimento (verificando a criação de ao menos 5 parceiros comerciais distribuídos em pastas contextuais).

**Acceptance Scenarios**:

1. **Given** a estrutura de seeds do sistema, **When** inspecionados os arquivos de carga, **Then** os scripts de sementes estão organizados em diretórios específicos por contexto de negócio (ex.: rotas/sistema de produção, parceiros comerciais, acomodações/tarifários).
2. **Given** a execução do seed de desenvolvimento/testes, **When** o processo é concluído, **Then** pelo menos 5 parceiros comerciais de tipos variados (agência de viagens, operadora, empresa corporativa, etc.) são criados no banco de dados com seus respectivos endereços e contatos.
3. **Given** a execução do seed de rotas de produção, **When** executado em qualquer ambiente, **Then** opera de maneira independente sem depender nem disparar a criação de dados mockados de testes.

---

### Edge Cases

- **Parceiro Inativo ou Bloqueado**: Se um parceiro comercial tiver status alterado para "inativo" ou "bloqueado", seus tarifários não devem aparecer para novos orçamentos ou reservas, mantendo-se íntegros apenas os históricos já confirmados.
- **Datas Parcialmente Cobertas**: Se o período de estadia (check-in a check-out) tiver noites que não possuem tarifário cadastrado para o parceiro selecionado, o sistema deve alertar as datas faltantes e impedir a confirmação sem tarifa definida.
- **Parceiro sem Tarifário Próprio**: Se um parceiro comercial não tiver nenhum tarifário cadastrado para si, o sistema deve informar claramente que não há tarifas negociadas cadastradas para aquele parceiro (e não aplicar silenciosamente tarifas públicas a menos que haja configuração explícita de fallback).
- **Troca de Parceiro em Reserva Existente**: Caso o operador altere o parceiro de uma reserva já existente com datas selecionadas, o sistema deve exigir confirmação explícita do recálculo antes de persistir alterações.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE permitir a associação de um tarifário a um parceiro comercial específico (relacionamento opcional, permitindo tarifários públicos quando nulo e corporativos quando preenchido).
- **FR-002**: O sistema DEVE validar o isolamento multi-inquilino (`hotel_id`), garantindo que tanto o parceiro quanto a categoria de quarto e o regime de alimentação pertençam estritamente ao mesmo hotel da tarifa.
- **FR-003**: O formulário e a listagem de tarifários DEVEM permitir filtrar, selecionar e visualizar o parceiro comercial associado.
- **FR-004**: O cadastro e edição de orçamentos DEVE permitir a seleção opcional de um parceiro comercial do hotel.
- **FR-005**: Ao selecionar um parceiro comercial na criação ou edição de um orçamento, o sistema DEVE restringir a listagem de categorias de quartos e opções de cálculo exclusivamente àquelas que possuam tarifários ativos vinculados àquele parceiro para o período solicitado.
- **FR-006**: Ao selecionar um parceiro comercial na criação ou edição de uma reserva, o sistema DEVE restringir as suítes e opções de tarifa disponíveis exclusivamente àquelas vigentes para o parceiro selecionado no período solicitado.
- **FR-007**: Se nenhum parceiro comercial for indicado no orçamento ou na reserva, o sistema DEVE disponibilizar exclusivamente os tarifários públicos gerais (sem vínculo com parceiros).
- **FR-008**: O cálculo de diárias e valor total em orçamentos e reservas DEVE utilizar os valores das diárias do tarifário vinculado ao parceiro selecionado em cada noite do período.
- **FR-009**: O sistema DEVE disponibilizar no ambiente de testes e desenvolvimento pelo menos 5 parceiros comerciais criados via seed, contemplando perfis distintos de regras comerciais (ex.: comissionado, faturado, agência, operadora, corporativo).
- **FR-010**: Os scripts de seeds da base de dados DEVEM ser organizados e separados por diretórios/contextos de domínio (por exemplo, contexto de sistema/produção isolado do contexto de massa de testes de parceiros e negócios).
- **FR-011**: O seed de rotas e permissões DEVE permanecer utilizável e idempotente em ambiente de produção, sem dependência de dados mock de testes.

### Key Entities *(include if feature involves data)*

- **Tarifario**: Representa o plano tarifário diário com valor e datas vigentes. Possui vínculo obrigatório com Hotel, Categoria de Quarto e Regime de Alimentação, e vínculo opcional com **Parceiro Comercial** (`parceiro_id`).
- **Parceiro Comercial (`Parceiro`)**: Pessoa jurídica ou física parceira (agências, empresas, operadoras) com modelo tarifário, comissão e dados fiscais/cadastrais cadastrados no hotel.
- **Orcamento**: Cotação para um lead ou parceiro. Contém o período, adultos/crianças, detalhamento de noites calculadas e passa a referenciar opcionalmente o **Parceiro Comercial** (`parceiro_id`).
- **Reserva**: Reserva de hospedagem em um quarto físico específico. Já possui campo de **Parceiro Comercial** (`parceiro_id`), que agora determina a restrição das categorias e diárias aplicáveis.
- **CategoriaQuarto / Quarto**: As suítes do hotel. As categorias elegíveis para o parceiro são determinadas pelos tarifários ativos vinculados a ele para o período.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: O usuário consegue cadastrar um tarifário vinculado a um parceiro comercial em menos de 1 minuto através da interface.
- **SC-002**: 100% dos orçamentos e reservas vinculados a um parceiro comercial utilizam estritamente as tarifas e categorias autorizadas para esse parceiro, eliminando qualquer vazamento acidental de tarifas públicas ou de outros parceiros.
- **SC-003**: Ao trocar ou selecionar um parceiro no fluxo de orçamento ou reserva, a resposta visual e atualização das suítes/tarifas disponíveis ocorre em menos de 500 milissegundos.
- **SC-004**: O banco de dados de testes pode ser populado com pelo menos 5 parceiros comerciais representativos via comando automatizado em menos de 5 segundos.
- **SC-005**: A execução do seed de produção de rotas permanece 100% isolada e executável sem carregar dados fictícios de parceiros ou reservas.

## Assumptions

- Tarifários sem parceiro comercial associado (`parceiro_id = null`) são tratados como tarifários públicos padrão (balcão/site direto).
- Um parceiro comercial pode possuir múltiplos tarifários (por exemplo, tarifários para diferentes épocas do ano ou para diferentes categorias de quartos).
- Não há compartilhamento de tarifas exclusivas entre parceiros distintos: cada tarifa negociada pertence exclusivamente ao parceiro indicado ou é pública geral.
- A restrição de suítes em orçamentos e reservas é derivada da existência de tarifários vigentes para o parceiro: se uma categoria de quarto não possui tarifário cadastrado para o parceiro no período, essa categoria não pode ser cotada nem reservada para ele.
- O isolamento de seeds organiza as rotas em pasta com escopo de produção/sistema, enquanto dados demonstrativos (hotéis de teste, parceiros, quartos, tarifários) ficam organizados em pastas contextuais para desenvolvimento e testes.
