import type { DB } from '@/db/client'
import { Rota } from '@/core/entities/rota'
import type { IRotaRepository } from '@/core/repositories/rota_repository'

export class PostgresRotaRepository implements IRotaRepository {
  constructor(private readonly db: DB) {}

  async findByHotel(hotelId: string): Promise<Rota[]> {
    const rows = await this.db.rotaHotel.findMany({
      where: { hotel_id: hotelId, rota: { ativo: true } },
      include: { rota: true },
      orderBy: { rota: { ordem: 'asc' } },
    })
    return rows.map(r => new Rota(r.rota))
  }

  async findByUsuario(hotelId: string, grupoIds: string[]): Promise<Rota[]> {
    if (grupoIds.length === 0) return []

    const rows = await this.db.rota.findMany({
      where: {
        ativo: true,
        hoteis: { some: { hotel_id: hotelId } },
        grupos: { some: { grupo_id: { in: grupoIds } } },
      },
      orderBy: { ordem: 'asc' },
    })

    return rows.map(r => new Rota(r))
  }
}
