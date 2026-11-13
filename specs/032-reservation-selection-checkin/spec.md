# Feature Specification: Seleção de Reserva e Check-in pelo Calendário

**Feature Branch**: `032-reservation-selection-checkin`

**Created**: 2026-11-12

**Status**: Ready for Planning

**Input**: User description: "O click na reserva deve seleciona-la e não abrir um modal de detalhes. Ao selecionar uma reserva, criar uma borda azul ao redor dela - é importante que entre a borda e a reserva tenha um micro espaço transparente. Consultar cores ao brand-design-specialist qual a melhor cor, sombra e destaque a ser utilizada. Criar botão de check-in (o ícone deve ser um símbolo de um sino). Com a reserva selecionada, criar funcionalidade de check-in. O processo de check-in consiste em validar o preenchimento das FNRHs, caso vazias, oferecer para fazer o preenchimento agora (não obrigatório). Se o usuário aceitar, abrir a página de edição da reserva com o formulário de edição das FNRHs abertas. Atualizar o status da reserva para check-in (mudar tema da reserva no calendário). Atualizar o status da suíte para laranja (bolinha de status no canto esquerdo junto com a label da suíte). Na confirmação do check-in, é importante que o modal aberto tenha os dados da reserva e a observação da mesma. Adicionar novo botão de detalhes para abrir o modal de detalhes da reserva selecionada. Ao passar o mouse sobre uma reserva, abrir um tooltip personalizado ligeiramente grande, com os detalhes da reserva: hóspedes, tipagem de cama, quantidade de pessoas, valores, obs e etc. Atualizar o ícone de nova reserva para um que faça mais sentido."

**Scope**: Hotel (web, equipe do hotel). Sem escopo de Plataforma. Pacote principal: `web`. `api`: sem mudança de comportamento; recebe apenas testes de caracterização do endpoint de troca de status já existente (transição `confirmada → check_in`, transição inválida, isolamento entre hotéis). `packages/.contracts`: sem tipos novos (os tipos `Reserva`, `ReservaStatus`, `Hospede`, `Quarto`, `ConfiguracaoCama`, `ChangeReservaStatusPayload` já existem).

**Supersedes**: na spec 031, o cenário 6 da US1 e o trecho "mantém a abertura de detalhes" do FR-001 (clicar numa barra de reserva abria o modal "Detalhes da Reserva"). A partir desta feature, clicar numa barra **seleciona** a reserva; o arraste continua não começando sobre uma barra.

## Atores

- **Operador do hotel** (recepcionista, gerente): usuário autenticado no `web` com acesso a `/reservas/calendario`. Nenhuma permissão nova é criada: quem acessa o calendário pode selecionar reservas, ver detalhes e realizar check-in (o endpoint de troca de status já é protegido apenas por autenticação, no escopo do hotel do token).

## Estados

### Seleção de reserva (UI efêmera, não persistida)

| Estado | Entrada | Saída |
|---|---|---|
| `nenhuma` | carga da página; Esc sem modal aberto; clique fora da região do calendário (grade + barra de ações); pressionar área livre de uma célula (início de seleção de período da spec 031); navegação de datas ou seletor de mês/ano; reserva selecionada deixa de existir no calendário após recarga | `selecionada(R)` ao clicar (ou Enter/Espaço com foco) numa barra da reserva R |
| `selecionada(R)` | clique/Enter/Espaço na barra de R | `selecionada(S)` ao clicar numa barra de outra reserva S; clicar de novo em R mantém `selecionada(R)`; `nenhuma` pelas entradas listadas acima |

- Seleção de reserva e seleção de período (spec 031) são mutuamente exclusivas: selecionar uma reserva remove a seleção de período; iniciar uma seleção de período remove a seleção de reserva.
- Cliques dentro de modais abertos a partir do calendário (Detalhes, Check-in, Nova Reserva) NÃO removem a seleção.
- Todas as barras da mesma reserva (dia de entrada, dias internos e dia de saída) exibem o destaque de seleção.

### Status da reserva (domínio, já existente na API)

Transições relevantes (fonte: regra já implementada na API, não muda):

