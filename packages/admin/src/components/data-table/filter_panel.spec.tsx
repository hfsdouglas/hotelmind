import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FilterPanel } from './filter_panel'

describe('FilterPanel', () => {
  it('starts closed — children are not visible', () => {
    render(
      <FilterPanel>
        <input placeholder="filtro interno" />
      </FilterPanel>,
    )
    expect(screen.queryByPlaceholderText('filtro interno')).not.toBeInTheDocument()
  })

  it('reveals children when "Mais filtros" is clicked', async () => {
    const user = userEvent.setup()
    render(
      <FilterPanel>
        <input placeholder="filtro interno" />
      </FilterPanel>,
    )
    await user.click(screen.getByRole('button', { name: /mais filtros/i }))
    expect(screen.getByPlaceholderText('filtro interno')).toBeInTheDocument()
  })

  it('hides children again when the toggle is clicked a second time', async () => {
    const user = userEvent.setup()
    render(
      <FilterPanel>
        <input placeholder="filtro interno" />
      </FilterPanel>,
    )
    const toggle = screen.getByRole('button', { name: /mais filtros/i })
    await user.click(toggle)
    await user.click(toggle)
    expect(screen.queryByPlaceholderText('filtro interno')).not.toBeInTheDocument()
  })
})
