# Feature Specification: Gestão de Reservas com Ficha de Hóspedes (FNRH)

**Feature Branch**: `025-reservations-management`

**Created**: 2026-11-04

**Status**: Draft

**Input**: User description: "Crie uma feature para cadastrar e consultar reservas. Uma reserva pode ter vários hóspedes (de acordo com a quantidade de pessoas escolhidas), porém em um primeiro momento o hotel pode não ter os dados do hóspede - criar tela/link (mobile-first) com formulário para preenchimento dos dados (FNRH - Ficha Nacional de Registro de Hóspedes) para enviar ao cliente. Obrigatório ter período de hospedagem, regime de alimentação, suíte escolhida e tarifas cadastradas. Na reserva deve ter campo opcional de indicação de parceiro (agência de viagens, operadoras, clubes de turismo e etc)."

## Clarifications

### Session 2026-11-04

- Q: Que dados de contato do titular a reserva deve exigir no cadastro? → A: Somente o nome do titular é obrigatório; telefone e e-mail são opcionais.
- Q: O que fazer quando a suíte já está reservada no período? → A: Bloquear o salvamento se a suíte tiver reserva não cancelada no período e sugerir outras suítes disponíveis.
- Q: Quem pode ver os dados pessoais da FNRH? → A: Sem restrição adicional nesta versão; qualquer usuário autenticado com permissão de reservas vê a ficha completa.
- Q: Quais status a reserva deve ter? → A: A confirmar, Confirmada, Check-in, Check-out e No-show (mais Cancelada, mantida do fluxo de cancelamento já previsto), alterados manualmente pela equipe.
- Esclarecimento do usuário (sobre a página pública): o formulário é montado com a quantidade de pessoas do orçamento/reserva, o hóspede não pode alterá-la, há um formulário por hóspede cadastrado, o acesso é por token exclusivo vinculado à reserva, e ao concluir o cliente envia os dados ao hotel.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Cadastrar uma reserva (Priority: P1)

Como atendente da recepção ou equipe de reservas, quero cadastrar uma reserva informando período de hospedagem (check-in e check-out), quantidade de pessoas, regime de alimentação e suíte, com o valor calculado a partir das tarifas cadastradas, para formalizar a hospedagem mesmo sem ter os dados dos hóspedes.

**Why this priority**: É o núcleo da feature; sem reserva não há consulta nem ficha de hóspedes.

**Independent Test**: Criar uma reserva com período, pessoas, regime e suíte que possuam tarifa vigente e verificar que ela é salva com o valor calculado e aparece na listagem.

**Acceptance Scenarios**:

1. **Given** uma suíte e um regime com tarifas vigentes para todas as diárias do período, **When** o atendente preenche os campos obrigatórios e salva, **Then** a reserva é criada com status inicial, código identificador e valor total calculado.
2. **Given** um formulário com nome do titular, período, regime ou suíte não preenchidos, **When** o atendente tenta salvar, **Then** o sistema bloqueia e indica os campos obrigatórios faltantes.
3. **Given** uma suíte/regime sem tarifa cadastrada para ao menos uma data do período, **When** o atendente tenta selecioná-los, **Then** o sistema impede a reserva e informa que não há tarifa para o período.
4. **Given** check-out igual ou anterior ao check-in, **When** o atendente salva, **Then** o sistema rejeita com mensagem de período inválido.
5. **Given** a quantidade de pessoas excede a capacidade da suíte, **When** o atendente salva, **Then** o sistema rejeita informando a capacidade máxima.
6. **Given** a suíte já reservada por reserva ativa em parte do período, **When** o atendente tenta salvar, **Then** o sistema bloqueia, informa o conflito e lista suítes alternativas disponíveis que podem ser selecionadas com um clique.

---

### User Story 2 - Consultar reservas (Priority: P1)

Como atendente, quero listar e buscar reservas por código, nome do hóspede, período, status, suíte e parceiro, e abrir o detalhe de cada uma, para acompanhar a ocupação e atender os clientes.

**Why this priority**: Consultar é parte explícita do pedido e necessária para operar o dia a dia.

**Independent Test**: Com várias reservas cadastradas, aplicar cada filtro e conferir que a listagem retorna somente as reservas esperadas; abrir o detalhe e ver todos os dados.

**Acceptance Scenarios**:

