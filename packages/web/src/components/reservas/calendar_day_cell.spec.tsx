import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { make_calendario_reservation } from '@/tests/utils/make_calendario_reservation'
import type { CellSelectionState } from '@/types/calendar_range_selection'
import type { Reservation } from '@/types/calendario_reserva'
import { CalendarDayCell } from './calendar_day_cell'

const QUARTO = { id: 'quarto-101', numero: '101' }
const DAY = new Date(2026, 11, 2)
const DAY_ISO = '2026-12-02'

function make_reservation(
  id: string,
  check_in: string,
  check_out: string
): Reservation {
  return make_calendario_reservation({
    id,
    quartoId: QUARTO.id,
    checkIn: `${check_in}T00:00:00`,
    checkOut: `${check_out}T00:00:00`,
  })
}

function render_cell(
  props: Partial<React.ComponentProps<typeof CalendarDayCell>> = {}
) {
  const handlers = {
    onSelectReservation: vi.fn(),
    onRangeStart: vi.fn(),
    onRangeExtend: vi.fn(),
  }
  render(
    <table>
      <tbody>
        <tr>
          <CalendarDayCell
            quarto={QUARTO}
            day={DAY}
            reservationsIntermediate={[]}
            reservationsForCheckOut={[]}
            reservationsForCheckIn={[]}
            selectionState="none"
            selectedReservationId={null}
            isDragging={false}
            {...handlers}
            {...props}
          />
        </tr>
      </tbody>
    </table>
  )
  const cell = screen.getByTestId(`calendar-day-cell-${QUARTO.id}-${DAY_ISO}`)
  return { cell, ...handlers }
}

function overlay_of(cell: HTMLElement) {
  const container = cell.firstElementChild as HTMLElement
  return container.firstElementChild as HTMLElement
}

function class_list(element: HTMLElement) {
  return element.className.split(/\s+/).filter(Boolean)
}

// Horizontal geometry only: width + anchored side (w-*, left-*, right-*, inset-*)
function geometry_of(element: HTMLElement) {
  return class_list(element)
    .filter(c => /^(w|left|right|inset)-/.test(c))
    .sort()
}

function screen_bar(cell: HTMLElement) {
  return within(cell).getByRole('button')
}

