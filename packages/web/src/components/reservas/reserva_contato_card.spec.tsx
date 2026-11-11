import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ReservaContatoCard } from './reserva_contato_card'

describe('ReservaContatoCard', () => {
  it('exibe todos os dados com telefone mascarado', () => {
    render(
      <ReservaContatoCard
        titularNome="Maria Silva"
        titularTelefone="11999998888"
        titularEmail="maria@test.com"
        observacoes="Chegada tardia"
      />
    )

    expect(screen.getByText('Contato do Titular')).toBeInTheDocument()
    expect(screen.getByText('Maria Silva')).toBeInTheDocument()
    expect(screen.getByText('(11) 99999-8888')).toBeInTheDocument()
    expect(screen.getByText('maria@test.com')).toBeInTheDocument()
    expect(screen.getByText('Chegada tardia')).toBeInTheDocument()
  })

  it('omite campos opcionais ausentes', () => {
    render(
      <ReservaContatoCard
        titularNome="Maria Silva"
        titularTelefone={null}
        titularEmail={null}
        observacoes={null}
      />
    )

    expect(screen.getByText('Maria Silva')).toBeInTheDocument()
    expect(screen.queryByText('Telefone')).not.toBeInTheDocument()
    expect(screen.queryByText('E-mail')).not.toBeInTheDocument()
    expect(screen.queryByText('Observações')).not.toBeInTheDocument()
  })
})
