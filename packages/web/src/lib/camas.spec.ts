import type { TipoCama } from '@hotelmind/contracts'
import { describe, expect, it } from 'vitest'
import { formatar_camas } from './camas'

describe('formatar_camas', () => {
  it('junta quantidade e rótulo separados por vírgula', () => {
    expect(
      formatar_camas([
        { tipo: 'casal', quantidade: 1 },
        { tipo: 'solteiro', quantidade: 2 },
      ])
    ).toBe('1 Casal, 2 Solteiro')
  })

  it.each<[TipoCama, string]>([
    ['solteiro', 'Solteiro'],
    ['casal', 'Casal'],
    ['queen', 'Queen'],
    ['king', 'King'],
    ['beliche', 'Beliche'],
    ['sofa_cama', 'Sofá-cama'],
  ])('rotula %s como %s', (tipo, rotulo) => {
    expect(formatar_camas([{ tipo, quantidade: 1 }])).toBe(`1 ${rotulo}`)
  })

  it('retorna "Não informada" sem camas', () => {
    expect(formatar_camas([])).toBe('Não informada')
  })
})
