# Feature Specification: Seleção de Período por Arraste no Calendário e Nova Reserva em Modal

**Feature Branch**: `031-calendar-range-selection`

**Created**: 2026-11-12

**Status**: Ready for Planning

**Input**: User description: "O usuário, no calendário de reservas, pode clicar, segurar o mouse e arrastar de uma celula a outra (de uma data inicial até uma data final). Essa função de arraste só deve funcionar na linha de uma suíte, e não deve passar para outra suíte. Com esse período selecionado, deve conseguir criar uma nova reserva (botão disponível na barra de ações). Abrir um modal grande com um formulário identico ao que temos na página exclusiva de criação de reserva. Ao selecionar, o período selecionado deve ter um tom claro de azul (seguindo a paleta disponível da aplicação), acionar o agente brand-design-specialist para entender qual o melhor tom para isso. Essa seleção não é necessário ser persistida. E qualquer clique fora do calendário a remove."

**Scope**: Hotel (web, equipe do hotel). Sem escopo de Plataforma. Pacote afetado: `web`. `api` e `packages/.contracts` não mudam (endpoints `GET /reservas/disponibilidade` e `POST /reservas` e os tipos `CreateReservaPayload`, `QuartoDisponivel`, `ReservaConflitoErro` já existem; na revisão "regimes por suíte" o formulário também consome `GET /quartos` e `GET /tarifarios` existentes, com os tipos `Quarto` e `Tarifario` já existentes).

## Atores

- **Operador do hotel** (recepcionista, gerente): usuário autenticado no `web` que já tem acesso a `/reservas/calendario` e a `/reservas/nova`. Nenhuma permissão nova é criada; quem pode acessar o calendário e criar reserva pela página dedicada pode usar o fluxo do modal.

## Estados da seleção (UI efêmera, não persistida)

| Estado | Entrada | Saída |
|---|---|---|
| `inativa` | carga da página; clique fora da região do calendário; tecla Esc; navegação de datas; reserva criada com sucesso; soltar o mouse na mesma célula de início | `arrastando` ao pressionar o botão principal do mouse em uma área livre de uma célula de dia |
| `arrastando` | pressionar o mouse em área livre de célula de dia | `selecionada` ao soltar o mouse em coluna diferente da inicial; `inativa` ao soltar na mesma coluna inicial |
| `selecionada` | soltar o mouse com ao menos 2 dias distintos | `arrastando` ao pressionar em outra área livre (nova seleção substitui a anterior); `inativa` pelas saídas listadas acima |

A seleção tem: suíte (linha de origem), dia inicial e dia final (normalizados em ordem cronológica, independente do sentido do arraste).

## Clarifications

### Session 2026-11-12

- Q: Como o intervalo arrastado vira check-in/check-out? → A: dia mais antigo = `check_in`, dia mais recente = `check_out` (a célula final é o dia de saída, igual à forma como as barras de reserva já terminam no dia de check-out). Mínimo de 2 dias distintos (1 diária).
- Q: O modal pré-preenche a suíte? → A: Sim. Datas são preenchidas; a suíte da linha é a "suíte preferida" e é marcada automaticamente quando aparece no resultado da disponibilidade.
- Q: Arrastar a partir de uma barra de reserva existente? → A: Não. Pressionar sobre uma barra de reserva mantém o comportamento atual (abrir detalhes). O arraste só começa em área livre da célula, mas pode passar sobre dias ocupados.
- Q: O que acontece após salvar no modal? → A: Toast de sucesso, modal fecha, seleção é removida e o calendário recarrega as reservas. Não há navegação (a página `/reservas/nova` continua navegando para o detalhe).
- Cor da seleção: decidida pelo brand-design-specialist (família de tokens `range-selection`, hue 230, ver FR-007).

### Revisão 2026-11-12 (correção visual solicitada)

- Pedido: "O drag no período ainda está bugado. Não tem cor no centro da seleção e a seleção ocupa todo o espaço da celula no inicio e no fim do período (deveria ser a metade, assim como na reserva efetivada). A celula do meio, nem seleção tem." → A: o destaque passa a ter a mesma geometria da barra de reserva efetivada (`reservation_cell.tsx`): início só na parte direita da célula (check-in), fim só na parte esquerda (check-out), dias internos na célula inteira; sem contorno (`ring`) nas extremidades; preenchimento contínuo do início ao fim. Os tokens `--range-selection*` foram reforçados (mesmo hue 230) para que o meio da seleção se distinga das linhas da grade. FR-007, SC-004, o Independent Test e o cenário 1 da US1 foram atualizados.

### Revisão 2026-11-12 (cor única e cursor apenas sobre a reserva)

- Pedido: "Precisa corrigir a diferença de cores. O cursor quando entra na celula, já muda para o pointer. Deve mudar para o pointer apenas quando estiver em cima da reserva." → A: início, meio e fim da seleção usam o mesmo tom (`bg-range-selection`, o mais claro); não existe mais tom "forte" nas extremidades e o token `--range-selection-strong` foi removido. A geometria não muda. O `td` da célula de dia não usa mais `cursor-pointer` (nem quando tem reservas): o cursor `pointer` aparece apenas sobre a barra de reserva; a área livre da célula, onde o arraste começa, mantém o cursor padrão. FR-007, novo FR-019, SC-004, o Independent Test e o cenário 1 da US1 foram atualizados.

