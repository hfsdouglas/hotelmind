import type { DB } from '@/lib/prisma'
import { Rota } from '@/core/entities/rota'
import type {
  IRouteRepository,
  CreateRouteData,
  UpdateRouteData,
} from '@/core/repositories/routes/route.repository'
import type { PaginationInput, PaginatedResult } from '@/core/repositories/pagination'

export class PostgresRouteRepository implements IRouteRepository {
  constructor(private readonly db: DB) {}

  async list(params: PaginationInput): Promise<PaginatedResult<Rota>> {
    const { pagina, limite, busca, ordenar_por, direcao } = params
    const skip = (pagina - 1) * limite

    const where = busca
      ? {
          OR: [
            { modulo: { contains: busca, mode: 'insensitive' as const } },
            { recurso: { contains: busca, mode: 'insensitive' as const } },
            { rota: { contains: busca, mode: 'insensitive' as const } },
          ],
        }
      : {}

    const orderBy = ordenar_por ? { [ordenar_por]: direcao ?? 'asc' } : { ordem: 'asc' as const }

    const [rows, total] = await Promise.all([
      this.db.rota.findMany({ where, skip, take: limite, orderBy }),
      this.db.rota.count({ where }),
    ])

    return {
      data: rows.map(r => new Rota(r)),
      meta: { pagina, limite, total, ultima_pagina: Math.ceil(total / limite) },
    }
  }

  async findById(id: string): Promise<Rota | null> {
    const row = await this.db.rota.findUnique({ where: { id } })
    return row ? new Rota(row) : null
  }

  async create(data: CreateRouteData): Promise<Rota> {
    const row = await this.db.rota.create({ data })
    return new Rota(row)
  }

  async update(id: string, data: UpdateRouteData): Promise<Rota> {
    const row = await this.db.rota.update({ where: { id }, data })
    return new Rota(row)
  }

  async delete(id: string): Promise<void> {
    await this.db.rota.delete({ where: { id } })
  }

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

  async findHotelRoutes(hotelId: string): Promise<Rota[]> {
    const rows = await this.db.rota.findMany({
      where: { hoteis: { some: { hotel_id: hotelId } } },
      orderBy: { ordem: 'asc' },
    })
    return rows.map(r => new Rota(r))
  }

  async setHotelRoutes(hotelId: string, routeIds: string[]): Promise<void> {
    await this.db.rotaHotel.deleteMany({ where: { hotel_id: hotelId } })
    if (routeIds.length > 0) {
      await this.db.rotaHotel.createMany({
        data: routeIds.map(rota_id => ({ hotel_id: hotelId, rota_id })),
      })
    }
  }
}
