import { describe, expect, it } from 'vitest'
import type { CalendarioHospede } from '@/types/calendario_reserva'
import {
  fichas_pendentes,
  primeira_ficha_pendente,
  rotulo_ficha_status,
  rotulo_hospede,
} from './fnrh'

const hospedes: CalendarioHospede[] = [
  { posicao: 3, nome: 'Carlos Lima', ficha_status: 'rascunho' },
  { posicao: 1, nome: 'Ana Souza', ficha_status: 'preenchida' },
  { posicao: 2, nome: null, ficha_status: 'pendente' },
]

describe('fichas_pendentes', () => {
  it('retorna apenas fichas não preenchidas ordenadas por posição', () => {
    expect(fichas_pendentes(hospedes).map(h => h.posicao)).toEqual([2, 3])
  })

  it('retorna lista vazia quando todas estão preenchidas', () => {
    expect(
      fichas_pendentes([
        { posicao: 1, nome: 'Ana', ficha_status: 'preenchida' },
      ])
    ).toEqual([])
  })
})

describe('primeira_ficha_pendente', () => {
  it('retorna a pendente de menor posição', () => {
    expect(primeira_ficha_pendente(hospedes)?.posicao).toBe(2)
  })

  it('retorna null para lista vazia', () => {
    expect(primeira_ficha_pendente([])).toBeNull()
  })

  it('retorna null quando todas estão preenchidas', () => {
    expect(
      primeira_ficha_pendente([
        { posicao: 1, nome: 'Ana', ficha_status: 'preenchida' },
      ])
    ).toBeNull()
  })
})

describe('rotulo_hospede', () => {
  it('usa "Hóspede N" quando não há nome', () => {
    expect(rotulo_hospede({ posicao: 1, nome: null })).toBe('Hóspede 1')
  })

  it('usa o nome quando existe', () => {
    expect(rotulo_hospede({ posicao: 2, nome: 'Carlos Lima' })).toBe(
      'Carlos Lima'
    )
  })
})

describe('rotulo_ficha_status', () => {
  it('traduz os status pendentes', () => {
    expect(rotulo_ficha_status('pendente')).toBe('Pendente')
    expect(rotulo_ficha_status('rascunho')).toBe('Rascunho')
  })
})
