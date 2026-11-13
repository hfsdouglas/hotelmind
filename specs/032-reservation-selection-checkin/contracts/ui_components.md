# UI Contracts (web)

Props are the contract between page, components and hooks. Paths relative to `packages/web/src/`. All texts in pt-BR exactly as in spec.md.

## `components/reservas/reservation_cell.tsx` (changed)

```ts
interface ReservationCellProps {
  reservation: Reservation            // new view model (data-model.md)
  day: Date
  isSelected: boolean
  tooltipDisabled: boolean            // true while range dragging
  onSelect: (reservation: Reservation) => void
}
```

- `role="button"`, `aria-pressed={isSelected}`, `aria-label="Reserva {codigo} - {titular.nome}"`, `data-reserva-id={id}`.
- Theme: `check_in` → `bg-status-checkin`; `confirmada` → `bg-primary/50`; `a_confirmar` → `bg-reservation-to-confirm`.
- Selected: selection classes (research R8) and `z-[4]`.
- Tooltip content: `<ReservaResumoCard reservation={...} />`; `open={false}` when `tooltipDisabled`.

## `components/reservas/calendar_day_cell.tsx` (changed)

Adds `selectedReservationId: string | null` and `isDragging: boolean`, forwarded as `isSelected` / `tooltipDisabled` to each `ReservationCell`. `onSelectReservation` unchanged in signature.

## `components/reservas/reserva_resumo_card.tsx` (new)

```ts
interface ReservaResumoCardProps { reservation: Reservation }
```
Renders the fields of US5 scenario 1 (labels: "Titular", "Hóspedes", "Suíte", "Camas", "Pessoas", "Regime", "Período", "Valor total", "Parceiro", "FNRH", "Observações"). Observations with `line-clamp-6`.

## `components/reservas/calendario_barra_acoes.tsx` (new)

```ts
interface CalendarioBarraAcoesProps {
  reservaSelecionada: Reservation | null
  onNovaReserva: () => void
  onCheckIn: () => void
  onDetalhes: () => void
}
```
Buttons in order with accessible names "Nova Reserva", "Check-in", "Detalhes"; icons `CalendarPlus`, `BellRing`, `Info`. Disabled + tooltip reason from `avaliar_check_in` / "Selecione uma reserva para ver os detalhes". Disabled buttons are wrapped in a `span` tooltip trigger so the reason is reachable on hover and focus (`aria-describedby` / tooltip).

## `components/reservas/modal_check_in_reserva.tsx` (new)

```ts
type OpcaoCheckIn = 'confirmar' | 'preencher_fnrh' | 'sem_preencher'
interface ModalCheckInReservaProps {
  open: boolean
  reservation: Reservation | null
  hoje: Date
  isPending: boolean
  onOpenChange: (open: boolean) => void
  onConfirmar: (opcao: OpcaoCheckIn) => void
}
```
Title "Confirmar check-in". Sections: reservation data (US2 sc. 4), "Observações" (full text or "Sem observações"), FNRH progress, pending list + "O preenchimento é opcional." when pending, "Check-in antecipado: a entrada prevista é dd/MM/yyyy" when applicable, "Nenhuma ficha FNRH cadastrada" when no guests. Buttons per FR-008; all confirm buttons disabled while `isPending`. Presentational: no fetch, no toast.

## `components/reservas/modal_detalhes_reserva.tsx` (new, extracted from page)

```ts
interface ModalDetalhesReservaProps {
  open: boolean
  reservation: Reservation | null
  onOpenChange: (open: boolean) => void
}
```
Title "Detalhes da Reserva"; content per US4 sc. 2; link "Abrir reserva" → `/reservas/{id}`.

## `components/reservas/suite_status_indicator.tsx` (new, extracted from page)

```ts
interface SuiteStatusIndicatorProps { room: Room }
```
Dot (`bg-status-available|blocked|maintenance|cleaning|checkin`) + number + category with tooltip `ROOM_STATUS_LABEL[status]`; dot has `data-status={status}`.

## `components/reservas/reserva_status_badge.tsx` (new, extracted)

```ts
interface ReservaStatusBadgeProps { status: ReservaStatus }
```
Same classes as today except `check_in` → `bg-status-checkin/10 text-status-checkin-foreground border-status-checkin/40`.

## `hooks/use_reserva_selecionada.ts` (new)

```ts
function useReservaSelecionada(options: {
  regionRefs: RefObject<HTMLElement | null>[]
  paused: boolean
  idsVisiveis: readonly string[]
}): { selecionadaId: string | null; selecionar: (id: string) => void; limpar: () => void }
```
Esc (not paused) → limpar; `pointerdown` outside all regions (not paused) → limpar; id not in `idsVisiveis` → limpar.

## `hooks/use_check_in_reserva.ts` (new)

```ts
function useCheckInReserva(callbacks: {
  onSucesso: (reserva: Reserva) => void
  onNaoEncontrada: () => void
  onTransicaoInvalida: () => void
}): { realizarCheckIn: (reserva: { id: string; codigo: string }) => void; isPending: boolean }
```
Calls `reservasService.changeStatus(id, 'check_in')`; success toast `Check-in da reserva {codigo} realizado com sucesso!`; invalidates `['reservas']` and `['reserva', id]` on success, 404 and 422; error toasts per FR-011.

## Pages

- `pages/app/reservas/calendario.tsx`: wires the above; navigation to `/reservas/{id}?fnrh=pendente` on success with option `preencher_fnrh`.
- `pages/app/reservas/[id]/index.tsx`: handles `fnrh=pendente` (FR-012); uses `ReservaStatusBadge`.
- `pages/app/reservas/index.tsx`: uses `ReservaStatusBadge`.

## Tokens

`src/index.css` (`:root` and `.dark`): `--selection-ring`, `--selection-glow`, `--selection-highlight`, `--status-checkin`, `--status-checkin-foreground`, `--status-maintenance` (slate). `tailwind.config.ts`: `colors.status.checkin`, `colors.status['checkin-foreground']`, `colors['selection-ring']`.
