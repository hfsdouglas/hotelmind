# Data Model: Seleção de Reserva e Check-in pelo Calendário

Sem mudanças de banco, de API ou de `packages/.contracts`. Os modelos abaixo são view models do `web` (`src/types/calendario_reserva.ts`) derivados dos contratos `Reserva`, `Hospede`, `Quarto`, `ConfiguracaoCama`, `ReservaStatus`.

## CalendarioStatusReserva

`Extract<ReservaStatus, 'a_confirmar' | 'confirmada' | 'check_in'>`. Constante `STATUS_EXIBIDOS_NO_CALENDARIO` (substitui `allowedStatuses` local).

`STATUS_RESERVA_LABEL: Record<ReservaStatus, string>`: a_confirmar "A Confirmar", confirmada "Confirmada", check_in "Check-in", check_out "Check-out", no_show "No-show", cancelada "Cancelada".

## CalendarioHospede

| Campo | Tipo | Origem |
|---|---|---|
| posicao | number | `Hospede.posicao` |
| nome | string \| null | `Hospede.nome_completo` (vazio → null) |
| ficha_status | `FichaStatus` | `Hospede.ficha_status` |

## Reservation (substitui o atual em `contexts/reservations_context.tsx`)

| Campo | Tipo | Origem / regra |
|---|---|---|
| id | string | `Reserva.id` |
| codigo | string | `Reserva.codigo` |
| quartoId | string | `Reserva.quarto_id` |
| quarto_identificacao | string | `Reserva.quarto.identificacao` ou identificação do `Quarto` da lista; fallback "-" |
| categoria_nome | string | `Reserva.quarto.categoria_nome` ou `Quarto.categoria.nome`; fallback "-" |
| camas | `ConfiguracaoCama[]` | `Quarto.camas` do quarto com o mesmo id; `[]` se não houver |
| checkIn / checkOut | string | `YYYY-MM-DDT00:00:00` (regra atual mantida) |
| diarias | number | diferença em dias entre check-out e check-in |
| status | CalendarioStatusReserva | `Reserva.status` |
| status_label | string | `STATUS_RESERVA_LABEL[status]` |
| titular | `{ nome: string; email: string \| null; telefone: string \| null }` | `titular_*` |
| adultos / criancas | number | `quantidade_adultos` / `quantidade_criancas` |
| regime_titulo | string \| null | `Reserva.regime_alimentacao?.titulo` |
| parceiro_nome | string \| null | `Reserva.parceiro?.razao_social` |
| valor_total | number | `Number(valor_total)`; `NaN` → 0 |
| observacoes | string \| null | `Reserva.observacoes` (vazio → null) |
| hospedes | `CalendarioHospede[]` | `Reserva.hospedes ?? []`, ordenado por posição |
| fichas_preenchidas / total_hospedes | number | contrato |

Removidos: `status_code`, `pagamento`, `hospede.documento`.

## Room / CalendarioSuite

| Campo | Tipo | Regra |
|---|---|---|
| id, numero, tipo | string | inalterado |
| camas | `ConfiguracaoCama[]` | `Quarto.camas` |
| status | `RoomStatus = 'disponivel' \| 'bloqueado' \| 'manutencao' \| 'limpeza' \| 'checkin'` | `derive_suite_status` |

`ROOM_STATUS_LABEL`: disponivel "Disponível", bloqueado "Bloqueado", manutencao "Manutenção", limpeza "Limpeza", checkin "Check-in".

### derive_suite_status(quarto, reservas)

1. `quarto.status === 'N'` → `bloqueado`
2. alguma reserva com `quartoId === quarto.id && status === 'check_in'` → `checkin`
3. senão → `disponivel`

## Regras derivadas (funções puras em `src/lib/`)

### `avaliar_check_in(reserva | null)` (`lib/reserva_status.ts`)

| Entrada | Resultado |
|---|---|
| null | `{ permitido: false, motivo: 'Selecione uma reserva para fazer check-in' }` |
| status `a_confirmar` | `{ permitido: false, motivo: 'Confirme a reserva antes do check-in' }` |
| status `check_in` | `{ permitido: false, motivo: 'Check-in já realizado' }` |
| status `confirmada` | `{ permitido: true }` |

### `fichas_pendentes(hospedes)` (`lib/fnrh.ts`)

Hóspedes com `ficha_status !== 'preenchida'`, ordenados por `posicao`. Rótulo: `nome ?? "Hóspede {posicao}"`; status "Pendente" (`pendente`) ou "Rascunho" (`rascunho`). `primeira_ficha_pendente(hospedes)` = primeiro item ou null.

### `formatar_camas(camas)` (`lib/camas.ts`)

`CAMA_LABEL: Record<TipoCama, string>` = solteiro "Solteiro", casal "Casal", queen "Queen", king "King", beliche "Beliche", sofa_cama "Sofá-cama". Resultado `"{qtd} {label}"` unidos por ", "; `[]` → "Não informada".

### `is_check_in_antecipado(checkIn, hoje)` (`lib/reserva_status.ts`)

`true` quando o dia de check-in > hoje (comparação por dia).

## Estado de UI (efêmero)

| Estado | Dono | Notas |
|---|---|---|
| `selecionadaId: string \| null` | `use_reserva_selecionada` | regras da tabela "Seleção de reserva" da spec |
| `detalhesOpen`, `checkInOpen`, `novaReservaOpen` | `calendario.tsx` | qualquer um aberto pausa seleção de período e o hook de seleção de reserva |

## Transições de status (API, inalteradas)

`confirmada → check_in` (200); `a_confirmar → check_in` (422 `ReservaTransicaoInvalidaError`); reserva de outro hotel/inexistente (404). Toda transição grava `reserva_status_historico` (comportamento existente).
