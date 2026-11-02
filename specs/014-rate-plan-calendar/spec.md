# Feature Specification: Gestão de Tarifários e Calendário de Tarifação

**Feature Branch**: `014-rate-plan-calendar`

**Created**: 2026-11-02

**Status**: Draft

**Input**: User description: "Gestão de Tarifários e Calendário de Tarifação: permitir cadastrar, editar, consultar, ativar e desativar tarifários de hospedagem por categoria de quarto com seleção visual de períodos em calendário mensal, prevenção de conflitos de períodos ativos no mesmo hotel e categoria, isolamento multi-tenant e regra do menor valor aplicável por noite no cálculo de reservas."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Cadastrar tarifário com seleção de período no calendário (Priority: P1)

Como usuário autorizado de um hotel, quero cadastrar um tarifário informando nome, categoria de quarto, período de vigência selecionado em um calendário visual e valor da diária, para que o tarifário seja utilizado no cálculo do valor das reservas.

**Why this priority**: O cadastro de tarifários com definição de vigência e valor de diária é a base operacional para precificação de hospedagens no hotel.

**Independent Test**: Acessar a tela de novo tarifário, selecionar uma categoria válida do hotel ativo, definir o período clicando na data inicial e final no calendário (ou preenchendo os campos de data sincronizados), informar nome e valor da diária, salvar e verificar a confirmação e listagem do novo tarifário.

**Acceptance Scenarios**:

1. **Given** que o usuário está autenticado e autorizado em um hotel ativo, **When** preenche nome, categoria de quarto válida, período de vigência sem conflitos e valor de diária válido e confirma o cadastro, **Then** o sistema registra o tarifário como ativo por padrão, exibe confirmação de sucesso e redireciona para a listagem de tarifários.
2. **Given** que o usuário está na tela de inclusão de tarifário, **When** realiza o primeiro clique em um dia do calendário e o segundo clique em uma data posterior ou igual, **Then** o calendário destaca a data inicial, os dias intermediários e a data final, e sincroniza automaticamente os campos de data do formulário.
3. **Given** que o usuário já selecionou uma data inicial no calendário, **When** clica em uma segunda data anterior à data inicial, **Then** o calendário reinicia a seleção passando a considerar a nova data clicada como data inicial.
4. **Given** que o usuário alterou manualmente uma data nos campos do formulário, **When** visualiza o calendário, **Then** a seleção visual do calendário reflete imediatamente o intervalo informado nos campos, e vice-versa.
5. **Given** que o usuário selecionou um intervalo no calendário, **When** aciona a opção de limpar seleção, **Then** o intervalo selecionado e os campos de data correspondentes são limpos para permitir nova seleção.

---

### User Story 2 - Prevenir conflitos e visualizar períodos ocupados no calendário (Priority: P1)

Como usuário autorizado de um hotel, quero visualizar no calendário os períodos já ocupados para a categoria selecionada e ser impedido de salvar períodos sobrepostos, para evitar inconsistências e conflitos na definição das tarifas.

**Why this priority**: A integridade dos períodos tarifários evita ambiguidades operacionais na cobrança de diárias dentro da mesma categoria de quarto.

**Independent Test**: Com um tarifário ativo cadastrado de 01/03 a 31/03 para uma categoria, abrir o cadastro para a mesma categoria, verificar a exibição visual do período ocupado no calendário, tentar selecionar 15/03 a 15/04 (deve acusar conflito e impedir salvamento) e em seguida selecionar 01/04 a 30/04 (período consecutivo, deve permitir salvamento).

**Acceptance Scenarios**:

