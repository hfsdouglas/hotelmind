# Feature Specification: Refatoração das Telas de Reservas (Consulta e Nova Reserva)

**Feature Branch**: `026-reservation-screens-refactor`

**Created**: 2026-11-05

**Status**: Draft

**Input**: User description: "Refatorar as telas de reservas (consulta + nova reserva). As telas estão fora dos padrões esperados, com diversos bugs de alinhamento. Comparar com as telas de orçamento para entender o que está fora do padrão."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Nova Reserva com Formulário Padronizado e Alinhado (Priority: P1)

Como atendente ou recepcionista do hotel, quero preencher os dados de uma nova reserva em um formulário com passos claros, campos visualmente alinhados, ícones indicativos e feedback imediato de diárias e valores, para que o processo de cadastramento seja rápido, sem falhas visuais e consistente com o fluxo de orçamentos.

**Why this priority**: A tela de nova reserva é uma das operações críticas mais frequentes da equipe de recepção. Inconsistências de alinhamento, inputs despadronizados e seleções sem contraste ou feedback prejudicam a produtividade e aumentam a chance de erros operacionais.

**Independent Test**: Pode ser validada acessando o fluxo de criação de reserva, preenchendo período, hóspedes, selecionando regime e acomodação disponível, verificando o alinhamento visual dos campos, a presença dos ícones padronizados, o banner de resumo de diárias calculadas e o fechamento do cadastro com sucesso.

**Acceptance Scenarios**:

1. **Given** que o usuário está na tela de "Nova Reserva", **When** a tela é carregada, **Then** as seções estruturais de passos apresentam cabeçalhos padronizados com ícone temático, tipografia uniforme e divisores consistentes.
2. **Given** que o usuário seleciona uma data de check-in e check-out válidas, **When** as datas formam um intervalo elegível, **Then** um banner de confirmação visual exibe a quantidade exata de diárias e o período formatado (`dd/mm/aaaa até dd/mm/aaaa`), mantendo alinhamento com a grade do formulário.
3. **Given** que o usuário preenche os campos de dados do titular (Nome, Telefone, E-mail) e parceiro comercial, **When** inspeciona visualmente a seção, **Then** todos os inputs apresentam altura uniforme, ícones identificadores alinhados à esquerda, máscara de telefone consistente e disposição em grade harmoniosa sem quebras verticais desniveladas.
4. **Given** que o usuário navega entre os passos de Regime de Alimentação e Suítes Disponíveis, **When** seleciona um item, **Then** os cards de seleção adotam estados visuais consistentes (borda ativa, anel de foco, plano de fundo semântico e badge de capacidade/tarifa) idênticos ao padrão aplicado na tela de orçamentos.

---

### User Story 2 - Consulta de Reservas com Filtros e Tabela Harmonizada (Priority: P2)

Como gestor ou recepcionista, quero consultar a lista de reservas com filtros rápidos de busca por texto, status e parceiro comercial perfeitamente integrados e alinhados à barra de pesquisa, além de visualizar as informações de cada reserva em colunas organizadas e com botões de ação padronizados.

**Why this priority**: A tela de listagem e consulta é o ponto central de monitoramento diário da ocupação. Filtros desalinhados com alturas e bordas discrepantes diminuem a legibilidade e conferem aspecto inacabado ao sistema.

**Independent Test**: Pode ser validada acessando a página de gestão de reservas, interagindo com a barra de busca e os controles de filtro (status e parceiro), verificando a simetria de alturas e espaçamentos no topo da página, e checando a formatação e alinhamento das colunas da tabela e dos botões de ação rápida.

**Acceptance Scenarios**:

1. **Given** que o usuário acessa a página de consulta de reservas, **When** visualiza a área de filtros e busca, **Then** os seletores de status e parceiro comercial possuem altura, bordas, tipografia e espaçamentos perfeitamente alinhados à barra de pesquisa principal.
2. **Given** que a listagem de reservas exibe resultados, **When** o usuário analisa as colunas da tabela, **Then** o código da reserva, dados do hóspede, período com datas formatadas, regime com indicador de cor, status e valor total seguem a hierarquia tipográfica padrão do sistema.
3. **Given** que o usuário examina a coluna de ações da tabela, **When** passa o mouse sobre o botão de visualização de detalhes, **Then** o botão exibe o estilo padronizado de botão de ícone (tamanho uniforme, estados de hover semânticos e indicação de acessibilidade).

---

### User Story 3 - Coerência Visual em Modo Claro e Escuro (Priority: P3)

Como operador do sistema utilizando temas claro ou escuro, quero que as telas de reservas respeitem os tokens semânticos de cores e contraste do Design System, garantindo que nenhum elemento utilize cores arbitrárias que fiquem ilegíveis ou destoantes.

**Why this priority**: Cores fixas ou arbitrárias causam perda de contraste em temas alternativos, além de quebrar a identidade visual consolidada nas demais telas do sistema (como orçamentos).

