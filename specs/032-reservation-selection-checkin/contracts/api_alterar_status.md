# API Contract (existing, unchanged): `PATCH /reservas/:id/status`

Consumed by `web` via `reservasService.changeStatus(id, status)` (`src/api/reservas.service.ts`). Types from `packages/.contracts/src/reservas.ts`: `ChangeReservaStatusPayload`, `Reserva`, `ReservaStatus`. No contract change.

## Request

- Auth: Bearer JWT (hotel from `request.user.hotelId`; never from body).
- Params: `id` (uuid of the reservation).
- Body: exactly `{ "status": "check_in" }` for this feature.

## Responses

| Status | When | Body |
|---|---|---|
| 200 | transition valid (`confirmada → check_in`) | `Reserva` (updated, `status: "check_in"`) |
| 400 | body invalid (Zod) | `{ message }` |
| 401 | missing/invalid token | `{ message }` |
| 404 | reservation not found **in the token's hotel** (includes other hotel's id) | `{ message: "Reserva não encontrada." }` |
| 422 | transition invalid (e.g. `a_confirmar → check_in`, `check_in → check_in` is a no-op 200) | `{ message }` from `ReservaTransicaoInvalidaError` |

Side effect: `reserva_status_historico` row (`status_anterior`, `status_novo`, `user_id`).

Note: `ReservaStatusService.validar_transicao` returns early when `atual === novo`, so a repeated `check_in` returns 200 without error. The web never sends it (button disabled for `check_in`).

## MSW handler (web, `src/mocks/reservas/reservas_handlers.ts`)

`http.patch(`${BASE_URL}/reservas/:id/status`)`:
- unknown id → 404 `{ message: 'Reserva não encontrada.' }`
- current `a_confirmar` and body `check_in` → 422 `{ message: 'Transição de status inválida: a_confirmar → check_in' }`
- otherwise mutate the in-memory fixture's `status` and return it (200)
- records the last request body in an exported getter (`ultimo_corpo_alterar_status()`) for assertions that the body has no `hotel_id`; reset alongside the existing fixture reset helper.
