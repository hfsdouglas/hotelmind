# Phase 1 Data Model: Cadastro de Categorias e Quartos

## CategoriaQuarto

Representa um agrupamento de quartos dentro de um hotel.

| Campo | Tipo | Regras |
|---|---|---|
| `id` | string/UUID | Identificador gerado |
| `hotel_id` | string/UUID | Obrigatório; vem do contexto autenticado |
| `nome` | string | Obrigatório, 1–100 caracteres após trim; único por hotel sem distinção de caixa |
| `status` | `S`/`N` | Padrão `S`; somente categorias ativas recebem novos quartos |
| `created_at` | datetime | Gerado na criação |
| `updated_at` | datetime | Atualizado pelo armazenamento |

Relacionamentos: pertence a um `Hotel` e possui zero ou mais `Quarto`.

## Quarto

Representa uma unidade hospedável do hotel.

| Campo | Tipo | Regras |
|---|---|---|
| `id` | string/UUID | Identificador gerado |
| `hotel_id` | string/UUID | Obrigatório; usado para isolamento do tenant |
| `categoria_id` | string/UUID | Obrigatório; referencia categoria ativa do mesmo hotel |
| `identificacao` | string | Obrigatório, 1–30 caracteres após trim; único por hotel sem distinção de caixa |
| `limite_hospedes` | integer | Obrigatório; inteiro positivo |
| `created_at` | datetime | Gerado na criação |
| `updated_at` | datetime | Atualizado pelo armazenamento |

Relacionamentos: pertence a uma `CategoriaQuarto`, pertence a um `Hotel` e possui uma ou mais `ConfiguracaoCama`.

## ConfiguracaoCama

Representa um tipo de cama e sua quantidade em um quarto.

| Campo | Tipo | Regras |
|---|---|---|
| `id` | string/UUID | Identificador gerado |
| `quarto_id` | string/UUID | Obrigatório; pertence ao quarto |
| `tipo` | enum/string controlada | Obrigatório; opção válida do domínio |
| `quantidade` | integer | Obrigatório; inteiro positivo |

Um quarto deve ter pelo menos uma configuração. O mesmo tipo de cama não deve aparecer repetido no mesmo cadastro; a interface deve consolidar ou bloquear duplicações antes do envio.

## Invariantes e transições

- Categoria é criada no estado ativo por padrão.
- Quarto só pode ser criado quando a categoria existe, pertence ao mesmo hotel e está ativa.
- A criação de quarto cria também todas as configurações de cama na mesma transação.
- Não há transição de edição/exclusão nesta feature.
