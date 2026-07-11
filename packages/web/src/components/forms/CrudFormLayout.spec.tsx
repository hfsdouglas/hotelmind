import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { CrudFormLayout } from './CrudFormLayout'

function renderLayout(
  props: Partial<React.ComponentProps<typeof CrudFormLayout>> = {},
) {
  return render(
    <MemoryRouter>
      <CrudFormLayout
        title="Novo grupo"
        backTo="/grupos"
        onSubmit={vi.fn()}
        actions={<button type="submit">Salvar</button>}
        {...props}
      >
        <p>form fields</p>
      </CrudFormLayout>
    </MemoryRouter>,
  )
}

describe('CrudFormLayout', () => {
  it('renders the title as a heading', () => {
    renderLayout()
    expect(
      screen.getByRole('heading', { name: 'Novo grupo' }),
    ).toBeInTheDocument()
  })

  it('renders a back-navigation link pointing to backTo', () => {
    renderLayout()
    expect(screen.getByRole('link')).toHaveAttribute('href', '/grupos')
  })

  it('renders exactly one card containing the children', () => {
    renderLayout()
    const cards = screen.getAllByTestId('crud-form-card')
    expect(cards).toHaveLength(1)
    expect(cards[0]).toHaveTextContent('form fields')
  })

  it('renders actions outside the card, right-aligned', () => {
    renderLayout()
    const card = screen.getByTestId('crud-form-card')
    const actionsRow = screen.getByTestId('crud-form-actions')
    const actionButton = screen.getByRole('button', { name: 'Salvar' })
    expect(card).not.toContainElement(actionButton)
    expect(actionsRow).toContainElement(actionButton)
    expect(actionsRow).toHaveClass('justify-end')
  })

  it('invokes onSubmit when the form is submitted', () => {
    const onSubmit = vi.fn(e => e.preventDefault())
    renderLayout({ onSubmit })
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }))
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })

  it('applies the breakpoint-based container width classes', () => {
    const { container } = renderLayout()
    expect(container.firstChild).toHaveClass(
      'sm:max-w-[540px]',
      'md:max-w-[720px]',
      'lg:max-w-[960px]',
      'xl:max-w-[1140px]',
      '2xl:max-w-[1320px]',
    )
  })
})
