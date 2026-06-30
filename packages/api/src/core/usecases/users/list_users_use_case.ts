import type { IUserRepository } from '@/core/repositories/users/user.repository'
import type { PaginationInput, PaginatedResult } from '@/core/repositories/pagination'
import type { User } from '@/core/entities/user'

export class ListUsersUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(hotelId: string, pagination: PaginationInput): Promise<PaginatedResult<User>> {
    return this.userRepository.list(hotelId, pagination)
  }
}