| De | Para | Nesta feature |
|---|---|---|
| `a_confirmar` | `confirmada`, `cancelada` | check-in **não** permitido (botão desabilitado) |
| `confirmada` | `check_in`, `no_show`, `cancelada` | check-in permitido |
| `check_in` | `check_out` | check-in já realizado (botão desabilitado) |

O calendário exibe apenas `a_confirmar`, `confirmada` e `check_in` (inalterado).

### Status da suíte (indicador derivado, não persistido)

| Indicador | Condição | Cor |
|---|---|---|
| Bloqueado | suíte inativa (`status = N`) | `status-blocked` (inalterado) |
| Check-in | suíte ativa com ao menos uma reserva em `check_in` no calendário | laranja `status-checkin` (substitui o antigo "Ocupado" roxo) |
| Disponível | demais casos | `status-available` (inalterado) |

## Clarifications

### Session 2026-11-12

Decisões tomadas autonomamente a partir do código e do contexto (sem pergunta ao stakeholder):

- Q: Onde abre "a página de edição da reserva com o formulário de edição das FNRHs aberto"? → A: Na página de detalhe `/reservas/:id`, que é a única com edição de FNRH (seção de hóspedes + modal "Editar ficha"). A página `/reservas/:id/editar` não tem formulário de FNRH. O calendário navega para `/reservas/:id?fnrh=pendente`; a página abre automaticamente o modal de edição da primeira ficha não preenchida (menor posição) e remove o parâmetro da URL.
- Q: Ao aceitar preencher as FNRHs, o check-in é feito antes? → A: Sim. As FNRHs não são obrigatórias e o operador já confirmou o check-in; a opção "Fazer check-in e preencher FNRHs" altera o status para `check_in` e, em caso de sucesso, navega para o preenchimento. Se a troca de status falhar, não navega.
- Q: Reserva `a_confirmar` pode fazer check-in? → A: Não (a API rejeita `a_confirmar → check_in`). O botão fica desabilitado com a dica "Confirme a reserva antes do check-in".
- Q: A API deve exigir FNRH no check-in? → A: Não. Preenchimento é opcional pelo pedido; nenhuma validação nova na API.
- Q: Há restrição de data para o check-in? → A: Não há bloqueio (a API não restringe). Se o dia atual for anterior à data de entrada, o modal de confirmação exibe um aviso não bloqueante "Check-in antecipado".
- Q: Quando a suíte fica laranja? → A: Quando houver reserva em `check_in` para a suíte entre as reservas carregadas no calendário, independentemente da data (o hóspede está na casa até o check-out). Substitui o cálculo atual "ocupado hoje".
- Q: De onde vem a tipagem de cama? → A: Da configuração de camas da suíte (`Quarto.camas`), já carregada pela lista de suítes do calendário; a reserva não tem cama própria.
- Cores (seleção, laranja de check-in, manutenção neutra): decididas pelo brand-design-specialist (ver FR-004, FR-016, FR-017).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Selecionar uma reserva com destaque azul (Priority: P1)

Como operador, quero clicar numa reserva do calendário para selecioná-la (sem abrir modal) e ver claramente qual está selecionada, para depois agir sobre ela pela barra de ações.

**Why this priority**: Base das demais histórias (check-in e detalhes agem sobre a reserva selecionada).

**Independent Test**: Abrir `/reservas/calendario` com a reserva RES-0001 (suíte 101, D..D+3). Clicar na barra do dia D+1. Verificar que nenhum modal abre, que todas as barras de RES-0001 exibem um contorno azul separado da barra por um espaço transparente (com brilho suave) e marcadas como pressionadas para tecnologias assistivas, e que nenhuma outra reserva tem o contorno. Clicar numa barra de RES-0002 e verificar que o destaque passa para ela. Pressionar Esc e verificar que nenhuma reserva fica destacada.

**Acceptance Scenarios**:

