import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { make_calendario_reservation } from '@/tests/utils/make_calendario_reservation'
import type { Reservation } from '@/types/calendario_reserva'
import { ReservationCell } from './reservation_cell'

const mockReservation: Reservation = make_calendario_reservation({
  id: 'res-1',
  checkIn: '2026-11-10T00:00:00',
  checkOut: '2026-11-15T00:00:00',
})

function render_cell(
  props: Partial<React.ComponentProps<typeof ReservationCell>> = {},
  day = new Date('2026-11-12T12:00:00')
) {
  const onSelect = vi.fn()
  const utils = render(
    <ReservationCell
      reservation={mockReservation}
      day={day}
      isSelected={false}
      tooltipDisabled={false}
      onSelect={onSelect}
      {...props}
    />
  )
  return { onSelect, ...utils }
}

describe('ReservationCell', () => {
  it('shows the pointer cursor on the reservation bar itself', () => {
    render(
      <ReservationCell
        reservation={mockReservation}
        day={new Date('2026-11-12T12:00:00Z')}
        isSelected={false}
        tooltipDisabled={false}
        onSelect={vi.fn()}
      />
    )

    expect(screen.getByRole('button')).toHaveClass('cursor-pointer')
  })

  it('calls onSelect when cell is clicked', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()

    const { container } = render(
      <ReservationCell
        reservation={mockReservation}
        day={new Date('2026-11-12T12:00:00Z')}
        isSelected={false}
        tooltipDisabled={false}
        onSelect={onSelect}
      />
    )

    const cell = container.querySelector('.cursor-pointer')
    expect(cell).toBeInTheDocument()
    if (cell) await user.click(cell)

    expect(onSelect).toHaveBeenCalledWith(mockReservation)
  })

  it('renders check-in position styling with z-[3]', () => {
    const { container } = render(
      <ReservationCell
        reservation={mockReservation}
        day={new Date('2026-11-10T00:00:00')}
        isSelected={false}
        tooltipDisabled={false}
        onSelect={vi.fn()}
      />
    )

    const cell = container.querySelector('.right-0')
    expect(cell).toBeInTheDocument()
    expect(cell).toHaveClass('z-[3]')
  })

  it('renders check-out position styling with z-[2]', () => {
    const { container } = render(
      <ReservationCell
        reservation={mockReservation}
        day={new Date('2026-11-15T00:00:00')}
        isSelected={false}
        tooltipDisabled={false}
        onSelect={vi.fn()}
      />
    )

    const cell = container.querySelector('.left-0')
    expect(cell).toBeInTheDocument()
    expect(cell).toHaveClass('z-[2]')
  })

  it('renders intermediate day styling with z-[1]', () => {
    const { container } = render(
      <ReservationCell
        reservation={mockReservation}
        day={new Date('2026-11-12T00:00:00')}
        isSelected={false}
        tooltipDisabled={false}
        onSelect={vi.fn()}
      />
    )

    const cell = container.querySelector('.w-full')
    expect(cell).toBeInTheDocument()
    expect(cell).toHaveClass('z-[1]')
  })

  it('renders the orange check-in token for check_in status', () => {
    render_cell({
      reservation: { ...mockReservation, status: 'check_in' },
    })

    const cell = screen.getByRole('button')
    expect(cell).toHaveClass('bg-status-checkin')
    expect(cell).not.toHaveClass('bg-primary')
    expect(cell).not.toHaveClass('bg-primary/50')
    expect(cell).not.toHaveClass('bg-reservation-to-confirm')
  })

  it('renders bg-primary/50 for confirmada status', () => {
    render_cell({ reservation: { ...mockReservation, status: 'confirmada' } })

    const cell = screen.getByRole('button')
    expect(cell).toHaveClass('bg-primary/50')
    expect(cell).not.toHaveClass('bg-primary')
    expect(cell).not.toHaveClass('bg-status-checkin')
    expect(cell).not.toHaveClass('bg-reservation-to-confirm')
  })

  it('renders the diagonal zebra theme for a_confirmar status', () => {
    render_cell({ reservation: { ...mockReservation, status: 'a_confirmar' } })

    const cell = screen.getByRole('button')
    expect(cell).toHaveClass('bg-reservation-to-confirm')
    expect(cell).not.toHaveClass('bg-primary')
    expect(cell).not.toHaveClass('bg-primary/50')
    expect(cell).not.toHaveClass('bg-status-checkin')
  })

  it('does not propagate mousedown to the parent, and click still selects', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    const onParentMouseDown = vi.fn()

    render(
      // biome-ignore lint/a11y/noStaticElementInteractions: test wrapper observing bubbling
      <div onMouseDown={onParentMouseDown}>
        <ReservationCell
          reservation={mockReservation}
          day={new Date('2026-11-12T12:00:00Z')}
          isSelected={false}
          tooltipDisabled={false}
          onSelect={onSelect}
        />
      </div>
    )

    await user.click(screen.getByRole('button'))

    expect(onParentMouseDown).not.toHaveBeenCalled()
    expect(onSelect).toHaveBeenCalledWith(mockReservation)
  })

  describe('seleção', () => {
    it('applies the blue ring with a transparent gap and raises the bar when selected', () => {
      render_cell({ isSelected: true })

      const bar = screen.getByRole('button')
      expect(bar).toHaveAttribute('aria-pressed', 'true')
      expect(bar).toHaveClass(
        'ring-2',
        'ring-selection-ring',
        'ring-offset-1',
        'ring-offset-transparent',
        'shadow-selection',
        'z-[4]'
      )
    })

    it('has no selection classes when not selected', () => {
      render_cell({ isSelected: false })

      const bar = screen.getByRole('button')
      expect(bar).toHaveAttribute('aria-pressed', 'false')
      for (const cls of [
        'ring-2',
        'ring-selection-ring',
        'ring-offset-1',
        'ring-offset-transparent',
        'shadow-selection',
        'z-[4]',
      ]) {
        expect(bar).not.toHaveClass(cls)
      }
    })

    it('exposes the reservation code and holder as the accessible name and its id', () => {
      render_cell()

      expect(
        screen.getByRole('button', { name: 'Reserva RES-0101 - Ana Souza' })
      ).toHaveAttribute('data-reserva-id', 'res-1')
    })

    it('exposes the status for styling and assertions', () => {
      render_cell({ reservation: { ...mockReservation, status: 'check_in' } })

      expect(screen.getByRole('button')).toHaveAttribute(
        'data-status',
        'check_in'
      )
    })

    it('selects once with Enter', async () => {
      const user = userEvent.setup()
      const { onSelect } = render_cell()

      screen.getByRole('button').focus()
      await user.keyboard('{Enter}')

      expect(onSelect).toHaveBeenCalledTimes(1)
      expect(onSelect).toHaveBeenCalledWith(mockReservation)
    })

    it('selects once with Space', async () => {
      const user = userEvent.setup()
      const { onSelect } = render_cell()

      screen.getByRole('button').focus()
      await user.keyboard(' ')

      expect(onSelect).toHaveBeenCalledTimes(1)
    })

    it('selects once when clicked', async () => {
      const user = userEvent.setup()
      const { onSelect } = render_cell()

      await user.click(screen.getByRole('button'))

      expect(onSelect).toHaveBeenCalledTimes(1)
    })
  })

  describe('tooltip de resumo', () => {
    beforeEach(() => {
      vi.useFakeTimers({ shouldAdvanceTime: true })
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    function make_user() {
      return userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    }

    it('shows the summary card after hovering for more than 300 ms', async () => {
      const user = make_user()
      render_cell()

      await user.hover(screen.getByRole('button'))
      await act(async () => {
        await vi.advanceTimersByTimeAsync(400)
      })

      expect(await screen.findByRole('tooltip')).toHaveTextContent('RES-0101')
    })

    it('shows the summary card on keyboard focus', async () => {
      const user = make_user()
      render_cell()

      await user.tab()
      await act(async () => {
        await vi.advanceTimersByTimeAsync(400)
      })

      expect(await screen.findByRole('tooltip')).toHaveTextContent('RES-0101')
    })

    it('never shows the tooltip when tooltipDisabled', async () => {
      const user = make_user()
      render_cell({ tooltipDisabled: true })

      await user.hover(screen.getByRole('button'))
      await act(async () => {
        await vi.advanceTimersByTimeAsync(600)
      })

      expect(screen.queryByRole('tooltip')).toBeNull()
    })

    it('still selects when clicking with the tooltip open', async () => {
      const user = make_user()
      const { onSelect } = render_cell()
      await user.hover(screen.getByRole('button'))
      await act(async () => {
        await vi.advanceTimersByTimeAsync(400)
      })
      await screen.findByRole('tooltip')

      await user.click(screen.getByRole('button'))

      expect(onSelect).toHaveBeenCalledWith(mockReservation)
    })
  })
})
