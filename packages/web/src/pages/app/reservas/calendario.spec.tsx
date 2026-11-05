import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Calendario } from './calendario'

describe('Página de Calendário de Reservas', () => {
  it('renderiza o cabeçalho e informações principais do calendário', () => {
    render(<Calendario />)

    expect(screen.getByText('Calendário de Reservas')).toBeInTheDocument()
    expect(
      screen.getByText('Visualize e gerencie as reservas do hotel')
    ).toBeInTheDocument()

    // Quartos mockados
    expect(screen.getByText('101')).toBeInTheDocument()
    expect(screen.getAllByText('Standard').length).toBeGreaterThan(0)

    // Controles de data
    expect(screen.getByLabelText('Mês')).toBeInTheDocument()
    expect(screen.getByLabelText('Ano')).toBeInTheDocument()
  })

  it('permite abrir o modal de detalhes ao clicar em uma reserva', async () => {
    render(<Calendario />)

    // Clica em uma célula de reserva (botão/trigger dentro da célula)
    const reservationCells = document.querySelectorAll('td div.cursor-pointer')
    expect(reservationCells.length).toBeGreaterThan(0)

    fireEvent.click(reservationCells[0])

    expect(await screen.findByText('Detalhes da Reserva')).toBeInTheDocument()
    expect(
      screen.getByText('Informações completas sobre a hospedagem')
    ).toBeInTheDocument()
  })
})