1. **Given** que o usuário selecionou uma categoria de quarto no formulário, **When** visualiza o calendário mensal, **Then** os períodos de tarifários existentes daquela categoria no hotel ativo são exibidos com identificação visual distinta dos dias disponíveis.
2. **Given** que existem períodos ocupados exibidos no calendário, **When** o usuário interage com os dias de um tarifário existente, **Then** o sistema apresenta o nome do tarifário, período de vigência, valor da diária e situação.
3. **Given** que existe um tarifário ativo com vigência efetiva de 01/03/2027 até 31/03/2027 (representado como intervalo semiaberto `[2027-03-01, 2027-04-01)`), **When** o usuário cadastra outro tarifário para a mesma categoria e hotel iniciando em 01/04/2027, **Then** o sistema permite a operação como período consecutivo válido.
4. **Given** que existe um tarifário ativo para o mesmo hotel e categoria no período de 01/03/2027 até 31/03/2027, **When** o usuário tenta cadastrar ou ativar outro tarifário com período de 15/03/2027 até 15/04/2027, **Then** o sistema identifica o conflito visualmente e impede a conclusão da operação informando o conflito de período.
5. **Given** que duas solicitações simultâneas tentam registrar tarifários ativos com períodos sobrepostos para o mesmo hotel e categoria, **When** ambas são processadas, **Then** apenas uma é concluída com sucesso e a outra é rejeitada com erro de conflito de período.
6. **Given** que o usuário está visualizando o calendário, **When** navega para o mês anterior, próximo mês ou retorna ao mês/ano atual, **Then** o calendário apresenta os dias e períodos ocupados do mês selecionado preservando qualquer seleção de intervalo em andamento, inclusive intervalos que atravessem múltiplos meses.

---

### User Story 3 - Listar e consultar tarifários do hotel (Priority: P1)

Como usuário autorizado de um hotel, quero visualizar e filtrar os tarifários cadastrados no meu hotel, para consultar suas condições de vigência, valores, situação e acessar ações de gestão.

**Why this priority**: A listagem centraliza a visibilidade de todas as regras tarifárias vigentes, futuras e históricas do estabelecimento.

**Independent Test**: Acessar a página de listagem de tarifários, verificar os dados exibidos para os registros do hotel ativo, filtrar por categoria e por situação (ativo/inativo), navegar entre páginas e validar os estados de carregamento, vazio e erro.

**Acceptance Scenarios**:

1. **Given** que existem tarifários cadastrados no hotel ativo, **When** o usuário acessa a página de listagem de tarifários, **Then** o sistema exibe nome, categoria de quarto, data de início, data de término efetiva, valor da diária, situação e ações disponíveis (visualizar, editar, ativar/desativar).
2. **Given** que o usuário aplica filtro por categoria de quarto ou por situação na listagem, **When** os resultados são atualizados, **Then** somente os tarifários do hotel ativo que correspondem aos filtros selecionados são exibidos.
3. **Given** que a quantidade de tarifários ultrapassa o limite por página, **When** o usuário navega pelos controles de paginação, **Then** o sistema apresenta a página correspondente mantendo os filtros ativos.
4. **Given** que não existem tarifários para o hotel ativo ou para os filtros selecionados, **When** a consulta é concluída, **Then** o sistema exibe um estado vazio claro orientando o usuário.

---

### User Story 4 - Editar, desativar e reativar tarifários (Priority: P2)

Como usuário autorizado de um hotel, quero editar os dados de um tarifário existente e poder desativá-lo ou reativá-lo sem excluir seu histórico, para atualizar condições comerciais e suspender tarifas obsoletas mantendo a rastreabilidade de reservas anteriores.

**Why this priority**: Condições comerciais mudam ao longo do ano e tarifários encerrados precisam sair de operação sem comprometer o histórico das reservas já realizadas.

**Independent Test**: Abrir a edição de um tarifário existente, verificar que o próprio período não gera alerta de conflito consigo mesmo, alterar valor ou datas para um período válido e salvar; em seguida desativar o tarifário mediante confirmação e verificar que ele não é mais considerado em novos cálculos nem bloqueia novos tarifários no mesmo período.

**Acceptance Scenarios**:

1. **Given** que o usuário acessa a edição de um tarifário pertencente ao seu hotel, **When** a tela é carregada, **Then** o formulário e o calendário exibem os dados atuais do tarifário selecionado sem tratar o próprio registro como conflito de período.
2. **Given** que o usuário altera nome, categoria de quarto (entre categorias válidas do hotel), período de vigência, valor da diária ou situação para valores válidos e sem conflito com outros tarifários ativos, **When** salva as alterações, **Then** o sistema persiste os novos dados, preserva o histórico de reservas existentes e exibe confirmação de sucesso.
3. **Given** que existe um tarifário ativo, **When** o usuário aciona a desativação e confirma explicitamente a operação, **Then** o tarifário passa para a situação inativa, permanece disponível para consulta histórica e deixa de ser utilizado no cálculo de novas reservas ou na restrição de sobreposição de períodos.
4. **Given** que existe um tarifário inativo, **When** o usuário solicita sua reativação, **Then** o sistema valida novamente se há conflito de período com tarifários ativos da mesma categoria e hotel antes de permitir a ativação.

