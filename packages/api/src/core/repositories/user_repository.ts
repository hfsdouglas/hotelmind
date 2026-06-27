import type { User } from '@/core/entities/user'

export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>
}
