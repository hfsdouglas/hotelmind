import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SearchBar } from './search_bar'

describe('SearchBar', () => {
  it('renders with default placeholder', () => {
    render(<SearchBar onSearch={vi.fn()} />)
    expect(screen.getByPlaceholderText('Pesquisar...')).toBeInTheDocument()
  })

  it('renders with custom placeholder', () => {
    render(<SearchBar onSearch={vi.fn()} placeholder="Buscar hotéis..." />)
    expect(screen.getByPlaceholderText('Buscar hotéis...')).toBeInTheDocument()
  })

  it('initialises input with defaultValue', () => {
    render(<SearchBar defaultValue="grand" onSearch={vi.fn()} />)
    expect(screen.getByDisplayValue('grand')).toBeInTheDocument()
  })

  it('calls onSearch with the current input value on form submit', async () => {
    const user = userEvent.setup()
    const on_search = vi.fn()
    render(<SearchBar onSearch={on_search} />)

    await user.type(screen.getByRole('textbox'), 'palace')
    await user.click(screen.getByRole('button'))

    expect(on_search).toHaveBeenCalledWith('palace')
  })

  it('calls onSearch when Enter is pressed inside the input', async () => {
    const user = userEvent.setup()
    const on_search = vi.fn()
    render(<SearchBar onSearch={on_search} />)

    await user.type(screen.getByRole('textbox'), 'mar{Enter}')

    expect(on_search).toHaveBeenCalledWith('mar')
  })
})
