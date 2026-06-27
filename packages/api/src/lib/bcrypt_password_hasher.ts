import bcrypt from 'bcryptjs'
import type { IPasswordHasher } from '@/core/services/password_hasher'

export class BcryptPasswordHasher implements IPasswordHasher {
  async compare(plain: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plain, hashed)
  }
}
