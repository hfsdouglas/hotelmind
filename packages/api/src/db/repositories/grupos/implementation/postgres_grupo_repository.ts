import type { DB } from '@/db/client'
import { Grupo } from '@/core/entities/grupo'
import { Rota } from '@/core/entities/rota'
import type {
  IGrupoRepository,
  PaginationInput,
  PaginatedResult,
  CreateGrupoData,
  UpdateGrupoData,
} from '@/core/repositories/grupo_repository'

export class PostgresGrupoRepository implements IGrupoRepository {
  constructor(private readonly db: DB) {}

  async list(hotelId: string, pagination: PaginationInput): Promise<PaginatedResult<Grupo>> {
    const { pagina, limite, busca, ordenar_por = 'grupo', direcao = 'asc', status } = pagination

    const where = {
      hotel_id: hotelId,
      ...(busca ? { grupo: { contains: busca, mode: 'insensitive' as const } } : {}),
      ...(status ? { status } : {}),
    }

    const [rows, total] = await Promise.all([
      this.db.grupo.findMany({
        where,
        orderBy: { [ordenar_por]: direcao },
        skip: (pagina - 1) * limite,
        take: limite,
      }),
      this.db.grupo.count({ where }),
    ])

    return {
      data: rows.map(r => new Grupo(r)),
      meta: {
        pagina,
        limite,
        total,
        ultima_pagina: Math.max(1, Math.ceil(total / limite)),
      },
    }
  }

  async create(data: CreateGrupoData): Promise<Grupo> {
    const row = await this.db.grupo.create({
      data: {
        hotel_id: data.hotel_id,
        grupo: data.grupo,
        descricao: data.descricao ?? null,
        status: data.status ?? 'S',
      },
    })
    return new Grupo(row)
  }

  async findById(id: string, hotelId: string): Promise<Grupo | null> {
    const row = await this.db.grupo.findFirst({ where: { id, hotel_id: hotelId } })
    return row ? new Grupo(row) : null
  }

  async update(id: string, hotelId: string, data: UpdateGrupoData): Promise<Grupo> {
    const row = await this.db.grupo.update({
      where: { id },
      data: {
        ...(data.grupo !== undefined && { grupo: data.grupo }),
        ...(data.descricao !== undefined && { descricao: data.descricao }),
        ...(data.status !== undefined && { status: data.status }),
      },
    })
    return new Grupo({ ...row, hotel_id: hotelId })
  }

  async delete(id: string, _hotelId: string): Promise<void> {
    await this.db.grupo.delete({ where: { id } })
  }

  async hasLinkedUsers(id: string, hotelId: string): Promise<boolean> {
    const count = await this.db.user.count({
      where: {
        hotel_id: hotelId,
        OR: [
          { grupos_ids: id },
          { grupos_ids: { startsWith: `${id},` } },
          { grupos_ids: { endsWith: `,${id}` } },
          { grupos_ids: { contains: `,${id},` } },
        ],
      },
    })
    return count > 0
  }

  async listRoutes(grupoId: string): Promise<Rota[]> {
    const rows = await this.db.grupoRota.findMany({
      where: { grupo_id: grupoId },
      include: { rota: true },
      orderBy: { rota: { ordem: 'asc' } },
    })
    return rows.map(r => new Rota(r.rota))
  }

  async syncRoutes(grupoId: string, rotaIds: string[]): Promise<void> {
    await this.db.$transaction([
      this.db.grupoRota.deleteMany({ where: { grupo_id: grupoId } }),
      this.db.grupoRota.createMany({
        data: rotaIds.map(rota_id => ({ grupo_id: grupoId, rota_id })),
      }),
    ])
  }
}
