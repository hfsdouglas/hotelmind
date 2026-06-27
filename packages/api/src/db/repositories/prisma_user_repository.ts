import type { DB } from '@/lib/prisma'
import { User } from '@/core/entities/user'
import type { IUserRepository } from '@/core/repositories/user_repository'

export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly db: DB) {}

  async findByEmail(email: string): Promise<User | null> {
    const row = await this.db.user.findUnique({ where: { email } })

    if (!row) return null

    return new User({
      id: row.id,
      hotel_id: row.hotel_id,
      nome_completo: row.nome_completo,
      email: row.email,
      senha: row.senha,
      nascimento: row.nascimento,
      genero: row.genero,
      celular: row.celular,
      cpf: row.cpf,
      rg: row.rg,
    })
  }
}
