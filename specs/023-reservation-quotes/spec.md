# Feature Specification: Orçamentos de Reserva com Cadastro de Leads e Visualização Pública

**Feature Branch**: `023-reservation-quotes`

**Created**: 2026-11-04

**Status**: Draft

**Input**: User description: "Dentro do módulo de reservas, crie um recurso para fazer orçamentos, esses orçamentos podem ser armazenados (a parte das reservas). Ao iniciar um orçamento, deve-se selecionar primeiro o regime de alimentação, para depois inserir o período, a quantidade de adultos, quantidade criaças e pets (opcional). Um orçamento, precisa ser vinculado à uma forma de "primeiro contato" (dados básicos de um lead: Nome, celular (WhatsApp) e e-mail, importante criar uma tabela para salvar leads no banco de dados). Os orçamentos podem ser editados e excluídos. Adicionar botões fictícios de enviar e-mail, enviar texto do orçamento no WhatsApp ou copiar link para visualização. Essa visualização deve ser uma página pública, simples, com foco em mobile-first, onde o lead consegue acessar para visualizar o orçamento. Adicionar botão fictício para reservar (função será implementada no futuro). A consulta de orçamento por ora não deve validar a disponibilidade do quarto para o período (função será implementada no futuro)."

## Clarifications

### Session 2026-11-04

- Q: Qual é a ordem sequencial de preenchimento ao iniciar um novo orçamento e como as acomodações são carregadas? → A: O atendente seleciona primeiro o período de hospedagem (check-in e check-out) e a composição de hóspedes (adultos, crianças e pets); em seguida, seleciona o regime de alimentação desejado, permitindo ao sistema carregar as suítes/categorias disponíveis de acordo com os tarifários configurados para o período e regime.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Criação e Cálculo de Orçamento com Seleção Inicial de Período, Regime e Vínculo de Lead (Priority: P1)

Como atendente da recepção ou equipe de reservas, quero criar uma proposta de orçamento vinculada a um lead interessado, informando primeiro o período (check-in e check-out) e ocupantes, selecionando em seguida o regime de alimentação desejado para carregar as suítes/categorias com tarifários vigentes, para que eu possa gerar rapidamente um valor de proposta comercial sem criar bloqueios de quartos no inventário de reservas confirmadas.

**Why this priority**: É a essência funcional do recurso de cotação. Permite ao hotel atender contatos ágeis sem poluir a grade de reservas confirmadas, exibindo apenas as suítes que possuem tarifários configurados para as datas e o regime solicitados.

**Independent Test**: Acessar o módulo de reservas, navegar até "Orçamentos" e clicar em "Novo Orçamento". Preencher o período (check-in e check-out) e a quantidade de adultos (ex.: 2), crianças (ex.: 1) e pets (ex.: 1). Em seguida, selecionar o regime de alimentação (ex.: Café da Manhã) e constatar que a lista de suítes/categorias disponíveis é carregada de acordo com os tarifários cadastrados para o período. Selecionar a categoria pretendida, preencher os dados do lead (Nome, WhatsApp, E-mail) e salvar. Verificar que o orçamento é salvo com seu cálculo total, gerando identificador de visualização e mantendo a grade de quartos intacta.

**Acceptance Scenarios**:

1. **Given** que o atendente acessa o formulário de novo orçamento, **When** a tela é carregada, **Then** o sistema exige primeiramente a definição do período de estada (check-in e check-out) e a quantidade de hóspedes (adultos, crianças e pets opcionais).
2. **Given** que o período e ocupantes foram definidos, **When** o atendente seleciona um regime de alimentação ativo, **Then** o sistema pesquisa os tarifários vigentes e carrega as opções de suítes/categorias de quartos compatíveis com aquela combinação de período e regime.
3. **Given** a suíte/categoria selecionada e os dados do lead preenchidos (Nome, WhatsApp e E-mail), **When** o atendente submete o formulário, **Then** o sistema calcula o valor estimado da estada e persiste tanto o lead quanto o orçamento independente.
4. **Given** um período com quartos já ocupados ou sem unidades físicas livres no calendário de reservas, **When** o atendente gera o orçamento para essas datas, **Then** o sistema gera o orçamento com sucesso sem exibir bloqueio de indisponibilidade de inventário físico.