1. **Given** o calendário com RES-0001 e RES-0002, **When** o operador clica numa barra de RES-0001, **Then** nenhum modal abre e todas as barras de RES-0001 exibem o destaque de seleção (contorno azul de 2px com 1px de espaço transparente, brilho e realce interno), com `aria-pressed="true"`; as barras de RES-0002 têm `aria-pressed="false"` e nenhum destaque.
2. **Given** RES-0001 selecionada, **When** o operador clica numa barra de RES-0002, **Then** RES-0002 passa a ser a selecionada e RES-0001 perde o destaque.
3. **Given** RES-0001 selecionada, **When** o operador clica de novo numa barra de RES-0001, **Then** ela continua selecionada.
4. **Given** RES-0001 selecionada, **When** o operador pressiona Esc (sem modal aberto), clica fora da região do calendário, navega de datas ou pressiona a área livre de uma célula, **Then** nenhuma reserva fica selecionada (no último caso, a seleção de período da spec 031 começa normalmente).
5. **Given** uma seleção de período ativa (spec 031), **When** o operador clica numa barra de reserva, **Then** a seleção de período é removida e a reserva fica selecionada.
6. **Given** foco de teclado numa barra de reserva, **When** o operador pressiona Enter ou Espaço, **Then** a reserva é selecionada.
7. **Given** uma reserva selecionada na primeira linha de suítes ou na primeira/última coluna visível, **When** o destaque é exibido, **Then** o contorno aparece completo (não é cortado pelo contêiner da grade nem pelo cabeçalho).

---

### User Story 2 - Fazer check-in da reserva selecionada (Priority: P1)

Como recepcionista, quero selecionar uma reserva confirmada e clicar no botão de check-in (sino), revisar os dados e a observação da reserva num modal e confirmar, para registrar a entrada do hóspede e ver o calendário refletir isso (reserva e suíte em laranja).

**Why this priority**: Valor de negócio principal do pedido.

**Independent Test**: Selecionar RES-0001 (`confirmada`, 2 de 2 fichas preenchidas, observação "Chegada tardia"). Clicar no botão "Check-in" (ícone de sino) da barra de ações. Verificar que o modal "Confirmar check-in" mostra código, titular, suíte e categoria, período, adultos/crianças, regime, valor total, a observação "Chegada tardia" e "2 de 2 fichas FNRH preenchidas". Clicar em "Confirmar check-in". Verificar a requisição de troca de status para `check_in` (sem `hotel_id` no corpo), o toast "Check-in da reserva RES-0001 realizado com sucesso!", o fechamento do modal, a barra de RES-0001 com o tema laranja de check-in e a bolinha da suíte 101 em laranja com a dica "Check-in".

**Acceptance Scenarios**:

1. **Given** nenhuma reserva selecionada, **When** o operador olha a barra de ações, **Then** o botão "Check-in" (ícone de sino) está visível e desabilitado, com a dica "Selecione uma reserva para fazer check-in".
2. **Given** uma reserva `a_confirmar` selecionada, **When** o operador passa o mouse no botão "Check-in", **Then** ele está desabilitado com a dica "Confirme a reserva antes do check-in".
3. **Given** uma reserva `check_in` selecionada, **When** o operador olha o botão "Check-in", **Then** ele está desabilitado com a dica "Check-in já realizado".
4. **Given** uma reserva `confirmada` selecionada, **When** o operador clica em "Check-in", **Then** abre o modal "Confirmar check-in" com: código, titular, suíte (identificação e categoria), check-in e check-out (dd/MM/yyyy) e número de diárias, adultos e crianças, regime de alimentação, parceiro (se houver), valor total em reais, observações completas (ou "Sem observações") e o progresso das FNRHs ("X de Y fichas FNRH preenchidas").
5. **Given** o modal aberto e todas as fichas preenchidas, **When** o operador clica em "Confirmar check-in", **Then** o status muda para `check_in`, aparece o toast de sucesso, o modal fecha, o calendário recarrega, a reserva continua selecionada com o tema laranja de check-in e a bolinha da suíte fica laranja com a dica "Check-in"; o botão "Check-in" fica desabilitado ("Check-in já realizado").
6. **Given** a confirmação em andamento, **When** o operador tenta clicar de novo, **Then** os botões de confirmação ficam desabilitados até a resposta (sem envio duplicado).
7. **Given** a API responde que a transição é inválida (ex.: a reserva mudou de status em outra sessão), **When** o operador confirma, **Then** aparece `toast.error` com a mensagem da API (ou "Não foi possível realizar o check-in."), o modal fecha e o calendário recarrega as reservas.
8. **Given** a API responde que a reserva não existe, **When** o operador confirma, **Then** aparece `toast.error` "Reserva não encontrada.", o modal fecha, o calendário recarrega e a seleção é removida.
9. **Given** erro de rede ou erro inesperado do servidor, **When** o operador confirma, **Then** aparece `toast.error` com a mensagem da API (ou "Não foi possível realizar o check-in.") e o modal permanece aberto para nova tentativa.
10. **Given** a data de entrada da reserva é posterior a hoje, **When** o modal abre, **Then** exibe o aviso não bloqueante "Check-in antecipado: a entrada prevista é dd/MM/yyyy" e a confirmação continua disponível.
11. **Given** o modal aberto, **When** o operador clica em "Cancelar", pressiona Esc ou fecha o modal, **Then** nada é enviado e a reserva continua selecionada.

