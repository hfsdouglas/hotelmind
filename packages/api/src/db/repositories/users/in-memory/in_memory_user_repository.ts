import { User } from '@/core/entities/user'
import type { IUserRepository } from '@/core/repositories/user_repository'

export class InMemoryUserRepository implements IUserRepository {
  private store = new Map<string, User>()

  async findByEmail(email: string): Promise<User | null> {
    for (const user of this.store.values()) {
      if (user.email === email) return user
    }
    return null
  }

  seed(user: User): void {
    this.store.set(user.id, user)
  }
}
