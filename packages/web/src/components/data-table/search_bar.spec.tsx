import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { SearchBar } from './search_bar'

describe('SearchBar', () => {
  it('renders an input with the given placeholder', () => {
    render(<SearchBar value="" onSearch={vi.fn()} placeholder="Buscar grupos..." />)
    expect(screen.getByPlaceholderText('Buscar grupos...')).toBeInTheDocument()
  })

  it('uses default placeholder when none is provided', () => {
    render(<SearchBar value="" onSearch={vi.fn()} />)
    expect(screen.getByPlaceholderText('Pesquisar...')).toBeInTheDocument()
  })

  it('initializes input with the given value', () => {
    render(<SearchBar value="hotel" onSearch={vi.fn()} />)
    expect(screen.getByDisplayValue('hotel')).toBeInTheDocument()
  })

  it('calls onSearch with the current input value when the form is submitted', async () => {
    const user = userEvent.setup()
    const onSearch = vi.fn()
    render(<SearchBar value="" onSearch={onSearch} />)

    await user.type(screen.getByRole('textbox'), 'plaza')
    await user.click(screen.getByRole('button'))

    expect(onSearch).toHaveBeenCalledWith('plaza')
  })

  it('does not call onSearch on simple input changes (only on submit)', async () => {
    const user = userEvent.setup()
    const onSearch = vi.fn()
    render(<SearchBar value="" onSearch={onSearch} />)

    await user.type(screen.getByRole('textbox'), 'abc')

    expect(onSearch).not.toHaveBeenCalled()
  })
})