---

### User Story 5 - Isolamento multi-tenant e cálculo pelo menor valor aplicável (Priority: P2)

Como gestor hoteleiro em ambiente multi-tenant, quero que cada hotel acesse e aplique exclusivamente seus próprios tarifários e que o cálculo de reservas utilize sempre o menor valor aplicável por noite quando houver mais de um tarifário elegível, para garantir segurança entre estabelecimentos e consistência comercial.

**Why this priority**: O isolamento de dados entre hotéis é mandatório para a segurança multi-tenant e a regra de precificação por noite assegura cálculo determinístico de reservas.

**Independent Test**: Tentar consultar, editar, desativar ou vincular categoria/tarifário de outro hotel e verificar o bloqueio; simular o cálculo de diárias de uma reserva abrangendo noites com tarifários distintos ou múltiplos tarifários elegíveis e confirmar a seleção do menor valor por noite.

**Acceptance Scenarios**:

1. **Given** que o usuário está autenticado no contexto do Hotel A, **When** tenta listar, visualizar, criar, editar, ativar ou desativar um tarifário ou associar uma categoria pertencente ao Hotel B, **Then** o sistema impede a operação e não expõe dados do Hotel B.
2. **Given** que uma reserva abrange múltiplas noites de hospedagem, **When** o sistema calcula o valor das diárias da reserva, **Then** cada noite é avaliada individualmente considerando hotel, categoria de quarto, data da noite e apenas tarifários ativos elegíveis, somando o valor de cada noite.
3. **Given** que existem múltiplos tarifários ativos elegíveis para uma mesma noite de hospedagem, **When** o sistema calcula o valor daquela noite, **Then** prevalece o menor valor de diária aplicável.

### Edge Cases