### Revisão 2026-11-12 (regimes por suíte e rolagem do modal)

- Pedido: "Caso o formulário de nova reserva seja aberto com o período e a suíte selecionada, mostrar apenas os regimes de alimentação disponíveis para aquela suíte. Caso o formulário de nova reserva seja aberto sem o período e sem a suíte selecionada, mostrar todos os regimes de alimentação disponíveis e carregar as suítes disponíveis em seguida. O scroll do modal de reservas deve ser escondido, embora deva manter o comportamento." → A: com suíte preferida, o Passo 3 lista só os regimes ativos que têm tarifário ativo para a categoria da suíte (categoria obtida em `GET /quartos`, regimes em `GET /tarifarios?categoria_quarto_id=…&ativo=true`), com texto de carregamento durante a consulta e mensagem própria quando a suíte não tem regime; sem suíte preferida (modal sem seleção ou página `/reservas/nova`), lista todos os regimes ativos e nunca consulta `/tarifarios`. A grade de regimes passa a aparecer antes de as datas serem informadas (antes só com diárias > 0); as suítes continuam vindo da consulta de disponibilidade (Passo 4) depois de datas, regime e pessoas. O período não filtra regimes (o endpoint de tarifários não tem filtro de data; a disponibilidade valida as datas). O `DialogContent` mantém a rolagem vertical (`overflow-y-auto`) com a barra de rolagem oculta (utility `scrollbar-none`). Sem mudança em `api`, `packages/.contracts` ou schemas. FR-010, FR-011, FR-017, o Independent Test e os cenários 1, 9 e 10 da US3, Edge Cases, Key Entities e Assumptions foram atualizados; novos cenários US3 11-14, US4 3 e FR-020 a FR-024.
- Correção (rodada 1 da revisão acima): `carregandoRegimes` passa a valer `true` enquanto a lista de regimes ativos carrega em todos os casos (com ou sem suíte) e, com suíte, também enquanto `GET /quartos` ou `GET /tarifarios` carregam; nesse intervalo `regimes` é sempre `[]` (fecha a janela em que a lista completa aparecia enquanto `/quartos` carregava). Novo `erroRegimes`: erro em `/regimes_alimentacao` ou, com suíte, em `/quartos`/`/tarifarios` falha fechado (bloco `role="alert"` "Não foi possível carregar os regimes de alimentação.", sem lista). A mensagem "Nenhum regime..." só aparece após carga bem-sucedida sem regimes (some o "piscar" da mensagem de vazio em `/reservas/nova`, restaurando FR-017). Sem suíte, o texto de carregamento é "Consultando regimes disponíveis...". Query keys com prefixo de domínio: `['quartos','para_regimes','lista']` e `['tarifarios','ativos_da_categoria', categoriaId]`. FR-020, FR-021, FR-022, novo FR-025, Edge Cases e Assumptions atualizados.

### Revisão 2026-11-12 (regime e suíte pré-selecionados)

- Pedido: "Quando abrir o modal de nova reserva e ele tiver o período e a suíte selecionada, o primeiro de alimentação disponível deve vir selecionado e a suíte também deve vir selecionada." → A: com suíte preferida e período válido (`check_in < check_out`), assim que os regimes terminam de carregar sem erro, o formulário marca automaticamente o **primeiro** regime da lista do Passo 3 (a lista já filtrada pela categoria da suíte, na ordem retornada pela API), uma única vez por abertura do modal e só se nenhum regime estiver marcado. A suíte não é setada diretamente: com o regime marcado, a consulta de disponibilidade existente roda e o efeito da suíte preferida (FR-013) a marca quando ela vem na disponibilidade (senão, o aviso de indisponibilidade aparece). Sem suíte, sem período válido, com lista vazia, carregando ou com erro, nada é pré-selecionado. O operador pode escolher outro regime depois; essa escolha é mantida (o primeiro não é re-aplicado) e a suíte preferida é marcada de novo se estiver disponível. O cenário 2 da US3 (antes "escolher regime → suíte marcada") passa a acontecer sem clique; o cenário 5 (mensagens de validação) passa a valer para o formulário sem pré-seleção. Independent Test e cenários 2, 5 e 11 da US3, FR-011, FR-017, Edge Cases e Assumptions atualizados; novos cenários US3 15-19 e FR-026 a FR-028.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Selecionar um período por arraste na linha de uma suíte (Priority: P1)

Como operador do hotel, quero clicar, segurar e arrastar sobre os dias de uma suíte no calendário para marcar visualmente um período, sem que a seleção vaze para outra suíte.

**Why this priority**: É a base da feature; sem a seleção não há atalho para criar reservas pelo calendário.

**Independent Test**: Abrir `/reservas/calendario`, pressionar o mouse na célula do dia D da suíte 101, mover até o dia D+3 (inclusive passando o ponteiro sobre a linha da suíte 102) e soltar. Verificar que apenas as células D..D+3 da suíte 101 ficam destacadas em azul com preenchimento contínuo de D a D+3: D+1 e D+2 preenchidas na célula inteira, D apenas na parte direita (check-in) e D+3 apenas na parte esquerda (check-out), todas no mesmo tom e com a mesma geometria da barra de uma reserva efetivada; nenhuma célula da 102 fica destacada. Passar o ponteiro sobre a área livre de uma célula mantém o cursor padrão; sobre a barra de uma reserva o cursor vira `pointer`.

