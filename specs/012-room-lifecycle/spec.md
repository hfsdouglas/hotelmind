# Feature Specification: Gestão do Ciclo de Vida de Quartos e Categorias

**Feature Branch**: `012-room-lifecycle`

**Created**: 2026-11-02

**Status**: Draft

**Input**: User description: "Permitir a edição de quartos e categorias; não permitir exclusão, apenas inativação; criar descrição na inclusão de quartos; adicionar filtro de ativos e inativos; identificação somente numérica com validação no front e na API; criar seeds para Suítes Luxo 101–116, Suítes Super Luxo 201–216, Suítes Master 302–306 e Suíte Presidencial 301; aplicar paginação, limite e busca de quartos; ajustar ações e filtros das tabelas."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Editar categorias e quartos (Priority: P1)

Como administrador do hotel, quero editar os dados de uma categoria ou quarto existente, para corrigir informações e manter o cadastro atualizado sem recriar registros.

**Why this priority**: A operação diária exige correção de nomes, descrições, capacidade, camas e demais dados do inventário.

**Independent Test**: Com uma categoria e um quarto existentes, o usuário abre cada edição, altera um campo válido, salva e confirma que a listagem exibe o novo valor.

**Acceptance Scenarios**:

1. **Given** que existe uma categoria pertencente ao hotel, **When** o usuário altera seu nome ou estado e salva, **Then** a categoria é atualizada e permanece no mesmo hotel.
2. **Given** que existe um quarto pertencente a uma categoria, **When** o usuário altera descrição, identificação, limite ou camas e salva, **Then** todos os dados válidos são atualizados juntos.
3. **Given** que o usuário tenta alterar um cadastro que não pertence ao hotel atual, **When** confirma a edição, **Then** o sistema não expõe nem modifica o cadastro.
4. **Given** que o usuário abre uma edição e cancela, **When** retorna à listagem, **Then** nenhum dado persistido é alterado.

---

### User Story 2 - Inativar sem excluir (Priority: P1)

Como administrador do hotel, quero inativar categorias e quartos sem excluí-los, para preservar o histórico e impedir o uso de registros que não estão disponíveis.

**Why this priority**: A exclusão física pode quebrar referências operacionais e elimina informações necessárias para histórico e auditoria.

**Independent Test**: O usuário altera o estado de uma categoria e de um quarto para inativo, confirma que ambos continuam consultáveis como inativos e verifica que não existe ação de exclusão.

**Acceptance Scenarios**:

1. **Given** que uma categoria ativa está cadastrada, **When** o usuário a inativa, **Then** ela permanece na listagem com estado inativo e não é oferecida para novos quartos.
2. **Given** que um quarto ativo está cadastrado, **When** o usuário o inativa, **Then** ele permanece armazenado e deixa de ser considerado disponível para novos usos.
3. **Given** que uma categoria possui quartos vinculados, **When** o usuário tenta inativá-la, **Then** a categoria é inativada sem remover seus quartos ou suas relações.
4. **Given** que o usuário visualiza categorias ou quartos, **When** procura uma ação de exclusão, **Then** nenhuma ação de excluir é apresentada ou aceita.

---

### User Story 3 - Pesquisar e validar o inventário (Priority: P1)

Como administrador do hotel, quero filtrar registros ativos e inativos e validar a identificação numérica dos quartos, para encontrar rapidamente o inventário correto e evitar cadastros inválidos.

**Why this priority**: A pesquisa por estado é necessária após a inativação, e uma identificação consistente evita duplicidades e erros operacionais.

**Independent Test**: Na listagem, o usuário pesquisa por identificação, categoria e cama, escolhe cada estado, altera limite e página e confirma os resultados; no formulário, tenta salvar identificações alfabéticas e recebe validação tanto na tela quanto no serviço.

**Acceptance Scenarios**:

