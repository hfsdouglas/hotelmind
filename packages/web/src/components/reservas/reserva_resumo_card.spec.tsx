import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import {
  make_calendario_reservation,
  make_calendario_reservation_0102,
} from '@/tests/utils/make_calendario_reservation'
import { ReservaResumoCard } from './reserva_resumo_card'

describe('ReservaResumoCard', () => {
  it('shows the full summary of a reservation', () => {
    render(
      <ReservaResumoCard reservation={make_calendario_reservation_0102()} />
    )

    for (const text of [
      'RES-0102',
      'Confirmada',
      'Fernanda Alves',
      'Hóspede 1',
      'Carlos Lima',
      '1 Casal',
      '2 adultos, 1 criança',
      'Pensão Completa',
      'R$ 980,50',
      'Agência Sol',
      'FNRH 0 de 2 preenchidas',
    ]) {
      expect(screen.getByText(text)).toBeInTheDocument()
    }
    expect(screen.getByText('102')).toBeInTheDocument()
    expect(screen.getByText(/Suíte Luxo/)).toBeInTheDocument()
    expect(screen.getByText(/2 diárias/)).toBeInTheDocument()
    expect(screen.getByText(/01\/12\/2026/)).toBeInTheDocument()
  })

  it('omits the Observações label when there are none', () => {
    render(
      <ReservaResumoCard reservation={make_calendario_reservation_0102()} />
    )

    expect(screen.queryByText('Observações')).toBeNull()
  })

  it('clamps long observations to 6 lines', () => {
    render(
      <ReservaResumoCard
        reservation={make_calendario_reservation({
          observacoes: 'Chegada tardia',
        })}
      />
    )

    expect(screen.getByText('Observações')).toBeInTheDocument()
    expect(screen.getByText('Chegada tardia')).toHaveClass('line-clamp-6')
  })

  it('omits the partner when there is none', () => {
    render(<ReservaResumoCard reservation={make_calendario_reservation()} />)

    expect(screen.queryByText('Parceiro')).toBeNull()
  })

  it('shows only adults when there are no children', () => {
    render(<ReservaResumoCard reservation={make_calendario_reservation()} />)

    expect(screen.getByText('2 adultos')).toBeInTheDocument()
    expect(screen.queryByText(/criança/)).toBeNull()
  })

  it('shows "Não informada" for a suite without beds', () => {
    render(
      <ReservaResumoCard
        reservation={make_calendario_reservation({ camas: [] })}
      />
    )

    expect(screen.getByText('Não informada')).toBeInTheDocument()
  })

  it('shows the bed types of the suite configuration', () => {
    render(<ReservaResumoCard reservation={make_calendario_reservation()} />)

    expect(screen.getByText('1 Casal, 1 Solteiro')).toBeInTheDocument()
  })
})
