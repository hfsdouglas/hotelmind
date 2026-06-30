import type { DB } from '@/lib/prisma'
import { Administrator } from '@/core/entities/administrator'
import type {
  IAdministratorRepository,
  CreateAdministratorData,
  UpdateAdministratorData,
} from '@/core/repositories/administrators/administrator.repository'
import type { PaginationInput, PaginatedResult } from '@/core/repositories/pagination'

export class PostgresAdministratorRepository implements IAdministratorRepository {
  constructor(private readonly db: DB) {}

  async list(params: PaginationInput): Promise<PaginatedResult<Administrator>> {
    const { pagina, limite, busca, ordenar_por, direcao } = params
    const skip = (pagina - 1) * limite

    const where = busca
      ? {
          OR: [
            { nome_completo: { contains: busca, mode: 'insensitive' as const } },
            { email: { contains: busca, mode: 'insensitive' as const } },
          ],
        }
      : {}

    const orderBy = ordenar_por ? { [ordenar_por]: direcao ?? 'asc' } : { created_at: 'desc' as const }

    const [rows, total] = await Promise.all([
      this.db.administrator.findMany({ where, skip, take: limite, orderBy }),
      this.db.administrator.count({ where }),
    ])

    return {
      data: rows.map(r => new Administrator(r)),
      meta: {
        pagina,
        limite,
        total,
        ultima_pagina: Math.ceil(total / limite),
      },
    }
  }

  async findById(id: string): Promise<Administrator | null> {
    const row = await this.db.administrator.findUnique({ where: { id } })
    return row ? new Administrator(row) : null
  }

  async findByEmail(email: string): Promise<Administrator | null> {
    const row = await this.db.administrator.findUnique({ where: { email } })
    return row ? new Administrator(row) : null
  }

  async create(data: CreateAdministratorData): Promise<Administrator> {
    const row = await this.db.administrator.create({ data })
    return new Administrator(row)
  }

  async update(id: string, data: UpdateAdministratorData): Promise<Administrator> {
    const row = await this.db.administrator.update({ where: { id }, data })
    return new Administrator(row)
  }

  async delete(id: string): Promise<void> {
    await this.db.administrator.delete({ where: { id } })
  }
}