1. **Given** que existem registros ativos e inativos, **When** o usuário escolhe “Ativos” em “Mais filtros”, **Then** somente registros ativos são exibidos.
2. **Given** que existem registros ativos e inativos, **When** o usuário escolhe “Inativos” em “Mais filtros”, **Then** somente registros inativos são exibidos.
3. **Given** que o usuário escolhe “Todos”, **When** aplica o filtro, **Then** registros ativos e inativos são exibidos sem alteração de seus estados.
4. **Given** que o usuário informa letras, símbolos ou espaços em uma identificação de quarto, **When** tenta salvar, **Then** o formulário rejeita o valor e o serviço também rejeita uma requisição inválida.
5. **Given** que o usuário informa uma identificação composta somente por números, **When** salva, **Then** o quarto é aceito se os demais dados forem válidos.
6. **Given** que o usuário informa um texto de busca, **When** aplica a pesquisa de quartos, **Then** são considerados identificação, nome da categoria e tipos de camas.
7. **Given** que a listagem possui mais quartos que o limite selecionado, **When** o usuário troca de página, **Then** a listagem exibe o conjunto correspondente sem perder os filtros ativos.
8. **Given** que o usuário abre os filtros da página de quartos, **When** o dropdown é exibido, **Then** ele sobrepõe o conteúdo da página sem empurrar ou alterar a estrutura da tabela.
9. **Given** que o usuário visualiza uma tabela de quartos ou categorias, **When** consulta as ações, **Then** a ação de editar exibe somente o ícone e permanece alinhada à direita.
10. **Given** que o usuário visualiza categorias, **When** seleciona o status, **Then** o status é alterado por um select direto, sem o componente “Mais filtros”.
11. **Given** que o usuário acessa a listagem de quartos, **When** visualiza o campo de busca, **Then** o campo possui largura destacada para facilitar a digitação de pesquisas longas.
12. **Given** que o dropdown de filtros está aberto, **When** o usuário clica fora dele, **Then** o dropdown é fechado e a listagem permanece no estado atual.
13. **Given** que o usuário escolhe a quantidade de resultados por página, **When** abre as opções, **Then** estão disponíveis somente 25, 50, 100 e 250 resultados, sendo 25 o menor limite.
14. **Given** que o usuário acessa a listagem de quartos, **When** visualiza a ação de pesquisa, **Then** o botão exibe a label “Pesquisar” junto ao ícone de pesquisa.

---

### User Story 4 - Popular o inventário inicial (Priority: P2)

Como operador do sistema, quero que o ambiente inicial contenha categorias e quartos de exemplo com diferentes camas e capacidades, para poder validar o fluxo sem cadastrar todo o inventário manualmente.

**Why this priority**: Os dados iniciais aceleram testes e demonstram a variedade de configurações suportadas, mas não substituem os fluxos administrativos.

**Independent Test**: Após executar a preparação inicial do ambiente, o usuário encontra as quatro categorias solicitadas e todos os 38 quartos com suas configurações de camas e limites.

**Acceptance Scenarios**:

1. **Given** que o ambiente foi preparado, **When** o usuário consulta categorias, **Then** existem Suítes Luxo, Suítes Super Luxo, Suítes Master e Suíte Presidencial.
2. **Given** que as categorias foram preparadas, **When** o usuário consulta quartos, **Then** existem 16 quartos 101–116, 16 quartos 201–216, 5 quartos 302–306 e o quarto 301.
3. **Given** que os quartos iniciais são consultados, **When** o usuário visualiza seus detalhes, **Then** há diferentes configurações de camas e limites de hóspedes positivos.
4. **Given** que a preparação inicial é executada novamente, **When** os dados são recriados, **Then** não existem duplicidades de categorias ou identificações dentro do hotel de seed.

### Edge Cases