---

### User Story 2 - Visualização Pública do Orçamento pelo Lead em Dispositivos Móveis (Priority: P1)

Como lead/cliente em potencial que solicitou uma cotação, quero abrir um link enviado pelo hotel no navegador do meu celular para visualizar uma página limpa e direta com todos os detalhes da minha proposta de hospedagem, incluindo regime de alimentação, datas, hóspedes, valores e um botão para solicitar a reserva.

**Why this priority**: A experiência do cliente final no primeiro contato define a taxa de conversão do hotel. A página precisa ser leve, clara e responsiva em telas pequenas de smartphones sem exigir download de app ou login.

**Independent Test**: Gerar um orçamento no painel do hotel, obter o link público gerado e abri-lo em janela anônima simulando resolução mobile. Verificar a renderização das informações do hotel, período cotado, regime selecionado com sua cor/descrição, quantidade de adultos/crianças/pets, valor discriminado e botão "Reservar". Clicar no botão "Reservar" e verificar o feedback informativo de funcionalidade em breve / contato.

**Acceptance Scenarios**:

1. **Given** um link público de orçamento válido, **When** o lead acessa a página em um dispositivo móvel, **Then** a interface apresenta um layout mobile-first legível, destacando nome do hotel, período de estada, regime de refeições, total de hóspedes e pets, e o valor total calculado.
2. **Given** que o lead está na página pública do orçamento, **When** clica no botão "Reservar", **Then** o sistema exibe uma mensagem informativa amigável comunicando que a confirmação direta de reservas online será disponibilizada em breve e orientando contato com o hotel.
3. **Given** um identificador ou token de orçamento inválido ou inexistente na URL pública, **When** a página é acessada, **Then** o sistema apresenta uma tela com mensagem amigável de "Orçamento não encontrado ou expirado".

---

### User Story 3 - Painel de Gestão, Edição e Exclusão de Orçamentos (Priority: P2)

Como gestor ou recepcionista do hotel, quero consultar a lista de todos os orçamentos realizados, pesquisar por nome do lead, editar dados de cotações em negociação e excluir orçamentos cancelados ou duplicados, para manter o controle operacional dos contatos comerciais.

**Why this priority**: Permite o acompanhamento contínuo das negociações, alterações de datas a pedido do hóspede e limpeza de orçamentos obsoletos.

**Independent Test**: Acessar a listagem de orçamentos, localizar uma proposta pelo nome do lead, abrir a tela de edição, alterar o número de noites ou hóspedes, salvar as alterações e constatar a atualização dos valores na listagem e na página pública correspondente. Em seguida, testar a exclusão de um orçamento com confirmação.

**Acceptance Scenarios**:

1. **Given** a listagem de orçamentos, **When** o operador filtra pelo nome ou telefone de um lead, **Then** apenas os orçamentos vinculados àquele lead são exibidos.
2. **Given** um orçamento salvo, **When** o operador acessa a tela de edição, altera a quantidade de hóspedes ou o período e salva, **Then** os dados e o valor total recalculado são gravados com sucesso.
3. **Given** um orçamento selecionado para exclusão, **When** o operador aciona a exclusão e confirma no diálogo de segurança, **Then** o orçamento é removido do sistema e seu link público deixa de responder.

---

### User Story 4 - Ações Rápidas de Compartilhamento e Simulação de Disparo (Priority: P2)

Como atendente, quero ter botões dedicados na tela do orçamento para copiar o link público com um clique e acionar ações fictícias de envio por e-mail e WhatsApp, para agilizar a rotina de atendimento enquanto as integrações automáticas completas de envio estiverem sendo desenvolvidas.

**Why this priority**: Garante produtividade imediata ao atendente (cópia direta do link para envio manual) e estabelece a experiência de interface para os canais de comunicação com o lead.