1. **Given** reservas cadastradas, **When** o atendente abre a listagem, **Then** vê código, período, suíte, regime, quantidade de pessoas, valor, parceiro e situação das fichas de hóspedes (ex.: 1 de 3 preenchidas).
2. **Given** a listagem, **When** filtra por período, status, suíte, parceiro ou busca por código/nome de hóspede, **Then** apenas reservas correspondentes são exibidas.
3. **Given** uma reserva, **When** o atendente abre o detalhe, **Then** vê período, regime, suíte, tarifas aplicadas por diária, total, parceiro, lista de hóspedes e o estado de cada ficha.
4. **Given** nenhum resultado para os filtros, **When** a busca é feita, **Then** é exibida mensagem de lista vazia.

---

### User Story 3 - Enviar link de preenchimento da FNRH ao cliente (Priority: P1)

Como atendente, quero gerar e enviar ao cliente um link exclusivo da reserva com formulário mobile-first de FNRH, para que ele mesmo informe os dados de todos os hóspedes antes da chegada.

**Why this priority**: O hotel normalmente não tem os dados dos hóspedes no momento da reserva; sem o link o fluxo fica manual.

**Independent Test**: Gerar o link de uma reserva, abri-lo sem login em um celular, preencher a ficha de cada hóspede e confirmar que os dados aparecem na reserva.

**Acceptance Scenarios**:

1. **Given** uma reserva criada, **When** o atendente solicita o link, **Then** o sistema gera uma URL exclusiva, não adivinhável, que pode ser copiada e compartilhada.
2. **Given** o link aberto sem autenticação, **When** a página carrega, **Then** exibe resumo da reserva (hotel, período, suíte) e um formulário por hóspede conforme a quantidade de pessoas, utilizável em telas pequenas.
3. **Given** campos obrigatórios da FNRH em branco ou inválidos (ex.: CPF inválido), **When** o hóspede envia, **Then** os erros aparecem junto aos campos e nada é perdido do que já foi preenchido.
4. **Given** todas as fichas preenchidas, **When** o cliente toca em "Enviar ao hotel", **Then** os dados são enviados, a reserva mostra "dados enviados pelo cliente" com data/hora e o cliente vê confirmação.
5. **Given** fichas incompletas, **When** o cliente tenta enviar, **Then** o envio é impedido e as fichas pendentes são indicadas.
6. **Given** dados já enviados e link ativo, **When** o cliente reabre o link, **Then** vê os dados e pode corrigir e reenviar.
7. **Given** a página pública aberta, **When** o cliente tenta mudar a quantidade de hóspedes, **Then** não há opção para isso; o número de formulários é o da reserva.
8. **Given** um link inválido, expirado ou de reserva cancelada, **When** acessado, **Then** é exibida mensagem clara sem revelar dados da reserva.

---

### User Story 4 - Gerenciar hóspedes da reserva internamente (Priority: P2)

Como atendente, quero preencher ou editar a ficha de hóspedes diretamente no sistema (ex.: no balcão ou por telefone) e acompanhar quais fichas estão pendentes.

**Why this priority**: Complementa o link para clientes que não o preencherão, mas a reserva funciona sem isso.

**Independent Test**: Abrir uma reserva, editar os dados de um hóspede e ver o indicador de fichas pendentes atualizar.

**Acceptance Scenarios**:

1. **Given** uma reserva com fichas pendentes, **When** o atendente preenche os dados de um hóspede, **Then** a ficha passa a "preenchida" e o contador é atualizado.
2. **Given** uma reserva com N pessoas, **When** o atendente visualiza os hóspedes, **Then** existem exatamente N posições de hóspede, uma delas marcada como responsável pela reserva.
3. **Given** a quantidade de pessoas alterada, **When** salva, **Then** as posições de hóspedes são ajustadas sem descartar fichas já preenchidas (reduzir só é permitido removendo posições vazias ou com confirmação).

---

### User Story 5 - Indicar parceiro comercial na reserva (Priority: P3)

Como atendente, quero opcionalmente vincular a reserva a um parceiro cadastrado (agência de viagens, operadora, clube de turismo etc.) para rastrear a origem comercial.

**Why this priority**: Campo opcional; não bloqueia o fluxo principal.

**Independent Test**: Criar uma reserva com e outra sem parceiro e filtrar a listagem por parceiro.

**Acceptance Scenarios**:

1. **Given** parceiros ativos cadastrados, **When** o atendente cria a reserva, **Then** pode selecionar um parceiro ou deixar o campo vazio.
2. **Given** um parceiro inativo, **When** o atendente abre a lista de seleção, **Then** o parceiro inativo não é oferecido para novas reservas, mas permanece exibido em reservas já existentes.

---

### Edge Cases

