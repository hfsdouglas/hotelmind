import { ConfiguracaoCama } from '@/core/entities/configuracao_cama'
import { Quarto } from '@/core/entities/quarto'
import type { DB } from '@/lib/prisma'
import type { CreateQuartoData, IQuartoRepository, QuartoPaginationInput, UpdateQuartoData } from '@/core/repositories/quartos/quarto.repository'

interface RoomRow {
  id: string
  hotel_id: string
  categoria_id: string
  identificacao: string
  descricao: string | null
  limite_hospedes: number
  status: string
  categoria: { id: string; nome: string; status: string }
  camas: Array<{ id: string; tipo: string; quantidade: number }>
  created_at: Date
  updated_at: Date
}

function map_row(row: RoomRow) {
  return new Quarto({
    id: row.id,
    hotel_id: row.hotel_id,
    categoria_id: row.categoria_id,
    identificacao: row.identificacao,
    descricao: row.descricao,
    limite_hospedes: row.limite_hospedes,
    status: row.status,
    categoria: row.categoria,
    camas: row.camas.map(bed => new ConfiguracaoCama(bed)),
    created_at: row.created_at,
    updated_at: row.updated_at,
  })
}

export class PostgresQuartoRepository implements IQuartoRepository {
  constructor(private readonly db: DB) {}

  async list(hotel_id: string, input: QuartoPaginationInput) {
    const { pagina, limite, busca, categoria_id, status } = input
    const where = {
      hotel_id,
      ...(categoria_id?.length ? { categoria_id: { in: categoria_id } } : {}),
      ...(status ? { status } : {}),
      ...(busca ? {
        OR: [
          { identificacao: { contains: busca, mode: 'insensitive' as const } },
          { categoria: { nome: { contains: busca, mode: 'insensitive' as const } } },
          { camas: { some: { tipo: { contains: busca, mode: 'insensitive' as const } } } },
        ],
      } : {}),
    }
    const include = { categoria: true, camas: { orderBy: { tipo: 'asc' as const } } }
    const [rows, total] = await Promise.all([
      this.db.quarto.findMany({ where, include, orderBy: { identificacao: 'asc' }, skip: (pagina - 1) * limite, take: limite }),
      this.db.quarto.count({ where }),
    ])
    return { data: rows.map(map_row), meta: { pagina, limite, total, ultima_pagina: Math.max(1, Math.ceil(total / limite)) } }
  }

  async create(data: CreateQuartoData) {
    const row = await this.db.$transaction(async transaction => {
      const quarto = await transaction.quarto.create({
        data: {
          hotel_id: data.hotel_id,
          categoria_id: data.categoria_id,
          identificacao: data.identificacao.trim(),
          descricao: data.descricao?.trim() || null,
          limite_hospedes: data.limite_hospedes,
          camas: { create: data.camas },
        },
        include: { categoria: true, camas: true },
      })
      return quarto
    })
    return map_row(row)
  }

  async find_by_id(id: string, hotel_id: string) {
    const row = await this.db.quarto.findFirst({ where: { id, hotel_id }, include: { categoria: true, camas: true } })
    return row ? map_row(row) : null
  }

  async update(data: UpdateQuartoData) {
    const row = await this.db.$transaction(async transaction => {
      const quarto = await transaction.quarto.update({
        where: { id: data.id },
        data: {
          categoria_id: data.categoria_id,
          identificacao: data.identificacao.trim(),
          descricao: data.descricao?.trim() || null,
          limite_hospedes: data.limite_hospedes,
          status: data.status,
          camas: {
            deleteMany: {},
            create: data.camas,
          },
        },
        include: { categoria: true, camas: true },
      })
      return quarto
    })
    return map_row(row)
  }
}
