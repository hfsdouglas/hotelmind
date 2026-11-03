# Feature Specification: Melhorias na Visualização e Seleção de Datas do Calendário de Tarifários

**Feature Branch**: `015-calendar-multi-month-bulk-select`

**Created**: 2026-11-02

**Status**: Draft

**Input**: User description: "# Feature: Melhorias na visualização e seleção de datas do calendário de tarifários — Visualização de 1, 3, 6 e 12 meses e ações de seleção em massa (todos os dias, dias da semana, fim de semana)"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Alternar visualização entre 1, 3, 6 e 12 meses (Priority: P1)

Como usuário autorizado configurando um tarifário, quero escolher quantos meses consecutivos são exibidos simultaneamente no calendário (`1 mês`, `3 meses`, `6 meses` ou `12 meses`) e navegar entre períodos proporcionalmente à visualização escolhida, para visualizar horizontes curtos ou anuais sem perder as datas já marcadas.

**Why this priority**: Permite enxergar temporadas completas (trimestre, semestre ou ano inteiro) de uma só vez e serve de base para que as ações de seleção em massa operem sobre múltiplos meses visíveis.

**Independent Test**: Abrir o formulário de criação ou edição de tarifário, verificar que o calendário inicia exibindo `1 mês`, marcar algumas datas, alternar para `3 meses`, `6 meses` e `12 meses` verificando que os meses consecutivos são renderizados imediatamente em grade responsiva, que as datas marcadas permanecem selecionadas e que os controles de avanço/recuo deslocam a janela pelo número de meses ativo.

**Acceptance Scenarios**:

1. **Given** que o usuário abre o formulário de tarifário, **When** o calendário é carregado inicialmente, **Then** a visualização padrão é de `1 mês` exibindo o mês de referência atual.
2. **Given** que o usuário selecionou datas no calendário em visualização de `1 mês`, **When** alterna o seletor de visualização para `3 meses`, `6 meses` ou `12 meses`, **Then** o calendário passa a exibir imediatamente 3, 6 ou 12 meses consecutivos a partir do mês inicial atual e preserva todas as datas previamente selecionadas.
3. **Given** que o calendário está configurado para exibir `N` meses (`1`, `3`, `6` ou `12`), **When** o usuário aciona o controle de período anterior ou próximo período, **Then** a janela de meses exibida recua ou avança exatamente `N` meses consecutivos, mantendo intactas as datas já selecionadas.

---

### User Story 2 - Selecionar datas em massa nos meses visíveis (Priority: P1)

Como usuário autorizado configurando um tarifário, quero utilizar botões de ação rápida (`Selecionar todos os dias`, `Selecionar dias da semana`, `Selecionar fim de semana`) que marquem automaticamente as datas disponíveis dos meses atualmente visíveis no calendário, para configurar tarifas de dias úteis, finais de semana ou temporadas inteiras sem precisar clicar data por data.

**Why this priority**: Reduz drasticamente o esforço manual ao cadastrar tarifários sazonais ou diferenciados para dias de semana e finais de semana ao longo de 1, 3, 6 ou 12 meses.

**Independent Test**: Com uma visualização de 1 ou mais meses ativa, clicar em `Selecionar todos os dias` e verificar que apenas os dias disponíveis dos meses visíveis são marcados; clicar em `Selecionar dias da semana` e verificar que a seleção anterior é substituída apenas pelos dias disponíveis de segunda a sexta-feira dos meses visíveis; clicar em `Selecionar fim de semana` e verificar que a seleção é substituída apenas pelos sábados e domingos disponíveis dos meses visíveis.

**Acceptance Scenarios**:

1. **Given** que o calendário exibe 1, 3, 6 ou 12 meses, **When** o usuário clica em `Selecionar todos os dias`, **Then** a seleção atual é substituída por todas as datas disponíveis pertencentes aos meses atualmente visíveis (segunda a domingo).
2. **Given** que o calendário exibe 1, 3, 6 ou 12 meses, **When** o usuário clica em `Selecionar dias da semana`, **Then** a seleção atual é substituída exclusivamente pelas datas disponíveis de segunda-feira a sexta-feira pertencentes aos meses atualmente visíveis.
3. **Given** que o calendário exibe 1, 3, 6 ou 12 meses, **When** o usuário clica em `Selecionar fim de semana`, **Then** a seleção atual é substituída exclusivamente pelos sábados e domingos disponíveis pertencentes aos meses atualmente visíveis.
4. **Given** que existem datas já ocupadas por outros tarifários ativos na categoria selecionada dentro dos meses visíveis, **When** o usuário aciona qualquer ação de seleção em massa, **Then** apenas as datas disponíveis são marcadas, ignorando as datas já ocupadas por outros tarifários ativos e mantendo inalterado o valor da diária informado no formulário.

---

### User Story 3 - Ajuste fino individual e contagem em tempo real após seleção em massa (Priority: P2)

Como usuário autorizado, após aplicar uma seleção em massa quero poder marcar ou desmarcar datas específicas individualmente (como exceções de feriados) e acompanhar a contagem total de datas selecionadas antes de confirmar o salvamento do tarifário.

**Why this priority**: Permite combinar a produtividade da seleção em massa com a flexibilidade de incluir ou excluir dias pontuais antes de salvar.

**Independent Test**: Aplicar `Selecionar dias da semana`, desmarcar um dia específico clicando nele, marcar um sábado específico clicando nele, verificar que o contador total de datas selecionadas reflete exatamente a quantidade atualizada e que nenhuma alteração é persistida até o envio do formulário.

