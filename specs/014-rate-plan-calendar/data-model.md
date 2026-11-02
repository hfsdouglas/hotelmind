# Data Model — Gestão de Tarifários e Calendário de Tarifação

## Tarifario

Aggregate root do módulo de tarifação, isolado por `hotel_id` e vinculado a uma `CategoriaQuarto`.

| Campo | Tipo Prisma / PostgreSQL | Regra / Restrição |
|---|---|---|
| `id` | `String @id @default(uuid())` (`UUID`) | Identificador único imutável |
| `hotel_id` | `String` (`UUID`) | Escopo multi-tenant obrigatório; FK para `hoteis.id` (`onDelete: Cascade`) |
| `categoria_quarto_id` | `String` (`UUID`) | FK obrigatória para `categorias_quartos.id` (`onDelete: Restrict`) |
| `nome` | `String @db.VarChar(100)` | Obrigatório, `trim()`, entre 1 e 100 caracteres |
| `data_inicio` | `DateTime @db.Date` (`DATE`) | Data inicial inclusiva do intervalo `[data_inicio, data_fim)` |
| `data_fim` | `DateTime @db.Date` (`DATE`) | Data final exclusiva do intervalo `[data_inicio, data_fim)`; `data_inicio < data_fim` |
| `valor_diaria` | `Decimal @db.Decimal(12, 2)` (`NUMERIC(12,2)`) | Obrigatório, precisão de 2 casas decimais, `>= 0.00` |
| `ativo` | `Boolean @default(true)` (`BOOLEAN`) | Situação do tarifário (`true` = ativo, `false` = inativo) |
| `criado_em` | `DateTime @default(now())` (` TIMESTAMP(3)`) | Data/hora de criação |
| `atualizado_em` | `DateTime @updatedAt` (`TIMESTAMP(3)`) | Data/hora da última atualização |

### Índices e Constraints de Banco de Dados (`tarifarios`)

1. **Índices de consulta e relacionamento**:
   - `@@index([hotel_id])`
   - `@@index([categoria_quarto_id])`
   - `@@index([hotel_id, categoria_quarto_id, ativo])`
   - `@@index([hotel_id, categoria_quarto_id, data_inicio, data_fim])`
2. **Check Constraints**:
   - `tarifarios_datas_validas_check`: `CHECK ("data_inicio" < "data_fim")`
   - `tarifarios_valor_diaria_positivo_check`: `CHECK ("valor_diaria" >= 0)`
3. **Exclusion Constraint de Prevenção de Sobreposição (`btree_gist`)**:
   ```sql
   CREATE EXTENSION IF NOT EXISTS btree_gist;

   ALTER TABLE "tarifarios"
   ADD CONSTRAINT "tarifarios_sem_sobreposicao_ativa_excl"
   EXCLUDE USING gist (
     "hotel_id" WITH =,
     "categoria_quarto_id" WITH =,
     daterange("data_inicio", "data_fim", '[)') WITH &&
   )
   WHERE ("ativo" = true);
   ```
   - Garante que dois tarifários ativos (`ativo = true`) no mesmo `hotel_id` e `categoria_quarto_id` nunca possuam interseção no intervalo semiaberto `[data_inicio, data_fim)`.
   - Permite períodos consecutivos (`[2027-03-01, 2027-04-01)` e `[2027-04-01, 2027-05-01)`).
   - Permite múltiplos tarifários inativos (`ativo = false`) com períodos sobrepostos para preservação de histórico.

## Conversão de Datas: Modelo de Dados vs. Interface Web

| Camada | Início | Término | Exemplo (Março/2027 completo) |
|---|---|---|---|
| **Persistência / API (`[data_inicio, data_fim)`)** | Inclusivo (`data_inicio`) | Exclusivo (`data_fim`) | `data_inicio = "2027-03-01"`, `data_fim = "2027-04-01"` |
| **Interface Web (Visualização / Inputs / Calendário)** | Inclusivo (`data_inicio`) | Inclusivo (`data_fim_efetiva = data_fim - 1 dia`) | `01/03/2027` até `31/03/2027` |

- Na interface, selecionar um único dia efetivo (ex.: `10/05/2027` a `10/05/2027`) corresponde ao intervalo semiaberto `["2027-05-10", "2027-05-11")` na API e no banco, satisfazendo `data_inicio < data_fim`.

## Projeção de Período do Calendário (`PeriodoTarifarioCalendario`)

Estrutura leve retornada por `GET /tarifarios/calendario` para renderizar ocupações e validar conflitos no calendário mensal:

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | `string` (UUID) | Identificador do tarifário |
| `categoria_quarto_id` | `string` (UUID) | Identificador da categoria de quarto |
| `nome` | `string` | Nome do tarifário |
| `data_inicio` | `string` (`YYYY-MM-DD`) | Data inicial inclusiva |
| `data_fim` | `string` (`YYYY-MM-DD`) | Data final exclusiva |
| `valor_diaria` | `string` (`"200.00"`) | Valor monetário formatado com duas casas decimais |
| `ativo` | `boolean` | Situação atual (`true` = ativo, `false` = inativo) |

## Cálculo de Tarifa de Reserva (`CalculoTarifaReserva`)

Projeção de domínio gerada por `TarifarioPricingService` / `CalcularTarifaReservaUseCase`:

| Campo | Tipo | Regra |
|---|---|---|
| `noites` | `Array<{ data: string; tarifario_id: string; tarifario_nome: string; valor_diaria: string }>` | Lista de cada noite `d` em `[check_in, check_out)` com o tarifário ativo de menor valor aplicável |
| `valor_total` | `string` (`"600.00"`) | Soma exata em duas casas decimais dos valores de cada noite |

## Transições de Estado

```text
Ativo (ativo = true) <----> Inativo (ativo = false)
```

- **Criação**: Inicia com `ativo = true` por padrão (ou conforme enviado no formulário), validando ausência de conflito caso `ativo = true`.
- **Desativação (`ativo: true -> false`)**: Preserva o registro histórico; libera o intervalo para novos tarifários ativos e retira o tarifário de novos cálculos de reserva.
- **Reativação (`ativo: false -> true`)**: Executa novamente a validação de conflito de período contra os tarifários ativos do mesmo `hotel_id` e `categoria_quarto_id` antes de persistir.
- **Exclusão física**: Não permitida nem exposta na API ou interface.
