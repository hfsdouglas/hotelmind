import { describe, expect, it } from 'vitest'
import { ConfiguracaoCama } from './configuracao_cama'

describe('ConfiguracaoCama', () => {
  it('rejects invalid quantities and unknown types', () => {
    expect(
      () => new ConfiguracaoCama({ id: '1', tipo: 'unknown', quantidade: 1 })
    ).toThrow()
    expect(
      () => new ConfiguracaoCama({ id: '1', tipo: 'casal', quantidade: 0 })
    ).toThrow()
  })
})
