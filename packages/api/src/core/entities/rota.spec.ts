import { describe, it, expect } from 'vitest'
import { Rota } from './rota'

const BASE_PROPS = {
  id: 'r-1',
  modulo: 'Dashboard',
  recurso: 'Visão Geral',
  rota: '/dashboard',
  icone: 'LayoutDashboard',
  ordem: 1,
  ativo: true,
}

describe('Rota', () => {
  it('stores all fields correctly', () => {
    const rota = new Rota(BASE_PROPS)
    expect(rota.id).toBe('r-1')
    expect(rota.modulo).toBe('Dashboard')
    expect(rota.recurso).toBe('Visão Geral')
    expect(rota.rota).toBe('/dashboard')
    expect(rota.icone).toBe('LayoutDashboard')
    expect(rota.ordem).toBe(1)
    expect(rota.ativo).toBe(true)
  })

  it('accepts null icone', () => {
    const rota = new Rota({ ...BASE_PROPS, icone: null })
    expect(rota.icone).toBeNull()
  })
})

describe('Rota.create', () => {
  it('returns a Rota instance', () => {
    const rota = Rota.create(BASE_PROPS)
    expect(rota).toBeInstanceOf(Rota)
    expect(rota.id).toBe('r-1')
  })
})
