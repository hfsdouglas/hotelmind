import { CategoriaQuarto } from '@/core/entities/categoria_quarto'
import type {
  CategoriaQuartoPaginationInput,
  CreateCategoriaQuartoData,
  ICategoriaQuartoRepository,
  UpdateCategoriaQuartoData,
} from '@/core/repositories/categorias_quartos/categoria_quarto.repository'
import type { DB } from '@/lib/prisma'

export class PostgresCategoriaQuartoRepository
  implements ICategoriaQuartoRepository
{
  constructor(private readonly db: DB) {}

  async list(hotel_id: string, input: CategoriaQuartoPaginationInput) {
    const { pagina, limite, busca, status } = input
    const where = {
      hotel_id,
      ...(busca
        ? { nome: { contains: busca, mode: 'insensitive' as const } }
        : {}),
      ...(status ? { status } : {}),
    }
    const [rows, total] = await Promise.all([
      this.db.categoriaQuarto.findMany({
        where,
        orderBy: { nome: 'asc' },
        skip: (pagina - 1) * limite,
        take: limite,
      }),
      this.db.categoriaQuarto.count({ where }),
    ])
    return {
      data: rows.map(
        row =>
          new CategoriaQuarto({
            ...row,
            status: row.status as 'S' | 'N',
          })
      ),
      meta: {
        pagina,
        limite,
        total,
        ultima_pagina: Math.max(1, Math.ceil(total / limite)),
      },
    }
  }

  async create(data: CreateCategoriaQuartoData) {
    const row = await this.db.categoriaQuarto.create({
      data: {
        hotel_id: data.hotel_id,
        nome: data.nome.trim(),
        status: data.status ?? 'S',
      },
    })
    return new CategoriaQuarto({
      ...row,
      status: row.status as 'S' | 'N',
    })
  }

  async find_by_id(id: string, hotel_id: string) {
    const row = await this.db.categoriaQuarto.findFirst({
      where: { id, hotel_id },
    })
    return row
      ? new CategoriaQuarto({
          ...row,
          status: row.status as 'S' | 'N',
        })
      : null
  }

  async update(data: UpdateCategoriaQuartoData) {
    const row = await this.db.categoriaQuarto.update({
      where: { id: data.id },
      data: { nome: data.nome.trim(), status: data.status },
    })
    return new CategoriaQuarto({
      ...row,
      status: row.status as 'S' | 'N',
    })
  }
}
