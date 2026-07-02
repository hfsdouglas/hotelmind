import { describe, it, expect } from 'vitest'
import { Hotel } from './hotel'

const BASE_PROPS = {
  id: 'h-1',
  nome_hotel: 'HotelMind',
  nome_fantasia: 'HotelMind',
  razao_social: 'HotelMind Ltda',
  cnpj: '00000000000000',
  email_comercial: 'contato@hotelmind.com.br',
  telefone_comercial: '11999999999',
}

describe('Hotel', () => {
  it('stores all required fields', () => {
    const hotel = new Hotel(BASE_PROPS)
    expect(hotel.id).toBe('h-1')
    expect(hotel.nome_hotel).toBe('HotelMind')
    expect(hotel.cnpj).toBe('00000000000000')
  })

  it('defaults website to null when not provided', () => {
    const hotel = new Hotel(BASE_PROPS)
    expect(hotel.website).toBeNull()
  })

  it('stores website when provided', () => {
    const hotel = new Hotel({ ...BASE_PROPS, website: 'https://hotelmind.com.br' })
    expect(hotel.website).toBe('https://hotelmind.com.br')
  })

  it('stores null website when explicitly null', () => {
    const hotel = new Hotel({ ...BASE_PROPS, website: null })
    expect(hotel.website).toBeNull()
  })

  it('defaults status to "S" when not provided', () => {
    const hotel = new Hotel(BASE_PROPS)
    expect(hotel.status).toBe('S')
  })

  it('stores explicit status', () => {
    const hotel = new Hotel({ ...BASE_PROPS, status: 'N' })
    expect(hotel.status).toBe('N')
  })
})

describe('Hotel.create', () => {
  it('returns a Hotel instance', () => {
    const hotel = Hotel.create(BASE_PROPS)
    expect(hotel).toBeInstanceOf(Hotel)
    expect(hotel.id).toBe('h-1')
  })
})
