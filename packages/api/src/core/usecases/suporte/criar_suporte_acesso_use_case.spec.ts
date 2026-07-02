import { describe, it, expect, beforeEach } from 'vitest'
import { CriarSuporteAcessoUseCase } from './criar_suporte_acesso_use_case'
import { InMemoryHotelRepository } from '@/core/repositories/hotels/in-memory/in_memory_hotel_repository'
import { InMemoryUserRepository } from '@/core/repositories/users/in-memory/in_memory_user_repository'
import { InMemoryRouteRepository } from '@/core/repositories/routes/in-memory/in_memory_route_repository'
import { HotelNotFoundError } from '@/core/errors/hotel_not_found_error'
import { UserNotFoundError } from '@/core/errors/authentication_error'
import { HotelInactiveError } from '@/core/errors/suporte_errors'

const HOTEL_DATA = {
  nome_hotel: 'HotelMind',
  razao_social: 'HotelMind Ltda',
  nome_fantasia: 'HotelMind',
  cnpj: '00000000000000',
  email_comercial: 'contato@hotelmind.com.br',
  telefone_comercial: '11999999999',
}

const USER_DATA = {
  nome_completo: 'Douglas Faria',
  email: 'douglas@hotelmind.com.br',
  senha: 'hashed',
  nascimento: new Date('1990-01-01'),
  genero: 'M',
  celular: '11988887777',
  cpf: '11122233344',
}

describe('CriarSuporteAcessoUseCase', () => {
  let hotelRepo: InMemoryHotelRepository
  let userRepo: InMemoryUserRepository
  let routeRepo: InMemoryRouteRepository
  let useCase: CriarSuporteAcessoUseCase

  beforeEach(() => {
    hotelRepo = new InMemoryHotelRepository()
    userRepo = new InMemoryUserRepository()
    routeRepo = new InMemoryRouteRepository()
    useCase = new CriarSuporteAcessoUseCase(hotelRepo, userRepo, routeRepo)
  })

  it('throws HotelNotFoundError when the hotel does not exist', async () => {
    await expect(
      useCase.execute({ hotelId: 'non-existent', usuarioId: 'any' }),
    ).rejects.toBeInstanceOf(HotelNotFoundError)
  })

  it('throws HotelInactiveError when the hotel is inactive', async () => {
    const hotel = await hotelRepo.create({ ...HOTEL_DATA, status: 'N' })
    await expect(
      useCase.execute({ hotelId: hotel.id, usuarioId: 'any' }),
    ).rejects.toBeInstanceOf(HotelInactiveError)
  })

  it('throws UserNotFoundError when the user does not belong to the hotel', async () => {
    const hotel = await hotelRepo.create({ ...HOTEL_DATA, status: 'S' })
    const otherHotel = await hotelRepo.create({ ...HOTEL_DATA, cnpj: '99999999999999', email_comercial: 'outro@hotelmind.com.br' })
    const user = await userRepo.create({ ...USER_DATA, hotel_id: otherHotel.id })

    await expect(
      useCase.execute({ hotelId: hotel.id, usuarioId: user.id }),
    ).rejects.toBeInstanceOf(UserNotFoundError)
  })

  it('throws UserNotFoundError when the user does not exist at all', async () => {
    const hotel = await hotelRepo.create({ ...HOTEL_DATA, status: 'S' })
    await expect(
      useCase.execute({ hotelId: hotel.id, usuarioId: 'ghost' }),
    ).rejects.toBeInstanceOf(UserNotFoundError)
  })

  it('returns user, hotel, and rotas on success', async () => {
    const hotel = await hotelRepo.create({ ...HOTEL_DATA, status: 'S' })
    const user = await userRepo.create({ ...USER_DATA, hotel_id: hotel.id, grupos_ids: 'grupo-1' })
    const rota = await routeRepo.create({ modulo: 'Dashboard', recurso: 'Dashboard', rota: '/' })
    await routeRepo.setHotelRoutes(hotel.id, [rota.id])

    const result = await useCase.execute({ hotelId: hotel.id, usuarioId: user.id })

    expect(result.user.id).toBe(user.id)
    expect(result.hotel.id).toBe(hotel.id)
    expect(result.rotas).toHaveLength(1)
    expect(result.rotas[0].id).toBe(rota.id)
  })
})
