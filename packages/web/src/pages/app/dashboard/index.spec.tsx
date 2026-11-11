import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { DashboardPage, VisaoGeral } from './index'

describe('Dashboard index', () => {
  it('exporta DashboardPage como alias de VisaoGeral', () => {
    expect(DashboardPage).toBe(VisaoGeral)
  })

  it('renderiza a página Visão Geral pelo export DashboardPage', () => {
    render(<DashboardPage />)

    expect(
      screen.getByRole('heading', { level: 1, name: 'Visão Geral' })
    ).toBeInTheDocument()
  })
})
