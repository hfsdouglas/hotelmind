import { describe, expect, it } from 'vitest'
import { DashboardPage, VisaoGeral } from './dashboard'
import { VisaoGeral as VisaoGeralDirect } from './dashboard/visao_geral'

describe('Dashboard Page re-export', () => {
  it('exports VisaoGeral as DashboardPage', () => {
    expect(DashboardPage).toBe(VisaoGeralDirect)
    expect(VisaoGeral).toBe(VisaoGeralDirect)
  })
})