**Acceptance Scenarios**:

1. **Given** uma seleção realizada por ação em massa, **When** o usuário clica individualmente sobre uma data marcada ou desmarcada, **Then** apenas aquela data tem seu estado alternado (marcado/desmarcado) e o contador total de datas selecionadas é atualizado imediatamente.
2. **Given** qualquer alteração na seleção de datas ou no modo de visualização, **When** o usuário ainda não acionou o botão de salvar do formulário, **Then** nenhum tarifário existente ou novo é salvo ou modificado automaticamente.

---

### Edge Cases

- **Dias de preenchimento de outros meses na grade mensal**: Cada grade mensal exibe células de dias do mês anterior/seguinte para completar as semanas; as ações de seleção em massa devem considerar **exclusivamente** os dias pertencentes aos meses efetivamente exibidos (ignorando células de preenchimento fora da janela de meses visíveis).
- **Datas ocupadas por outros tarifários ativos**: Ao usar `Selecionar todos os dias`, `Selecionar dias da semana` ou `Selecionar fim de semana`, datas já ocupadas por outro tarifário ativo da mesma categoria não devem ser marcadas automaticamente, evitando gerar conflitos involuntários em seleções amplas.
- **Edição do próprio tarifário**: Na edição de um tarifário existente, as datas que pertencem ao próprio tarifário em edição são consideradas disponíveis para ele e devem ser incluídas normalmente pelas ações de seleção em massa.
- **Transição de ano na visualização de múltiplos meses**: Quando a janela de 3, 6 ou 12 meses atravessa a virada de ano (ex.: Outubro de 2026 a Setembro de 2027), todos os meses e anos correspondentes devem ser calculados, exibidos e selecionados corretamente.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O calendário de tarifários DEVE disponibilizar um controle seletor de quantidade de meses exibidos simultaneamente com as opções `1 mês`, `3 meses`, `6 meses` e `12 meses`.
- **FR-002**: O calendário DEVE iniciar por padrão na visualização de `1 mês`.
- **FR-003**: Ao alternar entre `1 mês`, `3 meses`, `6 meses` e `12 meses`, o calendário DEVE atualizar imediatamente a quantidade de meses consecutivos renderizados em um layout organizado e responsivo, preservando integralmente as datas já selecionadas.
- **FR-004**: Os controles de navegação para o período anterior e próximo período DEVEM deslocar a janela de visualização respeitando a quantidade de meses selecionada (`1`, `3`, `6` ou `12` meses), preservando as datas já selecionadas.
- **FR-005**: O calendário DEVE disponibilizar a ação em massa `Selecionar todos os dias`, que substitui a seleção atual por todas as datas disponíveis (segunda a domingo) pertencentes exclusivamente aos meses atualmente visíveis.
- **FR-006**: O calendário DEVE disponibilizar a ação em massa `Selecionar dias da semana`, que substitui a seleção atual por todas as datas disponíveis de segunda-feira a sexta-feira pertencentes exclusivamente aos meses atualmente visíveis.
- **FR-007**: O calendário DEVE disponibilizar a ação em massa `Selecionar fim de semana`, que substitui a seleção atual por todos os sábados e domingos disponíveis pertencentes exclusivamente aos meses atualmente visíveis.
- **FR-008**: Após qualquer ação de seleção em massa, o usuário DEVE poder continuar marcando ou desmarcando datas individualmente no calendário (comportamento de checkbox) ou limpar toda a seleção.
- **FR-009**: A interface DEVE apresentar de forma visível e atualizada automaticamente a quantidade total de datas selecionadas e o destaque visual em cada data marcada.
- **FR-010**: As ações de seleção em massa e a troca de visualização NÃO DEVEM alterar o valor da diária preenchido no formulário nem salvar ou modificar tarifários automaticamente sem a confirmação explícita do usuário ao submeter o formulário.

### Key Entities

- **Janela de Visualização do Calendário**: Representa o mês/ano inicial de referência e a quantidade de meses consecutivos visíveis (`1`, `3`, `6` ou `12`).
- **Conjunto de Datas Selecionadas**: Lista ordenada e sem duplicatas de datas (`YYYY-MM-DD`) marcadas pelo usuário via seleção individual ou seleção em massa para aplicação do valor da diária do tarifário.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: O usuário consegue selecionar todos os dias úteis ou todos os finais de semana de um período de até 12 meses em até 2 cliques (escolha da visualização + botão de seleção em massa), reduzindo em mais de 95% a quantidade de interações em comparação à seleção individual dia a dia.
- **SC-002**: 100% das datas previamente selecionadas são preservadas ao alternar entre as visualizações de 1, 3, 6 e 12 meses ou ao navegar entre períodos anteriores e posteriores.
- **SC-003**: 100% das ações de seleção em massa restringem-se exclusivamente aos dias pertencentes aos meses atualmente visíveis e disponíveis, atualizando imediatamente o contador total de datas selecionadas.

## Assumptions

- Datas pertencentes a tarifários inativos continuam consideradas disponíveis para seleção em novos tarifários ativos, enquanto datas ocupadas por outros tarifários ativos na mesma categoria são consideradas indisponíveis nas ações de seleção em massa (`Selecionar todos os dias`, `Selecionar dias da semana`, `Selecionar fim de semana`).
- As melhorias concentram-se na experiência do componente de calendário e resumo de seleção no frontend, mantendo compatível o contrato de envio de `datas: string[]` já utilizado pela API de tarifários.