---

### User Story 3 - Oferecer o preenchimento das FNRHs pendentes no check-in (Priority: P1)

Como recepcionista, quero ser avisado no check-in quando há fichas FNRH não preenchidas e poder escolher preenchê-las agora (sem obrigatoriedade), para não esquecer o registro dos hóspedes.

**Why this priority**: Faz parte do processo de check-in pedido; sem ela o check-in ignora a FNRH.

**Independent Test**: Selecionar RES-0003 (`confirmada`, 0 de 2 fichas preenchidas). Clicar em "Check-in". Verificar o aviso "2 fichas FNRH pendentes" e a lista dos hóspedes pendentes. Clicar em "Fazer check-in e preencher FNRHs". Verificar a troca de status para `check_in`, o toast de sucesso e a navegação para `/reservas/<id>` com o modal "Editar ficha" aberto para o hóspede da posição 1. Repetir com outra reserva escolhendo "Fazer check-in sem preencher" e verificar que o check-in é feito e o operador continua no calendário.

**Acceptance Scenarios**:

1. **Given** uma reserva `confirmada` com fichas não preenchidas (qualquer ficha com status diferente de `preenchida`), **When** o modal de check-in abre, **Then** ele mostra o aviso "N ficha(s) FNRH pendente(s)", a lista dos hóspedes pendentes (nome, ou "Hóspede {posição}" quando sem nome, e o status "Pendente" ou "Rascunho") e o texto "O preenchimento é opcional."; os botões são "Fazer check-in e preencher FNRHs" (principal), "Fazer check-in sem preencher" e "Cancelar". O botão "Confirmar check-in" não aparece.
2. **Given** o modal com fichas pendentes, **When** o operador clica em "Fazer check-in e preencher FNRHs" e a troca de status tem sucesso, **Then** aparece o toast de sucesso e o operador é levado à página de detalhe da reserva com o modal "Editar ficha" aberto para a primeira ficha não preenchida (menor posição).
3. **Given** o modal com fichas pendentes, **When** o operador clica em "Fazer check-in e preencher FNRHs" e a troca de status falha, **Then** valem as regras de erro da US2 (cenários 7-9) e não há navegação.
4. **Given** o modal com fichas pendentes, **When** o operador clica em "Fazer check-in sem preencher", **Then** o comportamento é idêntico à US2 cenário 5 (permanece no calendário).
5. **Given** a página de detalhe aberta com o parâmetro de FNRH pendente, **When** a reserva carrega, **Then** o modal "Editar ficha" abre uma única vez para a primeira ficha não preenchida e o parâmetro é removido da URL (recarregar ou fechar o modal não o reabre).
6. **Given** a página de detalhe aberta com o parâmetro de FNRH pendente, mas todas as fichas já preenchidas (ou sem hóspedes), **When** a reserva carrega, **Then** nenhum modal abre e o parâmetro é removido.
7. **Given** uma reserva com `fichas_preenchidas = total_hospedes`, **When** o modal de check-in abre, **Then** não há aviso de pendência (US2 cenário 5).