**Independent Test**: Na página de detalhes ou edição do orçamento, clicar em "Copiar link de visualização" e verificar mensagem de sucesso e conteúdo na área de transferência. Clicar no botão fictício "Enviar por E-mail" e verificar a notificação visual de simulação. Clicar no botão fictício "Enviar no WhatsApp" e verificar o feedback simulado.

**Acceptance Scenarios**:

1. **Given** um orçamento cadastrado, **When** o operador clica no botão "Copiar link", **Then** o endereço completo da página pública do orçamento é copiado para a área de transferência do operador e uma notificação de sucesso é exibida.
2. **Given** os dados de e-mail do lead cadastrados no orçamento, **When** o operador clica no botão fictício "Enviar e-mail", **Then** o sistema exibe notificação informativa simulando o envio da mensagem para a caixa postal do lead.
3. **Given** o número de celular/WhatsApp do lead cadastrado, **When** o operador clica no botão fictício "Enviar no WhatsApp", **Then** o sistema exibe notificação informativa simulando o envio do resumo do orçamento para o WhatsApp do cliente.

---

### Edge Cases

- **Ausência de tarifário para a combinação de período e regime**: Caso o hotel não tenha tarifário cadastrado para alguma noite do período no regime selecionado, o sistema deve alertar o atendente informando quais suítes/categorias possuem cobertura tarifária completa para o intervalo.
- **Lead com múltiplos orçamentos**: Se o mesmo lead (identificado por mesmo e-mail ou celular) solicitar mais de um orçamento para períodos diferentes, o sistema deve vincular os novos orçamentos ao mesmo lead existente sem gerar duplicatas cadastrais desnecessárias.
- **Alteração do período ou regime de alimentação na edição**: Quando as datas ou o regime forem alterados em um orçamento existente, o sistema deve recarregar as suítes elegíveis e recalcular as diárias.
- **Tentativa de salvar datas inválidas**: Caso a data de check-out seja anterior ou igual à data de check-in, o formulário deve impedir a submissão com aviso claro sobre o intervalo mínimo de 1 diária.
- **Períodos com 100% de ocupação no hotel**: Conforme diretriz de negócio desta fase, a ausência de vagas em quartos físicos não impede a geração nem a visualização do orçamento.
- **Pets opcionais**: O campo de animais de estimação deve ser estritamente opcional (padrão zero/não informado), não impedindo a finalização de propostas sem pets.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE disponibilizar cadastro dedicado de Leads ("Primeiro Contato"), armazenando nome completo, celular (com suporte a DDD e número de WhatsApp) e e-mail.
- **FR-002**: O sistema DEVE vincular obrigatoriamente cada orçamento a um lead, permitindo criar um novo lead durante o preenchimento ou reutilizar um lead já existente.
- **FR-003**: O formulário de criação de orçamento DEVE solicitar como primeiro passo a seleção do período de hospedagem (datas de check-in e check-out) e a quantidade de hóspedes (adultos, crianças e pets opcionais).
- **FR-004**: O formulário de criação de orçamento DEVE solicitar em seguida a seleção do regime de alimentação desejado (ex.: Café da Manhã, Meia Pensão, Pensão Completa, All Inclusive).
- **FR-005**: A partir da definição do período e do regime de alimentação, o sistema DEVE carregar dinamicamente as suítes/categorias de acomodação disponíveis com base nos tarifários vigentes configurados para o intervalo e regime.
- **FR-006**: O sistema DEVE persistir os orçamentos em entidade autônoma e independente das reservas confirmadas, sem ocupar leitos, sem gerar bloqueios de unidades habitacionais e sem alterar o calendário de disponibilidade física de quartos.
- **FR-007**: Nesta fase de implementação, o sistema NÃO DEVE validar a disponibilidade física ou ocupação do quarto para o período solicitado ao gerar ou consultar o orçamento.
- **FR-008**: O sistema DEVE permitir a listagem, detalhamento, edição de dados e exclusão de orçamentos previamente criados.
- **FR-009**: O sistema DEVE gerar um identificador público seguro (token ou código não adivinhável) para cada orçamento criado, viabilizando o compartilhamento seguro com o cliente.
- **FR-010**: A interface interna do orçamento DEVE fornecer ação para copiar o link público de visualização diretamente para a área de transferência do usuário.
- **FR-011**: A interface interna do orçamento DEVE fornecer botão fictício de "Enviar por E-mail", com notificação de confirmação simulada.
- **FR-012**: A interface interna do orçamento DEVE fornecer botão fictício de "Enviar texto no WhatsApp", com notificação ou abertura de prévia simulada.
- **FR-013**: O sistema DEVE disponibilizar uma página pública de visualização do orçamento, acessível sem necessidade de autenticação no sistema de gestão.
- **FR-014**: A página pública de visualização DEVE seguir diretrizes mobile-first, com design simples, limpo e legível, apresentando:
  - Identificação do hotel;
  - Período da estada (datas de check-in e check-out com total de noites);
  - Regime de alimentação selecionado (nome, destaque visual e refeições inclusas);
  - Número de hóspedes discriminado (adultos, crianças e pets);
  - Categoria ou quarto cotado;
  - Discriminação e valor total estimado da cotação;
  - Identificação do lead destinatário.
