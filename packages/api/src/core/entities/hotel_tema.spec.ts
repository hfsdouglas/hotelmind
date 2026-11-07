import { describe, expect, it } from 'vitest'
import { HotelTema } from './hotel_tema'

describe('HotelTema Entity', () => {
  const validProps = {
    id: 'tema-1',
    hotel_id: 'hotel-1',
    cor_primaria: '#1e40af',
    cor_secundaria: '#64748b',
    cor_fundo: '#ffffff',
    cor_superficie: '#f8fafc',
    cor_texto_principal: '#0f172a',
    cor_texto_secundario: '#475569',
    cor_destaque: '#f59e0b',
  }

  it('should instantiate successfully with valid HEX colors', () => {
    const tema = HotelTema.create(validProps)

    expect(tema.id).toBe('tema-1')
    expect(tema.hotel_id).toBe('hotel-1')
    expect(tema.cor_primaria).toBe('#1e40af')
    expect(tema.cor_destaque).toBe('#f59e0b')
  })

  it('should throw an error if an invalid HEX color is provided', () => {
    expect(() =>
      HotelTema.create({
        ...validProps,
        cor_primaria: 'red',
      })
    ).toThrowError(/Cor cor_primaria inválida/)

    expect(() =>
      HotelTema.create({
        ...validProps,
        cor_destaque: '#ZZZZZZ',
      })
    ).toThrowError(/Cor cor_destaque inválida/)
  })
})
