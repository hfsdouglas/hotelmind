import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { TarifarioPeriodSummary } from './tarifario_period_summary'

describe('TarifarioPeriodSummary', () => {
  it('renders empty message when no dates are selected', () => {
    render(
      <TarifarioPeriodSummary selectedDates={[]} conflictingPeriods={[]} />
    )

    expect(screen.getByTestId('period-summary-empty')).toBeInTheDocument()
    expect(screen.getByText(/Marque no calendário/i)).toBeInTheDocument()
  })

  it('renders selected count and currency value', () => {
    render(
      <TarifarioPeriodSummary
        selectedDates={['2026-11-10', '2026-11-11']}
        valorDiaria="250,00"
        conflictingPeriods={[]}
      />
    )

    expect(screen.getByTestId('period-summary-selected')).toBeInTheDocument()
    expect(screen.getByText('2 datas marcadas')).toBeInTheDocument()
    expect(screen.getByText(/Diária: R\$ 250.00/i)).toBeInTheDocument()
  })

  it('renders warning when conflicting periods exist', () => {
    render(
      <TarifarioPeriodSummary
        selectedDates={['2026-11-10']}
        valorDiaria="200,00"
        conflictingPeriods={[
          {
            tarifario_id: 't-1',
            nome: 'Tarifário Conflitante',
            data_inicio: '2026-11-10',
            data_fim: '2026-11-12',
            valor_diaria: '190.00',
            ativo: true,
          },
        ]}
      />
    )

    expect(
      screen.getByText('Conflito de data identificado')
    ).toBeInTheDocument()
    expect(screen.getByText(/"Tarifário Conflitante"/i)).toBeInTheDocument()
  })
})
