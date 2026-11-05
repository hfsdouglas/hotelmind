import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { TarifarioCalendarDay } from './tarifario_calendar_day'

describe('TarifarioCalendarDay', () => {
  it('calls onToggleDay when day is clicked', async () => {
    const user = userEvent.setup()
    const onToggleDay = vi.fn()

    render(
      <TarifarioCalendarDay
        isoDate="2026-11-15"
        dayNumber={15}
        isCurrentMonth={true}
        isToday={false}
        isSelected={false}
        isConflicting={false}
        occupiedPeriods={[]}
        onToggleDay={onToggleDay}
      />
    )

    const button = screen.getByTestId('calendar-day-2026-11-15')
    await user.click(button)

    expect(onToggleDay).toHaveBeenCalledWith('2026-11-15')
  })

  it('renders selected state indicator', () => {
    render(
      <TarifarioCalendarDay
        isoDate="2026-11-15"
        dayNumber={15}
        isCurrentMonth={true}
        isToday={false}
        isSelected={true}
        isConflicting={false}
        occupiedPeriods={[]}
        onToggleDay={vi.fn()}
      />
    )

    const cell = screen.getByTestId('calendar-day-cell-2026-11-15')
    expect(cell).toHaveAttribute('data-selected', 'true')
  })
})