---

### User Story 4 - Ver detalhes da reserva selecionada pelo botão Detalhes (Priority: P2)

Como operador, quero um botão "Detalhes" na barra de ações que abra o modal de detalhes da reserva selecionada, já que o clique na barra agora só seleciona.

**Why this priority**: Mantém o acesso aos detalhes que o clique deixava de dar.

**Independent Test**: Selecionar RES-0001 e clicar em "Detalhes" (barra de ações). Verificar que abre o modal "Detalhes da Reserva" com dados reais da reserva (código, status, suíte e categoria, período, titular e contatos, adultos/crianças, regime, parceiro, valor total, FNRH e observações) e o link "Abrir reserva" para `/reservas/<id>`. Fechar e verificar que a reserva continua selecionada.

**Acceptance Scenarios**:

1. **Given** nenhuma reserva selecionada, **When** o operador olha a barra de ações, **Then** o botão "Detalhes" está desabilitado com a dica "Selecione uma reserva para ver os detalhes".
2. **Given** uma reserva selecionada, **When** o operador clica em "Detalhes", **Then** abre o modal "Detalhes da Reserva" com: código e status (rótulo legível), suíte (identificação e categoria), check-in, check-out e diárias, titular (nome, e-mail, telefone; "-" quando ausente), adultos e crianças, regime, parceiro ou "Balcão / Reserva Direta", valor total em reais, "X de Y fichas FNRH preenchidas", observações (seção omitida quando vazia) e o link "Abrir reserva".
3. **Given** o modal de detalhes aberto, **When** o operador o fecha, **Then** a reserva continua selecionada.
4. **Given** o modal de detalhes aberto, **When** o operador clica em "Abrir reserva", **Then** navega para `/reservas/<id>`.
5. O modal não exibe mais dados inventados (método/status de pagamento fixos como "Pago"/"Pendente").

---

### User Story 5 - Tooltip rico ao passar o mouse sobre a reserva (Priority: P2)

Como operador, quero ver um resumo completo da reserva ao passar o mouse (ou focar) uma barra, sem clicar, para consultar rapidamente hóspedes, camas, pessoas, valores e observações.

**Why this priority**: Acelera a consulta; não bloqueia check-in.

**Independent Test**: Passar o mouse sobre a barra de RES-0001 e aguardar. Verificar um cartão de resumo (maior que a dica atual) com: código e status, titular, hóspedes, suíte e categoria, tipagem de cama ("1 Casal, 1 Solteiro"), "2 adultos, 1 criança", regime, período e diárias, valor total em reais, parceiro, FNRH e observações. Verificar que clicar na barra com o resumo visível ainda seleciona a reserva.

**Acceptance Scenarios**:

1. **Given** a barra de uma reserva, **When** o operador mantém o ponteiro sobre ela ou a foca pelo teclado, **Then** após um curto atraso aparece um cartão de resumo (largura entre 18rem e 22rem) com: código e status; titular; lista de hóspedes (nomes das fichas com nome; fichas sem nome contam como "Hóspede {posição}"); suíte e categoria; tipagem de cama da suíte (tipos legíveis com quantidade, ex.: "1 Casal, 2 Solteiro"; "Não informada" se a suíte não tiver camas); quantidade de pessoas ("A adulto(s), C criança(s)", crianças omitidas quando 0); regime; check-in, check-out e diárias; valor total em reais; parceiro (omitido se não houver); FNRH "X de Y preenchidas"; observações (omitidas se vazias, limitadas visualmente a 6 linhas).
2. **Given** o resumo visível, **When** o operador clica na barra, **Then** a reserva é selecionada (o resumo não bloqueia o clique).
3. **Given** o resumo visível, **When** o ponteiro sai da barra, **Then** o resumo some.
4. **Given** um arraste de seleção de período em andamento (spec 031), **When** o ponteiro passa sobre barras, **Then** nenhum resumo é aberto.
5. **Given** o tema escuro, **When** o resumo abre, **Then** ele é legível (usa as cores de superfície do tema).

---

### User Story 6 - Cores de status e ícones atualizados (Priority: P2)

