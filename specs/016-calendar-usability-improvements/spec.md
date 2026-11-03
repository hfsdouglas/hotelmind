# Feature Specification: Melhorias de usabilidade e ajustes no calendário de tarifários

**Feature Branch**: `016-calendar-usability-improvements`

**Created**: 2026-11-02

**Status**: Draft

**Input**: User description: "# Feature: Melhorias de usabilidade e ajustes no calendário de tarifários

## Objetivo

Realizar ajustes na experiência de utilização do calendário de tarifários e corrigir inconsistências visuais e funcionais identificadas nas páginas de pesquisa, inclusão e edição de tarifários.

## 1. Classificação dos dias na hotelaria

Adequar a classificação dos dias da semana às convenções utilizadas na hotelaria.

**Fim de semana:**
- Sexta-feira.
- Sábado.

**Dias de semana:**
- Domingo.
- Segunda-feira.
- Terça-feira.
- Quarta-feira.
- Quinta-feira.

As ações de seleção em massa deverão respeitar essa classificação:

- \"Selecionar fim de semana\": selecionar todas as sextas-feiras e sábados.
- \"Selecionar dias da semana\": selecionar todos os dias de domingo a quinta-feira.

Essa classificação deverá ser aplicada independentemente da quantidade de meses exibidos no calendário.

## 2. Correção do texto das datas selecionadas

Corrigir o problema visual relacionado ao texto de identificação das datas selecionadas.

Atualmente, o texto que apresenta as datas selecionadas apresenta problemas de exibição em calendários com menor quantidade de meses ou dimensões reduzidas.

Ajustar sua apresentação para garantir que:

- O texto seja exibido corretamente em todas as opções de visualização.
- Não ocorra sobreposição com outros elementos.
- Não haja cortes ou quebras inadequadas.
- A informação permaneça legível em diferentes resoluções de tela.
- A quantidade de datas selecionadas continue sendo apresentada corretamente.

## 3. Substituição do botão \"Mês atual\" por seletor de mês

Substituir o botão \"Mês atual\" por um seletor de mês e ano.

O objetivo é permitir que o usuário escolha diretamente o mês e o ano a partir dos quais deseja iniciar a visualização do calendário.

### Comportamento esperado

- O controle deverá permitir selecionar um mês e um ano.
- Após a seleção, o calendário deverá navegar automaticamente para o período escolhido.
- A quantidade de meses exibidos deverá respeitar a opção de visualização atualmente selecionada (1, 3, 6 ou 12 meses).
- O usuário deverá conseguir navegar para períodos anteriores e posteriores normalmente.
- A seleção de datas já realizada deverá ser preservada durante a alteração do período inicial.

## 4. Ajuste dos botões de navegação do calendário

Remover os textos dos botões \"Período anterior\" e \"Próximo período\".

Manter somente os respectivos ícones de navegação:

- Seta para a esquerda: período anterior.
- Seta para a direita: próximo período.

Os botões deverão manter suas funcionalidades atuais, proporcionando uma interface mais compacta e limpa.

## 5. Correção do dropdown \"Mais filtros\"

Corrigir o comportamento e a apresentação do dropdown \"Mais filtros\" na página de pesquisa de tarifários.

Verificar seu funcionamento para garantir que:

- O dropdown seja aberto corretamente ao clicar no botão.
- As opções sejam exibidas integralmente.
- O posicionamento do menu esteja correto em relação ao botão.
- O menu não seja cortado ou fique escondido por outros elementos da interface.
- O usuário consiga interagir normalmente com todas as opções disponíveis.

Preservar os filtros e comportamentos já existentes na página.

## 6. Remoção de links de navegação nas páginas de tarifários

Remover os links de navegação (breadcrumbs) apresentados nas páginas de inclusão e edição de tarifários.

Atualmente, essas páginas apresentam a seguinte estrutura:

`Tarifários / Novo tarifário`

Remover completamente essa identificação das páginas de novo tarifário e editar tarifário.

A remoção deverá contemplar ambas as páginas, mantendo os demais elementos e funcionalidades da interface.

## 7. Resultado esperado

As páginas de tarifários deverão apresentar uma experiência mais consistente, organizada e intuitiva.

Os ajustes deverão corrigir os problemas visuais identificados, facilitar a navegação pelo calendário, permitir a escolha direta do período inicial e adequar a classificação dos dias às convenções da hotelaria.

