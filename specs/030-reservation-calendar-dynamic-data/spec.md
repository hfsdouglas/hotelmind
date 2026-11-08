# Feature Specification: Dados Dinâmicos no Calendário de Reservas e Listagem de Quartos

**Feature Branch**: `030-reservation-calendar-dynamic-data`

**Created**: 2026-11-07

**Status**: Ready for Planning

**Input**: User description: "A tela de calendário ficou linda e funcional. Mas, atualmente, não estamos carregando os dados do servidor. Estão todos estáticos na tela. Os dados agora podem começar a ser dinâmicos. Comece a implementação da listagem de quartos e depois implemente as reservas realizadas, conforme o status. Atuamente, os status visuais nas reservas no calendário, são apenas 2 (confirmada e check-in). As únicas reservas que devem aparecer no calendário são: a confirmar, confirmada e check-in. O restante, não aparece: cancelada, check-out. Avalie delicadamente a funcionalidade atual do front para que não seja modificada quando implementar a comunicação com o back-end."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Carregamento Dinâmico dos Quartos do Hotel (Priority: P1)

Como recepcionista ou gerente do hotel, quero que o eixo vertical do calendário de reservas exiba a lista real de quartos cadastrados no meu hotel com seu número, categoria e status operacional, para que eu visualize com precisão a estrutura física do estabelecimento.

**Why this priority**: A grade temporal só tem valor prático quando atrelada aos quartos reais do tenant/hotel atual.

**Independent Test**: Acessar o calendário de reservas e verificar que os quartos exibidos na coluna esquerda fixa correspondem aos quartos retornados pela API (`GET /quartos`), exibindo número (`identificacao`), categoria (`categoria.nome`) e indicador de status com tooltip.

**Acceptance Scenarios**:

1. **Given** que o hotel possui quartos cadastrados na base de dados, **When** a página do calendário é carregada, **Then** o frontend consome `quartosService.list` e renderiza cada quarto em sua respectiva linha da tabela com identificação e categoria reais.
2. **Given** um quarto com status inativo (`status: 'N'`), **When** renderizado na grade, **Then** seu ponto de status exibe a cor de bloqueado (`bg-status-blocked`) e o tooltip "Bloqueado".
3. **Given** um quarto ativo com hóspede hospedado na data de hoje (`status === 'check_in'`), **When** renderizado, **Then** seu ponto de status exibe a cor de ocupado (`bg-status-occupied`) e o tooltip "Ocupado".
4. **Given** um quarto ativo sem ocupação hoje, **When** renderizado, **Then** seu ponto de status exibe a cor de disponível (`bg-status-available`) e o tooltip "Disponível".

---

### User Story 2 - Carregamento Dinâmico e Filtragem de Reservas por Status (Priority: P1)

Como operador de recepção, quero que as reservas reais do hotel sejam desenhadas sobre a grade temporal dos quartos correspondentes, exibindo estritamente as reservas nos status permitidos (`a_confirmar`, `confirmada` e `check_in`) e omitindo as finalizadas ou canceladas.

**Why this priority**: Evita poluir a grade com reservas canceladas ou já encerradas (`check_out`), mantendo o foco operacional nas estadias vigentes e futuras.

**Independent Test**: Cadastrar reservas com diferentes status (`a_confirmar`, `confirmada`, `check_in`, `check_out`, `cancelada`, `no_show`) e verificar que apenas as três primeiras aparecem no calendário.

**Acceptance Scenarios**:

1. **Given** reservas cadastradas para o hotel, **When** o calendário é carregado, **Then** o sistema busca as reservas via `reservasService.list` e filtra exibindo exclusivamente aquelas com status `a_confirmar`, `confirmada` ou `check_in`.
2. **Given** reservas com status `cancelada`, `check_out` ou `no_show`, **When** a grade temporal é desenhada, **Then** essas reservas NÃO aparecem no calendário em nenhum quarto ou data.
3. **Given** uma reserva nos status permitidos, **When** desenhada no quarto correspondente, **Then** suas células respeitam a divisão do turno (check-in na metade direita `w-1/3 right-0 rounded-l`, intermediárias em largura total `w-full`, check-out na metade esquerda `w-1/3 left-0 rounded-r`).