**Acceptance Scenarios**:

1. **Given** o calendário carregado com as suítes 101 e 102, **When** o operador pressiona o mouse numa área livre do dia D na linha 101, move até D+3 e solta, **Then** as células D, D+1, D+2 e D+3 da linha 101 exibem o destaque de seleção (D+1 e D+2 com preenchimento na célula inteira; D só na parte direita e D+3 só na parte esquerda, todas no mesmo tom, com a mesma geometria da barra de reserva efetivada, sem contorno), formando uma faixa contínua de cor uniforme, e nenhuma outra célula exibe destaque.
2. **Given** um arraste iniciado na linha 101, **When** o ponteiro passa sobre células da linha 102, **Then** a seleção continua na linha 101 e o dia final acompanha a coluna sob o ponteiro.
3. **Given** um arraste iniciado no dia D+5, **When** o operador arrasta para trás até D+2 e solta, **Then** a seleção cobre D+2..D+5 (normalizada).
4. **Given** um arraste em andamento, **When** o operador solta o mouse fora da tabela, **Then** a seleção é finalizada com o último dia visível que estava sob o ponteiro.
5. **Given** o operador pressiona e solta o mouse na mesma célula, **When** o mouse é solto, **Then** nenhuma seleção permanece (seleção exige no mínimo 2 dias).
6. **Given** uma célula com barra de reserva, **When** o operador clica na barra, **Then** o modal "Detalhes da Reserva" abre como hoje e nenhuma seleção é iniciada.
7. **Given** uma seleção existente na linha 101, **When** o operador inicia um novo arraste na linha 102, **Then** a seleção anterior é substituída pela nova.
8. **Given** uma célula de dia com uma barra de reserva, **When** o operador passa o ponteiro sobre a área livre da célula e depois sobre a barra, **Then** o cursor é o padrão na área livre e `pointer` apenas sobre a barra (o mesmo vale para células sem reserva: cursor padrão).

---

### User Story 2 - Remover a seleção ao clicar fora do calendário (Priority: P1)

Como operador, quero que qualquer clique fora do calendário limpe a seleção, para que ela nunca fique "presa" na tela.

**Why this priority**: Requisito explícito; a seleção é efêmera e não pode confundir o operador.

**Independent Test**: Criar uma seleção, clicar na barra lateral (ou no título "Calendário", ou nos botões de navegação de datas) e verificar que nenhuma célula continua destacada. Repetir clicando no botão "Nova Reserva" e verificar que a seleção continua.

**Acceptance Scenarios**:

1. **Given** uma seleção ativa, **When** o operador clica em qualquer ponto fora da região do calendário (grade + barra de ações inferior), **Then** a seleção é removida.
2. **Given** uma seleção ativa, **When** o operador clica em "Dia anterior", "Próximo dia", "Voltar 15 dias", "Avançar 15 dias" ou escolhe outro mês, **Then** a seleção é removida.
3. **Given** uma seleção ativa, **When** o operador clica no botão "Nova Reserva" da barra de ações, **Then** a seleção permanece e o modal abre.
4. **Given** uma seleção ativa e o modal de nova reserva aberto, **When** o operador interage com o formulário do modal, **Then** a seleção permanece.
5. **Given** uma seleção ativa e nenhum modal aberto, **When** o operador pressiona Esc, **Then** a seleção é removida.
6. **Given** uma seleção ativa, **When** o operador recarrega a página, **Then** nenhuma seleção é exibida (não persistida).

---

### User Story 3 - Criar reserva em modal a partir da seleção (Priority: P1)

Como operador, quero clicar em "Nova Reserva" na barra de ações com o período selecionado e preencher, num modal grande, o mesmo formulário da página de nova reserva, já com as datas e a suíte, para criar a reserva sem sair do calendário.

**Why this priority**: Entrega o valor de negócio (criar reserva mais rápido pelo mapa).

**Independent Test**: Selecionar D..D+3 na suíte 101, clicar em "Nova Reserva", verificar que o modal "Nova Reserva" mostra check-in = D e check-out = D+3 e, no Passo 3, apenas os regimes com tarifário ativo para a categoria da suíte 101, com o primeiro deles já marcado ("Selecionado ✓") e a suíte 101 já marcada sem nenhum clique, preencher apenas o titular, salvar e verificar o toast "Reserva RES-XXXX cadastrada com sucesso!", o fechamento do modal, a remoção da seleção e que a requisição de criação enviou `quarto_id` da suíte 101 sem `hotel_id` no corpo.

**Acceptance Scenarios**:

1. **Given** uma seleção D..D+3 na suíte 101, **When** o operador clica em "Nova Reserva", **Then** abre um modal grande com título "Nova Reserva" contendo exatamente as mesmas seções, campos, rótulos e validações da página `/reservas/nova` (Passo 1 a Passo 5, Cupom de Desconto), com check-in = D e check-out = D+3 preenchidos; a única diferença de conteúdo é a lista de regimes do Passo 3, restrita à suíte preferida (cenário 11).
2. **Given** uma seleção D..D+3 na suíte 101 cuja categoria tem ao menos um regime, **When** o operador abre o modal sem clicar em nenhum regime, **Then** o primeiro regime listado no Passo 3 fica marcado ("Selecionado ✓"), a disponibilidade é consultada com esse regime e, quando retorna a suíte 101, a categoria da 101 fica ativa e a suíte 101 fica selecionada automaticamente (resumo "Proposta selecionada: Suíte 101 ..."); falta apenas o titular para salvar.
3. **Given** o modal aberto a partir da suíte 101, **When** a disponibilidade carregada não inclui a suíte 101, **Then** o formulário exibe o aviso "A suíte 101 não está disponível para os critérios informados. Escolha outra suíte." e nenhuma suíte fica marcada.
4. **Given** o formulário válido no modal, **When** o operador clica em "Salvar", **Then** a reserva é criada, aparece o toast de sucesso, o modal fecha, a seleção é removida e o calendário recarrega as reservas (a nova reserva aparece se seu status for exibível).
5. **Given** o formulário sem pré-seleção (modal aberto sem seleção ou página `/reservas/nova`) com campos obrigatórios vazios, **When** o operador clica em "Salvar", **Then** as mensagens de validação da página (ex.: "Selecione um regime de alimentação.", "Selecione uma suíte disponível.") aparecem no modal e nada é enviado.
6. **Given** a API responde 409 (suíte já reservada no período), **When** o operador salva, **Then** o modal de conflito existente abre sobre o modal com as alternativas, e escolher uma alternativa marca a nova suíte no formulário do modal.
7. **Given** a API responde outro erro (4xx/5xx), **When** o operador salva, **Then** aparece `toast.error` com a mensagem da API (ou "Erro ao cadastrar reserva.") e o modal permanece aberto com os dados.
8. **Given** o modal aberto, **When** o operador clica em "Cancelar", no X ou pressiona Esc, **Then** o modal fecha sem confirmação, os dados digitados são descartados e a seleção permanece.
9. **Given** nenhuma seleção ativa, **When** o operador clica em "Nova Reserva", **Then** o modal abre com o formulário vazio (mesmos padrões da página), com todos os regimes ativos visíveis no Passo 3.
10. **Given** a página `/reservas/nova`, **When** o operador a usa, **Then** o comportamento é idêntico ao do modal sem seleção (todos os regimes ativos, grade de regimes visível antes das datas), incluindo navegação para `/reservas/:id` após salvar.
11. **Given** uma seleção D..D+3 na suíte 101, cuja categoria tem tarifário ativo apenas para "Pensão Completa", e o hotel com os regimes ativos "Pensão Completa" e "Meia Pensão", **When** o operador abre o modal, **Then** enquanto a consulta roda o Passo 3 exibe "Consultando regimes disponíveis para a suíte..." (sem mostrar a lista completa nem a mensagem de vazio) e, ao terminar, lista apenas "Pensão Completa" (já marcado, cenário 2); se a categoria não tiver nenhum tarifário ativo, exibe "Nenhum regime de alimentação disponível para esta suíte.".
12. **Given** nenhuma seleção ativa, **When** o operador abre o modal, **Then** o Passo 3 lista todos os regimes ativos ("Pensão Completa" e "Meia Pensão"), nenhuma requisição a `GET /tarifarios` é feita e, se não houver regime ativo, exibe "Nenhum regime de alimentação ativo cadastrado.".
13. **Given** o formulário aberto sem datas informadas, **When** o operador olha o Passo 3, **Then** a grade de regimes já está visível e selecionável; o Passo 4 só carrega as suítes disponíveis depois de datas válidas, regime e pessoas.
14. **Given** o modal aberto com conteúdo mais alto que 90% da janela, **When** o operador rola com a roda do mouse, teclado ou toque, **Then** o conteúdo rola verticalmente e nenhuma barra de rolagem é exibida.
15. **Given** o modal aberto com seleção na suíte 101, com o primeiro regime e a suíte 101 já marcados (cenário 2), **When** o operador preenche apenas "Nome Completo *" e clica em "Salvar", **Then** o `POST /reservas` envia `regime_alimentacao_id` do primeiro regime e `quarto_id` da suíte 101, sem `hotel_id`, e nenhuma mensagem "Selecione um regime de alimentação." ou "Selecione uma suíte disponível." aparece.
16. **Given** o modal aberto sem seleção (ou a página `/reservas/nova`), ou um formulário com suíte preferida mas sem período válido (`check_in < check_out`), **When** os regimes terminam de carregar, **Then** nenhum regime fica marcado (nenhum "Selecionado ✓"), a disponibilidade não é consultada e nenhuma suíte fica marcada.
17. **Given** uma seleção numa suíte cuja categoria não tem nenhum tarifário ativo, **When** o operador abre o modal, **Then** o Passo 3 exibe "Nenhum regime de alimentação disponível para esta suíte.", nenhum regime é marcado e a disponibilidade não é consultada.
18. **Given** o modal aberto com o primeiro regime e a suíte 101 pré-selecionados, **When** o operador clica em outro regime, **Then** esse regime fica marcado, `quarto_id` é limpo, a disponibilidade é consultada com o novo regime e a suíte 101 é marcada de novo se vier na disponibilidade (senão, o aviso do cenário 3); o primeiro regime nunca é re-aplicado durante essa abertura. Clicar no regime já marcado mantém a suíte 101 selecionada (é limpa e marcada de novo).
19. **Given** o Passo 3 com os regimes carregando, **When** o operador olha o Passo 3, **Then** vê "Consultando regimes disponíveis para a suíte..." (com suíte preferida) ou "Consultando regimes disponíveis..." (sem), sem lista, sem mensagem de vazio e sem pré-seleção. **Given** que `GET /regimes_alimentacao` falha (ou, com suíte preferida, `GET /quartos` ou `GET /tarifarios` falham), **Then** o Passo 3 mostra um bloco `role="alert"` "Não foi possível carregar os regimes de alimentação.", sem lista, sem mensagem de vazio e sem pré-seleção (falha fechada).

