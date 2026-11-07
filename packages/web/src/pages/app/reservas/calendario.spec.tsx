import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Calendario } from './calendario'

describe('Página de Calendário de Reservas', () => {
  it('renderiza a barra de controles, filtros de período e quartos sem título ou linha divisória', () => {
    const { container } = render(<Calendario />)

    // Não deve exibir título, subtítulo ou linha divisória (hr) do PageHeader
    expect(
      screen.queryByRole('heading', { name: 'Calendário de Reservas' })
    ).not.toBeInTheDocument()
    expect(
      screen.queryByText('Visualize e gerencie as reservas do hotel')
    ).not.toBeInTheDocument()
    expect(container.querySelector('hr')).not.toBeInTheDocument()

    // Exibe "Calendário" em negrito no centro da barra superior
    const calendarLabel = screen.getByText('Calendário')
    expect(calendarLabel).toBeInTheDocument()
    expect(calendarLabel).toHaveClass('font-bold')

    // Quartos mockados
    expect(screen.getByText('101')).toBeInTheDocument()
    expect(screen.getAllByText('Standard').length).toBeGreaterThan(0)

    // Controles de data e navegação
    expect(screen.getByLabelText('Mês')).toBeInTheDocument()
    expect(screen.getByLabelText('Ano')).toBeInTheDocument()
    expect(screen.getByTitle('Voltar 15 dias')).toBeInTheDocument()
    expect(screen.getByTitle('Dia anterior')).toBeInTheDocument()
    expect(screen.getByTitle('Próximo dia')).toBeInTheDocument()
    expect(screen.getByTitle('Avançar 15 dias')).toBeInTheDocument()

    // Botão de ação Nova Reserva mantido na barra de ações inferior
    const novaReservaBtn = screen.getByRole('button', { name: 'Nova Reserva' })
    expect(novaReservaBtn).toBeInTheDocument()
    expect(novaReservaBtn.closest('div.border-t')).toBeInTheDocument()
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

  it('aplica corretamente as classes de ocupação total, isolamento e z-index no grid', () => {
    const { container } = render(<Calendario />)

    // Container raiz do calendário ocupando todo o espaço sem padding externo e isolado
    const rootContainer = container.firstElementChild
    expect(rootContainer).toHaveClass(
      '-m-6',
      'flex',
      'flex-1',
      'flex-col',
      'h-[calc(100%+3rem)]',
      'min-h-0',
      'overflow-hidden',
      'isolate'
    )

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
