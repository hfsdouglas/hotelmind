# Data Model: Refatoração das Telas de Reservas

**Feature**: Refatoração das Telas de Reservas
**Directory**: `specs/026-reservation-screens-refactor`
**Date**: 2026-11-05

## Visão Geral

Esta funcionalidade foca no alinhamento visual e ergonômico das telas de reservas do frontend (`packages/web`). Os modelos de dados consumidos já estão estabelecidos no pacote `@hotelmind/contracts`. Este documento descreve as entidades envolvidas no formulário e na listagem, com as respectivas regras de validação visual e de negócio.

---

## 1. Entidades de Dados

### 1.1 `Reserva` (Entidade da Listagem / Consulta)

Representa a reserva cadastrada no sistema.

| Campo | Tipo | Descrição | Apresentação na Tabela |
|---|---|---|---|
| `id` | `string` (UUID) | Identificador único | Chave de rota e navegação |
| `codigo` | `string` | Código legível da reserva (ex: `RES-001`) | Link monoespaçado com cor primária e data de criação abaixo |
| `titular_nome` | `string` | Nome do titular | Destaque em peso médio (`font-medium`) |
| `titular_telefone` | `string \| null` | Telefone do responsável | Formatado com máscara `(00) 00000-0000` |
| `check_in` | `string` (ISO Date) | Data de início da hospedagem | Formatado `dd/mm/aaaa` |
| `check_out` | `string` (ISO Date) | Data de término da hospedagem | Formatado `dd/mm/aaaa` |
| `quarto` | `{ identificacao: string, ... }` | Acomodação associada | Exibição de `Suíte [número]` |
| `regime_alimentacao` | `{ titulo: string, cor_pulseira: string }` | Regime de refeição | Ponto colorido com borda protetora + nome do regime |
| `parceiro_comercial` | `{ razao_social: string } \| null` | Agência / parceiro | Ícone de aperto de mão + Razão social |
| `fnrh` | `{ total_hospedes, fichas_preenchidas }` | Estado das fichas FNRH | Badge semântica (verde se completo, âmbar se pendente) |
| `valor_total` | `number \| string` | Valor financeiro da reserva | Moeda formatada em Real (`R$ 0,00`) em negrito |
| `status` | `ReservaStatus` | Situação (`a_confirmar`, `confirmada`, etc.) | Badge semântica estilizada com variantes de status |

### 1.2 `NovaReservaFormData` (Entidade do Formulário de Cadastro)

Dados gerenciados no formulário de criação de reserva.

| Campo | Tipo | Obrigatório | Regra de Validação / Apresentação |
|---|---|---|---|
| `check_in` | `string` | Sim | Data válida; menor que `check_out`. Input com DatePicker. |
| `check_out` | `string` | Sim | Data válida; maior que `check_in`. Input com DatePicker. |
| `quantidade_adultos` | `number` | Sim | Inteiro >= 1. Input numérico com ícone `Users`. |
| `quantidade_criancas` | `number` | Não | Inteiro >= 0. Input numérico com ícone auxiliar. |
| `regime_alimentacao_id` | `string` | Sim | UUID do regime selecionado via card interativo. |
| `quarto_id` | `string` | Sim | UUID da suíte selecionada com disponibilidade confirmada. |
| `titular_nome` | `string` | Sim | Mínimo 2 caracteres. Input com ícone `User`. |
| `titular_telefone` | `string` | Não | Máscara de telefone brasileiro. Input com ícone `Phone`. |
| `titular_email` | `string` | Não | Formato de e-mail válido se preenchido. Input com ícone `Mail`. |
| `parceiro_comercial_id` | `string` | Não | UUID do parceiro ativo selecionado via dropdown estilizado. |
| `observacoes` | `string` | Não | Texto livre com Textarea alinhado ao layout. |

---

## 2. Estados Derivados e Cálculos na Interface

- **`total_noites` (Duração da Estadia)**:
  - Calculado dinamicamente a partir de `check_in` e `check_out`.
  - Quando `check_in < check_out`, dispara a renderização do banner informativo:
    `Período selecionado: N diária(s) (dd/mm/aaaa até dd/mm/aaaa)`.
- **`pode_consultar_disponibilidade`**:
  - `Boolean(check_in && check_out && check_in < check_out && regime_alimentacao_id && (adultos + criancas) >= 1)`.
- **`valor_total_calculado`**:
  - Obtido diretamente da suíte selecionada na lista de quartos disponíveis.
  - Exibido no card de resumo de valor antes da confirmação do envio.