- Não deve ser possível editar ou inativar um registro pertencente a outro hotel.
- A edição de identificação deve manter a unicidade numérica por hotel e aceitar a própria identificação do quarto que está sendo editado.
- Uma categoria inativa não deve ser selecionável em novos quartos, mas seus quartos existentes devem continuar associados e consultáveis.
- Um quarto inativo não deve ser removido nem perder suas camas, descrição ou categoria.
- O estado “Todos” não deve ser confundido com ausência de resultados.
- O filtro deve preservar a seleção ao trocar de página e permitir retornar a todos os estados.
- A busca sem resultados deve exibir estado vazio sem quebrar a paginação ou a estrutura da tabela.
- O limite escolhido deve ser preservado ao trocar de página e ao combinar busca, categoria e status.
- O dropdown de filtros de quartos deve fechar sem deixar espaço reservado ou alterar a posição da tabela.
- A ação de editar deve manter uma dica acessível para identificar sua finalidade mesmo exibindo somente o ícone.
- O filtro direto de categorias deve permitir Todos, Ativos e Inativos sem abrir painel adicional.
- O campo de busca deve permanecer utilizável em telas pequenas sem causar rolagem horizontal.
- O clique fora do dropdown deve fechá-lo mesmo quando ocorrer sobre a tabela ou os controles de paginação.
- Ao alterar o limite, a listagem deve retornar à primeira página para evitar uma página inválida.
- Descrição vazia deve ser aceita como opcional, mas uma descrição preenchida deve ser salva integralmente.
- Identificações com zeros à esquerda devem ser preservadas como texto numérico, desde que sejam compostas apenas por dígitos.
- A execução repetida dos seeds deve ser idempotente no ambiente preparado e não criar registros duplicados.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST permitir editar categorias pertencentes ao hotel atual.
- **FR-002**: O sistema MUST permitir editar quartos pertencentes ao hotel atual, incluindo categoria, identificação, descrição, limite de hóspedes, camas e estado.
- **FR-003**: O sistema MUST preservar a unicidade do nome da categoria por hotel durante a criação e edição, desconsiderando maiúsculas, minúsculas e espaços nas extremidades.
- **FR-004**: O sistema MUST preservar a unicidade da identificação numérica do quarto por hotel durante a criação e edição.
- **FR-005**: O sistema MUST permitir apenas identificações compostas por um ou mais dígitos, preservando zeros à esquerda quando informados.
- **FR-006**: O sistema MUST validar a identificação numérica no formulário web e novamente no serviço de cadastro/edição.
- **FR-007**: O sistema MUST permitir inativar categorias e quartos sem apagar seus dados ou relações.
- **FR-008**: O sistema MUST NOT disponibilizar operações de exclusão física para categorias ou quartos.
- **FR-009**: O sistema MUST impedir que categorias inativas sejam escolhidas para novos quartos.
- **FR-010**: O sistema MUST manter quartos existentes associados à categoria mesmo quando ela for inativada.
- **FR-011**: O sistema MUST permitir informar e editar uma descrição opcional do quarto.
- **FR-012**: A listagem de quartos MUST oferecer em “Mais filtros” as opções Todos, Ativos e Inativos.
- **FR-013**: A listagem de quartos MUST aplicar paginação e permitir a escolha do limite de registros por página.
- **FR-014**: A busca de quartos MUST pesquisar simultaneamente por identificação, nome da categoria e tipo de cama.
- **FR-015**: O sistema MUST aplicar o filtro de estado à listagem e refletir o estado atual de cada registro.
- **FR-016**: Na página de quartos, os filtros adicionais MUST ser exibidos em um dropdown sobreposto ao conteúdo, sem alterar o espaço ou a estrutura da tabela.
- **FR-017**: Na página de categorias, o filtro de status MUST ser exibido diretamente como select, sem o componente “Mais filtros”.
- **FR-018**: As tabelas de quartos e categorias MUST exibir a ação de editar somente como ícone, alinhada à direita.
- **FR-019**: O sistema MUST impedir alteração ou inativação de registros fora do hotel do usuário autenticado.
- **FR-020**: Os dados iniciais MUST criar as quatro categorias e 38 quartos: 101–116, 201–216, 302–306 e 301.
- **FR-021**: Cada quarto criado pelos dados iniciais MUST estar vinculado à sua categoria correspondente.
- **FR-022**: Os dados iniciais MUST distribuir configurações de camas e limites de hóspedes positivos entre os quartos criados.
- **FR-023**: A interface web MUST oferecer ações de editar e inativar, mas não deve oferecer ação de excluir.
- **FR-024**: A interface web MUST exibir confirmação antes de inativar uma categoria ou quarto e informar o resultado da operação.
- **FR-025**: O campo de busca da listagem de quartos MUST possuir largura mínima de 360 pixels em telas de desktop e ocupar a largura disponível em telas menores.
- **FR-026**: O dropdown de “Mais filtros” MUST fechar quando o usuário clicar fora de sua área, sem limpar ou alterar os filtros aplicados.
- **FR-027**: A paginação de quartos MUST aceitar somente os limites 25, 50, 100 e 250 resultados por página, utilizando 25 como limite mínimo e padrão.
- **FR-028**: O botão de pesquisa da listagem de quartos MUST exibir simultaneamente a label “Pesquisar” e um ícone de pesquisa.