Como operador, quero que check-in tenha uma cor própria (laranja) consistente no calendário e nas listas, que manutenção não se confunda com check-in e que o botão de nova reserva tenha um ícone que represente reserva.

**Why this priority**: Consistência visual exigida pelo pedido; complementa US2.

**Independent Test**: Com uma reserva em `check_in`, verificar no calendário a barra laranja e a bolinha laranja da suíte com dica "Check-in"; na lista `/reservas` e no detalhe `/reservas/<id>` o selo "Check-in" laranja. Verificar que o botão "Nova Reserva" usa o ícone de calendário com "+" e o botão "Check-in" o ícone de sino.

**Acceptance Scenarios**:

1. **Given** uma reserva `check_in`, **When** exibida no calendário, **Then** a barra usa o tema laranja de check-in (não mais a cor primária sólida); `confirmada` e `a_confirmar` mantêm seus temas atuais.
2. **Given** uma suíte ativa com reserva `check_in`, **When** o calendário carrega, **Then** a bolinha da suíte é laranja e a dica da etiqueta diz "Check-in"; suíte inativa continua "Bloqueado"; suíte sem reserva em check-in continua "Disponível".
3. **Given** a lista `/reservas` ou o detalhe `/reservas/<id>`, **When** uma reserva está em `check_in`, **Then** o selo "Check-in" usa o laranja de check-in (não mais verde-esmeralda); os demais selos não mudam.
4. **Given** a barra de ações do calendário, **When** renderizada, **Then** contém, nesta ordem, "Nova Reserva" (ícone calendário com "+"), "Check-in" (ícone sino) e "Detalhes" (ícone de informação), todos botões de ícone com nome acessível e dica.
5. **Given** o indicador de manutenção, **When** exibido, **Then** usa um tom neutro (ardósia), distinto do laranja de check-in.

---

### User Story 7 - Isolamento entre hotéis (Priority: P1)

Como hotel, quero que o check-in só afete reservas do meu hotel.

**Independent Test**: Teste de rota da API: autenticado como operador do hotel B, enviar troca de status para `check_in` de uma reserva do hotel A e verificar 404 e que a reserva do hotel A continua `confirmada`. No `web`, verificar que a requisição de check-in contém apenas `{ status: "check_in" }` no corpo.

**Acceptance Scenarios**:

1. **Given** um operador do hotel B, **When** tenta fazer check-in de uma reserva do hotel A (por id), **Then** a API responde 404 "Reserva não encontrada" e nenhum status ou histórico do hotel A muda.
2. **Given** um operador do hotel A, **When** faz check-in pelo calendário, **Then** o corpo da requisição é exatamente `{ "status": "check_in" }` (sem `hotel_id`); o hotel vem do token.
3. **Given** o calendário do hotel A, **When** carregado, **Then** só exibe reservas e suítes retornadas para o hotel A (inalterado).

### Edge Cases

