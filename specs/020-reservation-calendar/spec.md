# Feature Specification: Mapa e Calendário Visual de Ocupação de Reservas por Quarto

**Feature Branch**: `020-reservation-calendar`

**Created**: 2026-11-03

**Status**: Draft

**Input**: User description: "Implementar a tela de Calendário de Reservas (mapa de ocupação) do hotel, permitindo visualizar a ocupação dos quartos em uma grade temporal interativa dia a dia. Incluir navegação ágil de datas (dia anterior/seguinte, 15 dias antes/depois, seletores diretos de mês e ano), cálculo responsivo da quantidade de dias visíveis sem barra de rolagem horizontal desnecessária, células de reserva com divisão visual inteligente para check-in (metade direita) e check-out (metade esquerda), cores de status de quarto e reserva, modal com detalhes completos da hospedagem ao clicar em uma reserva, barra inferior com atalho para nova reserva e isolamento de camada z-index para sobreposição suave da barra lateral."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Visualização do Mapa de Ocupação por Quarto e Linha do Tempo (Priority: P1)

Como recepcionista ou gerente de reservas, quero acessar uma visão matricial onde cada linha represente uma unidade habitacional (quarto) com seu status atual e as colunas representem os dias consecutivos a partir da data de referência, para identificar instantaneamente quais quartos estão ocupados, disponíveis ou em manutenção em qualquer data.

**Why this priority**: O mapa de ocupação (rack de reservas / grid calendário) é a principal ferramenta de trabalho diária da recepção de qualquer hotel para alocação, visualização e conferência de hóspedes.

**Independent Test**: Acessar a rota `/reservas/calendario` (ou `/reservas`), verificar a exibição da lista de quartos no eixo vertical com seus números, categorias e pontos de status (verde/disponível, vermelho/bloqueado, laranja/manutenção, azul/limpeza, roxo/ocupado), com as colunas de datas no eixo horizontal destacando o dia atual em tom diferenciado.

**Acceptance Scenarios**:

1. **Given** que o usuário acessa o calendário de reservas, **When** a página carrega, **Then** a grade de quartos é renderizada exibindo número e tipo do quarto com seu status em coluna fixa à esquerda (`sticky left-0 bg-background z-20 w-[120px]`).
2. **Given** a linha do tempo horizontal, **When** os dias são desenhados, **Then** o cabeçalho superior (`thead sticky top-0 z-20`) exibe o dia da semana abreviado e o dia/mês (`dd/MM`), destacando o dia corrente com fundo em destaque (`bg-primary/10`).
3. **Given** um quarto com status operacional (ex.: em limpeza ou manutenção), **When** o usuário passa o mouse sobre o indicador colorido ao lado do número do quarto, **Then** um tooltip exibe a descrição textual do status do quarto (ex.: "Disponível", "Bloqueado", "Manutenção", "Limpeza", "Ocupado").

---

### User Story 2 - Renderização Inteligente de Células de Reserva e Turnos Consecutivos (Priority: P1)

Como operador de recepção, quero que o calendário represente visualmente o fluxo de chegadas e saídas em uma mesma data, ocupando apenas a metade direita da célula para o dia de check-in e a metade esquerda para o dia de check-out, para que uma saída e uma entrada consecutivas no mesmo quarto e mesmo dia fiquem claramente legíveis lado a lado sem sobreposição.

**Why this priority**: No ciclo hoteleiro, o check-out ocorre pela manhã e o check-in à tarde; a divisão da célula reflete com exatidão a disponibilidade real do quarto naquele dia.

**Independent Test**: Localizar uma reserva na grade e verificar que no dia de check-in a barra colorida ocupa os 50% direitos da célula; nos dias intermediários, preenche 100% da célula; e no dia de check-out, ocupa os 50% esquerdos da célula. Se houver duas reservas no mesmo dia para o mesmo quarto (uma saindo e outra entrando), ambas são visíveis simultaneamente na mesma célula.

**Acceptance Scenarios**:

1. **Given** uma reserva confirmada para o período de dia D1 a D3, **When** a reserva é desenhada na linha do quarto, **Then** no dia D1 a barra ocupa a metade direita (`right-0 w-1/2 rounded-r`), no dia D2 ocupa a largura total (`w-full`), e no dia D3 ocupa a metade esquerda (`left-0 w-1/2 rounded-l`).
2. **Given** que o hóspede A faz check-out no dia D e o hóspede B faz check-in no mesmo dia D no mesmo quarto, **When** a célula do dia D é exibida, **Then** a reserva de saída de A é mostrada na metade esquerda e a reserva de entrada de B é mostrada na metade direita, sem que uma oculte a outra.
3. **Given** as células de reserva na grade, **When** o usuário as visualiza, **Then** o nome do hóspede é exibido de forma legível com a cor representativa da situação da reserva (ex.: Check-in ativo, Confirmada, etc.).

---

### User Story 3 - Navegação Temporal Flexível e Cálculo Responsivo de Dias (Priority: P1)

