import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { DataTablePagination } from './data_table_pagination'

// The Select trigger renders with role="combobox", so getAllByRole('button') returns
// exactly the 4 navigation buttons in DOM order:
// [0] ChevronFirst  [1] ChevronLeft  [2] ChevronRight  [3] ChevronLast

function renderPagination(overrides: {
  pagina?: number
  limite?: number
  ultima_pagina?: number
  onPageChange?: ReturnType<typeof vi.fn>
  onLimitChange?: ReturnType<typeof vi.fn>
} = {}) {
  const props = {
    pagina: 2,
    limite: 50,
    ultima_pagina: 5,
    onPageChange: vi.fn(),
    onLimitChange: vi.fn(),
    ...overrides,
  }
  render(<DataTablePagination {...props} />)
  return props
}

describe('DataTablePagination', () => {
  it('shows current page and total pages', () => {
    renderPagination({ pagina: 3, ultima_pagina: 7 })
    expect(screen.getByText('Página 3 de 7')).toBeInTheDocument()
  })

  it('disables first and previous buttons on the first page', () => {
    renderPagination({ pagina: 1 })
    const buttons = screen.getAllByRole('button')
    expect(buttons[0]).toBeDisabled() // ChevronFirst
    expect(buttons[1]).toBeDisabled() // ChevronLeft
  })

  it('disables next and last buttons on the last page', () => {
    renderPagination({ pagina: 5, ultima_pagina: 5 })
    const buttons = screen.getAllByRole('button')
    expect(buttons[2]).toBeDisabled() // ChevronRight
    expect(buttons[3]).toBeDisabled() // ChevronLast
  })

  it('calls onPageChange(1) when first-page button is clicked', async () => {
    const user = userEvent.setup()
    const onPageChange = vi.fn()
    renderPagination({ pagina: 3, onPageChange })
    const buttons = screen.getAllByRole('button')
    await user.click(buttons[0])
    expect(onPageChange).toHaveBeenCalledWith(1)
  })

  it('calls onPageChange with pagina - 1 when previous button is clicked', async () => {
    const user = userEvent.setup()
    const onPageChange = vi.fn()
    renderPagination({ pagina: 3, onPageChange })
    const buttons = screen.getAllByRole('button')
    await user.click(buttons[1])
    expect(onPageChange).toHaveBeenCalledWith(2)
  })

  it('calls onPageChange with pagina + 1 when next button is clicked', async () => {
    const user = userEvent.setup()
    const onPageChange = vi.fn()
    renderPagination({ pagina: 3, ultima_pagina: 5, onPageChange })
    const buttons = screen.getAllByRole('button')
    await user.click(buttons[2])
    expect(onPageChange).toHaveBeenCalledWith(4)
  })

  it('calls onPageChange with ultima_pagina when last-page button is clicked', async () => {
    const user = userEvent.setup()
    const onPageChange = vi.fn()
    renderPagination({ pagina: 3, ultima_pagina: 5, onPageChange })
    const buttons = screen.getAllByRole('button')
    await user.click(buttons[3])
    expect(onPageChange).toHaveBeenCalledWith(5)
  })
})
