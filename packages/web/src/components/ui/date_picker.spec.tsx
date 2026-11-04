import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { DatePicker } from './date_picker'

describe('DatePicker', () => {
  it('renders placeholder when value is empty', () => {
    render(<DatePicker placeholder="dd/mm/aaaa" />)
    const input = screen.getByPlaceholderText('dd/mm/aaaa')
    expect(input).toBeInTheDocument()
  })

  it('renders formatted date when value is provided in ISO', () => {
    render(<DatePicker value="2026-12-25" />)
    const input = screen.getByDisplayValue('25/12/2026')
    expect(input).toBeInTheDocument()
  })

  it('allows manual date typing with automatic mask and calls onChange with ISO', () => {
    const handleChange = vi.fn()
    render(<DatePicker onChange={handleChange} />)
    const input = screen.getByPlaceholderText('dd/mm/aaaa')

    fireEvent.change(input, { target: { value: '15032026' } })
    expect(input).toHaveValue('15/03/2026')
    expect(handleChange).toHaveBeenCalledWith('2026-03-15')
  })

  it('opens calendar popover when clicking the calendar icon button', () => {
    render(<DatePicker />)
    const button = screen.getByTitle('Abrir calendário')
    fireEvent.click(button)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})
