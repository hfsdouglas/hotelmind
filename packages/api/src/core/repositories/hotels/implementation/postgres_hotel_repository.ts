import type { DB } from '@/lib/prisma'
import { Hotel } from '@/core/entities/hotel'
import type {
  IHotelRepository,
  CreateHotelData,
  UpdateHotelData,
} from '@/core/repositories/hotels/hotel.repository'
import type { PaginationInput, PaginatedResult } from '@/core/repositories/pagination'

export class PostgresHotelRepository implements IHotelRepository {
  constructor(private readonly db: DB) {}

  async list(params: PaginationInput): Promise<PaginatedResult<Hotel>> {
    const { pagina, limite, busca, ordenar_por, direcao } = params
    const skip = (pagina - 1) * limite

    const where = busca
      ? {
          OR: [
            { nome_hotel: { contains: busca, mode: 'insensitive' as const } },
            { nome_fantasia: { contains: busca, mode: 'insensitive' as const } },
            { cnpj: { contains: busca } },
          ],
        }
      : {}

    const orderBy = ordenar_por ? { [ordenar_por]: direcao ?? 'asc' } : { nome_hotel: 'asc' as const }

    const [rows, total] = await Promise.all([
      this.db.hotel.findMany({ where, skip, take: limite, orderBy }),
      this.db.hotel.count({ where }),
    ])

    return {
      data: rows.map(r => new Hotel(r)),
      meta: { pagina, limite, total, ultima_pagina: Math.ceil(total / limite) },
    }
  }

  async findById(id: string): Promise<Hotel | null> {
    const row = await this.db.hotel.findUnique({ where: { id } })
    return row ? new Hotel(row) : null
  }

  async create(data: CreateHotelData): Promise<Hotel> {
    const row = await this.db.hotel.create({ data })
    return new Hotel(row)
  }

  async update(id: string, data: UpdateHotelData): Promise<Hotel> {
    const row = await this.db.hotel.update({ where: { id }, data })
    return new Hotel(row)
  }

  async delete(id: string): Promise<void> {
    await this.db.hotel.delete({ where: { id } })
  }
}
