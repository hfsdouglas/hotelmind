import type { Hotel } from '@/core/entities/hotel'
import type { User } from '@/core/entities/user'
import {
  InvalidCredentialsError,
  UserNotFoundError,
} from '@/core/errors/authentication_error'
import { HotelNotFoundError } from '@/core/errors/hotel_not_found_error'
import type { IHotelRepository } from '@/core/repositories/hotel_repository'
import type { IUserRepository } from '@/core/repositories/user_repository'
import type { IPasswordHasher } from '@/core/services/password_hasher'

interface LoginInput {
  email: string
  password: string
}

interface LoginOutput {
  user: User
  hotel: Hotel
}

export class LoginUseCase {
  constructor(
    private readonly user_repository: IUserRepository,
    private readonly hotel_repository: IHotelRepository,
    private readonly password_hasher: IPasswordHasher
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

    return { user, hotel }
  }
}
