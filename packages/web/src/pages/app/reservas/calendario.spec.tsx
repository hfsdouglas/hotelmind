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

  it('aplica corretamente as classes de isolamento e z-index no grid', () => {
    const { container } = render(<Calendario />)

    // Container raiz do calendário isolado
    const rootContainer = container.querySelector('.isolate')
    expect(rootContainer).toBeInTheDocument()

    // thead com z-20
    const thead = container.querySelector('thead')
    expect(thead).toHaveClass('sticky', 'top-0', 'z-20')

    // Canto superior esquerdo com z-30
    const cornerHeader = container.querySelector('thead th.sticky')
    expect(cornerHeader).toHaveClass('sticky', 'left-0', 'bg-muted', 'z-30')

    // Headers de data possuem bg-muted e destaque de hoje
    const dateHeaders = container.querySelectorAll('thead th')
    expect(dateHeaders.length).toBeGreaterThan(2)
    expect(dateHeaders[1]).toHaveClass('bg-primary/10')
    expect(dateHeaders[2]).toHaveClass('bg-muted')

    // Colunas sticky de quarto com z-10
    const roomStickyCells = container.querySelectorAll('tbody td.sticky')
    expect(roomStickyCells.length).toBeGreaterThan(0)
    expect(roomStickyCells[0]).toHaveClass('sticky', 'left-0', 'z-10')

    // Container de reserva nas células possui isolate
    const cellContainers = container.querySelectorAll(
      'tbody td .relative.w-full.h-8'
    )
    expect(cellContainers.length).toBeGreaterThan(0)
    expect(cellContainers[0]).toHaveClass('isolate')
  })
})