Todas as funcionalidades existentes deverão ser preservadas, exceto as alterações de interface explicitamente descritas nesta especificação."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Classificação Hoteleira para Seleção em Massa de Dias de Semana e Fim de Semana (Priority: P1)

Um gestor hoteleiro precisa configurar tarifas diferenciadas para dias de semana e finais de semana seguindo a convenção da hotelaria, onde as diárias de fim de semana compreendem os pernoites de sexta-feira e sábado, e as diárias de dias de semana compreendem os pernoites de domingo a quinta-feira. Ao clicar em "Selecionar fim de semana" ou "Selecionar dias da semana", o calendário deve aplicar essa classificação em qualquer visualização (1, 3, 6 ou 12 meses).

**Why this priority**: A classificação correta dos pernoites (sexta e sábado como fim de semana; domingo a quinta como dias de semana) é uma regra de negócio essencial da operação hoteleira e impacta diretamente a precificação das diárias.

**Independent Test**: Pode ser testado de forma independente abrindo o calendário de tarifários em qualquer visualização (1, 3, 6 ou 12 meses), acionando os botões "Selecionar fim de semana" e "Selecionar dias da semana" e verificando os dias da semana selecionados.

**Acceptance Scenarios**:

1. **Given** o calendário de tarifários exibindo 1, 3, 6 ou 12 meses, **When** o usuário clica em "Selecionar fim de semana", **Then** todas as sextas-feiras e sábados disponíveis nos meses visíveis são selecionados, e nenhum dia de domingo a quinta-feira é selecionado.
2. **Given** o calendário de tarifários exibindo 1, 3, 6 ou 12 meses, **When** o usuário clica em "Selecionar dias da semana", **Then** todos os dias de domingo, segunda-feira, terça-feira, quarta-feira e quinta-feira disponíveis nos meses visíveis são selecionados, excluindo sextas-feiras e sábados.

---

### User Story 2 - Navegação Direta por Seletor de Mês/Ano e Botões Compactos com Ícones (Priority: P1)

Um gestor hoteleiro deseja planejar tarifários para um mês ou ano específico (por exemplo, alta temporada do próximo ano) sem precisar clicar repetidamente nos botões de avanço, além de contar com uma barra de ferramentas mais limpa onde os botões de período anterior e próximo exibem apenas ícones de seta.

**Why this priority**: Permite acesso imediato a qualquer mês e ano no calendário e reduz a poluição visual do cabeçalho do calendário.

**Independent Test**: Pode ser testado selecionando diretamente um mês e ano no seletor do cabeçalho do calendário e clicando nos botões de seta para a esquerda e para a direita.

**Acceptance Scenarios**:

1. **Given** o calendário de tarifários aberto com datas já selecionadas, **When** o usuário escolhe um novo mês e/ou ano no seletor de período inicial, **Then** o calendário navega imediatamente para o mês e ano escolhidos, respeitando a quantidade de meses exibidos (1, 3, 6 ou 12) e preservando integralmente as datas já selecionadas.
2. **Given** o cabeçalho de navegação do calendário, **When** o usuário visualiza os controles de navegação de período anterior e próximo período, **Then** o botão "Mês atual" não é exibido (substituído pelo seletor de mês e ano) e os botões de avanço/recuo exibem exclusivamente os ícones de seta para a esquerda e seta para a direita, mantendo a navegação proporcional à quantidade de meses ativos.

---

### User Story 3 - Exibição Legível das Datas Selecionadas em Todas as Visualizações (Priority: P2)

Ao selecionar datas no calendário em diferentes modos de visualização (1, 3, 6 ou 12 meses) e diferentes larguras de tela, o usuário precisa visualizar com clareza quais datas estão marcadas e o resumo da quantidade de datas selecionadas, sem cortes, quebras de palavras inadequadas ou sobreposição entre elementos dentro das células ou no resumo do período.

**Why this priority**: Corrige problemas visuais de legibilidade e sobreposição que dificultam a conferência das datas marcadas.

**Independent Test**: Pode ser testado selecionando múltiplas datas e alternando entre as visualizações de 1, 3, 6 e 12 meses em resoluções variadas, verificando que não há truncamento indevido ou sobreposição de textos nas células e nos indicadores de seleção.

**Acceptance Scenarios**:

1. **Given** o calendário com datas selecionadas, **When** o usuário alterna entre 1, 3, 6 e 12 meses ou redimensiona a janela, **Then** a identificação visual das datas selecionadas e o texto de resumo/contagem permanecem legíveis, sem cortes inadequados, quebras truncadas ou sobreposição com outros elementos da célula ou do cabeçalho.
2. **Given** qualquer quantidade de datas selecionadas no calendário, **When** o usuário observa o contador e o resumo de datas selecionadas, **Then** a quantidade total de datas selecionadas continua sendo exibida com precisão e sem distorção de layout.

---

### User Story 4 - Funcionamento do Dropdown "Mais filtros" na Pesquisa de Tarifários e Remoção de Breadcrumbs (Priority: P2)

Na página de pesquisa de tarifários, o usuário utiliza o botão "Mais filtros" para filtrar por categoria de quarto e situação (ativos/inativos) em um menu suspenso bem posicionado e sem cortes. Além disso, ao acessar as páginas de inclusão ("Novo tarifário") e edição ("Editar tarifário"), o topo da página não exibe links redundantes de breadcrumb (`Tarifários / Novo tarifário` ou `Tarifários / Editar tarifário`), mantendo o padrão visual limpo do sistema.

**Why this priority**: Padroniza a experiência de filtragem na listagem de tarifários e remove elementos redundantes de navegação nas telas de formulário.

**Independent Test**: Pode ser testado abrindo a página `/tarifarios`, clicando no botão "Mais filtros", aplicando os filtros de categoria e situação, e navegando para `/tarifarios/novo` e `/tarifarios/:id/editar` para verificar a ausência de breadcrumbs.

**Acceptance Scenarios**:

1. **Given** a página de pesquisa de tarifários, **When** o usuário clica no botão "Mais filtros", **Then** o dropdown abre corretamente posicionado em relação ao botão, exibe integralmente os filtros existentes (categoria de quarto e situação) sem ser cortado ou ocultado por outros elementos, e permite filtrar a listagem normalmente.
2. **Given** as páginas de inclusão ("Novo tarifário") e edição ("Editar tarifário"), **When** a página é renderizada, **Then** a estrutura de breadcrumb (`Tarifários / Novo tarifário` ou `Tarifários / Editar tarifário`) não é exibida em nenhuma das duas páginas, mantendo todos os demais controles e funcionalidades.

---

### Edge Cases

- **Mudança de ano no seletor de mês/ano seguida de navegação por setas**: Se o usuário selecionar "Novembro de 2027" na visualização de 6 meses e clicar na seta para a direita, o calendário avança para "Maio de 2028" atualizando o seletor de mês e ano em sincronia com o período visível.
- **Células compactas na visualização de 3, 6 e 12 meses**: Quando vários meses são exibidos lado a lado, as células de cada dia adaptam sua apresentação para que o indicador de seleção, o número do dia e eventuais marcações ("Hoje", ocupação ou conflito) não se sobreponham nem quebrem palavras de maneira ilegível.
- **Interação com selects dentro do dropdown "Mais filtros"**: Ao abrir uma lista de seleção (como categoria de quarto ou situação) dentro do menu "Mais filtros", o dropdown principal não deve fechar prematuramente ao clicar nas opções internas.
- **Seleção em massa com datas ocupadas nas sextas e sábados**: Ao clicar em "Selecionar fim de semana", caso uma sexta-feira ou sábado já pertença a outro tarifário ativo da mesma categoria, essa data ocupada continua sendo ignorada pela seleção automática, preservando a prevenção de conflitos.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE classificar como **Fim de semana** exclusivamente as **sextas-feiras** e os **sábados** nas ações de seleção em massa do calendário de tarifários.
- **FR-002**: O sistema DEVE classificar como **Dias da semana** todos os dias de **domingo a quinta-feira** (domingo, segunda-feira, terça-feira, quarta-feira e quinta-feira) nas ações de seleção em massa do calendário de tarifários.
- **FR-003**: As ações "Selecionar fim de semana" e "Selecionar dias da semana" DEVEM aplicar a classificação hoteleira (FR-001 e FR-002) de forma consistente em todas as opções de visualização do calendário (1, 3, 6 e 12 meses).
- **FR-004**: O sistema DEVE apresentar o texto e os indicadores de datas selecionadas (tanto no resumo/contador quanto nas células do calendário) de forma legível, sem sobreposição de elementos e sem cortes ou quebras inadequadas em todas as opções de visualização (1, 3, 6 e 12 meses) e diferentes resoluções de tela.
- **FR-005**: O sistema DEVE continuar exibindo e atualizando automaticamente a quantidade total de datas selecionadas.
- **FR-006**: O sistema DEVE substituir o botão "Mês atual" do calendário por um seletor de mês e ano que permita ao usuário escolher diretamente o mês e o ano iniciais da visualização.
- **FR-007**: Ao selecionar um mês ou ano no seletor de período, o calendário DEVE navegar imediatamente para o período escolhido, mantendo a quantidade de meses exibidos atualmente selecionada (1, 3, 6 ou 12 meses) e preservando todas as datas já selecionadas.
- **FR-008**: O seletor de mês e ano DEVE refletir o mês e o ano iniciais do período visível sempre que o usuário navegar para períodos anteriores ou posteriores pelos botões de seta.
- **FR-009**: Os botões de navegação para período anterior e próximo período no calendário DEVEM exibir exclusivamente os ícones de seta para a esquerda e seta para a direita, removendo os rótulos de texto visíveis ("Mês anterior", "Período anterior", "Próximo mês", "Próximo período") e mantendo seus rótulos de acessibilidade e funcionamento atual.
- **FR-010**: Na página de pesquisa de tarifários, os filtros adicionais (categoria de quarto e situação) DEVEM ser disponibilizados por meio do dropdown "Mais filtros", garantindo abertura correta ao clicar no botão, posicionamento alinhado sem cortes ou sobreposição por outros elementos, exibição integral das opções e preservação do comportamento de filtragem existente.
- **FR-011**: O sistema DEVE remover completamente os links de navegação em estilo breadcrumb (`Tarifários / Novo tarifário` e `Tarifários / Editar tarifário`) das páginas de inclusão e edição de tarifários, preservando o botão de voltar e todas as demais funcionalidades do formulário.