- Reserva selecionada some após recarga (ex.: cancelada em outra sessão): a seleção é removida e os botões voltam ao estado desabilitado.
- Reserva com `total_hospedes = 0` ou sem hóspedes cadastrados: modal de check-in mostra "Nenhuma ficha FNRH cadastrada" e trata como sem pendências (botão "Confirmar check-in").
- Reserva cuja barra está parcialmente fora do período visível: seleção e destaque funcionam nas barras visíveis; ao navegar de datas a seleção é removida.
- Observação longa: modal de check-in mostra o texto completo com quebra de linha e rolagem do modal; o resumo limita a 6 linhas.
- Valor total inválido/ausente: exibido como "R$ 0,00".
- Suíte com várias reservas em `check_in`: indicador continua um único "Check-in".
- Duas reservas no mesmo dia (saída de uma, entrada de outra): o destaque da selecionada fica acima da vizinha e não a cobre por inteiro.
- Abrir o modal de check-in pausa a seleção de período (como já ocorre com o modal de nova reserva) e Esc fecha só o modal, sem remover a seleção da reserva.
- Clique em "Nova Reserva" com reserva selecionada: abre o formulário vazio (sem período); a reserva continua selecionada.
- Exclusão: não há operação de exclusão nesta feature (sem caso 409).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Clicar (ou Enter/Espaço com foco) numa barra de reserva DEVE selecionar a reserva e NÃO DEVE abrir modal. Pressionar sobre a barra continua não iniciando a seleção de período (spec 031).
- **FR-002**: Deve haver no máximo uma reserva selecionada. As regras de entrada/saída seguem a tabela "Seleção de reserva". Seleção de reserva e de período são mutuamente exclusivas.
- **FR-003**: A seleção DEVE ser removida quando a reserva selecionada deixar de constar entre as reservas exibidas após recarga.
- **FR-004**: Todas as barras da reserva selecionada DEVEM exibir o destaque decidido pelo brand-design-specialist: contorno de 2px na cor `selection-ring` com 1px de espaço transparente entre contorno e barra, brilho (`selection-glow`) e realce interno (`selection-highlight`), acima das barras vizinhas, em tema claro e escuro, com `aria-pressed="true"` (demais barras `aria-pressed="false"`). O contorno NÃO DEVE ser cortado na primeira linha nem nas colunas extremas.
- **FR-005**: A barra de ações DEVE conter, nesta ordem, os botões de ícone "Nova Reserva" (ícone calendário com "+"), "Check-in" (ícone sino) e "Detalhes" (ícone de informação), cada um com nome acessível e dica.
- **FR-006**: O botão "Check-in" DEVE estar habilitado apenas com uma reserva `confirmada` selecionada; caso contrário desabilitado com a dica correspondente: sem seleção "Selecione uma reserva para fazer check-in"; `a_confirmar` "Confirme a reserva antes do check-in"; `check_in` "Check-in já realizado".
- **FR-007**: Clicar em "Check-in" DEVE abrir o modal "Confirmar check-in" com os dados listados na US2 cenário 4, incluindo as observações completas, o progresso de FNRH e, quando a entrada for posterior a hoje, o aviso "Check-in antecipado".
- **FR-008**: Ficha FNRH pendente é qualquer hóspede da reserva com status de ficha diferente de `preenchida`. Sem pendências, o modal oferece "Confirmar check-in" e "Cancelar". Com pendências, oferece a lista de pendentes, o texto "O preenchimento é opcional.", "Fazer check-in e preencher FNRHs", "Fazer check-in sem preencher" e "Cancelar".
- **FR-009**: Toda confirmação DEVE solicitar a troca de status da reserva para `check_in` com corpo contendo apenas o novo status. Durante a requisição os botões de confirmação ficam desabilitados.
- **FR-010**: Em sucesso: `toast.success("Check-in da reserva {codigo} realizado com sucesso!")`, fechar o modal, recarregar reservas do calendário e demais listas de reservas, manter a reserva selecionada. Se a opção foi "preencher FNRHs", navegar para `/reservas/{id}?fnrh=pendente`.
- **FR-011**: Em erro: transição inválida → `toast.error` com a mensagem da API (fallback "Não foi possível realizar o check-in."), fechar o modal e recarregar; não encontrada → `toast.error("Reserva não encontrada.")`, fechar, recarregar e remover a seleção; outros erros → `toast.error` com a mensagem da API (mesmo fallback), modal permanece aberto. Sem navegação em nenhum erro.
- **FR-012**: A página de detalhe `/reservas/:id`, quando aberta com `fnrh=pendente`, DEVE abrir uma única vez o modal "Editar ficha" para a primeira ficha não preenchida (menor posição) após carregar a reserva e remover o parâmetro da URL (substituindo o histórico); sem fichas pendentes, apenas remove o parâmetro.
- **FR-013**: O botão "Detalhes" DEVE estar habilitado apenas com reserva selecionada (dica desabilitada "Selecione uma reserva para ver os detalhes") e abrir o modal "Detalhes da Reserva" com os dados reais listados na US4 cenário 2 e o link "Abrir reserva". Fechar o modal mantém a seleção. Dados de pagamento inventados DEVEM ser removidos.
- **FR-014**: Passar o ponteiro ou focar uma barra DEVE abrir, após curto atraso, o resumo descrito na US5 cenário 1; o resumo não bloqueia o clique e não abre durante um arraste de período.
- **FR-015**: A tipagem de cama DEVE vir da configuração de camas da suíte da reserva, com rótulos legíveis: solteiro "Solteiro", casal "Casal", queen "Queen", king "King", beliche "Beliche", sofa_cama "Sofá-cama", formatados "{quantidade} {rótulo}" separados por vírgula.
- **FR-016**: Reservas em `check_in` DEVEM usar o tema laranja de check-in (`status-checkin`) na barra do calendário e nos selos de status da lista e do detalhe de reservas; os temas de `confirmada` e `a_confirmar` no calendário não mudam.
- **FR-017**: O indicador de suíte DEVE seguir a tabela "Status da suíte": laranja com dica "Check-in" quando a suíte ativa tiver reserva `check_in` entre as reservas carregadas; o indicador de manutenção DEVE usar tom neutro ardósia.
- **FR-018**: O mapeamento de status no calendário NÃO DEVE usar códigos numéricos mágicos; o status do domínio (`a_confirmar`, `confirmada`, `check_in`) e seu rótulo legível ("A Confirmar", "Confirmada", "Check-in") DEVEM ser usados.
- **FR-019**: Abrir os modais de check-in ou de detalhes DEVE pausar a seleção de período (como o modal de nova reserva); ter apenas uma reserva selecionada (sem modal) NÃO pausa a seleção de período.
- **FR-020**: O isolamento por hotel DEVE ser garantido pela API a partir do token: troca de status de reserva de outro hotel responde 404 sem alterar dados.