---

### User Story 4 - Isolamento entre hotéis (Priority: P1)

Como hotel, quero que a seleção e a criação pelo modal só envolvam suítes do meu hotel.

**Why this priority**: Vazamento entre hotéis é bug crítico de segurança.

**Independent Test**: Logado no hotel A, o calendário lista apenas suítes de A (vindas de `GET /quartos` escopado por JWT); a criação pelo modal envia `POST /reservas` sem `hotel_id` no corpo e a API grava com o `hotel_id` do JWT. Uma suíte de outro hotel informada como suíte preferida não é marcada porque não aparece na disponibilidade do hotel A.

**Acceptance Scenarios**:

1. **Given** o operador do hotel A, **When** cria a reserva pelo modal, **Then** o corpo da requisição não contém `hotel_id` e só contém `quarto_id` de uma suíte retornada pela disponibilidade do hotel A.
2. **Given** uma suíte preferida que não pertence ao hotel A (não presente na disponibilidade), **When** a disponibilidade carrega, **Then** a suíte não é marcada e o aviso de indisponibilidade é exibido.
3. **Given** o modal aberto com suíte preferida, **When** o formulário resolve os regimes da suíte, **Then** as consultas `GET /quartos` e `GET /tarifarios` não enviam `hotel_id` (escopo vem do JWT na API).

### Edge Cases

