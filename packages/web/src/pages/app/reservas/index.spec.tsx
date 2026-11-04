import { describe, expect, it } from 'vitest'
import { Calendario } from './index'
import { Calendario as CalendarioDirect } from './calendario'

describe('Reservas Index', () => {
  it('exports Calendario component correctly', () => {
    expect(Calendario).toBe(CalendarioDirect)
  })
})
