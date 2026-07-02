import type { Hotel } from '@/core/entities/hotel'
import type { User } from '@/core/entities/user'
import type { Rota } from '@/core/entities/rota'
import type { IHotelRepository } from '@/core/repositories/hotels/hotel.repository'
import type { IUserRepository } from '@/core/repositories/users/user.repository'
import type { IRouteRepository } from '@/core/repositories/routes/route.repository'
import { HotelNotFoundError } from '@/core/errors/hotel_not_found_error'
import { UserNotFoundError } from '@/core/errors/authentication_error'
import { HotelInactiveError } from '@/core/errors/suporte_errors'

interface CriarSuporteAcessoInput {
  hotelId: string
  usuarioId: string
}

interface CriarSuporteAcessoOutput {
  user: User
  hotel: Hotel
  rotas: Rota[]
}

export class CriarSuporteAcessoUseCase {
  constructor(
    private readonly hotel_repository: IHotelRepository,
    private readonly user_repository: IUserRepository,
    private readonly route_repository: IRouteRepository,
  ) {}

  async execute({ hotelId, usuarioId }: CriarSuporteAcessoInput): Promise<CriarSuporteAcessoOutput> {
    const hotel = await this.hotel_repository.findById(hotelId)
    if (!hotel) throw new HotelNotFoundError()

    if (hotel.status !== 'S') throw new HotelInactiveError()

    const user = await this.user_repository.findById(usuarioId, hotelId)
    if (!user) throw new UserNotFoundError()

    const grupo_ids = user.grupos_ids
      ? user.grupos_ids.split(',').map(id => id.trim()).filter(Boolean)
      : []

    const rotas = grupo_ids.length > 0 ? await this.route_repository.findByUsuario(hotel.id, grupo_ids) : []

    return { user, hotel, rotas }
  }
}