- Arraste além do último/primeiro dia visível: o dia final fica limitado aos dias visíveis; não há rolagem automática nem avanço de datas.
- Redimensionar a janela durante uma seleção altera a quantidade de dias visíveis: a seleção é mantida pelas datas; se sair da área visível, apenas a parte visível é destacada.
- Período sobre dias já reservados: permitido; a disponibilidade/409 da API é a fonte da verdade.
- Suíte bloqueada (`status: 'N'`): seleção permitida; a disponibilidade não a retorna e o aviso da US3 cenário 3 aparece.
- Datas passadas: sem regra nova; vale o que a página e a API já fazem.
- Botão direito ou do meio do mouse: não inicia seleção.
- Arraste não seleciona texto da página (seleção nativa de texto suprimida durante o arraste).
- Clique em "Nova Reserva" quando a seleção tem menos de 2 dias: impossível por definição (seleção de 1 dia é descartada); abre formulário vazio.
- Exclusão com dependentes (409 em delete): não se aplica, a feature não exclui nada.
- Suíte preferida cuja categoria não tem tarifário ativo: Passo 3 exibe "Nenhum regime de alimentação disponível para esta suíte." (nunca cai para a lista completa), nada é pré-selecionado; o operador pode fechar o modal e escolher outra suíte.
- Suíte preferida fora das primeiras 250 suítes de uma resposta **bem-sucedida** de `GET /quartos` (categoria não resolvida): o Passo 3 mostra todos os regimes ativos (fallback) e, por consequência, o primeiro regime ativo é pré-selecionado (FR-026; ver Assumptions); a disponibilidade do Passo 4 continua sendo a fonte da verdade (se a suíte não vier, aparece o aviso da US3 cenário 3).
- Erro ao carregar regimes (`GET /regimes_alimentacao`, ou com suíte `GET /quartos`/`GET /tarifarios`): falha fechada; bloco `role="alert"` "Não foi possível carregar os regimes de alimentação.", sem lista, sem fallback para todos os regimes e sem pré-seleção (FR-025). Se uma nova tentativa automática da consulta tiver sucesso na mesma abertura, a lista aparece e a pré-seleção roda (uma vez).
- Suíte preferida com período inválido ou ausente (só alcançável fora do calendário, que sempre passa 2+ dias): nenhuma pré-seleção de regime (FR-027).
- Operador altera as datas depois da pré-seleção: o regime marcado permanece (não é re-escolhido); a disponibilidade é reconsultada e a suíte preferida é re-marcada se disponível.
- Vários tarifários do mesmo regime para a categoria: o regime aparece uma única vez.
- Regime com tarifário mas inativo: não aparece (só regimes ativos são listados).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O calendário DEVE permitir iniciar uma seleção pressionando o botão principal do mouse sobre a área livre de uma célula de dia de uma suíte; pressionar sobre uma barra de reserva NÃO inicia seleção e mantém a abertura de detalhes.
- **FR-002**: Durante o arraste, a seleção DEVE ficar travada na linha (suíte) de origem; o dia final DEVE acompanhar a coluna da célula sob o ponteiro, inclusive quando o ponteiro está sobre outra linha.
- **FR-003**: Ao soltar o mouse (em qualquer lugar da janela), a seleção DEVE ser finalizada; se início e fim forem o mesmo dia, a seleção DEVE ser descartada.
- **FR-004**: A seleção DEVE ser normalizada em ordem cronológica e limitada aos dias visíveis.
- **FR-005**: A seleção DEVE ser removida ao clicar fora da região do calendário (grade + barra de ações inferior), ao usar a navegação de datas ou o seletor de mês/ano, ao pressionar Esc sem modal aberto, e após criar uma reserva com sucesso. Cliques dentro de modais abertos a partir do calendário NÃO removem a seleção.
- **FR-006**: A seleção NÃO DEVE ser persistida (nem URL, nem storage, nem servidor).
- **FR-007**: O destaque DEVE usar a família de tokens `range-selection` decidida pelo brand-design-specialist: todos os dias selecionados (início, internos e fim) usam o mesmo tom `bg-range-selection`, sem tom diferente nas extremidades; dias internos ocupam a célula inteira; dia de início apenas na parte direita da célula (check-in, arredondado à esquerda) e dia de fim apenas na parte esquerda (check-out, arredondado à direita), com exatamente a mesma geometria (posição, largura, altura) da barra de uma reserva efetivada no mesmo dia, de modo que seleção e barras se alinhem. Não há contorno (`ring`) nas extremidades; o preenchimento é contínuo do início ao fim. O preenchimento dos dias internos DEVE ser visualmente distinguível do fundo das linhas da grade (`bg-muted`). O destaque é uma camada decorativa (`aria-hidden`) abaixo das barras de reserva; as barras continuam visíveis e clicáveis por cima. Se algum texto for renderizado sobre células selecionadas, ele usa `text-range-selection-foreground` (hoje o overlay não renderiza texto). Funciona em tema claro e escuro.
- **FR-008**: Cada célula de dia DEVE expor seu estado de seleção de forma verificável (`data-selection` = `start` | `middle` | `end`, ausente quando não selecionada) e o calendário DEVE anunciar o período para leitores de tela numa região `role="status"` com o texto "Período selecionado: Suíte {identificacao}, de DD/MM/AAAA a DD/MM/AAAA" (vazia quando não há seleção).
- **FR-009**: O botão "Nova Reserva" da barra de ações DEVE abrir o modal de nova reserva, com ou sem seleção.
- **FR-010**: O modal DEVE ser grande (largura próxima à da página de formulário, rolagem vertical interna com a barra de rolagem oculta conforme FR-024, altura máxima de 90% da janela), título "Nova Reserva", botões "Salvar" e "Cancelar".
- **FR-011**: O formulário do modal e o da página `/reservas/nova` DEVEM ser o mesmo componente compartilhado (mesmas seções, campos, rótulos, validação, consultas, mensagens e fluxo de conflito 409). Apenas o invólucro (página vs modal), a ação pós-sucesso e, quando há suíte preferida, a lista de regimes do Passo 3 (FR-020) e a pré-seleção do primeiro regime (FR-026) diferem.
- **FR-012**: Com seleção ativa, o modal DEVE abrir com `check_in` = dia inicial e `check_out` = dia final (formato `AAAA-MM-DD`) e a suíte da linha como suíte preferida.
- **FR-013**: A suíte preferida DEVE ser marcada automaticamente quando a disponibilidade carregada a contiver e nenhuma suíte estiver marcada; se a disponibilidade carregada não a contiver, o formulário DEVE exibir o aviso "A suíte {identificacao} não está disponível para os critérios informados. Escolha outra suíte.".
- **FR-014**: Após sucesso no modal: `toast.success("Reserva {codigo} cadastrada com sucesso!")`, fechar o modal, remover a seleção e invalidar as consultas de reservas para o calendário recarregar. Sem navegação.
- **FR-015**: Em 409 DEVE abrir o `ModalConflitoReserva` existente; em outros erros DEVE exibir `toast.error` com a mensagem da API ou "Erro ao cadastrar reserva." e manter o modal aberto.
- **FR-016**: Fechar o modal (Cancelar, X, Esc, clique no overlay) DEVE descartar os dados sem confirmação e manter a seleção.
- **FR-017**: A página `/reservas/nova` DEVE manter exatamente o comportamento atual após a extração do formulário, exceto pela grade de regimes visível antes das datas (FR-023); a página não passa suíte preferida, lista todos os regimes ativos (FR-022), nunca pré-seleciona regime (FR-027) e não exibe a mensagem de vazio enquanto os regimes carregam (FR-021).
- **FR-018**: A criação DEVE usar o endpoint existente; o `hotel_id` vem só do JWT e nunca é enviado pelo front-end.
- **FR-019**: O cursor `pointer` DEVE aparecer apenas sobre a barra de uma reserva (`ReservationCell`, clicável para abrir detalhes). A célula de dia (`td`) NÃO DEVE usar `cursor-pointer`, tenha ou não reservas; a área livre da célula, onde o arraste começa, mantém o cursor padrão.
- **FR-020**: Com suíte preferida, o Passo 3 DEVE listar apenas os regimes de alimentação ativos que aparecem (sem repetição) em algum tarifário ativo da categoria da suíte: a categoria vem da suíte na lista `GET /quartos` (`limite=250`) e os tarifários de `GET /tarifarios` com `categoria_quarto_id`, `ativo=true`, `limite=250`. Se a categoria não tiver regime, DEVE exibir "Nenhum regime de alimentação disponível para esta suíte.". O período NÃO filtra regimes. Se a categoria não puder ser resolvida (suíte ausente de uma resposta bem-sucedida de `GET /quartos`), DEVE mostrar todos os regimes ativos; erros seguem FR-025.
- **FR-021**: Enquanto `GET /regimes_alimentacao` carrega (com ou sem suíte preferida) e, com suíte preferida, também enquanto `GET /quartos` ou `GET /tarifarios` carregam, o Passo 3 DEVE exibir "Consultando regimes disponíveis para a suíte..." (com suíte preferida) ou "Consultando regimes disponíveis..." (sem) e NÃO DEVE exibir nenhuma lista de regimes nem a mensagem de vazio (o hook expõe `carregandoRegimes = true` e `regimes = []`).
- **FR-022**: Sem suíte preferida (modal sem seleção e página `/reservas/nova`), o Passo 3 DEVE listar todos os regimes ativos sem consultar `GET /quartos` nem `GET /tarifarios`; sem nenhum regime ativo após uma carga bem-sucedida, DEVE exibir "Nenhum regime de alimentação ativo cadastrado." (as mensagens de vazio, com ou sem suíte, só aparecem após carga bem-sucedida, nunca durante o carregamento ou em erro). As suítes disponíveis (Passo 4) DEVEM ser carregadas em seguida pela consulta de disponibilidade existente, quando datas válidas, regime e pessoas estiverem definidos.
- **FR-023**: A grade de regimes do Passo 3 DEVE estar visível e selecionável mesmo antes de as datas serem informadas (não depende de diárias > 0). O texto de apoio não menciona o período ("Selecione o plano de refeições desejado para carregar as acomodações com tarifários vigentes:").
- **FR-024**: O conteúdo do modal "Nova Reserva" DEVE continuar rolável verticalmente (roda do mouse, teclado, toque) com a barra de rolagem oculta em todos os navegadores (utility `scrollbar-none`: `scrollbar-width: none`, `-ms-overflow-style: none`, `::-webkit-scrollbar { display: none }`).
- **FR-025**: Se `GET /regimes_alimentacao` falhar, ou, com suíte preferida, `GET /quartos` ou `GET /tarifarios` falharem, o Passo 3 DEVE falhar fechado: exibir um bloco `role="alert"` com "Não foi possível carregar os regimes de alimentação.", NÃO exibir lista de regimes (nem o fallback de todos os regimes), NÃO exibir mensagem de vazio e NÃO pré-selecionar regime (o hook expõe `erroRegimes = true` e `regimes = []`).
- **FR-026**: Com suíte preferida e período válido (`check_in` e `check_out` preenchidos e `check_in < check_out`), quando os regimes terminam de carregar sem erro e a lista tem ao menos um regime, o formulário DEVE marcar automaticamente o primeiro regime da lista do Passo 3 (`regimes[0]` de `useNovaReservaOpcoes`, ou seja, a ordem retornada por `GET /regimes_alimentacao` filtrada pelos tarifários da categoria da suíte), com validação (`setValue(..., { shouldValidate: true })`), somente se nenhum regime estiver marcado. A pré-seleção acontece no máximo uma vez por formulário montado (uma vez por abertura do modal). A suíte NÃO é setada pela pré-seleção: a consulta de disponibilidade existente roda com o regime marcado e a suíte preferida é marcada por FR-013.
- **FR-027**: A pré-seleção de regime NÃO DEVE acontecer sem suíte preferida (modal sem seleção, página `/reservas/nova`), sem período válido, com lista de regimes vazia, enquanto os regimes carregam (FR-021) ou em erro (FR-025).
- **FR-028**: Depois da pré-seleção, a escolha do operador DEVE prevalecer: clicar em outro regime o marca e limpa `quarto_id` (comportamento existente); o primeiro regime NÃO DEVE ser re-aplicado na mesma abertura; a suíte preferida volta a ser marcada por FR-013 se vier na disponibilidade do novo regime. O regime marcado exibe "Selecionado ✓".

