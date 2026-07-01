import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DataTablePagination } from './data_table_pagination'

const default_props = {
  pagina: 2,
  limite: 50,
  ultima_pagina: 5,
  onPagina: vi.fn(),
  onLimite: vi.fn(),
}

describe('DataTablePagination', () => {
  it('displays the current page and total pages', () => {
    render(<DataTablePagination {...default_props} />)
    expect(screen.getByText('Página 2 de 5')).toBeInTheDocument()
  })

  it('calls onPagina(1) when the first-page button is clicked', async () => {
    const user = userEvent.setup()
    const on_pagina = vi.fn()
    render(<DataTablePagination {...default_props} onPagina={on_pagina} />)
    const buttons = screen.getAllByRole('button')
    // first button = go to first page
    await user.click(buttons[0])
    expect(on_pagina).toHaveBeenCalledWith(1)
  })

  it('calls onPagina(pagina - 1) when the previous-page button is clicked', async () => {
    const user = userEvent.setup()
    const on_pagina = vi.fn()
    render(<DataTablePagination {...default_props} pagina={3} onPagina={on_pagina} />)
    const buttons = screen.getAllByRole('button')
    await user.click(buttons[1])
    expect(on_pagina).toHaveBeenCalledWith(2)
  })

  it('calls onPagina(pagina + 1) when the next-page button is clicked', async () => {
    const user = userEvent.setup()
    const on_pagina = vi.fn()
    render(<DataTablePagination {...default_props} onPagina={on_pagina} />)
    const buttons = screen.getAllByRole('button')
    await user.click(buttons[2])
    expect(on_pagina).toHaveBeenCalledWith(3)
  })

  it('calls onPagina(ultima_pagina) when the last-page button is clicked', async () => {
    const user = userEvent.setup()
    const on_pagina = vi.fn()
    render(<DataTablePagination {...default_props} onPagina={on_pagina} />)
    const buttons = screen.getAllByRole('button')
    await user.click(buttons[3])
    expect(on_pagina).toHaveBeenCalledWith(5)
  })

  it('disables first and previous buttons on the first page', () => {
    render(<DataTablePagination {...default_props} pagina={1} />)
    const buttons = screen.getAllByRole('button')
    expect(buttons[0]).toBeDisabled()
    expect(buttons[1]).toBeDisabled()
  })

  it('disables next and last buttons on the last page', () => {
    render(<DataTablePagination {...default_props} pagina={5} ultima_pagina={5} />)
    const buttons = screen.getAllByRole('button')
    expect(buttons[2]).toBeDisabled()
    expect(buttons[3]).toBeDisabled()
  })
})
