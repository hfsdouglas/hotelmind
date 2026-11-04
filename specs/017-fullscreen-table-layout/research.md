# Phase 0 Research: Tabelas em Tela Cheia com Rolagem Interna, Cabeçalho Fixo e Paginação no Rodapé

## 1. Estratégia de Layout Flexível em Altura Total (`min-h-0` e `flex-1`)

- **Decision**: Configurar o container de conteúdo principal em `AppLayout` como `relative flex min-h-0 flex-1 flex-col overflow-y-auto p-6`. Na sequência, `ListPageLayout` e `PagedDataTable` recebem `flex flex-1 flex-col min-h-0`, e o elemento de tabela recebe `overflow-auto flex-1`.
- **Rationale**:
  - Em navegadores modernos, containers flexíveis aninhados não colapsam a altura se `min-h-0` for omitido, causando o transbordamento da janela inteira com scroll externo indesejado.
  - Ao declarar `min-h-0` em todos os níveis intermediários, a viewport delega o limite de altura física diretamente ao wrapper da tabela (`Table`).
- **Alternatives considered**:
  - Altura fixa em pixels (`height: 500px` ou `calc(100vh - 200px)`): rejeitado por quebrar em resoluções variáveis e quando a barra de filtros se expande.

## 2. Cabeçalho Congelado (`sticky top-0`) com Sombra de Separação

- **Decision**: Aplicar `sticky top-0 z-10 bg-background shadow-[0_1px_0_0_hsl(var(--border))]` no elemento `TableHeader` e `bg-background` explícito em `TableHead`.
- **Rationale**:
  - Sem `bg-background` sólido, o texto das linhas roladas se sobrepõe com transparência ao texto do cabeçalho.
  - O uso de `shadow-[0_1px_0_0_hsl(var(--border))]` em vez de simples `border-b` garante que a linha divisória do cabeçalho permaneça nítida mesmo sobre células com fundos alternados ou zebrados.
- **Alternatives considered**:
  - `position: fixed`: rejeitado porque remove o cabeçalho do fluxo natural da tabela e desalinha a largura das colunas.

## 3. Paginação Ancorada no Rodapé

- **Decision**: Adicionar `className="mt-auto shrink-0 border-t bg-background py-2 px-4"` ao componente `DataTablePagination` dentro de `PagedDataTable`.
- **Rationale**:
  - `mt-auto` empurra a barra de paginação para o limite inferior do container flexível, mesmo quando há apenas 1 ou 2 registros na página, eliminando o comportamento instável de "subir e descer" da barra.
  - `shrink-0` assegura que a barra de paginação nunca seja comprimida ou cortada quando o espaço vertical estiver no limite.

## 4. Otimização de Transição de Filtros e Paginação em Lote (`setParams`)

- **Decision**: Adicionar a função `setParams(updates: Record<string, string | number>)` no hook `usePaginacao`, utilizando uma `useRef` para capturar os parâmetros mais recentes da URL e executar um único `startTransition` atômico.
- **Rationale**:
  - Evita condições de corrida em que múltiplas chamadas consecutivas a `setParam` sobrescreviam filtros anteriores.
  - Automaticamente redefine `pagina` para `1` sempre que algum filtro diferente da página for alterado.
