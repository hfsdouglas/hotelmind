# Feature Specification: Tabelas em Tela Cheia com Rolagem Interna, Cabeçalho Fixo e Paginação no Rodapé

**Feature Branch**: `017-fullscreen-table-layout`

**Created**: 2026-11-03

**Status**: Draft

**Input**: User description: "Padronizar as telas de listagem e consulta do sistema (web e admin) para que as tabelas de dados ocupem 100% da altura visível da tela (full screen), com cabeçalho fixo durante a rolagem, área interna de rolagem vertical apenas para as linhas de dados, e barra de paginação fixada no rodapé da visualização. Reduzir a quantidade padrão de linhas do esqueleto de carregamento (suspense) para 8 linhas e otimizar a atualização atômica de múltiplos filtros e paginação."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Visualização de Tabela em Tela Cheia com Cabeçalho Fixo e Rolagem Interna (Priority: P1)

Como operador ou administrador do sistema acessando páginas de consulta (ex.: Quartos, Categorias de Quartos, Tarifários, Usuários, Grupos, Administradores, Hotéis, Rotas), quero que a listagem de registros preencha todo o espaço vertical útil da janela do navegador, de modo que o cabeçalho das colunas permaneça sempre fixo no topo e a rolagem ocorra exclusivamente no corpo da tabela, para manter a referência das colunas visível mesmo ao navegar por dezenas de itens.

**Why this priority**: A rolagem de página inteira faz com que o usuário perca de vista o título, os filtros e os cabeçalhos das colunas ao descer a lista, prejudicando severamente a ergonomia e a rapidez na análise dos dados.

**Independent Test**: Acessar qualquer página de listagem em `web` ou `admin` com mais de 20 registros, rolar o conteúdo verticalmente e verificar que apenas as linhas da tabela se deslocam, mantendo o cabeçalho fixado no topo com borda/sombra separadora e o título da página visível.

**Acceptance Scenarios**:

1. **Given** que o usuário acessa uma página de listagem com múltiplos registros, **When** a página é renderizada, **Then** o layout da página ocupa toda a altura disponível da janela do navegador (`flex flex-1 flex-col min-h-0`), sem gerar barra de rolagem externa na janela principal.
2. **Given** que a tabela possui mais linhas do que o espaço vertical disponível na tela, **When** o usuário efetua a rolagem vertical, **Then** o cabeçalho da tabela permanece congelado no topo com fundo opaco (`bg-background sticky top-0 z-10`) e apenas o corpo com as linhas de dados é rolado internamente.
3. **Given** que a tela é redimensionada para diferentes resoluções de monitor ou janelas menores, **When** o layout é recalculado, **Then** a tabela preserva o comportamento de rolagem interna adaptando-se à nova altura visível.

---

### User Story 2 - Paginação Fixada no Rodapé da Tela (Priority: P1)

Como usuário navegando por listas paginadas, quero que a barra de paginação (controles de página anterior/próxima, seletor de limite por página e contador de páginas) permaneça sempre ancorada no rodapé da área de trabalho, para que eu possa alternar páginas ou alterar o tamanho do lote sem precisar rolar até o fim da página.

**Why this priority**: Usuários precisam ter acesso imediato à navegação entre páginas a qualquer momento, independentemente da quantidade de registros carregados ou da posição atual do scroll.

**Independent Test**: Abrir uma listagem paginada, verificar que os controles de paginação estão fixados na parte inferior da área de dados e que a troca de página atualiza a lista mantendo a barra no mesmo lugar.

**Acceptance Scenarios**:

1. **Given** uma listagem com paginação ativa, **When** a tabela exibe seus dados, **Then** a barra de paginação (`DataTablePagination`) é renderizada fixada no rodapé (`mt-auto shrink-0 border-t bg-background py-2 px-4`).
2. **Given** uma lista com poucas linhas (ex.: 2 itens), **When** a tabela é exibida, **Then** a paginação permanece ancorada no rodapé inferior da área útil, sem subir colada à última linha.
3. **Given** que o usuário altera a página ou a quantidade de itens por página, **When** a ação é disparada, **Then** a lista recarrega mantendo a posição dos controles de paginação estável.

---

### User Story 3 - Esqueleto de Carregamento Otimizado para 8 Linhas (Priority: P2)

Como usuário aguardando o carregamento inicial ou a aplicação de filtros em uma listagem, quero visualizar um indicador de carregamento (skeleton) enxuto de 8 linhas que represente adequadamente o layout sem estourar a altura da tela ou causar saltos visuais bruscos.

**Why this priority**: Um esqueleto excessivamente longo causa quebra de layout e barras de rolagem desnecessárias durante o carregamento; 8 linhas preenchem confortavelmente o campo de visão padrão.

**Independent Test**: Simular carregamento com suspense ou latência de rede na consulta e verificar que o componente de suspense renderiza exatamente 8 linhas de placeholders skeleton na tabela.

**Acceptance Scenarios**:

1. **Given** que uma listagem está em estado de carregamento de busca ou filtros, **When** o esqueleto de suspense é exibido, **Then** o padrão renderiza 8 linhas de skeleton no corpo da tabela.
2. **Given** que o usuário altera um filtro, **When** a transição de busca ocorre, **Then** a estrutura de colunas do esqueleto preserva a largura e o alinhamento das colunas originais.

---

### User Story 4 - Atualização Atômica de Múltiplos Parâmetros de Filtro e Busca (Priority: P2)

Como usuário filtrando registros por múltiplos critérios simultâneos (ex.: busca textual, categoria, status ativo), quero que a limpeza ou aplicação simultânea de filtros atualize a URL de uma só vez e redefina a paginação para a primeira página, sem requisições concorrentes intermediárias.

