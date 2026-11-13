import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import {
  ROOM_STATUS_LABEL,
  type Room,
  type RoomStatus,
} from '@/types/calendario_reserva'
import { SuiteStatusIndicator } from './suite_status_indicator'

function make_room(status: RoomStatus): Room {
  return {
    id: 'quarto-101',
    numero: '101',
    tipo: 'Suíte Luxo',
    camas: [],
    status,
  }
}

describe('SuiteStatusIndicator', () => {
  it.each<[RoomStatus, string]>([
    ['disponivel', 'bg-status-available'],
    ['bloqueado', 'bg-status-blocked'],
    ['manutencao', 'bg-status-maintenance'],
    ['limpeza', 'bg-status-cleaning'],
    ['checkin', 'bg-status-checkin'],
  ])('paints the %s dot with %s', (status, css_class) => {
    const { container } = render(
      <SuiteStatusIndicator room={make_room(status)} />
    )

    const dot = container.querySelector(`[data-status="${status}"]`)
    expect(dot).toBeInTheDocument()
    expect(dot).toHaveClass(css_class)
  })

  it('shows the suite number and category', () => {
    render(<SuiteStatusIndicator room={make_room('disponivel')} />)

    expect(screen.getByText('101')).toBeInTheDocument()
    expect(screen.getByText('Suíte Luxo')).toBeInTheDocument()
  })

  it('shows the status label on hover', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <SuiteStatusIndicator room={make_room('checkin')} />
    )

    await user.hover(
      container.querySelector('[data-status="checkin"]') as HTMLElement
    )

    expect(ROOM_STATUS_LABEL.checkin).toBe('Check-in')
    expect((await screen.findAllByText('Check-in')).length).toBeGreaterThan(0)
  })
})