Como usuário, quero poder avançar ou recuar o calendário dia a dia ou em blocos de 15 dias, bem como selecionar diretamente qualquer mês e ano desejados, com o sistema ajustando automaticamente a quantidade de dias exibidos de acordo com a largura da tela do meu monitor.

**Why this priority**: A recepção precisa consultar tanto a ocupação imediata dos próximos dias quanto reservas de temporadas futuras sem perder tempo com cliques excessivos.

**Independent Test**: Utilizar os botões de avançar/voltar 1 dia e 15 dias, verificar a atualização das colunas de datas; selecionar um mês diferente no dropdown e um ano no campo numérico, verificando o salto imediato do calendário; e redimensionar a janela verificando o recálculo automático do número de dias visíveis (mínimo de 15 dias).

**Acceptance Scenarios**:

1. **Given** a barra de controles no cabeçalho do calendário, **When** o usuário clica em "Próximo dia" ou "Dia anterior", **Then** a data inicial avança ou recua exatamente 1 dia.
2. **Given** a barra de controles, **When** o usuário clica em "Avançar 15 dias" ou "Voltar 15 dias", **Then** a visualização se desloca em 15 dias consecutivos.
3. **Given** os seletores de mês e ano, **When** o usuário escolhe um novo mês no dropdown ou altera o ano, **Then** a data inicial do calendário salta para o primeiro dia daquele mês/ano selecionado (ou para o dia atual se o período for anterior ao dia de hoje).
4. **Given** o redimensionamento da janela do navegador, **When** a largura disponível aumenta ou diminui, **Then** o sistema recalcula dinamicamente a quantidade de dias exibidos (`Math.max(15, Math.floor(availableWidth / minCellWidth))`), garantindo preenchimento ideal sem exigir scroll horizontal desnecessário.

---

### User Story 4 - Consulta aos Detalhes da Reserva em Modal (Priority: P2)

Como recepcionista, quero clicar em qualquer barra de reserva no calendário para abrir um modal detalhado com todos os dados do hóspede, dados da hospedagem, modalidade de pagamento e observações registradas, para tirar dúvidas rapidamente ou conferir os detalhes da estadia.

**Why this priority**: Permite que o operador acesse informações aprofundadas do hóspede e do pagamento sem precisar sair da tela de calendário.

**Independent Test**: Clicar em qualquer reserva visível na grade e verificar a abertura do modal "Detalhes da Reserva" contendo nome do hóspede, e-mail, telefone, documento, quarto, datas de entrada/saída, método e status de pagamento e observações.

**Acceptance Scenarios**:

1. **Given** reservas renderizadas no calendário, **When** o usuário clica sobre a célula ou barra de uma reserva, **Then** o modal de diálogo (`Dialog`) é aberto imediatamente exibindo o título "Detalhes da Reserva" e subtítulo "Informações completas sobre a hospedagem".
2. **Given** o modal de detalhes aberto, **When** o usuário inspeciona as seções, **Then** são exibidos:
   - Dados do Hóspede: Nome completo, E-mail, Telefone e Documento (CPF/Passaporte);
   - Dados da Hospedagem: Número do Quarto, Tipo/Categoria, Data de Check-in, Data de Check-out e Situação da Reserva;
   - Dados do Pagamento: Forma de pagamento (ex.: Cartão de Crédito, PIX, Dinheiro), Valor total (formatado em moeda) e Status do pagamento (ex.: Pago, Pendente);
   - Observações: Texto com solicitações e notas especiais do hóspede.
3. **Given** o modal aberto, **When** o usuário clica no botão de fechar ou fora da janela, **Then** o modal é fechado e a seleção é limpa, retornando ao estado do mapa de reservas.

---

### User Story 5 - Atalho Rápido de Nova Reserva e Isolamento de Camada da Barra Lateral (Priority: P2)

Como operador, quero ter uma barra de ações na parte inferior do calendário com botão de atalho para "Nova Reserva" e ter a certeza de que a barra lateral de navegação se sobreponha perfeitamente sobre a grade sem conflito de camadas visuais ou cortes causados pelo cabeçalho fixo.

**Why this priority**: O uso intensivo de `sticky` horizontal e vertical em tabelas pode gerar vazamento de z-index sobre menus laterais retráteis; o isolamento de camada CSS resolve isso definitivamente.

**Independent Test**: Abrir e fechar a barra lateral com o calendário preenchido e verificar que a barra lateral sobrepõe suavemente o calendário sem que as células fixas de cabeçalho ou quartos vazem por cima do menu.

**Acceptance Scenarios**:

1. **Given** a visualização do calendário, **When** o usuário observa a base da tela, **Then** uma barra de ferramentas fixa (`border-t bg-background shrink-0 p-2`) apresenta um botão com ícone `Plus` e tooltip "Nova Reserva".
2. **Given** o container principal do calendário, **When** renderizado, **Then** ele possui a classe CSS `isolate`, criando um novo contexto de empilhamento que garante que a barra lateral (com `z-40` ou `z-50`) fique sempre posicionada acima do cabeçalho e das colunas fixas do calendário.

