import { Tarifario, normalize_valor_diaria } from '@/core/entities/tarifario'
import { TarifarioPeriodConflictError } from '@/core/errors/tarifario_errors'
import type {
  CreateTarifarioData,
  FindCalendarioPeriodsInput,
  FindOverlappingActiveInput,
  ITarifarioRepository,
  TarifarioListFilter,
  UpdateTarifarioData,
} from '@/core/repositories/tarifarios/tarifario.repository'
import type { DB } from '@/lib/prisma'

interface TarifarioRow {
  id: string
  hotel_id: string
  categoria_quarto_id: string
  nome: string
  data_inicio: Date
  data_fim: Date
  valor_diaria: { toFixed(digits: number): string } | number | string
  ativo: boolean
  categoria_quarto: { id: string; nome: string; status: string }
  criado_em: Date
  atualizado_em: Date
}

function to_date_only_string(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function to_utc_date(iso_date: string): Date {
  return new Date(`${iso_date}T00:00:00.000Z`)
}

function format_decimal(
  value: { toFixed(digits: number): string } | number | string,
): string {
  if (typeof value === 'object' && value !== null && 'toFixed' in value) {
    return value.toFixed(2)
  }
  return normalize_valor_diaria(value)
}

function map_row(row: TarifarioRow): Tarifario {
  return new Tarifario({
    id: row.id,
    hotel_id: row.hotel_id,
    categoria_quarto_id: row.categoria_quarto_id,
    nome: row.nome,
    data_inicio: to_date_only_string(row.data_inicio),
    data_fim: to_date_only_string(row.data_fim),
    valor_diaria: format_decimal(row.valor_diaria),
    ativo: row.ativo,
    categoria_quarto: {
      id: row.categoria_quarto.id,
      nome: row.categoria_quarto.nome,
      status: row.categoria_quarto.status === 'N' ? 'N' : 'S',
    },
    criado_em: row.criado_em.toISOString(),
    atualizado_em: row.atualizado_em.toISOString(),
  })
}

function is_exclusion_conflict_error(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false
  const message = 'message' in error ? String(error.message) : ''
  const code = 'code' in error ? String(error.code) : ''
  return (
    code === '23P01' ||
    message.includes('23P01') ||
    message.includes('tarifarios_sem_sobreposicao_ativa_excl')
  )
}

export class PostgresTarifarioRepository implements ITarifarioRepository {
  constructor(private readonly db: DB) {}

  async list(hotel_id: string, input: TarifarioListFilter) {
    const { pagina, limite, busca, categoria_quarto_id, ativo } = input
    const where = {
      hotel_id,
      ...(categoria_quarto_id?.length
        ? { categoria_quarto_id: { in: categoria_quarto_id } }
        : {}),
      ...(typeof ativo === 'boolean' ? { ativo } : {}),
      ...(busca
        ? {
            OR: [
              { nome: { contains: busca, mode: 'insensitive' as const } },
              {
                categoria_quarto: {
                  nome: { contains: busca, mode: 'insensitive' as const },
                },
              },
            ],
          }
        : {}),
    }

    const [rows, total] = await Promise.all([
      this.db.tarifario.findMany({
        where,
        include: { categoria_quarto: true },
        orderBy: [{ data_inicio: 'asc' }, { nome: 'asc' }],
        skip: (pagina - 1) * limite,
        take: limite,
      }),
      this.db.tarifario.count({ where }),
    ])

    return {
      data: rows.map(map_row),
      meta: {
        pagina,
        limite,
        total,
        ultima_pagina: Math.max(1, Math.ceil(total / limite)),
      },
    }
  }

  async find_by_id(id: string, hotel_id: string) {
    const row = await this.db.tarifario.findFirst({
      where: { id, hotel_id },
      include: { categoria_quarto: true },
    })
    return row ? map_row(row) : null
  }

  async find_periods_by_category(input: FindCalendarioPeriodsInput) {
    const where = {
      hotel_id: input.hotel_id,
      categoria_quarto_id: input.categoria_quarto_id,
      ...(input.data_inicio && input.data_fim
        ? {
            data_inicio: { lt: to_utc_date(input.data_fim) },
            data_fim: { gt: to_utc_date(input.data_inicio) },
          }
        : {}),
    }

    const rows = await this.db.tarifario.findMany({
      where,
      orderBy: [{ data_inicio: 'asc' }, { criado_em: 'asc' }],
    })

    return rows.map(row => ({
      id: row.id,
      categoria_quarto_id: row.categoria_quarto_id,
      nome: row.nome,
      data_inicio: to_date_only_string(row.data_inicio),
      data_fim: to_date_only_string(row.data_fim),
      valor_diaria: format_decimal(row.valor_diaria),
      ativo: row.ativo,
    }))
  }

  async find_overlapping_active(input: FindOverlappingActiveInput) {
    const row = await this.db.tarifario.findFirst({
      where: {
        hotel_id: input.hotel_id,
        categoria_quarto_id: input.categoria_quarto_id,
        ativo: true,
        ...(input.exclude_id ? { id: { not: input.exclude_id } } : {}),
        data_inicio: { lt: to_utc_date(input.data_fim) },
        data_fim: { gt: to_utc_date(input.data_inicio) },
      },
      include: { categoria_quarto: true },
    })
    return row ? map_row(row) : null
  }

  async find_active_for_range(input: {
    hotel_id: string
    categoria_quarto_id: string
    data_inicio: string
    data_fim: string
  }) {
    const rows = await this.db.tarifario.findMany({
      where: {
        hotel_id: input.hotel_id,
        categoria_quarto_id: input.categoria_quarto_id,
        ativo: true,
        data_inicio: { lt: to_utc_date(input.data_fim) },
        data_fim: { gt: to_utc_date(input.data_inicio) },
      },
      include: { categoria_quarto: true },
      orderBy: [{ valor_diaria: 'asc' }, { data_inicio: 'asc' }],
    })
    return rows.map(map_row)
  }

  async create(data: CreateTarifarioData) {
    try {
      const row = await this.db.tarifario.create({
        data: {
          hotel_id: data.hotel_id,
          categoria_quarto_id: data.categoria_quarto_id,
          nome: data.nome.trim(),
          data_inicio: to_utc_date(data.data_inicio),
          data_fim: to_utc_date(data.data_fim),
          valor_diaria: normalize_valor_diaria(data.valor_diaria),
          ativo: data.ativo,
        },
        include: { categoria_quarto: true },
      })
      return map_row(row)
    } catch (error) {
      if (is_exclusion_conflict_error(error)) {
        throw new TarifarioPeriodConflictError()
      }
      throw error
    }
  }

  async update(data: UpdateTarifarioData) {
    try {
      const row = await this.db.tarifario.update({
        where: { id: data.id },
        data: {
          categoria_quarto_id: data.categoria_quarto_id,
          nome: data.nome.trim(),
          data_inicio: to_utc_date(data.data_inicio),
          data_fim: to_utc_date(data.data_fim),
          valor_diaria: normalize_valor_diaria(data.valor_diaria),
          ativo: data.ativo,
        },
        include: { categoria_quarto: true },
      })
      return map_row(row)
    } catch (error) {
      if (is_exclusion_conflict_error(error)) {
        throw new TarifarioPeriodConflictError()
      }
      throw error
    }
  }
}