### Key Entities

- **Reserva (visão do calendário)**: id, código, suíte (id, identificação, categoria), status do domínio e rótulo, check-in, check-out, titular (nome, e-mail, telefone), adultos, crianças, regime, parceiro, valor total, observações, hóspedes (posição, nome, status da ficha), fichas preenchidas e total de hóspedes, camas da suíte.
- **Hóspede / Ficha FNRH**: posição, nome, status da ficha (`pendente`, `rascunho`, `preenchida`).
- **Suíte (visão do calendário)**: id, identificação, categoria, camas, indicador de status derivado (Bloqueado, Check-in, Disponível).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Um operador conclui o check-in de uma reserva confirmada a partir do calendário em no máximo 3 cliques (selecionar, Check-in, Confirmar) e em menos de 15 segundos.
- **SC-002**: Em 100% dos check-ins com fichas pendentes, o operador vê o aviso e pode seguir sem preencher.
- **SC-003**: Após um check-in bem-sucedido, a barra e o indicador da suíte mudam para laranja sem recarregar a página manualmente.
- **SC-004**: O resumo ao passar o mouse mostra todos os campos listados na US5 sem o operador precisar abrir qualquer modal.
- **SC-005**: Zero requisições de check-in conseguem alterar reservas de outro hotel (verificado por teste automatizado).
- **SC-006**: O destaque de seleção é visível e completo em 100% das posições da grade (incluindo primeira linha e colunas extremas), nos temas claro e escuro.

## Assumptions

- Sem permissão nova: o endpoint de troca de status exige apenas autenticação (comportamento atual).
- A API já implementa a transição `confirmada → check_in` e rejeita `a_confirmar → check_in` com 422; não há mudança de código na API, só testes de caracterização (rota e caso de uso não tinham testes).
- O preenchimento de FNRH é feito na página de detalhe `/reservas/:id` (único lugar com o formulário), não em `/reservas/:id/editar`.
- O check-in é registrado antes da navegação para o preenchimento das FNRHs.
- Check-in antecipado é permitido com aviso; não há regra de horário de check-in.
- O indicador "Check-in" da suíte considera apenas as reservas carregadas pelo calendário (mesma consulta atual, limite 250).
- A lista de reservas do calendário já inclui hóspedes, suíte, regime e parceiro; a lista de suítes já inclui camas. Nenhuma consulta nova é necessária.
- Rótulos e mensagens em português, como o restante do `web`.
- Os valores HEX derivados das cores OKLCH do brand-design-specialist serão verificados com conversor; os tokens canônicos são os OKLCH.