- Tarifas alteradas depois da criação da reserva: o valor da reserva permanece o congelado no momento da criação.
- Link acessado por duas pessoas ao mesmo tempo: a última gravação por ficha prevalece, sem perda das demais fichas.
- Hóspede estrangeiro: documento e nacionalidade variam (passaporte em vez de CPF).
- Hóspede menor de idade: dados de documento e contato podem ser dispensados conforme a regra da FNRH, e deve haver vínculo com um responsável.
- Reserva cancelada, check-out ou no-show: link deixa de funcionar e a reserva permanece na consulta com status cancelado.
- Duas reservas para a mesma suíte e período sobrepostos: o sistema bloqueia a segunda e sugere suítes disponíveis (FR-004a). Reservas canceladas ou no-show não contam para conflito.
- Regeneração do link: o link anterior é invalidado.
- Dados pessoais enviados pelo link não devem ser visíveis a quem não tiver o link ou permissão no sistema.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST permitir cadastrar reservas com nome do titular, período de hospedagem (check-in e check-out), quantidade de pessoas (adultos e crianças), regime de alimentação e suíte, todos obrigatórios.
- **FR-001a**: O sistema MUST aceitar telefone e e-mail do titular como campos opcionais e MUST validar o formato quando informados; o nome do titular identifica a reserva na listagem e na busca enquanto as fichas FNRH estiverem pendentes.
- **FR-002**: O sistema MUST permitir selecionar apenas combinações de suíte e regime que possuam tarifa cadastrada para todas as diárias do período, e MUST bloquear a reserva caso contrário.
- **FR-003**: O sistema MUST calcular e armazenar o valor das diárias e o total da reserva com base nas tarifas vigentes, congelando-os na criação.
- **FR-004**: O sistema MUST validar que check-out é posterior a check-in e que a quantidade de pessoas respeita a capacidade da suíte.
- **FR-004a**: O sistema MUST bloquear o salvamento (criação ou edição) de reserva cuja suíte já possua outra reserva ativa (A confirmar, Confirmada, Check-in ou Check-out) em período sobreposto (check-out de uma no mesmo dia do check-in de outra não é conflito) e MUST sugerir outras suítes disponíveis no período, com tarifa vigente para o regime escolhido e capacidade suficiente.
- **FR-005**: O sistema MUST gerar um código único e legível para cada reserva e um status entre: A confirmar (inicial), Confirmada, Check-in, Check-out, No-show e Cancelada.
- **FR-005a**: O sistema MUST permitir à equipe alterar o status manualmente seguindo as transições: A confirmar → Confirmada ou Cancelada; Confirmada → Check-in, No-show ou Cancelada; Check-in → Check-out; Cancelada, Check-out e No-show são finais. Cada mudança MUST registrar data/hora e usuário.
- **FR-005b**: Reservas Canceladas e No-show MUST NOT contar como conflito de suíte; o link público MUST funcionar apenas nos status A confirmar, Confirmada e Check-in.
- **FR-006**: O sistema MUST permitir um campo opcional de parceiro comercial, selecionado entre parceiros ativos já cadastrados.
- **FR-007**: O sistema MUST criar uma posição de hóspede para cada pessoa da reserva, sem exigir dados no momento do cadastro, e marcar um hóspede como responsável.
- **FR-008**: O sistema MUST permitir listar reservas com paginação e filtros por texto (código/nome de hóspede), período, status, suíte, regime e parceiro.
- **FR-009**: O sistema MUST exibir detalhe da reserva com tarifas aplicadas, parceiro, hóspedes e estado de preenchimento das fichas.
- **FR-010**: O sistema MUST permitir editar e cancelar reservas, preservando o histórico de cancelamento.
- **FR-011**: O sistema MUST gerar um token exclusivo, não adivinhável, vinculado a uma única reserva, que compõe o link público; a equipe MUST poder copiá-lo, regenerá-lo (invalidando o anterior) e desativá-lo.
- **FR-012**: A página pública MUST dispensar login, ser mobile-first e exibir resumo mínimo da reserva e exatamente um formulário de FNRH por hóspede, conforme a quantidade de pessoas definida na reserva (originada do orçamento/reserva); o hóspede MUST NOT poder adicionar, remover ou alterar essa quantidade.
- **FR-013**: A FNRH MUST coletar os dados exigidos pela ficha nacional: nome completo, nacionalidade, data de nascimento, sexo, profissão, tipo e número de documento, endereço de residência (ou país de residência para estrangeiros), contato (telefone e e-mail), motivo da viagem, meio de transporte, procedência e destino (próximo destino) e, quando aplicável, dados do responsável por menores.
- **FR-014**: O sistema MUST validar os dados da FNRH (formato de CPF, datas, campos obrigatórios) com mensagens claras no próprio campo.
- **FR-015**: A página pública MUST permitir salvar o progresso de cada ficha separadamente e MUST oferecer a ação "Enviar ao hotel" para concluir, habilitada somente quando todas as fichas tiverem os campos obrigatórios válidos; o envio MUST registrar data/hora e notificar a equipe na reserva (indicador "dados enviados pelo cliente").
- **FR-015a**: Após o envio, enquanto o link estiver ativo, o cliente MUST poder reabrir, corrigir e reenviar os dados; cada reenvio registra nova data/hora.
- **FR-016**: O sistema MUST registrar data/hora do envio de cada ficha e identificar se foi preenchida pelo cliente ou pelo hotel.
- **FR-017**: O sistema MUST permitir que a equipe preencha e edite fichas de hóspedes internamente.
- **FR-018**: O sistema MUST restringir as telas internas a usuários autenticados com permissão de reservas; usuários com essa permissão veem as fichas completas, sem mascaramento nem permissão separada nesta versão. Dados de hóspedes MUST NOT ser acessíveis sem usuário autenticado ou link válido.
- **FR-019**: O sistema MUST exibir mensagens genéricas para links inválidos, expirados ou de reservas canceladas, sem expor dados.
- **FR-020**: O sistema MUST limitar tentativas abusivas de acesso e envio na página pública.

