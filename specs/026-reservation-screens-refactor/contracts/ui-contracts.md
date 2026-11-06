# UI Contracts: Telas de Reservas (Consulta e Nova Reserva)

**Feature**: Refatoração das Telas de Reservas
**Directory**: `specs/026-reservation-screens-refactor/contracts`
**Date**: 2026-11-05

## 1. Contrato da Página de Gestão de Reservas (`/reservas`)

### 1.1 Parâmetros de Navegação e Filtro (URL Query Parameters)

A página de consulta consome e atualiza a query string da URL via hook `usePaginacao`:

| Parâmetro | Tipo | Padrão | Descrição |
|---|---|---|---|
| `pagina` | `number` | `1` | Página atual da tabela |
| `limite` | `number` | `25` | Quantidade de itens por página |
| `busca` | `string` | `""` | Filtro textual (código ou nome do titular) |
| `status` | `ReservaStatus` | `""` (todos) | Situação da reserva (`a_confirmar`, `confirmada`, etc.) |
| `parceiro_id` | `string` | `""` (todos) | Identificador do parceiro comercial associado |

### 1.2 Layout e Componentes Estruturais

- Utiliza `ListPageLayout` com props:
  - `title`: `"Gestão de Reservas"`
  - `action`: Botão primário (`Button asChild`) direcionando para `/reservas/nova` com ícone `Plus mr-2 h-4 w-4`.
  - `searchBar`: Componente `SearchBar` com placeholder `"Buscar por código ou nome do hóspede..."`.
  - `filters`: Contêiner com altura `h-9` contendo:
    - Seletor de Status (estilizado em paridade de altura e borda com `SearchBar`).
    - Seletor de Parceiro Comercial (carregado via `parceirosComerciaisService.list({ status: 'ativo' })`).
  - `children`: `PagedDataTable` com colunas padronizadas (`codigo`, `titular`, `periodo`, `quarto`, `fnrh`, `valor_total`, `status`, `acoes`).

---

## 2. Contrato da Página de Nova Reserva (`/reservas/nova`)

### 2.1 Estrutura de Passos no `CrudFormLayout`

- `title`: `"Nova Reserva"`
- `backTo`: `"/reservas"`
- `submitLabel`: `"Cadastrar Reserva"`

#### Passo 1: Período e Ocupantes
- **Inputs**:
  - `check_in`: `DatePicker` com formato `YYYY-MM-DD`.
  - `check_out`: `DatePicker` com formato `YYYY-MM-DD`.
  - `quantidade_adultos`: `Input` numérico com ícone decorativo `Users` à esquerda (`pl-9 h-9`).
  - `quantidade_criancas`: `Input` numérico com ícone decorativo `Users` à esquerda (`pl-9 h-9`).
- **Feedback Banner**:
  - Exibido quando `check_in < check_out`.
  - Contém ícone `CheckCircle2`, período em formato brasileiro e contagem total de diárias.

#### Passo 2: Regime de Alimentação
- **Grid de Cards**:
  - Seleção por clique.
  - Indicador circular com borda da cor da pulseira (`cor_pulseira`).
  - Destaque ativo com anel temático (`ring-2 ring-primary/20 bg-primary/5 border-primary`).

#### Passo 3: Seleção da Suíte (Disponíveis com Tarifa Vigente)
- **Consulta Reativa**:
  - Acionada quando `podeConsultar` for verdadeiro.
  - Grid de suítes exibindo identificação da suíte, categoria, capacidade máxima de hóspedes e valor total formatado.
  - Estado vazio (`disponiveis.length === 0`) com caixa informativa amigável (`Info` icon, borda tracejada).

#### Resumo de Valor Total em Destaque
- **Card Resumo**:
  - Exibido quando uma suíte estiver selecionada.
  - Apresenta badge de valor congelado, suíte escolhida, quantidade de hóspedes e o valor total formatado em moeda brasileira (`R$ 0,00`).

#### Passo 4: Dados do Titular e Parceiro Comercial
- **Grid de Inputs**:
  - `titular_nome`: Input com ícone `User` à esquerda (`pl-9 h-9`).
  - `titular_telefone`: Input com ícone `Phone` à esquerda (`pl-9 h-9`) e máscara de telefone.
  - `titular_email`: Input com ícone `Mail` à esquerda (`pl-9 h-9`).
  - `parceiro_comercial_id`: Seletor estilizado (`h-9`) com ícone `Handshake`.
  - `observacoes`: `Textarea` para notas internas da recepção.
