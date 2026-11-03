import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { VisaoGeral } from './visao_geral'

describe('VisaoGeral Page', () => {
  it('renders title, description and metric cards', () => {
    render(<VisaoGeral />)

    expect(screen.getByRole('heading', { level: 1, name: 'Visão Geral' })).toBeInTheDocument()
    expect(
      screen.getByText('Dashboard com informações gerais do hotel'),
    ).toBeInTheDocument()

    expect(screen.getByText('Total de Pessoas')).toBeInTheDocument()
    expect(screen.getByText('Total de Crianças')).toBeInTheDocument()
    expect(screen.getByText('Taxa de Ocupação')).toBeInTheDocument()
    expect(screen.getByText('Reservas Confirmadas')).toBeInTheDocument()

    expect(screen.getByText('Check-ins Hoje')).toBeInTheDocument()
    expect(screen.getByText('Check-outs Hoje')).toBeInTheDocument()
    expect(screen.getByText('Quartos Ocupados')).toBeInTheDocument()
    expect(screen.getByText('Quartos Disponíveis')).toBeInTheDocument()

    expect(
      screen.getByText('Pessoas por Regime de Alimentação'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Distribuição por Tipo de Quarto'),
    ).toBeInTheDocument()
  })
})