- **Conversão de intervalo semiaberto vs. exibição inclusiva**: Na interface, um tarifário de 01/03/2027 a 31/03/2027 apresenta 31/03/2027 como último dia efetivo de aplicação, mas no modelo de domínio/persistência o intervalo semiaberto `[2027-03-01, 2027-04-01)` deve permitir que outro tarifário inicie em 01/04/2027 sem acusar sobreposição.
- **Seleção de período de um único dia efetivo**: Quando o usuário seleciona início e término no mesmo dia efetivo na interface (ex.: 10/05/2027 a 10/05/2027), o intervalo semiaberto correspondente `[2027-05-10, 2027-05-11)` possui data inicial anterior à data final exclusiva e deve ser aceito como 1 diária vigente.
- **Clique em data final anterior à data inicial no calendário**: Se o usuário já clicou na data inicial e clica em uma data anterior, o calendário não deve gerar intervalo inválido; deve reiniciar a seleção assumindo a nova data clicada como início.
- **Seleção cruzando meses ou anos**: O usuário deve conseguir clicar na data inicial em um mês (ex.: dezembro de 2026), navegar para o mês seguinte (ex.: janeiro de 2027) e clicar na data final sem perder a data inicial selecionada.
- **Reativação de tarifário com período agora ocupado**: Se um tarifário foi desativado, outro tarifário ativo foi criado no mesmo período e categoria, e depois o usuário tenta reativar o primeiro, o sistema deve impedir a reativação por conflito de período.
- **Concorrência no cadastro/edição de períodos**: Requisições simultâneas para períodos sobrepostos no mesmo hotel e categoria devem ser serializadas ou barradas na camada de integridade de dados, retornando erro de conflito sem permitir duplicidade.
- **Acessibilidade visual no calendário**: A distinção entre dias disponíveis, início/fim de seleção, dias intermediários, períodos ocupados, períodos conflitantes e dia atual não deve depender exclusivamente de cor, incluindo bordas, ícones, rótulos ou indicadores visuais complementares.
- **Manipulação do identificador de hotel pelo cliente**: Qualquer identificador de hotel enviado na requisição do cliente deve ser ignorado ou rejeitado em favor do hotel determinado pelo contexto de autenticação.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST disponibilizar uma página de listagem de tarifários apresentando nome, categoria de quarto, data de início, data de término efetiva, valor da diária, situação (ativo/inativo) e ações por registro (visualizar, editar, ativar/desativar).
- **FR-002**: A listagem de tarifários MUST apresentar apenas registros pertencentes ao hotel ativo na sessão autenticada, permitindo filtrar por categoria de quarto e por situação, além de paginar os resultados quando o volume ultrapassar o limite por página.
- **FR-003**: A listagem e os formulários de tarifários MUST contemplar estados visuais claros para carregamento inicial, carregamento de categorias e períodos, listagem ou calendário vazios, envio em andamento e erros de comunicação ou validação.
- **FR-004**: O sistema MUST disponibilizar páginas dedicadas de inclusão (`/tarifarios/novo`) e edição (`/tarifarios/:id/editar`) utilizando o layout autenticado padrão e compartilhando o mesmo componente de formulário e calendário.
- **FR-005**: O formulário de tarifário MUST exigir o preenchimento de Nome (texto obrigatório, sem apenas espaços em branco, com remoção de espaços excedentes nas extremidades), Categoria de quarto (pertencente e disponível no hotel ativo), Data de início, Data de término, Valor da diária (numérico maior ou igual a zero com precisão de duas casas decimais) e Situação Ativo (booleano inicializado como verdadeiro na inclusão).
- **FR-006**: O sistema MUST disponibilizar um componente reutilizável de calendário mensal que permita selecionar o intervalo de vigência com dois cliques (data inicial e data final), visualizar dias intermediários, limpar a seleção atual e navegar entre mês anterior, próximo mês e mês/ano atual sem perder a seleção em andamento.
- **FR-007**: Caso o usuário selecione no calendário uma segunda data anterior à data inicial, o componente MUST reiniciar a seleção considerando a nova data clicada como data inicial.
- **FR-008**: Os campos de data do formulário e a seleção do calendário MUST permanecer sincronizados bidirecionalmente em tempo real, compartilhando as mesmas regras de validação.
- **FR-009**: O calendário MUST consultar e exibir os períodos ocupados por tarifários existentes do hotel e categoria selecionados, permitindo inspecionar nome, período de vigência, valor da diária e situação ao interagir com os dias ocupados.
- **FR-010**: O calendário MUST diferenciar visualmente dias disponíveis, data inicial selecionada, data final selecionada, dias intermediários, períodos ocupados, períodos conflitantes e data atual utilizando elementos visuais adicionais além de cor (como bordas, ícones, textos ou padrões) e mantendo funcionamento responsivo em desktop, tablet e dispositivos móveis (exibindo um mês por vez em telas menores).
- **FR-011**: O sistema MUST representar internamente a vigência como intervalo semiaberto `[data_inicio, data_fim)` (data inicial inclusiva e data final exclusiva para persistência e verificação de conflitos), convertendo corretamente para a exibição inclusiva do último dia efetivo de aplicação na interface do usuário.
- **FR-012**: O sistema MUST impedir a criação, edição ou ativação de dois tarifários ativos com períodos sobrepostos dentro do mesmo escopo (`hotel_id + categoria_quarto_id`), tanto na validação prévia da interface quanto na validação definitiva de negócio e na garantia de integridade da camada de persistência, retornando erro de conflito quando houver sobreposição.
- **FR-013**: O sistema MUST permitir o cadastro e a edição de tarifários com períodos consecutivos no mesmo escopo (quando o início de um tarifário coincide exatamente com o fim exclusivo do tarifário adjacente), bem como períodos coincidentes em categorias de quarto diferentes ou em hotéis diferentes.
- **FR-014**: Durante a edição de um tarifário, o sistema MUST impedir a edição do hotel vinculado, desconsiderar o próprio tarifário na verificação de conflitos de período e preservar o histórico de reservas existentes após salvar as alterações.
- **FR-015**: O sistema MUST permitir desativar um tarifário ativo mediante confirmação explícita do usuário e reativar um tarifário inativo mediante nova validação de conflitos, preservando integralmente o registro histórico em ambos os casos.
- **FR-016**: Tarifários desativados MUST NOT ser considerados no cálculo de novas reservas nem bloquear o cadastro de novos tarifários ativos no mesmo período.
- **FR-017**: No cálculo do valor de uma reserva no serviço de domínio, o sistema MUST avaliar cada noite de hospedagem individualmente (considerando hotel, categoria de quarto, data da noite e tarifários ativos elegíveis) e aplicar o menor valor de diária quando houver mais de um tarifário elegível para a noite.
- **FR-018**: Todas as operações de listagem, consulta, criação, edição, ativação, desativação e visualização de calendário MUST obter o identificador do hotel exclusivamente a partir do contexto de autenticação, bloqueando qualquer acesso ou associação a tarifários e categorias de outros hotéis.
- **FR-019**: O sistema MUST apresentar mensagens claras e compreensíveis de feedback para conclusão de cadastro, edição e desativação, bem como para erros de validação, conflito de período, falha de autorização, tarifário não encontrado e falha de comunicação.

