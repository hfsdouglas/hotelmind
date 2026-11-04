# Feature Specification: Painel de Visão Geral Operacional e Métricas Hoteleiras

**Feature Branch**: `021-hotel-overview-dashboard`

**Created**: 2026-11-03

**Status**: Draft

**Input**: User description: "Implementar a tela de Visão Geral (dashboard operacional) do hotel, fornecendo uma visão executiva consolidada e em tempo real sobre a operação do empreendimento. O painel deve disponibilizar cartões com os principais indicadores-chave (KPIs: hóspedes presentes, crianças, taxa de ocupação, reservas confirmadas, check-ins e check-outs previstos, quartos disponíveis e ocupados), distribuição de hóspedes por regime de alimentação com barras de proporção, distribuição de ocupação por tipo de quarto, seletor de data interativo em popover com calendário e navegação por mês/ano em dropdowns, e atualização do título da aba do navegador."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Acompanhamento Executivo de Indicadores de Ocupação e Movimentação Diária (Priority: P1)

Como gerente geral ou gestor operacional do hotel, quero acessar um painel consolidado com os principais indicadores do dia (taxa de ocupação, total de hóspedes, total de crianças, reservas confirmadas, entradas e saídas programadas, e contagem de quartos ocupados e livres), para entender rapidamente o panorama da operação sem ter que compilar relatórios manuais.

**Why this priority**: Esses números orientam decisões operacionais imediatas no hotel, como remanejamento de equipe de limpeza, preparo de café da manhã e alocação de quartos.

**Independent Test**: Acessar a rota `/dashboard` (ou `/dashboard/visao-geral`), verificar que a página carrega o título "Visão Geral", subtítulo explicativo e os 8 cartões de métricas principais com seus valores, ícones temáticos e legendas informativas.

**Acceptance Scenarios**:

1. **Given** que o usuário acessa a página de Visão Geral, **When** o painel é carregado, **Then** são exibidos no topo os 4 cartões de métricas de ocupação:
   - "Total de Pessoas" (com ícone de usuários e legenda "Hóspedes no hotel hoje");
   - "Total de Crianças" (com ícone infantil e legenda "Menores de 12 anos");
   - "Taxa de Ocupação" (com percentual e legenda "Quartos ocupados");
   - "Reservas Confirmadas" (com legenda "Para o período selecionado").
2. **Given** o painel carregado, **When** o usuário observa a segunda linha de métricas, **Then** são exibidos os 4 cartões de fluxo operacional:
   - "Check-ins Hoje" (entradas programadas);
   - "Check-outs Hoje" (saídas programadas);
   - "Quartos Ocupados" (em uso no momento);
   - "Quartos Disponíveis" (prontos para reserva).
3. **Given** que a data de consulta é alterada, **When** uma nova data é selecionada, **Then** todos os 8 indicadores são recalculados proporcionalmente para a data correspondente.

---

### User Story 2 - Distribuição por Regime de Alimentação e por Tipo de Quarto (Priority: P1)

Como gestor de alimentos e bebidas (A&B) e governança, quero visualizar a quantidade de pessoas atendidas por cada tipo de regime alimentar (Café da Manhã, Meia Pensão, Pensão Completa, Sem Refeição) com barras de progresso proporcionais, bem como a quantidade de quartos em uso por categoria de acomodação (Standard, Deluxe, Suite, Premium), para planejar o consumo da cozinha e a escala de camareiras.

**Why this priority**: A cozinha do hotel precisa saber com precisão quantas refeições de cada tipo produzir a cada dia para evitar desperdício de insumos ou falta de alimentos.

**Independent Test**: Verificar os blocos inferiores de "Pessoas por Regime de Alimentação" e "Distribuição por Tipo de Quarto", constatando a listagem com nomes, barras gráficas percentuais e contadores totais em cada categoria.

**Acceptance Scenarios**:

1. **Given** a seção "Pessoas por Regime de Alimentação", **When** exibida, **Then** lista os regimes alimentares cadastrados, exibindo indicador circular, nome do regime, barra de progresso horizontal proporcional ao total de hóspedes e a quantidade absoluta de pessoas.
2. **Given** a seção "Distribuição por Tipo de Quarto", **When** exibida, **Then** apresenta uma grade responsiva com cartões individuais para cada categoria de quarto (ex.: Standard, Deluxe, Suite, Premium), contendo o nome da acomodação, a quantidade de quartos ocupados em destaque e o rótulo "quartos".

---

### User Story 3 - Consulta Dinâmica de Datas via Popover com Calendário de Mês/Ano (Priority: P2)

Como usuário, quero poder trocar a data de referência da visão geral através de um botão no cabeçalho que abre um calendário em popover, com possibilidade de escolher mês e ano diretamente por seletores suspensos, para consultar tanto o histórico de dias anteriores quanto a previsão para datas futuras.

**Why this priority**: Permite que o operador avalie a ocupação de dias anteriores (auditoria) ou de dias futuros (previsão de demanda).

**Independent Test**: Clicar no botão de data no cabeçalho da página, verificar a abertura do popover com o componente de calendário, trocar o mês/ano pelos seletores suspensos (`captionLayout="dropdown"`), selecionar um dia específico e verificar que a data selecionada atualiza o botão e os dados do dashboard, fechando o popover automaticamente.

**Acceptance Scenarios**:

1. **Given** o cabeçalho do painel de Visão Geral, **When** o usuário clica no botão com a data formatada, **Then** um popover (`Popover`) abre exibindo um calendário mensal interativo.
2. **Given** o calendário aberto no popover, **When** o usuário utiliza os menus suspensos de navegação de cabeçalho, **Then** pode alternar rapidamente o mês e o ano desejados.
3. **Given** um dia clicado no calendário, **When** a seleção é confirmada, **Then** a data de referência é atualizada, os dados do dashboard recalculam para refletir o novo dia, e o popover se fecha automaticamente.

---

### User Story 4 - Sincronização do Título da Aba do Navegador (Priority: P3)

Como usuário navegando entre múltiplas telas ou mantendo várias abas do sistema abertas, quero que a aba do navegador exiba claramente o título "Visão Geral", para que eu possa alternar de aba e reconhecer imediatamente o painel de controle do hotel.

**Why this priority**: Melhora a navegabilidade em ambientes multitarefa na recepção do hotel.

**Independent Test**: Acessar o dashboard e verificar que `document.title` assume o valor `'Visão Geral'`.

**Acceptance Scenarios**:

1. **Given** o acesso à página de Visão Geral, **When** o componente é montado, **Then** o hook `usePageTitle('Visão Geral')` atualiza o título do documento HTML no navegador.
2. **Given** a navegação para outra página, **When** o usuário sai do dashboard, **Then** a página subsequente pode definir seu próprio título sem resíduos ou conflitos.

---

### Edge Cases

- **Dia sem hóspedes presentes (ex.: hotel em reforma ou pré-inauguração)**: Os indicadores numéricos devem exibir 0 de forma amigável, e as barras de porcentagem de alimentação devem se manter em 0% sem gerar divisão por zero (`NaN%`).
- **Resoluções móveis e telas reduzidas**: Os 8 cartões de métricas devem se reorganizar responsivamente (1 coluna em telas pequenas, 2 em médias e 4 em telas largas), preservando a legibilidade.
- **Fechamento do popover de calendário sem seleção**: Se o usuário clicar fora do popover sem escolher uma data, a data anterior deve ser preservada sem disparar recálculos desnecessários.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE disponibilizar as rotas `/dashboard/visao-geral`, `/dashboard` e `/dashboard/index` na aplicação `web`, apontando para o componente `VisaoGeral`.
- **FR-002**: O componente `VisaoGeral` DEVE renderizar o componente `PageHeader` com título "Visão Geral", subtítulo "Dashboard com informações gerais do hotel" e botão acionador de seletor de data.
- **FR-003**: O seletor de data DEVE utilizar o componente `Popover` com trigger exibindo a data atual formatada e conteúdo renderizando o componente `Calendar` no modo de seleção única (`mode="single"`).
- **FR-004**: O componente `Calendar` DEVE suportar navegação por menus suspensos de mês e ano (`captionLayout="dropdown"`), utilizando componentes `Select` com acessibilidade total.
- **FR-005**: O dashboard DEVE renderizar 8 cartões de indicadores (KPIs):
  - Total de Pessoas (`totalPessoas`)
  - Total de Crianças (`totalCriancas`)
  - Taxa de Ocupação (`taxaOcupacao`)
  - Reservas Confirmadas (`reservasConfirmadas`)
  - Check-ins Hoje (`checkInsHoje`)
  - Check-outs Hoje (`checkOutsHoje`)
  - Quartos Ocupados (`quartosOcupados`)
  - Quartos Disponíveis (`quartosDisponiveis`)
- **FR-006**: O painel DEVE renderizar o cartão "Pessoas por Regime de Alimentação" apresentando os regimes existentes, contagem de hóspedes e barra de porcentagem preenchida proporcionalmente ao total de pessoas presentes.
- **FR-007**: O painel DEVE renderizar o cartão "Distribuição por Tipo de Quarto" com contadores em destaque para cada categoria de quarto do hotel.
- **FR-008**: O hook `use_document_title` (`usePageTitle`) DEVE atualizar o título da janela (`document.title`) na montagem da tela e restaurar/sincronizar adequadamente.
- **FR-009**: O dashboard e o componente de calendário DEVEM possuir suítes de testes automatizados (`visao_geral.spec.tsx` e `calendar.spec.tsx`) cobrindo renderização de métricas e funcionamento dos seletores dropdown.

### Key Entities

- **DashboardData**: Estrutura contendo as métricas consolidadas: `totalPessoas`, `totalCriancas`, `pessoasPorRegime` (`regime`, `quantidade`), `checkInsHoje`, `checkOutsHoje`, `reservasConfirmadas`, `quartosDisponiveis`, `quartosOcupados`, `taxaOcupacao` e `distribuicaoPorTipo` (`tipo`, `quantidade`).
- **RegimeAlimentacaoItem**: Estrutura de agrupamento alimentar contendo a descrição do plano de alimentação e a quantidade de hóspedes aderentes.
- **TipoQuartoOcupacao**: Estrutura de distribuição habitacional contendo a categoria de acomodação e a contagem de unidades ocupadas.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: O painel de Visão Geral carrega completamente com todos os 8 cards e gráficos em menos de 200ms.
- **SC-002**: A alternância de data pelo popover atualiza todos os 8 indicadores e 2 painéis de distribuição em menos de 50ms.
- **SC-003**: 100% dos testes unitários de `visao_geral.spec.tsx` e `calendar.spec.tsx` executam com sucesso.
- **SC-004**: O título da página no navegador reflete "Visão Geral" imediatamente após a montagem do componente.

## Assumptions

- Os dados de indicadores hoteleiros utilizam simulação calculada com base na data ativa até a disponibilização dos endpoints de consolidação analítica na API.
- O componente `Calendar` estende a biblioteca `react-day-picker` com integração ao design system baseado em Radix UI e Tailwind CSS.