describe('CalendarDayCell', () => {
  it('exposes a test id with the suite id and the ISO day', () => {
    const { cell } = render_cell()

    expect(cell.tagName).toBe('TD')
  })

  it('has no data-selection and no overlay when not selected', () => {
    const { cell } = render_cell({ selectionState: 'none' })

    expect(cell).not.toHaveAttribute('data-selection')
    expect(cell.querySelector('[aria-hidden="true"]')).toBeNull()
  })

  it.each<CellSelectionState>([
    'start',
    'middle',
    'end',
  ])('renders the %s overlay as a filled, aria-hidden, non-interactive first child below the bars', state => {
    const { cell } = render_cell({ selectionState: state })

    const overlay = overlay_of(cell)

    expect(cell).toHaveAttribute('data-selection', state)
    expect(overlay).toHaveAttribute('aria-hidden', 'true')
    expect(overlay).toHaveClass('absolute', 'z-0', 'pointer-events-none')
    expect(class_list(overlay).some(c => /^bg-range-selection/.test(c))).toBe(
      true
    )
    expect(overlay).not.toHaveClass('bg-range-selection-border')
  })

  it.each<CellSelectionState>([
    'start',
    'middle',
    'end',
  ])('paints the %s overlay with the single regular selection color', state => {
    const { cell } = render_cell({ selectionState: state })

    const overlay = overlay_of(cell)

    expect(overlay).toHaveClass('bg-range-selection')
    expect(overlay).not.toHaveClass('bg-range-selection-strong')
    expect(overlay).not.toHaveClass('bg-range-selection-border')
  })

  it.each<CellSelectionState>([
    'start',
    'end',
  ])('keeps the %s overlay as a bar on the top with the bar height', state => {
    const { cell } = render_cell({ selectionState: state })

    expect(overlay_of(cell)).toHaveClass('top-0', 'h-8')
  })

  it.each([
    ['without reservations', []],
    ['with reservations', [make_reservation('r1', '2026-12-01', '2026-12-05')]],
  ])('does not show the pointer cursor on the cell %s', (_label, reservations) => {
    const { cell } = render_cell({ reservationsIntermediate: reservations })

    expect(cell).not.toHaveClass('cursor-pointer')
  })

  it.each<CellSelectionState>([
    'start',
    'middle',
    'end',
  ])('does not outline the whole cell with a ring in the %s overlay', state => {
    const { cell } = render_cell({ selectionState: state })

    const ring_classes = class_list(overlay_of(cell)).filter(c =>
      /^(ring|border|outline)(-|$)/.test(c)
    )

    expect(ring_classes).toEqual([])
  })

  it('fills the whole cell in the middle overlay', () => {
    const { cell } = render_cell({ selectionState: 'middle' })

    const overlay = overlay_of(cell)

    expect(overlay).toHaveClass('inset-0')
    expect(overlay).not.toHaveClass('right-0')
    expect(overlay).not.toHaveClass('left-0')
    expect(class_list(overlay).filter(c => /^w-/.test(c))).toEqual([])
  })

  it('anchors the start overlay to the right with the same width as the check-in bar', () => {
    const reservation = make_reservation('res-in', '2026-12-02', '2026-12-06')
    const bar_geometry = geometry_of(
      screen_bar(render_cell({ reservationsForCheckIn: [reservation] }).cell)
    )
    cleanup()

    const { cell } = render_cell({ selectionState: 'start' })
    const overlay = overlay_of(cell)

    expect(bar_geometry).toContain('right-0')
    expect(geometry_of(overlay)).toEqual(bar_geometry)
    expect(overlay).not.toHaveClass('inset-0')
    expect(overlay).not.toHaveClass('left-0')
    expect(class_list(overlay).some(c => /^rounded-l/.test(c))).toBe(true)
    expect(class_list(overlay).some(c => /^rounded-r/.test(c))).toBe(false)
  })

  it('anchors the end overlay to the left with the same width as the check-out bar', () => {
    const reservation = make_reservation('res-out', '2026-11-28', '2026-12-02')
    const bar_geometry = geometry_of(
      screen_bar(render_cell({ reservationsForCheckOut: [reservation] }).cell)
    )
    cleanup()

    const { cell } = render_cell({ selectionState: 'end' })
    const overlay = overlay_of(cell)

    expect(bar_geometry).toContain('left-0')
    expect(geometry_of(overlay)).toEqual(bar_geometry)
    expect(overlay).not.toHaveClass('inset-0')
    expect(overlay).not.toHaveClass('right-0')
    expect(class_list(overlay).some(c => /^rounded-r/.test(c))).toBe(true)
    expect(class_list(overlay).some(c => /^rounded-l/.test(c))).toBe(false)
  })

  it('does not paint the td with selection colors', () => {
    const { cell } = render_cell({ selectionState: 'start' })

    expect(cell.className).not.toMatch(/range-selection/)
  })

  it('starts a range with the suite and ISO day on primary mouse button down', () => {
    const { cell, onRangeStart } = render_cell()

    fireEvent.mouseDown(cell, { button: 0 })

    expect(onRangeStart).toHaveBeenCalledWith(
      { id: QUARTO.id, identificacao: '101' },
      DAY_ISO
    )
  })

  it.each([1, 2])('ignores mouse button %i', button => {
    const { cell, onRangeStart } = render_cell()

    fireEvent.mouseDown(cell, { button })

    expect(onRangeStart).not.toHaveBeenCalled()
  })

  it('prevents the default action on primary mouse down (no text selection)', () => {
    const { cell } = render_cell()

    const not_prevented = fireEvent.mouseDown(cell, { button: 0 })

    expect(not_prevented).toBe(false)
  })

  it('extends the range with the ISO day on mouse enter', () => {
    const { cell, onRangeExtend } = render_cell()

    fireEvent.mouseEnter(cell)

    expect(onRangeExtend).toHaveBeenCalledWith(DAY_ISO)
  })

  it('does not start a range when pressing a reservation bar, and click selects it', async () => {
    const user = userEvent.setup()
    const reservation = make_reservation('res-in', '2026-12-02', '2026-12-06')
    const { onRangeStart, onSelectReservation } = render_cell({
      reservationsForCheckIn: [reservation],
    })

    await user.click(screen.getByRole('button'))

    expect(onRangeStart).not.toHaveBeenCalled()
    expect(onSelectReservation).toHaveBeenCalledWith(reservation)
  })

  it('keeps reservation bars above the overlay in intermediate, check-out, check-in order', () => {
    const { cell } = render_cell({
      selectionState: 'middle',
      reservationsIntermediate: [
        make_reservation('res-mid', '2026-12-01', '2026-12-05'),
      ],
      reservationsForCheckOut: [
        make_reservation('res-out', '2026-11-28', '2026-12-02'),
      ],
      reservationsForCheckIn: [
        make_reservation('res-in', '2026-12-02', '2026-12-06'),
      ],
    })

    const container = cell.firstElementChild as HTMLElement
    const bars = within(container).getAllByRole('button')

    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true')
    expect(bars).toHaveLength(3)
    expect(bars[0]).toHaveClass('z-[1]')
    expect(bars[1]).toHaveClass('z-[2]')
    expect(bars[2]).toHaveClass('z-[3]')
  })

  describe('seleção de reserva e tooltip', () => {
    it('marks only the bar of the selected reservation as pressed', () => {
      const { cell } = render_cell({
        selectedReservationId: 'res-out',
        reservationsForCheckOut: [
          make_reservation('res-out', '2026-11-28', '2026-12-02'),
        ],
        reservationsForCheckIn: [
          make_reservation('res-in', '2026-12-02', '2026-12-06'),
        ],
      })

      const bars = within(cell).getAllByRole('button')
      const pressed = bars.filter(
        bar => bar.getAttribute('aria-pressed') === 'true'
      )

      expect(pressed).toHaveLength(1)
      expect(pressed[0]).toHaveAttribute('data-reserva-id', 'res-out')
    })

    it('marks no bar as pressed when nothing is selected', () => {
      const { cell } = render_cell({
        selectedReservationId: null,
        reservationsForCheckOut: [
          make_reservation('res-out', '2026-11-28', '2026-12-02'),
        ],
        reservationsForCheckIn: [
          make_reservation('res-in', '2026-12-02', '2026-12-06'),
        ],
      })

      for (const bar of within(cell).getAllByRole('button')) {
        expect(bar).toHaveAttribute('aria-pressed', 'false')
      }
    })

    it('does not show the summary tooltip on hover while dragging', async () => {
      const user = userEvent.setup()
      render_cell({
        isDragging: true,
        reservationsForCheckIn: [
          make_reservation('res-in', '2026-12-02', '2026-12-06'),
        ],
      })

      await user.hover(screen.getByRole('button'))
      await new Promise(resolve => setTimeout(resolve, 450))

      expect(screen.queryByRole('tooltip')).toBeNull()
    })
  })
})