- **FR-015**: A página pública de visualização DEVE apresentar um botão fictício com rótulo "Reservar", exibindo mensagem contextual informativa indicando que a confirmação online de reservas estará disponível futuramente.

### Key Entities *(include if feature involves data)*

- **Lead (Primeiro Contato)**: Representa o contato comercial interessado nos serviços do hotel. Possui atributos de identificação pessoal (nome completo, telefone celular/WhatsApp, endereço de e-mail), vínculo com o hotel de origem e histórico de data de criação.
- **Orçamento de Reserva (Reservation Quote)**: Representa a proposta comercial calculada para uma estada futura. Possui relação obrigatória com um Lead e um Hotel, dados de regime de alimentação escolhido, período (check-in, check-out, diárias), ocupação pretendida (adultos, crianças, pets), categoria/acomodação cotada, valores unitários e total calculado, código/token de acesso público, data de validade/criação e status do orçamento (ex.: Pendente, Visualizado, Expirado).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Atendentes conseguem definir período, selecionar regime, escolher uma das suítes carregadas pelo tarifário, cadastrar o lead e gerar um orçamento completo em menos de 60 segundos no painel administrativo.
- **SC-002**: 100% das páginas públicas de orçamento carregam e adaptam seus elementos com clareza em telas de smartphones sem necessidade de rolagem horizontal ou cortes de texto.
- **SC-003**: 100% dos links de orçamentos gerados podem ser copiados com 1 único clique no botão de ação da interface.
- **SC-004**: Nenhum orçamento é bloqueado ou rejeitado por falta de disponibilidade física de quartos no período, permitindo atendimento de 100% das cotações solicitadas.
- **SC-005**: 100% dos dados essenciais da cotação (regime de alimentação, hóspedes, pets, período e total) são legíveis pelo cliente na visualização pública em até 3 segundos de carregamento em conexões móveis convencionais.

## Assumptions

- O hotel já conta com regimes de alimentação e categorias com tarifários configurados para períodos vigentes.
- O carregamento de suítes considera as categorias que possuem tarifários ativos para as noites do período no regime de alimentação selecionado.
- A validação de disponibilidade de inventário físico e bloqueio temporário de quartos específicos será tratada em funcionalidade futura de conversão de orçamento em reserva formal.
- Os botões de envio de e-mail e WhatsApp funcionam inicialmente em modo simulado/fictício, preparando os componentes de interface para quando as integrações com provedores de mensageria forem implementadas.
- O link público utiliza um token seguro e aleatório, impossibilitando a varredura sequencial de orçamentos de outros clientes na web.
- A exclusão de um orçamento é definitiva ou lógica, desativando imediatamente o acesso ao link público correspondente.
