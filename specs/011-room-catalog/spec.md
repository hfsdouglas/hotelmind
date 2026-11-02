# Feature Specification: Cadastro de Categorias e Quartos

**Feature Branch**: `011-room-catalog`

**Created**: 2026-11-02

**Status**: Draft

**Input**: User description: "Criar os endpoints e layouts (web) para permitir a criação de quartos. A criação de quartos deve permitir antes a criação de categorias, e dentro das categorias a criação dos quartos. Deve permitir inserir a configuração de camas e a quantidade limite de hóspedes por quarto."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Criar categoria de quarto (Priority: P1)

Como administrador do hotel, quero cadastrar uma categoria antes de cadastrar seus quartos, para organizar os quartos por características comerciais e operacionais.

**Why this priority**: A categoria é a estrutura necessária para que os quartos sejam agrupados e identificados corretamente.

**Independent Test**: A partir da área de cadastro, o usuário consegue informar uma categoria válida, salvá-la e encontrá-la na lista de categorias sem precisar cadastrar um quarto.

**Acceptance Scenarios**:

1. **Given** que o usuário autorizado está na tela de categorias, **When** informa um nome válido e confirma o cadastro, **Then** a categoria é criada e aparece na lista disponível para seleção.
2. **Given** que já existe uma categoria com o mesmo nome no hotel, **When** o usuário tenta cadastrá-la novamente, **Then** o sistema impede o cadastro e informa que o nome já está em uso.
3. **Given** que o usuário deixou o nome obrigatório vazio, **When** tenta salvar, **Then** o sistema apresenta a validação do campo e não cria a categoria.

---

### User Story 2 - Criar quarto dentro de uma categoria (Priority: P1)

Como administrador do hotel, quero cadastrar um quarto associado a uma categoria, para disponibilizá-lo na estrutura do hotel e posteriormente utilizá-lo nas operações de hospedagem.

**Why this priority**: O cadastro do quarto é o objetivo principal da feature e depende de uma categoria válida.

**Independent Test**: Com uma categoria existente, o usuário abre o formulário de quarto, informa os dados obrigatórios, salva e verifica o quarto associado à categoria correta.

**Acceptance Scenarios**:

1. **Given** que existe uma categoria ativa, **When** o usuário abre o cadastro de quarto, informa identificação, capacidade e configuração de camas válidas e confirma, **Then** o quarto é criado dentro da categoria selecionada.
2. **Given** que não existem categorias cadastradas, **When** o usuário acessa o cadastro de quarto, **Then** o sistema informa que é necessário criar uma categoria e oferece acesso ao cadastro de categoria.
3. **Given** que o usuário selecionou uma categoria e preencheu o formulário, **When** cancela a operação, **Then** nenhum quarto é criado e os dados não confirmados não alteram a lista.

---

### User Story 3 - Definir camas e limite de hóspedes (Priority: P1)

Como administrador do hotel, quero informar as camas de um quarto e o limite de hóspedes, para que a capacidade de hospedagem represente a configuração real do quarto.

**Why this priority**: Essas informações determinam a capacidade operacional do quarto e evitam reservas incompatíveis.

**Independent Test**: No cadastro de um quarto, o usuário adiciona uma ou mais configurações de cama, informa a quantidade limite de hóspedes, salva e verifica que os dados exibidos correspondem ao preenchimento.

**Acceptance Scenarios**:

1. **Given** que o usuário está cadastrando um quarto, **When** informa um tipo de cama, sua quantidade e o limite de hóspedes com valores positivos, **Then** o cadastro é aceito e a composição de camas fica visível no quarto.
2. **Given** que o quarto possui mais de um tipo de cama, **When** o usuário adiciona cada configuração antes de salvar, **Then** o sistema preserva todas as configurações associadas ao mesmo quarto.
3. **Given** que a quantidade de camas ou o limite de hóspedes é zero, negativo ou não informado, **When** o usuário tenta salvar, **Then** o sistema rejeita o cadastro e identifica o campo que precisa ser corrigido.

### Edge Cases