---

### User Story 3 - Preservação dos 2 Status Visuais nas Células de Reserva (Priority: P1)

Como usuário, quero que as reservas na grade mantenham a linguagem visual existente de apenas 2 estilos visuais (check-in e confirmada/a confirmar), garantindo consistência visual e clareza imediata sobre quem já deu entrada física no hotel.

**Why this priority**: A recepção bate o olho no mapa para saber instantaneamente quem já entrou e quem ainda está por vir, sem excesso de cores que cause ruído cognitivo.

**Independent Test**: Inspecionar células de reservas com status `check_in` (devem ter cor primária cheia `bg-primary`) e células com status `confirmada` ou `a_confirmar` (devem ter cor primária com opacidade `bg-primary/50`).

**Acceptance Scenarios**:

1. **Given** uma reserva com status `check_in`, **When** renderizada na célula, **Then** ela recebe a classe `bg-primary` representando check-in realizado.
2. **Given** uma reserva com status `confirmada` ou `a_confirmar`, **When** renderizada na célula, **Then** ela recebe a classe `bg-primary/50` representando chegada pendente.
3. **Given** qualquer reserva na grade, **When** o usuário passa o mouse, **Then** o tooltip exibe as observações cadastradas da reserva, caso existam.

---

### User Story 4 - Modal de Detalhes da Reserva com Dados Reais do Back-End (Priority: P2)

Como recepcionista, quero clicar em qualquer barra de reserva para abrir o modal de detalhes contendo as informações reais do titular, quarto, período, valores e observações vindos do servidor.

**Why this priority**: Permite consultar os dados completos de contato e da estadia com agilidade diretamente no fluxo do calendário.

**Independent Test**: Clicar em uma célula de reserva no calendário e verificar a abertura do modal `Dialog` com título "Detalhes da Reserva" preenchido com nome do hóspede, telefone, e-mail, número do quarto e datas formatadas.

**Acceptance Scenarios**:

1. **Given** uma reserva visível na grade, **When** o usuário clica sobre sua barra, **Then** o modal `Dialog` abre com título "Detalhes da Reserva" e descrição "Informações completas sobre a hospedagem".
2. **Given** o modal de detalhes aberto, **When** inspecionado, **Then** são exibidos:
   - Reserva: datas de check-in e check-out formatadas em `dd/MM/yyyy`, status textual ("Check In", "Confirmada" ou "A Confirmar") e número real do quarto;
   - Hóspede: titular nome, e-mail, telefone e documento (ou '-' caso não informado);
   - Pagamento: método, valor formatado em moeda (`R$`) e status de pagamento;
   - Observações: notas adicionais registradas na reserva.

---

### User Story 5 - Preservação Delicada da Experiência e Layout Frontend Existente (Priority: P1)

Como usuário, quero que a experiência de uso, layout, navegação temporal (dia anterior/seguinte, 15 dias antes/depois, seletores de mês e ano) e cálculo responsivo de colunas permaneçam idênticos e impecáveis sem regressões.

**Why this priority**: O layout foi aprovado e elogiado pelos usuários ("A tela de calendário ficou linda e funcional. Avalie delicadamente a funcionalidade atual do front para que não seja modificada").

**Acceptance Scenarios**:

1. **Given** a tela de calendário, **When** o usuário navega entre dias ou meses, **Then** a grade de datas e as reservas se atualizam fluidamente sem quebrar o layout nem reiniciar estados indevidamente.
2. **Given** telas de diferentes resoluções, **When** a janela é redimensionada, **Then** o cálculo dinâmico de `daysToShow` (mínimo 15 dias) permanece ativo e responsivo.
3. **Given** o container principal da página, **When** inspecionado, **Then** mantém as classes `-m-6 flex flex-1 flex-col h-[calc(100%+3rem)] min-h-0 overflow-hidden isolate` e o congelamento sticky do cabeçalho e coluna esquerda.