### Key Entities

- **Classificação Hoteleira de Dia da Semana**: Convenção de negócio que define sexta-feira e sábado como fim de semana e domingo a quinta-feira como dias de semana para fins de seleção em massa no calendário de tarifários.
- **Seletor de Período Inicial (Mês e Ano)**: Controle de navegação do calendário que define e exibe o mês (Janeiro a Dezembro) e o ano base a partir dos quais os `1`, `3`, `6` ou `12` meses consecutivos são renderizados.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% das execuções da ação "Selecionar fim de semana" em qualquer visualização (1, 3, 6 ou 12 meses) selecionam exclusivamente sextas-feiras e sábados disponíveis nos meses visíveis.
- **SC-002**: 100% das execuções da ação "Selecionar dias da semana" em qualquer visualização (1, 3, 6 ou 12 meses) selecionam exclusivamente domingos, segundas, terças, quartas e quintas-feiras disponíveis nos meses visíveis.
- **SC-003**: O usuário consegue navegar diretamente para qualquer mês e ano desejado em uma única seleção através do controle de mês e ano, com 0% de perda das datas previamente selecionadas.
- **SC-004**: Em todas as 4 opções de visualização (1, 3, 6 e 12 meses), os textos e indicadores de datas selecionadas são exibidos com zero sobreposições ou cortes indevidos, mantendo o contador total de datas selecionadas visível e exato.
- **SC-005**: O dropdown "Mais filtros" na página de pesquisa de tarifários abre e permite selecionar filtros de categoria e situação em 100% das tentativas sem fechamento inesperado ou corte visual, e as páginas de inclusão e edição de tarifários são renderizadas sem o elemento de breadcrumb.

## Assumptions

- O seletor de ano disponibilizará uma faixa ampla e prática de anos ao redor do ano corrente e do ano atualmente visualizado (por exemplo, de 5 anos no passado até 10 anos no futuro, incluindo também o ano de qualquer data já vinculada ao tarifário), permitindo navegação rápida para qualquer período operacional do hotel.
- Os botões de navegação com ícones de seta para a esquerda e para a direita manterão atributos de acessibilidade (`aria-label`) para leitores de tela, mesmo sem texto visível na interface.
- Dentro do dropdown "Mais filtros" na listagem de tarifários, será incluído um controle rápido para limpar os filtros ativos quando houver filtro aplicado, mantendo consistência com as demais páginas de pesquisa do sistema.
