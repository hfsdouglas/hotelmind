import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { CrudFormLayout } from './crud_form_layout'

function renderLayout(
  props: Partial<React.ComponentProps<typeof CrudFormLayout>> = {}
) {
  return render(
    <CrudFormLayout
      title="Novo grupo"
      renderBackLink={icon => <a href="/grupos">{icon}</a>}
      onSubmit={vi.fn()}
      actions={<button type="submit">Salvar</button>}
      {...props}
    >
      <p>form fields</p>
    </CrudFormLayout>
  )
}

describe('CrudFormLayout', () => {
  it('renders the title as a heading', () => {
    renderLayout()
    expect(
      screen.getByRole('heading', { name: 'Novo grupo' })
    ).toBeInTheDocument()
  })

  it('renders the back link provided by renderBackLink with the arrow icon', () => {
    renderLayout()
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/grupos')
    expect(link.querySelector('svg')).toBeInTheDocument()
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

  it('applies the breakpoint-based container width classes and extra className', () => {
    const { container } = renderLayout({ className: 'extra' })
    expect(container.firstChild).toHaveClass(
      'sm:max-w-[540px]',
      'md:max-w-[720px]',
      'lg:max-w-[960px]',
      'xl:max-w-[1140px]',
      '2xl:max-w-[1320px]',
      'extra'
    )
  })

  it('renders the default SaveButton when actions is omitted', () => {
    renderLayout({ actions: undefined, submitLabel: 'Criar' })
    const button = screen.getByRole('button', { name: /Criar/i })
    expect(button.querySelector('svg')).toBeInTheDocument()
  })

  it('renders the card title when provided', () => {
    renderLayout({ cardTitle: 'Dados gerais' })
    expect(screen.getByText('Dados gerais')).toBeInTheDocument()
  })
})