### Key Entities

- **Tarifário**: Regra comercial de precificação pertencente a um hotel e associada a uma categoria de quarto, contendo identificador único, nome, data de início, data de término (intervalo semiaberto `[data_inicio, data_fim)`), valor da diária com precisão decimal de duas casas, indicador de situação ativa/inativa e datas de criação e atualização.
- **Período de Calendário Tarifário**: Projeção dos intervalos de vigência dos tarifários de um hotel e categoria de quarto para exibição no calendário mensal, incluindo identificação do tarifário, intervalo de datas, valor da diária e situação.
- **Categoria de Quarto**: Agrupamento de quartos pertencente a um hotel ao qual os tarifários são vinculados para definir o escopo de aplicação e validação de conflitos.
- **Hotel (Tenant)**: Estabelecimento hoteleiro ativo no contexto autenticado do usuário que isola todos os tarifários e categorias de quarto.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Usuários autorizados conseguem cadastrar um novo tarifário selecionando o período pelo calendário em até 1 minuto na primeira tentativa.
- **SC-002**: 100% das tentativas de cadastrar, editar ou reativar tarifários ativos com períodos sobrepostos no mesmo hotel e categoria são bloqueadas antes da persistência ou rejeitadas como conflito, inclusive sob requisições simultâneas (condição de corrida).
- **SC-003**: 100% dos cadastros de tarifários com períodos consecutivos (ex.: término efetivo em 31/03 e início do próximo em 01/04) são aceitos sem falso positivo de conflito.
- **SC-004**: 100% das alterações de datas realizadas no calendário refletem imediatamente nos campos do formulário e 100% das alterações nos campos do formulário atualizam a seleção do calendário sem divergência entre a vigência efetiva exibida e o intervalo salvo.
- **SC-005**: 100% das tentativas de consultar, editar, ativar, desativar ou associar tarifários e categorias pertencentes a outro hotel são negadas pelo sistema.
- **SC-006**: Em 100% dos cenários de cálculo de reserva com múltiplos tarifários ativos elegíveis para uma mesma noite, o sistema seleciona o menor valor de diária aplicável para cada noite individualmente.
- **SC-007**: 100% dos tarifários desativados permanecem disponíveis para consulta histórica na listagem e 0% deles são aplicados em novos cálculos de reserva ou bloqueiam novos períodos ativos.

## Assumptions

- O escopo inicial de prevenção de sobreposição de tarifários ativos considera exclusivamente a combinação `hotel_id + categoria_quarto_id`; caso critérios futuros permitam múltiplos tarifários ativos elegíveis simultaneamente, a regra do menor valor por noite já estará estabelecida no domínio.
- Na interface do usuário, as datas inicial e final selecionadas representam dias efetivos de hospedagem (ambas inclusivas na visualização, permitindo selecionar um único dia ou vários dias), sendo a data final convertida para o dia seguinte (`data_fim` exclusiva) ao comunicar e persistir o intervalo semiaberto `[data_inicio, data_fim)`.
- Apenas categorias de quarto ativas e pertencentes ao hotel autenticado são disponibilizadas para seleção na criação de novos tarifários.
- Não fazem parte desta versão: tarifários por canal de distribuição, plano alimentar, ocupação ou quantidade de hóspedes, cupons promocionais, tarifários derivados, precificação dinâmica por demanda, regras de cancelamento/reembolso, integração com Channel Manager, edição de preço dia a dia diretamente no calendário e cálculo de impostos/taxas adicionais.
