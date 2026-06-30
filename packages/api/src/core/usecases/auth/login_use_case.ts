import type { Hotel } from '@/core/entities/hotel'
import type { User } from '@/core/entities/user'
import type { Rota } from '@/core/entities/rota'
import {
  InvalidCredentialsError,
  UserNotFoundError,
} from '@/core/errors/authentication_error'
import { HotelNotFoundError } from '@/core/errors/hotel_not_found_error'
import type { IHotelRepository } from '@/core/repositories/hotels/hotel.repository'
import type { IUserRepository } from '@/core/repositories/users/user.repository'
import type { IRouteRepository } from '@/core/repositories/routes/route.repository'
import type { IPasswordHasher } from '@/core/services/password_hasher'

interface LoginInput {
  email: string
  password: string
}

interface LoginOutput {
  user: User
  hotel: Hotel
  rotas: Rota[]
}

export class LoginUseCase {
  constructor(
    private readonly user_repository: IUserRepository,
    private readonly hotel_repository: IHotelRepository,
    private readonly password_hasher: IPasswordHasher,
    private readonly route_repository?: IRouteRepository,
  ) {}

  async execute({ email, password }: LoginInput): Promise<LoginOutput> {
    const user = await this.user_repository.findByEmail(email)

    if (!user) {
      throw new UserNotFoundError()
    }

    const is_valid = await this.password_hasher.compare(password, user.senha)

    if (!is_valid) {
      throw new InvalidCredentialsError()
    }

    const hotel = await this.hotel_repository.findById(user.hotel_id)

    if (!hotel) {
      throw new HotelNotFoundError()
    }

    const grupo_ids = user.grupos_ids
      ? user.grupos_ids.split(',').map(id => id.trim()).filter(Boolean)
      : []

    const rotas =
      this.route_repository && grupo_ids.length > 0
        ? await this.route_repository.findByUsuario(hotel.id, grupo_ids)
        : []

    return { user, hotel, rotas }
  }
}