### Key Entities

- **Seleção de período** (estado de UI, não persistido): suíte (id e identificação), dia inicial, dia final. Derivados: `check_in`, `check_out`, quantidade de diárias.
- **Valores iniciais da nova reserva**: `check_in`, `check_out` e suíte preferida opcionais passados ao formulário compartilhado.
- **Regimes da suíte preferida** (derivado, não persistido): interseção dos regimes ativos do hotel com os `regime_alimentacao_id` distintos dos tarifários ativos da categoria da suíte. Entidades existentes consumidas: `Quarto` (`categoria_id`), `Tarifario` (`categoria_quarto_id`, `regime_alimentacao_id`, `ativo`), `RegimeAlimentacao`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Um operador cria uma reserva a partir do calendário sem sair da página, em no máximo 1 arraste + 1 clique para abrir o formulário com datas, primeiro regime e suíte já preenchidos (quando a suíte tem regime e está disponível), restando apenas os dados do titular.
- **SC-002**: 100% dos arrastes que cruzam linhas mantêm o destaque somente na suíte de origem.
- **SC-003**: 100% dos cliques fora da região do calendário removem a seleção; 0% dos cliques no botão "Nova Reserva" ou dentro do modal a removem.
- **SC-004**: O destaque de seleção é perceptível e distinto das barras de reserva e do fundo das linhas da grade em tema claro e escuro, inclusive nos dias internos; início, meio e fim têm exatamente a mesma cor (sem diferença de tom); as extremidades ocupam a mesma fração da célula que a barra de reserva efetivada; as barras permanecem clicáveis sobre células selecionadas; e o cursor `pointer` aparece somente sobre as barras de reserva.
- **SC-005**: Os testes existentes da página `/reservas/nova` e do calendário continuam passando sem alteração de comportamento.