---

### Edge Cases

- **Mês selecionado no passado**: Se o usuário selecionar um mês/ano anterior à data corrente, o calendário deve reposicionar automaticamente a data inicial para a data de hoje, evitando navegações inválidas para períodos já transcorridos.
- **Quarto sem nenhuma reserva no período**: A linha do quarto deve permanecer disponível com células em branco com bordas sutis e fundo alternado para facilitar a leitura.
- **Redimensionamento extremo de tela (ex.: largura muito estreita)**: O cálculo de dias exibidos deve garantir no mínimo 15 dias visíveis (`Math.max(15, ...)`), ativando rolagem horizontal caso o espaço físico seja inferior à largura mínima da célula.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A aplicação `web` DEVE disponibilizar a rota `/reservas/calendario` e um alias/redirecionamento `/reservas` renderizando a página de Calendário de Reservas.
- **FR-002**: A página DEVE utilizar um provedor `ReservationsProvider` e hook `useReservations` disponibilizando métodos para recuperar reservas por quarto e dia.
- **FR-003**: A grade do calendário DEVE ser organizada em tabela com cabeçalho congelado no topo (`sticky top-0 z-20`) e coluna de identificação dos quartos congelada à esquerda (`sticky left-0 z-20`).
- **FR-004**: Cada quarto DEVE exibir seu número, tipo de acomodação e um indicador visual circular com cor correspondente ao status operacional (`disponivel`: verde, `bloqueado`: vermelho, `manutencao`: laranja, `limpeza`: azul, `ocupado`: roxo), com tooltip descritivo.
- **FR-005**: O componente `ReservationCell` DEVE calcular a posição horizontal da reserva na célula:
  - Check-in: metade direita (`right-0 w-1/2`)
  - Check-out: metade esquerda (`left-0 w-1/2`)
  - Noite intermediária: largura total (`w-full`)
- **FR-006**: Ao clicar sobre qualquer célula de reserva, o sistema DEVE abrir o componente `Dialog` apresentando todos os detalhes cadastrais do hóspede, quarto, datas, valores, meio de pagamento e observações.
- **FR-007**: A barra superior de navegação de datas DEVE conter:
  - Seletor suspenso (`Select`) com os 12 meses do ano;
  - Campo numérico (`Input type="number"`) para o ano;
  - Botões para recuar e avançar 1 dia (`ChevronLeft`, `ChevronRight`);
  - Botões para recuar e avançar 15 dias (`ChevronsLeft`, `ChevronsRight`).
- **FR-008**: O cálculo de dias visíveis DEVE recalcular dinamicamente no carregamento e no evento `resize` da janela com mínimo de 15 dias baseado na largura líquida da área útil.
- **FR-009**: O container do calendário DEVE possuir a propriedade CSS `isolate` (`className="... isolate"`) para garantir isolamento de contexto de empilhamento contra menus sobrepostos.
- **FR-010**: O catálogo de rotas do sistema (`routes_seed.ts`) DEVE registrar as rotas do módulo de Reservas:
  - `/reservas/calendario` (recurso: 'Calendário', ícone: 'CalendarDays', ordem: 5)
  - `/reservas/novo` (recurso: 'Reservar', ordem: 6)
  - `/reservas` (recurso: 'Consultar', ordem: 7)
- **FR-011**: A página de calendário DEVE possuir testes automatizados (`calendario.spec.tsx`) validando a renderização dos quartos, controles de navegação e abertura do modal de detalhes ao clicar em uma reserva.

### Key Entities

- **Room**: Representa a unidade habitacional no calendário, com `id`, `numero`, `tipo` e `status` operacional (`disponivel`, `bloqueado`, `manutencao`, `limpeza`, `ocupado`).
- **Reservation**: Representa a hospedagem agendada ou em curso, contendo `id`, `quartoId`, `checkIn`, `checkOut`, dados do `hospede` (nome, email, telefone, documento), dados de `pagamento` (metodo, valor, status), `observacoes`, `status` textual e `status_code`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: O mapa de reservas renderiza a grade completa com até 30 quartos e 30 dias em menos de 300ms.
- **SC-002**: A navegação entre dias ou meses atualiza a matriz de reservas instantaneamente sem recarregar a página ou perder o estado da visualização.
- **SC-003**: 100% das reservas com check-out e check-in no mesmo dia no mesmo quarto são visíveis de forma não colidente (esquerda e direita) na mesma célula.
- **SC-004**: O modal de detalhes da reserva abre em menos de 100ms após o clique sobre a célula.
- **SC-005**: 100% dos testes da suíte `calendario.spec.tsx` passam com sucesso.

## Assumptions

- Os quartos e reservas mockados no cliente servem como base visual e de dados para a interface até a integração com os endpoints REST de reservas da API.
- A convenção de horário padrão de hotelaria (check-in após as 14h e check-out até as 12h) embasa a divisão visual da célula de meia-diária.
- As datas são processadas e formatadas utilizando a biblioteca `date-fns` com localização para português brasileiro (`pt-BR`).