**Independent Test**: Pode ser validada alternando entre temas claro e escuro em ambas as telas (consulta e nova reserva), confirmando que textos, bordas, badges, cartões e fundos respondem harmonicamente sem conflito de legibilidade.

**Acceptance Scenarios**:

1. **Given** que a interface está em modo escuro, **When** o usuário visualiza cards de seleção, alertas e badges de status, **Then** as cores de fundo e texto mantêm contraste legível sem usar valores de cor estáticos incompatíveis com o tema.

---

### Edge Cases

- **Nenhuma suíte disponível para o período/regime**: A tela deve exibir uma mensagem de estado vazio bem diagramada, com ícone informativo e aviso visual acolhedor, em vez de seções em branco ou desalinhadas.
- **Datas com intervalo inválido (check-in >= check-out)**: A tela deve ocultar amigavelmente o banner de cálculo de diárias e desabilitar seleções dependentes, orientando o usuário com instruções claras.
- **Nomes longos de titulares ou parceiros na tabela**: O texto deve quebrar ou truncar de forma graciosa sem estourar as larguras das colunas ou desalinhá-las.
- **Exibição em diferentes larguras de viewport**: Formulários e filtros devem reorganizar os grids de forma fluida (responsiva) sem quebrar o alinhamento das linhas ou truncar botões de ação.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O formulário de "Nova Reserva" DEVE organizar os dados em passos numerados com cabeçalho contendo ícone contextual, título semântico e linha separadora de seção equivalente ao padrão da tela de orçamentos.
- **FR-002**: Os campos de entrada de dados (nome, telefone, e-mail, quantidades) DEVEM exibir ícones auxiliares no início do campo, com recuo interno uniforme e altura padrão correspondente aos demais formulários do sistema.
- **FR-003**: A tela de "Nova Reserva" DEVE calcular e exibir um banner informativo de período com a quantidade total de diárias e as datas formatadas assim que check-in e check-out válidos forem selecionados.
- **FR-004**: Os cards de seleção de "Regime de Alimentação" e "Suíte Disponível" DEVEM aplicar a grade de cards padronizada, com destaque visual ativo baseado em anel de foco e borda primária, indicador colorido da pulseira com borda de proteção, e exibição clara de valores e limites.
- **FR-005**: A área de destaque de "Valor Total Calculado" da nova reserva DEVE adotar estrutura em card padronizado com tipografia legível, valor em moeda brasileira formatada e descrição do resumo dos ocupantes.
- **FR-006**: A barra de filtros da tela de "Gestão de Reservas" DEVE utilizar seletores estilizados e alinhados em altura, preenchimento e cantos com a barra de busca textual.
- **FR-007**: A tabela de "Gestão de Reservas" DEVE padronizar os botões de ação por linha como botões de ícone com dimensões universais, dicas visuais (tooltips/title) e estados interativos de destaque.
- **FR-008**: Todas as cores de borda, foco, fundo de seleção e tipografia nas telas de reservas DEVEM utilizar tokens semânticos do Design System da aplicação, eliminando classes de cores arbitrárias isoladas.
- **FR-009**: A formatação de valores monetários, datas de check-in/check-out e máscaras de telefone DEVE ser estritamente consistente entre a listagem de reservas e a listagem de orçamentos.

### Key Entities

- **Reserva**: Representa a contratação confirmada ou em processamento de uma acomodação no hotel, contendo código identificador, dados do titular, período de hospedagem, quantidade de ocupantes, acomodação alocada, regime contratado, parceiro comercial associado e valor total.
- **Orçamento (Referência de Padrão)**: Representa a proposta comercial gerada para um cliente ou lead, servindo de diretriz de interface para estrutura de formulário, cards interativos, filtros de lista e padrões visuais.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% dos campos de entrada de texto e controles de seleção nas telas de reservas adotam alturas, cantos e espaçamentos visualmente idênticos aos controles da tela de orçamentos.
- **SC-002**: A tela de nova reserva exibe feedback imediato do total de diárias calculadas em até 100ms após o preenchimento de datas válidas de check-in e check-out.
- **SC-003**: 0 ocorrências de cores arbitrárias não-semânticas (ex: classes estáticas hardcoded desconectadas do tema base) no código das páginas de consulta e nova reserva.
- **SC-004**: Todos os testes unitários e de renderização existentes das telas de reservas continuam passando com 100% de sucesso após as melhorias de layout.

## Assumptions

- O comportamento de negócio existente (regras de disponibilidade de quartos, cálculo de valor congelado, bloqueio de conflitos com modal e envio de FNRH) é mantido sem alterações funcionais destrutivas.
- As telas de orçamentos (`/reservas/orcamentos` e `/reservas/orcamentos/novo`) permanecem como fonte da verdade para o padrão visual e de interação no módulo de reservas.
- As mudanças são concentradas na camada de apresentação (`packages/web/src/pages/app/reservas/`), sem necessidade de alterações no contrato da API ou no banco de dados.