### Key Entities

- **Categoria de quarto**: Agrupamento do hotel com nome e estado ativo/inativo; pode ter quartos associados mesmo após inativação.
- **Quarto**: Unidade do hotel com identificação numérica, descrição opcional, estado, limite de hóspedes, camas e categoria.
- **Configuração de cama**: Tipo e quantidade de cama vinculados ao quarto durante criação ou edição.
- **Hotel**: Contexto proprietário que determina escopo, unicidade e autorização dos registros.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Usuários autorizados conseguem editar uma categoria ou quarto e visualizar o resultado na listagem em até 2 minutos.
- **SC-002**: 100% dos registros inativados permanecem consultáveis e 0% são removidos fisicamente por ações da interface.
- **SC-003**: 100% das identificações com caracteres não numéricos são rejeitadas no formulário e no serviço, enquanto identificações numéricas válidas são aceitas.
- **SC-004**: Em testes de aceitação, os filtros Todos, Ativos e Inativos retornam somente os registros correspondentes ao estado escolhido em 100% dos casos.
- **SC-005**: A listagem de quartos permite navegar por todas as páginas e alterar o limite sem perder busca, categoria ou status selecionados em 100% dos testes de aceitação.
- **SC-006**: Uma busca por identificação, categoria ou cama retorna os quartos correspondentes em até 2 segundos em 95% das consultas de aceitação.
- **SC-007**: A preparação inicial cria exatamente 4 categorias e 38 quartos sem duplicidades, com 100% dos quartos vinculados à categoria correta, contendo camas e limite de hóspedes positivo.
- **SC-008**: Pelo menos 90% dos usuários de teste encontram os filtros de quartos e concluem uma pesquisa por estado na primeira tentativa, sem deslocamento estrutural da tabela.
- **SC-009**: Em 100% dos testes de interface, o dropdown fecha ao clicar fora e o campo de busca mantém pelo menos 360 pixels em desktop sem causar rolagem horizontal em telas menores.
- **SC-010**: Em 100% dos testes de paginação, somente os limites 25, 50, 100 e 250 são oferecidos, com 25 como opção inicial.
- **SC-011**: Em 100% dos testes de interface da listagem de quartos, o botão de pesquisa apresenta a label “Pesquisar” e o ícone correspondente, mantendo nome acessível equivalente.

## Assumptions

- O estado ativo/inativo continuará representado pelos valores já usados pelo produto (`S` e `N`).
- Editar o estado é o mecanismo usado para inativar; não haverá exclusão ou restauração separada nesta feature.
- A descrição do quarto será opcional e poderá ser alterada em conjunto com os demais dados.
- A identificação será armazenada como texto para preservar zeros à esquerda, embora aceite somente dígitos.
- Os quartos de seed usarão estas configurações representativas: Suítes Luxo com cama de casal e limite 2; Suítes Super Luxo com cama queen e cama solteiro e limite 3; Suítes Master com cama king e cama solteiro e limite 3; Suíte Presidencial com cama king e duas camas solteiro e limite 4.
- Os seeds continuam destinados ao ambiente de desenvolvimento/preparação existente e seguem a política atual de recriação do ambiente.
- A busca de quartos considera correspondência textual parcial e não diferencia maiúsculas de minúsculas.
- O limite padrão da listagem de quartos seguirá o padrão já adotado pelas tabelas paginadas do produto, com possibilidade de alteração pelo usuário.
- O limite padrão da listagem de quartos será 25, e as únicas opções permitidas serão 25, 50, 100 e 250.
- O campo de busca terá largura mínima de 360 pixels em desktop e largura fluida em telas menores.
- O seed deve criar cada quarto usando explicitamente a categoria correspondente, garantindo a integridade do vínculo mesmo quando executado novamente.
