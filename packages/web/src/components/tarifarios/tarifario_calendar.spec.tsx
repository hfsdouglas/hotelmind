import type { PeriodoTarifarioCalendario } from '@hotelmind/contracts'
import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { toggle_date_selection } from '@/schemas/tarifarios/tarifario_schema'
import { TarifarioCalendar } from './tarifario_calendar'
import { TarifarioForm } from './tarifario_form'

const OCCUPIED_PERIODS: PeriodoTarifarioCalendario[] = [
  {
    id: 'tar-existing',
    categoria_quarto_id: 'cat-1',
    nome: 'Feriado Março',
    datas: ['2027-03-05', '2027-03-07'], // 2027-03-05 is Friday (weekend), 2027-03-07 is Sunday (weekday)
    valor_diaria: '420.00',
    ativo: true,
  },
]

function ControlledCalendarWrapper() {
  const [selected, setSelected] = useState<string[]>([])
  return (
    <TarifarioCalendar
      selectedDates={selected}
      occupiedPeriods={OCCUPIED_PERIODS}
      initialMonth={{ year: 2027, month: 2 }}
      onToggleDate={iso =>
        setSelected(prev => toggle_date_selection(prev, iso))
      }
      onReplaceSelection={next => setSelected(next)}
      onClearSelection={() => setSelected([])}
    />
  )
}

