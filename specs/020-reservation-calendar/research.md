# Phase 0 Research: Mapa e Calendário Visual de Ocupação de Reservas por Quarto

## 1. Visualização de Diárias Consecutivas com Meia-Célula (Turno de Check-in e Check-out)

- **Decision**: Na renderização de cada célula do dia para um quarto, classificar as reservas em três listas:
  1. `reservationsIntermediate`: dias internos entre check-in e check-out (largura 100%, `inset-0`).
  2. `reservationsForCheckOut`: dia de término da estadia (metade esquerda, `left-0 w-1/2 rounded-l`).
  3. `reservationsForCheckIn`: dia de início da estadia (metade direita, `right-0 w-1/2 rounded-r`).
- **Rationale**:
  - Na operação hoteleira, a diária de saída é liberada no final da manhã e a diária de entrada ingressa no início da tarde.
  - Ao desenhar saída na metade esquerda e entrada na metade direita, duas reservas no mesmo dia e mesmo quarto não colidem nem se ocultam.
- **Alternatives considered**:
  - Exibir duas linhas separadas por quarto: rejeitado por inflar verticalmente a tabela e dificultar a leitura do rack.

## 2. Cálculo Responsivo de Dias Visíveis

- **Decision**: Calcular a quantidade de colunas de dias através da fórmula:
  ```typescript
  const availableWidth = window.innerWidth - sidebarIconWidth - padding - roomColumnWidth - toolbarWidth
  const calculatedDays = Math.max(15, Math.floor(availableWidth / minCellWidth))
  ```
  onde `minCellWidth = 50px`. Adicionar listener no evento `window.resize`.
- **Rationale**:
  - Evita que monitores ultrawide exibam apenas 7 dias com células gigantes ou monitores compactos quebrem o layout.
  - Garante uma janela confortável mínima de 15 dias para planejamento de curto/médio prazo.
- **Alternatives considered**:
  - Fixar sempre em 30 dias com barra de rolagem horizontal: rejeitado por exigir rolagem horizontal constante para visualizar a semana atual.

## 3. Isolamento CSS contra Conflito de Z-Index (`isolate`)

- **Decision**: Adicionar `className="flex flex-col h-full isolate"` no container principal da página e garantir que a barra lateral possua z-index superior (`z-40` ou `z-50`).
- **Rationale**:
  - Elementos `sticky` com `z-index: 20` ou `z-index: 30` (como cabeçalho e coluna esquerda congelados) vazavam por cima da barra lateral móvel em certos navegadores.
  - A propriedade CSS `isolation: isolate` cria um novo contexto de empilhamento delimitado à página de calendário, impedindo que seus índices internos compitam com a barra lateral da aplicação.