### Key Entities *(include if feature involves data)*

- **Reserva**: Registro da hospedagem com código, nome do titular (obrigatório), telefone e e-mail do titular (opcionais), período, quantidade de adultos/crianças, regime de alimentação, suíte, valor total, status (A confirmar, Confirmada, Check-in, Check-out, No-show, Cancelada), parceiro opcional e link de preenchimento.
- **Diária da reserva**: Valor aplicado a cada noite, congelado na criação a partir da tarifa vigente.
- **Hóspede da reserva**: Uma posição por pessoa da reserva, com indicador de responsável, estado da ficha (pendente/preenchida) e origem do preenchimento.
- **Ficha FNRH**: Dados pessoais e de viagem do hóspede conforme a Ficha Nacional de Registro de Hóspedes.
- **Link de preenchimento**: Acesso público por token exclusivo vinculado a uma reserva, com registro de envio ao hotel, com estado (ativo, desativado, expirado).
- **Entidades existentes referenciadas**: Suíte/quarto, regime de alimentação, tarifa (tarifário) e parceiro comercial.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Um atendente cadastra uma reserva completa, sem dados de hóspedes, em menos de 2 minutos.
- **SC-002**: 100% das reservas salvas possuem período, regime, suíte e tarifas aplicadas; nenhuma é criada sem tarifa vigente para todas as diárias.
- **SC-003**: Um cliente preenche a ficha de um hóspede pelo celular em menos de 5 minutos, sem necessidade de zoom horizontal ou login.
- **SC-004**: Pelo menos 80% dos hóspedes têm a ficha preenchida antes do check-in nas reservas em que o link foi enviado.
- **SC-005**: Uma reserva é localizada na listagem por qualquer filtro em menos de 10 segundos.
- **SC-006**: Nenhum dado de hóspede é acessível sem link válido ou usuário autorizado em testes de acesso.
- **SC-007**: A página pública é utilizável em telas a partir de 320 px de largura.

## Assumptions

- Os cadastros de suítes, regimes de alimentação, tarifas e parceiros comerciais já existem (features anteriores) e são reutilizados.
- A disponibilidade é verificada apenas contra outras reservas ativas; bloqueios de manutenção, allotment de parceiros e overbooking controlado ficam para evolução futura.
- O envio do link é feito pelo atendente (cópia e compartilhamento manual, ex.: WhatsApp ou e-mail); envio automático está fora do escopo.
- Pagamentos, sinal, fluxos operacionais de check-in/check-out (apenas o status é alterado manualmente) e a transmissão da FNRH a órgãos oficiais estão fora do escopo; a feature apenas coleta e armazena os dados.
- O link expira após a data de check-out e pode ser regenerado ou desativado pela equipe.
- Permissões granulares ou mascaramento de dados da FNRH ficam para evolução futura.
- Os dados pessoais seguem a LGPD: coleta limitada à finalidade da FNRH, com acesso restrito e aviso de privacidade na página pública.
- Conversão de orçamento em reserva está fora do escopo desta versão.
- A página pública é apresentada em português do Brasil.
