# Data Model: Tabelas em Tela Cheia com Rolagem Interna, Cabeçalho Fixo e Paginação no Rodapé

## 1. Estruturas de Estado de Paginação e Parâmetros (`usePaginacao`)

As tabelas de listagem consom parâmetros serializados na querystring da URL e expostos através do hook `usePaginacao`.

### 1.1. Interface `PaginacaoParams`

| Propriedade | Tipo | Valor Padrão | Descrição |
|---|---|---|---|
| `pagina` | `number` | `1` | Número da página atual |
| `limite` | `number` | `25` | Quantidade de registros por página (`10`, `25`, `50`, `100`) |
| `busca` | `string` | `""` | Termo de pesquisa textual livre |
| `ordenar_por` | `string` | `""` | Campo chave de ordenação da entidade |
| `direcao` | `'asc' \| 'desc'` | `'asc'` | Sentido da ordenação |

### 1.2. Funções de Mutação de Estado

- `setParam(key: string, value: string | number)`: Atualiza ou remove um único parâmetro, resetando `pagina` para `1`.
- `setParams(updates: Record<string, string | number>)`: Aplica múltiplas alterações atômicas na querystring em um único lote (`batch`), resetando `pagina` para `1` se algum filtro for modificado.
- `setPagina(pagina: number)`: Altera exclusivamente o número da página ativa.
- `toggleSort(campo: string)`: Alterna a ordenação do campo entre ascendente, descendente e desativada.

## 2. Metadados de Resposta da API (`meta`)

Estrutura padrão consumida pelos componentes `PagedDataTable` e `DataTablePagination`:

```typescript
interface PaginationMeta {
  pagina: number
  limite: number
  total: number
  ultima_pagina: number
}
```

## 3. Invariantes de Interface e Layout

1. **Invariante de Altura**: A soma das alturas de cabeçalho da página, barra de busca, tabela e paginação nunca excede a altura útil do container principal (`100% da viewport`).
2. **Invariante de Paginação**: A barra de paginação permanece fixa na base inferior com `shrink-0` e `mt-auto`, com altura de 48px e borda superior divisória.
3. **Invariante de Skeletons**: Durante qualquer carregamento via suspense em listagens, a tabela renderiza exatamente 8 linhas com placeholders de animação pulsante.
