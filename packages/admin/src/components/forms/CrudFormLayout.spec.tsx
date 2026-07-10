import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { CrudFormLayout } from './CrudFormLayout'

describe('CrudFormLayout', () => {
  it('renders the title as a heading', () => {
    render(
      <MemoryRouter>
        <CrudFormLayout title="Novo Hotel" backTo="/hoteis">
          <p>form fields</p>
        </CrudFormLayout>
      </MemoryRouter>,
    )
    expect(
      screen.getByRole('heading', { name: 'Novo Hotel' }),
    ).toBeInTheDocument()
  })

  it('renders a back-navigation link pointing to backTo', () => {
    render(
      <MemoryRouter>
        <CrudFormLayout title="Novo Hotel" backTo="/hoteis">
          <p>form fields</p>
        </CrudFormLayout>
      </MemoryRouter>,
    )
    expect(screen.getByRole('link')).toHaveAttribute('href', '/hoteis')
  })

  it('renders children inside a card', () => {
    render(
      <MemoryRouter>
        <CrudFormLayout title="Novo Hotel" backTo="/hoteis">
          <p>form fields</p>
        </CrudFormLayout>
      </MemoryRouter>,
    )
    expect(screen.getByText('form fields')).toBeInTheDocument()
  })

  it('renders an optional sidebar alongside the form card', () => {
    render(
      <MemoryRouter>
        <CrudFormLayout
          title="Editar Hotel"
          backTo="/hoteis"
          sidebar={<p>rotas do hotel</p>}
        >
          <p>form fields</p>
        </CrudFormLayout>
      </MemoryRouter>,
    )
    expect(screen.getByText('rotas do hotel')).toBeInTheDocument()
  })

  it('does not render sidebar content when sidebar is not provided', () => {
    render(
      <MemoryRouter>
        <CrudFormLayout title="Novo Hotel" backTo="/hoteis">
          <p>form fields</p>
        </CrudFormLayout>
      </MemoryRouter>,
    )
    expect(screen.queryByText('rotas do hotel')).not.toBeInTheDocument()
  })
})
