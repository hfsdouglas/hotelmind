import type { ReservaStatus } from '@hotelmind/contracts'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { STATUS_RESERVA_LABEL } from '@/types/calendario_reserva'
import { ReservaStatusBadge } from './reserva_status_badge'

const STATUSES: ReservaStatus[] = [
  'a_confirmar',
  'confirmada',
  'check_in',
  'check_out',
  'no_show',
  'cancelada',
]

describe('ReservaStatusBadge', () => {
  it.each(STATUSES)('renders the label of %s', status => {
    render(<ReservaStatusBadge status={status} />)

    expect(screen.getByText(STATUS_RESERVA_LABEL[status])).toBeInTheDocument()
  })

  it('uses the orange check-in token and no emerald class for check_in', () => {
    render(<ReservaStatusBadge status="check_in" />)

    const badge = screen.getByText('Check-in')
    expect(badge).toHaveClass(
      'bg-status-checkin/10',
      'text-status-checkin-foreground',
      'border-status-checkin/40'
    )
    expect(badge.className).not.toMatch(/emerald/)
  })

  it.each([
    ['a_confirmar', 'amber'],
    ['confirmada', 'sky'],
    ['check_out', 'muted'],
    ['no_show', 'purple'],
    ['cancelada', 'destructive'],
  ] as const)('keeps the %s classes (%s)', (status, token) => {
    render(<ReservaStatusBadge status={status} />)

    const badge = screen.getByText(STATUS_RESERVA_LABEL[status])
    expect(badge.className).toContain(token)
    expect(badge.className).not.toMatch(/status-checkin/)
  })
})
