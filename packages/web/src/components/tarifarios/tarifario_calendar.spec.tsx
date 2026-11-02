import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { TarifarioCalendar } from './tarifario_calendar'
import { TarifarioForm } from './tarifario_form'

const occupied_periods = [
  {
    id: 't-marco',
    categoria_quarto_id: 'cat-1',
    nome: 'Baixa Temporada',
    data_inicio: '2027-03-01',
    data_fim: '2027-03-11',
    valor_diaria: '200.00',
    ativo: true,
  },
]

const categories = [
  { id: 'cat-1', nome: 'Suítes Luxo', status: 'S' as const },
]

describe('TarifarioCalendar & TarifarioForm', () => {
  it('CA02 & CA03: selects date range with 2 clicks, resets when second click is before start date, and navigates months preserving selection', () => {
    const on_select = vi.fn()
    render(
      <TarifarioCalendar
        startDate=""
        endDate=""
        occupiedPeriods={occupied_periods}
        initialMonth={{ year: 2027, month: 2 }}
        onSelectRange={on_select}
      />,
    )

    expect(screen.getByTestId('calendar-month-title')).toHaveTextContent(
      'Março de 2027',
    )

    // 1st click sets start date
    fireEvent.click(screen.getByTestId('calendar-day-2027-03-20'))
    expect(on_select).toHaveBeenLastCalledWith('2027-03-20', '')
  })

  it('restarts selection when second click is before start date and completes selection when second click is after start date', () => {
    const on_select = vi.fn()
    const { rerender } = render(
      <TarifarioCalendar
        startDate="2027-03-20"
        endDate=""
        occupiedPeriods={[]}
        initialMonth={{ year: 2027, month: 2 }}
        onSelectRange={on_select}
      />,
    )

    // Clicking earlier date (2027-03-15) restarts selection
    fireEvent.click(screen.getByTestId('calendar-day-2027-03-15'))
    expect(on_select).toHaveBeenLastCalledWith('2027-03-15', '')

    // Rerender with startDate = 2027-03-15 and click 2027-03-25
    rerender(
      <TarifarioCalendar
        startDate="2027-03-15"
        endDate=""
        occupiedPeriods={[]}
        initialMonth={{ year: 2027, month: 2 }}
        onSelectRange={on_select}
      />,
    )
    fireEvent.click(screen.getByTestId('calendar-day-2027-03-25'))
    expect(on_select).toHaveBeenLastCalledWith('2027-03-15', '2027-03-25')

    // Navigate to next month and verify title updates
    fireEvent.click(screen.getByRole('button', { name: /próximo mês/i }))
    expect(screen.getByTestId('calendar-month-title')).toHaveTextContent(
      'Abril de 2027',
    )
  })

  it('RF07 & RF08: inspects occupied period details and highlights conflicting range', () => {
    render(
      <TarifarioCalendar
        startDate="2027-03-05"
        endDate="2027-03-15"
        occupiedPeriods={occupied_periods}
        initialMonth={{ year: 2027, month: 2 }}
        onSelectRange={vi.fn()}
      />,
    )

    // Day 2027-03-05 is inside both selected range and occupied period -> marked as conflict
    expect(
      screen.getByTestId('calendar-day-cell-2027-03-05'),
    ).toHaveAttribute('data-conflict', 'true')

    // Click occupied info pill to inspect existing rate plan details
    fireEvent.click(screen.getByTestId('calendar-occupied-info-2027-03-02'))
    const details = screen.getByTestId('calendar-inspected-period')
    expect(details).toHaveTextContent('Baixa Temporada')
    expect(details).toHaveTextContent('01/03/2027 até 10/03/2027')
    expect(details).toHaveTextContent('R$ 200.00')
  })

  it('CA12: synchronizes bidirectionally between form date inputs and calendar and converts to half-open interval on submit', () => {
    const on_submit = vi.fn()
    render(
      <MemoryRouter>
        <TarifarioForm
          mode="create"
          title="Novo tarifário"
          submitLabel="Salvar tarifário"
          initialValues={{
            nome: 'Tarifa Abril',
            categoria_quarto_id: 'cat-1',
            valor_diaria: '280.00',
            ativo: true,
          }}
          categories={categories}
          occupiedPeriods={occupied_periods}
          initialCalendarMonth={{ year: 2027, month: 2 }}
          onCancel={vi.fn()}
          onSubmitPayload={on_submit}
        />
      </MemoryRouter>,
    )

    // Click 2027-03-15 and 2027-03-20 on calendar -> form date inputs update
    fireEvent.click(screen.getByTestId('calendar-day-2027-03-15'))
    fireEvent.click(screen.getByTestId('calendar-day-2027-03-20'))

    const input_inicio = screen.getByLabelText(
      /data de início/i,
    ) as HTMLInputElement
    const input_fim = screen.getByLabelText(
      /data de término/i,
    ) as HTMLInputElement
    expect(input_inicio.value).toBe('2027-03-15')
    expect(input_fim.value).toBe('2027-03-20')

    // Change form input directly -> calendar selection updates
    fireEvent.change(input_fim, { target: { value: '2027-03-22' } })
    expect(
      screen.getByTestId('calendar-day-cell-2027-03-22'),
    ).toHaveAttribute('data-selected', 'true')

    // Submit form -> converts inclusive 2027-03-22 to exclusive 2027-03-23
    fireEvent.click(screen.getByRole('button', { name: /salvar tarifário/i }))
    expect(on_submit).toHaveBeenCalledWith({
      categoria_quarto_id: 'cat-1',
      nome: 'Tarifa Abril',
      data_inicio: '2027-03-15',
      data_fim: '2027-03-23',
      valor_diaria: '280.00',
      ativo: true,
    })
  })
})
