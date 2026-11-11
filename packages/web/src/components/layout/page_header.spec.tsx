import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PageHeader } from './page_header'

describe('PageHeader', () => {
  it('renders title and description', () => {
    render(
      <PageHeader title="Reservas" description="Gerencie as reservas do hotel">
        <button type="button">Nova Reserva</button>
      </PageHeader>
    )

    expect(
      screen.getByRole('heading', { name: 'Reservas' })
    ).toBeInTheDocument()
    expect(
      screen.getByText('Gerencie as reservas do hotel')
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Nova Reserva' })
    ).toBeInTheDocument()
  })

  it('applies middle container classes when middle is true', () => {
    const { container } = render(
      <PageHeader
        title="Configurações"
        description="Ajustes do sistema"
        middle
      />
    )

    expect(container.querySelector('.max-w-4xl')).toBeInTheDocument()
  })
})