**Why this priority**: Atualizar parâmetros um a um causa múltiplas re-renderizações e pode levar o usuário a estados inconsistentes (ex.: página 5 de um filtro com apenas 1 registro).

**Independent Test**: Aplicar filtros adicionais na tela de tarifários, acionar o botão "Limpar filtros" e constatar que todos os parâmetros extras são removidos simultaneamente da URL retornando à página 1.

**Acceptance Scenarios**:

1. **Given** que o usuário possui múltiplos filtros aplicados na URL, **When** aciona a limpeza de filtros combinados, **Then** uma única atualização atômica (`setParams`) remove todos os parâmetros selecionados e redefine a página para 1.
2. **Given** uma alteração de parâmetro que não seja a própria página, **When** novos filtros são definidos, **Then** o sistema ajusta automaticamente o parâmetro `pagina` para `1`.

---

### Edge Cases

- **Tabela vazia (sem registros)**: Quando a consulta não retorna registros, a mensagem de estado vazio ("Nenhum registro encontrado") deve ser centralizada no corpo da tabela preservando o cabeçalho fixo e a paginação no rodapé com indicador de página 1 de 1.
- **Telas com altura reduzida (laptops ou monitores verticais menores)**: A rolagem interna deve se limitar à área disponível entre o cabeçalho da página (título + busca) e a barra de paginação, sem que nenhum botão fique inacessível ou oculto fora da viewport.
- **Tabelas com muitas colunas (rolagem horizontal)**: O container da tabela deve suportar rolagem horizontal suave (`overflow-auto`) sem desencaixar o congelamento do cabeçalho vertical.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O layout principal das aplicações (`AppLayout`) DEVE prover um container de conteúdo flexível com altura total da janela (`min-h-0 flex-1 flex flex-col overflow-y-auto`) permitindo que as páginas filhas ocupem 100% da altura remanescente.
- **FR-002**: O componente `ListPageLayout` DEVE estruturar o título, a barra de busca e os filtros como elementos fixos sem encolhimento (`shrink-0`), delegando todo o espaço vertical restante (`flex-1 flex flex-col min-h-0`) para a área de dados.
- **FR-003**: O componente `PagedDataTable` DEVE preencher a altura disponível (`flex flex-1 flex-col min-h-0`), mantendo a tabela no topo e fixando o componente `DataTablePagination` no rodapé através de margem automática superior (`mt-auto shrink-0`).
- **FR-004**: O componente `Table` DEVE suportar um `containerClassName` customizável e seu container padrão DEVE possuir rolagem interna (`relative w-full overflow-auto`).
- **FR-005**: O cabeçalho `TableHeader` DEVE possuir posicionamento fixo (`sticky top-0 z-10 bg-background`) com sombra inferior ou borda (`shadow-[0_1px_0_0_hsl(var(--border))]`) para isolar visualmente as linhas de cabeçalho das linhas de dados em rolagem.
- **FR-006**: As células de cabeçalho `TableHead` DEVEM possuir fundo sólido condizente com o tema (`bg-background`) para evitar transparência sobre as linhas de dados roladas.
- **FR-007**: O componente `SearchResultsSuspense` e os skeletons padrão das tabelas DEVEM utilizar 8 linhas como valor padrão para simular o carregamento de forma harmônica com o espaço de tela.
- **FR-008**: O hook `usePaginacao` DEVE expor uma função `setParams(updates: Record<string, string | number>)` capaz de atualizar ou remover múltiplos parâmetros de consulta na URL em lote com uma única transição do React, redefinindo automaticamente `pagina` para 1 quando qualquer filtro que não a página for alterado.
- **FR-009**: A tela de listagem de tarifários DEVE substituir os modais de confirmação inline de ativação/desativação por navegação direta para edição, e o botão "Limpar filtros" DEVE resetar simultaneamente os filtros de categoria e de status.

### Key Entities

- **ListPageLayout**: Componente de moldura das telas de listagem, contendo título, botão de ação principal, filtros e espaço expansível de dados.
- **PagedDataTable**: Componente orquestrador da tabela com paginação, unindo o cabeçalho de contagem, a grade de dados e a barra de rodapé.
- **DataTablePagination**: Barra de controles de paginação (botões de primeira/anterior/próxima/última página, seletor de limite 10/25/50/100 e indicador textual de páginas).
- **PaginacaoParams**: Estrutura de estado de consulta via URL (`pagina`, `limite`, `busca`, `ordenar_por`, `direcao`, e parâmetros adicionais dinâmicos).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% das páginas de listagem em `web` e `admin` ocupam a altura total da janela sem exibir barra de rolagem dupla ou barra de rolagem na viewport principal do navegador quando há muitos registros.
- **SC-002**: Durante a rolagem de tabelas com mais de 50 registros, o cabeçalho das colunas permanece 100% legível e fixo no topo da tabela em 0ms de atraso visual.
- **SC-003**: A barra de paginação permanece visível na parte inferior da tela em 100% das páginas de listagem, independentemente da quantidade de itens retornados (0, 5 ou 100).
- **SC-004**: O tempo de renderização do esqueleto de carregamento com 8 linhas não causa layout shift perceptível (CLS < 0.05).
- **SC-005**: A ação de limpeza de filtros em lote atualiza a URL em uma única operação síncrona sem disparar requisições HTTP redundantes para a API.

## Assumptions

- O navegador do usuário possui suporte padrão a CSS Flexbox, CSS Grid e propriedades `position: sticky`.
- As tabelas utilizam a paleta de tokens do Tailwind CSS do projeto (`bg-background`, `border-border`, `text-muted-foreground`), garantindo contraste tanto no tema claro quanto no escuro.
- O padrão é aplicável tanto ao pacote `packages/web` quanto ao pacote `packages/admin`.
