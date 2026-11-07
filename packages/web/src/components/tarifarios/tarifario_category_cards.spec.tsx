import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import {
  type CategoryCardItem,
  TarifarioCategoryCards,
} from './tarifario_category_cards'

describe('TarifarioCategoryCards', () => {
  const mockCategories: CategoryCardItem[] = [
    { id: 'cat-1', nome: 'Suíte Standard', status: 'S' },
    { id: 'cat-2', nome: 'Suíte Luxo', status: 'S' },
    { id: 'cat-3', nome: 'Chalé Família', status: 'S' },
    { id: 'cat-4', nome: 'Desativada', status: 'N' },
  ]

  it('renders only active categories and shows count', () => {
    render(
      <TarifarioCategoryCards
        categorias={mockCategories}
        selectedIds={['cat-1']}
        onChange={vi.fn()}
      />
    )

    expect(screen.getByText('Suíte Standard')).toBeInTheDocument()
    expect(screen.getByText('Suíte Luxo')).toBeInTheDocument()
    expect(screen.getByText('Chalé Família')).toBeInTheDocument()
    expect(screen.queryByText('Desativada')).not.toBeInTheDocument()
    expect(screen.getByText(/1 de 3 selecionada/)).toBeInTheDocument()
  })

  it('toggles selection when clicking a card', () => {
    const handleChange = vi.fn()
    render(
      <TarifarioCategoryCards
        categorias={mockCategories}
        selectedIds={['cat-1']}
        onChange={handleChange}
      />
    )

    // Selecting another category
    fireEvent.click(screen.getByText('Suíte Luxo'))
    expect(handleChange).toHaveBeenCalledWith(['cat-1', 'cat-2'])

    // Deselecting currently selected category
    fireEvent.click(screen.getByText('Suíte Standard'))
    expect(handleChange).toHaveBeenCalledWith([])
  })

  it('handles "Selecionar todas" and "Desmarcar todas"', () => {
    const handleChange = vi.fn()
    const { rerender } = render(
      <TarifarioCategoryCards
        categorias={mockCategories}
        selectedIds={['cat-1']}
        onChange={handleChange}
      />
    )

    fireEvent.click(screen.getByText('Selecionar todas'))
    expect(handleChange).toHaveBeenCalledWith(['cat-1', 'cat-2', 'cat-3'])

    rerender(
      <TarifarioCategoryCards
        categorias={mockCategories}
        selectedIds={['cat-1', 'cat-2', 'cat-3']}
        onChange={handleChange}
      />
    )

    fireEvent.click(screen.getByText('Desmarcar todas'))
    expect(handleChange).toHaveBeenCalledWith([])
  })

  it('displays error message when provided', () => {
    render(
      <TarifarioCategoryCards
        categorias={mockCategories}
        selectedIds={[]}
        onChange={vi.fn()}
        error="Selecione ao menos uma categoria de quarto."
      />
    )

    expect(
      screen.getByText('Selecione ao menos uma categoria de quarto.')
    ).toBeInTheDocument()
  })
})