---

### Edge Cases

- **Hotel sem quartos cadastrados**: Exibir grade sem linhas de quartos com layout estável, sem quebras de execução ou loops.
- **Hotel sem reservas no período**: As linhas dos quartos continuam sendo renderizadas vazias, permitindo visualização de disponibilidade.
- **Fuso horário nas datas da API**: Garantir que as datas retornadas em formato `YYYY-MM-DD` sejam interpretadas no fuso local para evitar que o check-in recue 1 dia devido ao offset GMT-3.
- **Reserva sem observações ou sem documento cadastrado**: O modal de detalhes deve tratar graciosamente valores nulos ou indefinidos exibindo `-` ou omitindo a seção de observações sem erros de runtime.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O componente `Calendario` DEVE consumir a API de quartos (`quartosService.list`) para obter a lista real de quartos do hotel logado.
- **FR-002**: O componente `Calendario` DEVE consumir a API de reservas (`reservasService.list`) para obter as reservas do hotel logado.
- **FR-003**: O calendário DEVE filtrar as reservas do servidor, exibindo EXCLUSIVAMENTE reservas com status `a_confirmar`, `confirmada` e `check_in`.
- **FR-004**: Reservas com status `cancelada`, `check_out` e `no_show` NÃO DEVEM ser exibidas no calendário.
- **FR-005**: As reservas no calendário DEVEM possuir apenas 2 representações visuais de status:
  - Check-in (`r.status === 'check_in'`): barra com classe `bg-primary` (`status_code: 1`);
  - Confirmada ou A Confirmar (`r.status === 'confirmada' || r.status === 'a_confirmar'`): barra com classe `bg-primary/50` (`status_code: 0`).
- **FR-006**: O status operacional do quarto na coluna fixa DEVE ser determinado dinamicamente:
  - Se `quarto.status === 'N'`, status é `bloqueado` (`bg-status-blocked`);
  - Se o quarto possuir reserva ativa com status `check_in` cobrindo o dia de hoje, status é `ocupado` (`bg-status-occupied`);
  - Caso contrário, status é `disponivel` (`bg-status-available`).
- **FR-007**: Ao clicar em qualquer célula de reserva, o modal de detalhes DEVE exibir os dados reais da reserva e do hóspede titular vindos do back-end.
- **FR-008**: Toda a estrutura de layout existente (classes Tailwind, grid responsivo, cabeçalho sticky `z-20`, coluna esquerda sticky `z-10`, canto sticky `z-30`, isolamento `isolate`, navegação de 1 dia e 15 dias, seletores de mês e ano) DEVE ser integralmente preservada sem regressões visuais.

### Key Entities

- **Quarto**: Identificador único, número/identificação (`identificacao`), categoria (`categoria.nome`) e status operacional calculado (`disponivel`, `bloqueado`, `ocupado`).
- **Reserva**: Código da reserva, titular, quarto associado, datas de entrada (`check_in`) e saída (`check_out`), status (`a_confirmar`, `confirmada`, `check_in`), valor total e observações.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Eliminação total de dados estáticos (`mockRooms` e `mockReservations`) no fluxo de produção da página de calendário.
- **SC-002**: 100% de conformidade com o filtro de status: nenhuma reserva com status `cancelada`, `check_out` ou `no_show` é exibida.
- **SC-003**: 100% dos testes unitários e de integração existentes em `calendario.spec.tsx` continuam passando sem falhas, expandidos com cenários de mock da API.
- **SC-004**: Zero regressão visual ou quebra de layout na grade responsiva e no isolamento de contexto z-index.