## Assumptions

- O intervalo vira `check_in` (dia mais antigo) e `check_out` (dia mais recente, célula final = dia de saída), consistente com a renderização das barras; mínimo de 1 diária.
- Interação apenas por mouse (ponteiro do tipo mouse). Toque e seleção por teclado ficam fora do escopo; o botão "Nova Reserva" continua acessível por teclado e abre o formulário vazio.
- Sem nova permissão: o acesso segue as regras atuais do calendário e da criação de reserva.
- O modal não navega após salvar; a página continua navegando para `/reservas/:id`.
- Fechar o modal não pede confirmação de descarte (alinha com os modais existentes do `web`).
- Esc limpa a seleção quando nenhum modal está aberto (complemento razoável ao "clique fora").
- A navegação de datas fica fora da região do calendário e, portanto, limpa a seleção.
- A cor é a definida pelo brand-design-specialist (tokens `--range-selection`, `--range-selection-border`, `--range-selection-foreground` em `:root` e `.dark`), reforçada na revisão de 2026-11-12: claro `oklch(0.85 0.07 230)` / borda `oklch(0.5 0.13 230)`; escuro `oklch(0.4 0.08 230)` / borda `oklch(0.7 0.11 230)`. Na revisão "cor única" o tom forte (`--range-selection-strong`, Tailwind `range-selection.strong`) foi removido por não ser mais usado; todo o overlay usa `bg-range-selection`. Sem contorno nas extremidades, `--range-selection-border` fica definido mas não é usado pelo overlay.
- Cursor: só a barra de reserva (`ReservationCell`) tem `cursor-pointer`; o `td` da célula nunca tem (FR-019). Não há cursor especial (ex.: `crosshair`) para a área livre; fica o padrão do navegador.
- Com o servidor de desenvolvimento (Vite) rodando, uma mudança em `packages/web/tailwind.config.ts` exige reiniciar o Vite para regenerar as utilities; sem isso classes novas como `bg-range-selection` não são geradas e a seleção aparece "sem cor" (sintoma observado antes nesta feature).
- Geometria das extremidades = geometria da barra de reserva efetivada. Hoje `reservation_cell.tsx` usa `w-1/3` (embora o comentário diga "metade"), então o overlay também usa um terço da célula. Ponto em aberto: se o desejado for de fato metade, barra e overlay mudam juntos.
- A causa do meio "sem cor" relatada foi inferida como preenchimento fraco demais (antes ~0,035 de L mais escuro que `bg-muted`), somada às utilities não regeneradas sem reiniciar o Vite. O E2E `calendario_selecao.e2e.ts` roda verde em navegador real (inclui cor uniforme e cursor); a validação manual completa do quickstart (T041, inclui tema escuro) continua pendente.
- Nenhuma mudança em `api` ou `packages/.contracts`.
- Regimes por suíte (revisão 2026-11-12): o período selecionado NÃO filtra os regimes, porque `GET /tarifarios` não tem filtro por data; um regime com tarifário na categoria mas sem tarifa vigente nas datas aparece no Passo 3 e a disponibilidade (Passo 4) é quem valida as datas.
- A categoria da suíte preferida é resolvida na primeira página de `GET /quartos` com `limite=250` (máximo do contrato de paginação). Se a suíte não estiver numa resposta bem-sucedida, a categoria não é resolvida e o formulário volta a mostrar todos os regimes ativos (fallback seguro: a disponibilidade continua validando). Erro em `/quartos` não cai no fallback: falha fechada (FR-025).
- A lista de `GET /tarifarios` da categoria inclui tarifários de parceiros (`parceiro_id` preenchido). Por isso um regime vendido só por meio de um parceiro pode aparecer (e ser o pré-selecionado) numa reserva direta, e a escolha de parceiro no Passo 2 não altera a lista de regimes. É coerente com o filtro apenas por categoria; a disponibilidade (Passo 4) continua validando a combinação regime + parceiro + datas.
- Pré-seleção (revisão "regime e suíte pré-selecionados"): "primeiro regime disponível" = primeiro card do Passo 3, isto é, `regimes[0]` do hook na ordem da API de regimes filtrada pela categoria; não há critério de ordenação adicional (ex.: preço ou nome).
- Assumido: quando a categoria da suíte não é resolvida (suíte fora das primeiras 250 de `/quartos`), o fallback para todos os regimes ativos também alimenta a pré-seleção, então o primeiro regime ativo é marcado; se ele não tiver tarifa para a suíte, a disponibilidade não a retorna e o aviso de indisponibilidade aparece.
- A pré-seleção é uma única vez por abertura (flag `useRef` no formulário montado; o modal remonta o formulário a cada abertura). Não há botão de "tentar novamente" no bloco de erro dos regimes.
- Melhoria futura, fora de escopo: filtro por data em `GET /tarifarios` ou um endpoint de regimes por suíte, que eliminariam o fallback e o filtro sem período. Follow-up opcional: resolver a categoria com `quartosService.get(id)` (`GET /quartos/:id`) em vez de paginar 250 suítes, eliminando o fallback por suíte fora da primeira página.
