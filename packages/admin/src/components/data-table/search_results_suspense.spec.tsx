import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import {
  SearchResultsSkeleton,
  SearchResultsSuspense,
} from './search_results_suspense'

describe('SearchResultsSuspense', () => {
  it('renders a table-shaped skeleton with the requested columns', () => {
    render(<SearchResultsSkeleton column_count={4} row_count={2} />)

    expect(screen.getByLabelText('Carregando resultados')).toHaveAttribute(
      'aria-busy',
      'true'
    )
    expect(screen.getAllByRole('row')).toHaveLength(3)
    expect(screen.getAllByRole('row')[1].querySelectorAll('td')).toHaveLength(4)
  })

  it('keeps result content and controls available while pending', () => {
    render(
      <SearchResultsSuspense column_count={3} is_pending label="Resultados">
        <button type="button">Continuar</button>
      </SearchResultsSuspense>
    )

    expect(screen.getByRole('region', { name: 'Resultados' })).toHaveAttribute(
      'aria-busy',
      'true'
    )
    expect(
      screen.getByRole('button', { name: 'Continuar' })
    ).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent(
      'Atualizando resultados.'
    )
  })

  it('announces completion after a pending refresh ends', () => {
    const view = render(
      <SearchResultsSuspense column_count={3} is_pending label="Resultados">
        <div>Resultados anteriores</div>
      </SearchResultsSuspense>
    )

    view.rerender(
      <SearchResultsSuspense column_count={3} label="Resultados">
        <div>Resultados novos</div>
      </SearchResultsSuspense>
    )

    expect(screen.getByRole('status')).toHaveTextContent(
      'Resultados atualizados.'
    )
    expect(screen.getByText('Resultados novos')).toBeInTheDocument()
  })
})