- O nome da categoria deve ser considerado duplicado independentemente de diferenças de maiúsculas, minúsculas ou espaços extras nas extremidades.
- A identificação do quarto deve ser única dentro do hotel; uma tentativa de reutilizar a identificação deve ser recusada com mensagem clara.
- O usuário não deve conseguir salvar um quarto sem categoria, sem ao menos uma configuração de cama ou sem limite de hóspedes.
- O sistema deve impedir a criação de uma configuração de cama sem tipo ou com quantidade inválida.
- Se ocorrer uma falha ao salvar, o usuário deve receber uma mensagem compreensível e os dados já preenchidos devem permanecer disponíveis para correção ou nova tentativa.
- A lista e os formulários devem exibir estado vazio quando ainda não houver categorias ou quartos cadastrados.
- Categorias inativas não devem ser oferecidas para novos quartos, mas os quartos já vinculados devem manter sua categoria registrada.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST permitir que um usuário autorizado visualize a lista de categorias do hotel e inicie o cadastro de uma nova categoria.
- **FR-002**: O sistema MUST exigir um nome não vazio para cada categoria e impedir nomes duplicados no mesmo hotel, desconsiderando maiúsculas, minúsculas e espaços nas extremidades.
- **FR-003**: O sistema MUST permitir salvar uma categoria e disponibilizá-la imediatamente para associação a quartos.
- **FR-004**: O sistema MUST permitir que um usuário autorizado visualize os quartos agrupados por categoria e inicie o cadastro de um quarto dentro de uma categoria ativa.
- **FR-005**: O sistema MUST exigir que todo quarto pertença a uma categoria ativa existente no momento da criação.
- **FR-006**: O sistema MUST exigir uma identificação do quarto não vazia e única dentro do hotel.
- **FR-007**: O sistema MUST permitir que o usuário informe uma ou mais configurações de cama para o quarto, contendo tipo de cama e quantidade.
- **FR-008**: O sistema MUST permitir informar a quantidade limite de hóspedes do quarto como um número inteiro positivo.
- **FR-009**: O sistema MUST validar que a quantidade de cada tipo de cama seja um número inteiro positivo antes de criar o quarto.
- **FR-010**: O sistema MUST persistir a categoria, a identificação do quarto, todas as configurações de camas e o limite de hóspedes como um único cadastro consistente; se o salvamento falhar, não deve existir um quarto parcialmente criado.
- **FR-011**: O sistema MUST disponibilizar operações de serviço para criar e consultar categorias e para criar e consultar quartos com suas respectivas configurações, retornando mensagens de validação compreensíveis quando os dados forem inválidos.
- **FR-012**: A interface web MUST oferecer uma tela de categorias com listagem, estado vazio, ação de criar e formulário de criação.
- **FR-013**: A interface web MUST oferecer uma tela de quartos com agrupamento ou filtro por categoria, estado vazio, ação de criar e formulário de criação.
- **FR-014**: O formulário de quarto MUST permitir adicionar, visualizar e remover linhas de configuração de camas antes da confirmação.
- **FR-015**: A interface web MUST indicar visualmente campos obrigatórios, erros de validação, sucesso do cadastro, falhas de salvamento e ações de cancelamento sem perda de dados já salvos.
- **FR-016**: O sistema MUST restringir o cadastro e a consulta aos usuários autorizados conforme as regras de acesso já existentes no produto.

### Key Entities

- **Categoria de quarto**: Agrupamento comercial e operacional de quartos de um hotel; possui nome, estado de disponibilidade para novos cadastros e seus quartos associados.
- **Quarto**: Unidade hospedável pertencente a uma categoria; possui identificação, limite de hóspedes e uma ou mais configurações de camas.
- **Configuração de cama**: Composição de um quarto que registra um tipo de cama e a quantidade daquele tipo.
- **Hotel**: Contexto proprietário que determina a unicidade de nomes de categorias e identificações de quartos.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Um usuário autorizado consegue criar uma categoria válida e vê-la disponível para seleção em até 60 segundos após abrir a área de categorias.
- **SC-002**: Um usuário autorizado consegue cadastrar um quarto com categoria, identificação, camas e capacidade em até 3 minutos, sem assistência externa.
- **SC-003**: Em testes de aceitação, pelo menos 95% das tentativas com dados válidos criam exatamente um quarto completo, sem registros parciais ou duplicados.
- **SC-004**: Em testes de aceitação, 100% das tentativas com categoria ausente, identificação duplicada, cama inválida ou capacidade inválida são rejeitadas com indicação do problema ao usuário.
- **SC-005**: Após o cadastro, 100% dos quartos consultados exibem a categoria, a identificação, o limite de hóspedes e todas as configurações de camas salvas.
- **SC-006**: Pelo menos 90% dos usuários de teste concluem o cadastro de categoria e quarto na primeira tentativa, sem precisar retornar a uma etapa anterior para descobrir campos obrigatórios.

## Assumptions

- O usuário já está autenticado e o produto já possui uma regra de autorização aplicável aos cadastros administrativos.
- O hotel do usuário é determinado pelo contexto existente da sessão e não precisa ser escolhido no formulário.
- A primeira versão contempla criação e consulta; alteração, exclusão e ordenação avançada ficam fora do escopo, salvo necessidade já existente do produto.
- Os tipos de cama disponíveis serão selecionados de uma lista controlada pelo produto, com possibilidade de inclusão de mais de um tipo no mesmo quarto.
- Uma categoria pode ser marcada como inativa por fluxo administrativo existente; categorias inativas não podem receber novos quartos.
- As telas devem seguir os padrões visuais, de navegação e componentes já usados na aplicação web.
- O cadastro de quarto deve ser atomicamente consistente: todas as informações do quarto e suas camas são confirmadas juntas.
