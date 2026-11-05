import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Calendar } from './calendar'

describe('Calendar component', () => {
  it('renders dropdown selects using Radix/shadcn Select component', () => {
    render(
      <Calendar
        mode="single"
        selected={new Date(2026, 2, 15)}
        defaultMonth={new Date(2026, 2, 15)}
        captionLayout="dropdown"
      />
    )

    // Radix SelectTrigger has role="combobox"
    const triggers = screen.getAllByRole('combobox')
    expect(triggers.length).toBeGreaterThanOrEqual(1)
  })
})
