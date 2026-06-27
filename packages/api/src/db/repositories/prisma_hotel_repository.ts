import type { DB } from '@/lib/prisma'
import { Hotel } from '@/core/entities/hotel'
import type { IHotelRepository } from '@/core/repositories/hotel_repository'

export class PrismaHotelRepository implements IHotelRepository {
  constructor(private readonly db: DB) {}

  async findById(id: string): Promise<Hotel | null> {
    const row = await this.db.hotel.findUnique({ where: { id } })

    if (!row) return null

    return new Hotel({
      id: row.id,
      nome_hotel: row.nome_hotel,
      nome_fantasia: row.nome_fantasia,
      razao_social: row.razao_social,
      cnpj: row.cnpj,
      email_comercial: row.email_comercial,
      telefone_comercial: row.telefone_comercial,
      website: row.website,
    })
  }
}