describe('TarifarioCalendar & TarifarioForm (Hospitality Classification, Month/Year Selector & Usability)', () => {
  it('US2: replaces "Mês atual" button with month/year selectors, renders icon-only navigation buttons, and preserves selected dates across view modes and navigation', () => {
    render(<ControlledCalendarWrapper />)

    // "Mês atual" button does not exist anymore
    expect(
      screen.queryByRole('button', { name: 'Mês atual' })
    ).not.toBeInTheDocument()

    // Previous and Next buttons are icon-only (no text content inside the buttons)
    const prev_btn = screen.getByTestId('calendar-prev-period')
    const next_btn = screen.getByTestId('calendar-next-period')
    expect(prev_btn.textContent).toBe('')
    expect(next_btn.textContent).toBe('')

    expect(screen.getByTestId('calendar-month-title')).toHaveTextContent(
      'Março de 2027'
    )
    expect(screen.getByTestId('calendar-view-1')).toHaveAttribute(
      'aria-pressed',
      'true'
    )

    // Select a date in March 2027
    fireEvent.click(screen.getByTestId('calendar-day-2027-03-10'))
    expect(screen.getByTestId('calendar-selected-count')).toHaveTextContent(
      '1 data selecionada'
    )

    // Open the shadcn/radix Datepicker popover
    const datepicker_trigger = screen.getByTestId('calendar-datepicker-trigger')
    expect(datepicker_trigger).toHaveTextContent('Março de 2027')
    fireEvent.click(datepicker_trigger)
    expect(
      screen.getByTestId('calendar-datepicker-popover')
    ).toBeInTheDocument()

    // Select year 2028 via shadcn/radix Select and month Novembro via datepicker grid
    fireEvent.click(screen.getByTestId('calendar-select-year'))
    fireEvent.click(screen.getByRole('option', { name: '2028' }))
    fireEvent.click(screen.getByTestId('calendar-picker-month-10')) // Novembro (0-based 10)

    expect(screen.getByTestId('calendar-month-title')).toHaveTextContent(
      'Novembro de 2028'
    )
    expect(datepicker_trigger).toHaveTextContent('Novembro de 2028')
    expect(screen.getByTestId('calendar-selected-count')).toHaveTextContent(
      '1 data selecionada'
    )

    // Switch to 3 months -> renders Nov/2028 to Jan/2029
    fireEvent.click(screen.getByTestId('calendar-view-3'))
    expect(screen.getByTestId('calendar-month-title')).toHaveTextContent(
      'Novembro de 2028 — Janeiro de 2029'
    )
    expect(
      screen.getByTestId('calendar-month-block-2028-11')
    ).toBeInTheDocument()
    expect(
      screen.getByTestId('calendar-month-block-2028-12')
    ).toBeInTheDocument()
    expect(
      screen.getByTestId('calendar-month-block-2029-01')
    ).toBeInTheDocument()
    expect(screen.getByTestId('calendar-selected-count')).toHaveTextContent(
      '1 data selecionada'
    )

    // Navigate next period (3 months forward -> Feb/2029 to Apr/2029)
    fireEvent.click(next_btn)
    expect(screen.getByTestId('calendar-month-title')).toHaveTextContent(
      'Fevereiro de 2029 — Abril de 2029'
    )
    expect(datepicker_trigger).toHaveTextContent('Fevereiro de 2029')
    expect(screen.getByTestId('calendar-selected-count')).toHaveTextContent(
      '1 data selecionada'
    )

    // Switch to 6 months and 12 months
    fireEvent.click(screen.getByTestId('calendar-view-6'))
    expect(screen.getByTestId('calendar-month-title')).toHaveTextContent(
      'Fevereiro de 2029 — Julho de 2029'
    )
    fireEvent.click(screen.getByTestId('calendar-view-12'))
    expect(screen.getByTestId('calendar-month-title')).toHaveTextContent(
      'Fevereiro de 2029 — Janeiro de 2030'
    )
  }, 15000)

  it('US1: bulk selects all days, hospitality weekdays (Sun-Thu), and hospitality weekends (Fri-Sat) in visible months excluding occupied dates', () => {
    render(<ControlledCalendarWrapper />)

    // March 2027 has 31 days:
    // - 8 hospitality weekend days (Fri: 5, 12, 19, 26; Sat: 6, 13, 20, 27) -> 2027-03-05 is occupied => 7 available
    // - 23 hospitality weekdays (Sun-Thu) -> 2027-03-07 (Sun) is occupied => 22 available

    // 1. Bulk select all days -> 31 - 2 = 29 days
    fireEvent.click(screen.getByTestId('bulk-select-all'))
    expect(screen.getByTestId('calendar-selected-count')).toHaveTextContent(
      '29 datas selecionadas'
    )

    // 2. Bulk select hospitality weekdays (Sun-Thu) -> 22 days
    fireEvent.click(screen.getByTestId('bulk-select-weekdays'))
    expect(screen.getByTestId('calendar-selected-count')).toHaveTextContent(
      '22 datas selecionadas'
    )
    // Sunday 2027-03-14 and Thursday 2027-03-11 ARE selected
    expect(screen.getByTestId('calendar-day-cell-2027-03-14')).toHaveAttribute(
      'data-selected',
      'true'
    )
    expect(screen.getByTestId('calendar-day-cell-2027-03-11')).toHaveAttribute(
      'data-selected',
      'true'
    )
    // Friday 2027-03-12 and Saturday 2027-03-06 are NOT selected
    expect(screen.getByTestId('calendar-day-cell-2027-03-12')).toHaveAttribute(
      'data-selected',
      'false'
    )
    expect(screen.getByTestId('calendar-day-cell-2027-03-06')).toHaveAttribute(
      'data-selected',
      'false'
    )

    // 3. Bulk select hospitality weekends (Fri-Sat) -> 7 days (8 - 1 occupied Friday 2027-03-05)
    fireEvent.click(screen.getByTestId('bulk-select-weekends'))
    expect(screen.getByTestId('calendar-selected-count')).toHaveTextContent(
      '7 datas selecionadas'
    )
    // Friday 2027-03-12 and Saturday 2027-03-06 ARE selected
    expect(screen.getByTestId('calendar-day-cell-2027-03-12')).toHaveAttribute(
      'data-selected',
      'true'
    )
    expect(screen.getByTestId('calendar-day-cell-2027-03-06')).toHaveAttribute(
      'data-selected',
      'true'
    )
    // Sunday 2027-03-14 is NOT selected
    expect(screen.getByTestId('calendar-day-cell-2027-03-14')).toHaveAttribute(
      'data-selected',
      'false'
    )

    // 4. Fine-grained individual adjustment after bulk select
    fireEvent.click(screen.getByTestId('calendar-day-2027-03-06'))
    expect(screen.getByTestId('calendar-selected-count')).toHaveTextContent(
      '6 datas selecionadas'
    )
    fireEvent.click(screen.getByTestId('calendar-day-2027-03-08'))
    expect(screen.getByTestId('calendar-selected-count')).toHaveTextContent(
      '7 datas selecionadas'
    )
  })

  it('displays occupied dates, opens rate plan details on click, and highlights conflicts', () => {
    render(<ControlledCalendarWrapper />)

    expect(screen.getByTestId('calendar-day-cell-2027-03-05')).toHaveAttribute(
      'data-occupied',
      'true'
    )

    fireEvent.click(screen.getByTestId('calendar-occupied-info-2027-03-05'))
    expect(screen.getByTestId('calendar-inspected-period')).toHaveTextContent(
      'Feriado Março'
    )
    expect(screen.getByTestId('calendar-inspected-period')).toHaveTextContent(
      'R$ 420.00'
    )

    // Manually checking an already occupied date flags a conflict
    fireEvent.click(screen.getByTestId('calendar-day-2027-03-05'))
    expect(screen.getByTestId('calendar-day-cell-2027-03-05')).toHaveAttribute(
      'data-conflict',
      'true'
    )
  })

  it('preserves daily rate value during bulk selection, renders no breadcrumbs on TarifarioForm, and only submits when confirmed', () => {
    const on_submit = vi.fn()
    render(
      <MemoryRouter>
        <TarifarioForm
          mode="create"
          title="Novo tarifário"
          submitLabel="Salvar tarifário"
          initialCalendarMonth={{ year: 2027, month: 2 }}
          initialValues={{
            nome: 'Fins de Semana Março',
            categoria_quarto_id: 'cat-1',
            regime_alimentacao_id: 'reg-1',
            datas: [],
            valor_diaria: '380.00',
            ativo: true,
          }}
          categories={[{ id: 'cat-1', nome: 'Suítes Luxo', status: 'S' }]}
          regimes={[
            {
              id: 'reg-1',
              hotel_id: 'h-1',
              titulo: 'Meia Pensão',
              descricao: '',
              cor_pulseira: '#2563EB',
              ativo: true,
              criado_em: '',
              atualizado_em: '',
            },
          ]}
          occupiedPeriods={OCCUPIED_PERIODS}
          onCancel={vi.fn()}
          onSubmitPayload={on_submit}
        />
      </MemoryRouter>
    )

    // Verify breadcrumb navigation is completely absent
    expect(
      screen.queryByRole('navigation', { name: 'Breadcrumb' })
    ).not.toBeInTheDocument()

    // Bulk select hospitality weekends (Fridays and Saturdays) in March 2027
    // Available Fridays: 12, 19, 26 (05 is occupied)
    // Available Saturdays: 06, 13, 20, 27
    fireEvent.click(screen.getByTestId('bulk-select-weekends'))
    expect(on_submit).not.toHaveBeenCalled()
    expect(screen.getByDisplayValue(/380,00/)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Salvar tarifário' }))
    expect(on_submit).toHaveBeenCalledWith(
      expect.objectContaining({
        categoria_quarto_id: 'cat-1',
        categoria_quarto_ids: ['cat-1'],
        regime_alimentacao_id: 'reg-1',
        parceiro_id: null,
        nome: 'Fins de Semana Março',
        datas: [
          '2027-03-06',
          '2027-03-12',
          '2027-03-13',
          '2027-03-19',
          '2027-03-20',
          '2027-03-26',
          '2027-03-27',
        ],
        valor_diaria: '380.00',
        minimo_diarias: 1,
        ativo: true,
      })
    )
  })

  it('automatically expands view mode to 12 months when +200 dates are selected and memorizes user calendar view style choice', () => {
    // Generate 261 dates across 2026 (Jan to Dec)
    const dates_2026: string[] = []
    for (let m = 1; m <= 12; m++) {
      for (let d = 1; d <= 22; d++) {
        if (dates_2026.length < 261) {
          dates_2026.push(
            `2026-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
          )
        }
      }
    }

    const { unmount } = render(
      <TarifarioCalendar
        selectedDates={dates_2026}
        occupiedPeriods={[]}
        onToggleDate={vi.fn()}
        onClearSelection={vi.fn()}
      />
    )

    // Automatically presents 12 months starting from January 2026
    expect(screen.getByTestId('calendar-view-12')).toHaveAttribute(
      'aria-pressed',
      'true'
    )
    expect(screen.getByTestId('calendar-month-title')).toHaveTextContent(
      'Janeiro de 2026 — Dezembro de 2026'
    )
    expect(screen.getByTestId('calendar-selected-count')).toHaveTextContent(
      '261 datas selecionadas'
    )
    expect(
      screen.getByTestId('calendar-month-block-2026-01')
    ).toBeInTheDocument()
    expect(
      screen.getByTestId('calendar-month-block-2026-12')
    ).toBeInTheDocument()

    unmount()
  })
})
