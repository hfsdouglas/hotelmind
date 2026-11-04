import {
  normalize_datas,
  normalize_valor_diaria,
  Tarifario,
} from '@/core/entities/tarifario'
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
  regime_alimentacao_id?: string | null
  nome: string
  valor_diaria: { toFixed(digits: number): string } | number | string
  ativo: boolean
  datas: Array<{ data: Date }>
  categoria_quarto: { id: string; nome: string; status: string }
  regime_alimentacao?: {
    id: string
    titulo: string
    cor_pulseira: string
  } | null
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
  value: { toFixed(digits: number): string } | number | string
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
    regime_alimentacao_id: row.regime_alimentacao_id,
    nome: row.nome,
    datas: row.datas.map(d => to_date_only_string(d.data)),
    valor_diaria: format_decimal(row.valor_diaria),
    ativo: row.ativo,
    categoria_quarto: {
      id: row.categoria_quarto.id,
      nome: row.categoria_quarto.nome,
      status: row.categoria_quarto.status === 'N' ? 'N' : 'S',
    },
    regime_alimentacao: {
      id: row.regime_alimentacao.id,
      titulo: row.regime_alimentacao.titulo,
      cor_pulseira: row.regime_alimentacao.cor_pulseira,
    },
    criado_em: row.criado_em.toISOString(),
    atualizado_em: row.atualizado_em.toISOString(),
  })
}

export class PostgresTarifarioRepository implements ITarifarioRepository {
  constructor(private readonly db: DB) {}

  async list(hotel_id: string, input: TarifarioListFilter) {
    const {
      pagina,
      limite,
      busca,
      categoria_quarto_id,
      regime_alimentacao_id,
      ativo,
    } = input
    const where = {
      hotel_id,
      ...(categoria_quarto_id?.length
        ? { categoria_quarto_id: { in: categoria_quarto_id } }
        : {}),
      ...(regime_alimentacao_id ? { regime_alimentacao_id } : {}),
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
        include: {
          categoria_quarto: true,
          regime_alimentacao: true,
          datas: { orderBy: { data: 'asc' } },
        },
        orderBy: [{ nome: 'asc' }, { criado_em: 'desc' }],
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
      include: {
        categoria_quarto: true,
        regime_alimentacao: true,
        datas: { orderBy: { data: 'asc' } },
      },
    })
    return row ? map_row(row) : null
  }

  async find_periods_by_category(input: FindCalendarioPeriodsInput) {
    const where = {
      hotel_id: input.hotel_id,
      categoria_quarto_id: input.categoria_quarto_id,
      ...(input.data_inicio && input.data_fim
        ? {
            datas: {
              some: {
                data: {
                  gte: to_utc_date(input.data_inicio),
                  lte: to_utc_date(input.data_fim),
                },
              },
            },
          }
        : {}),
    }

    const rows = await this.db.tarifario.findMany({
      where,
      include: { datas: { orderBy: { data: 'asc' } } },
      orderBy: [{ nome: 'asc' }, { criado_em: 'asc' }],
    })

    return rows.map(row => ({
      id: row.id,
      categoria_quarto_id: row.categoria_quarto_id,
      nome: row.nome,
      datas: row.datas.map(d => to_date_only_string(d.data)),
      valor_diaria: format_decimal(row.valor_diaria),
      ativo: row.ativo,
    }))
  }

  async find_overlapping_active(input: FindOverlappingActiveInput) {
    const normalized_datas = normalize_datas(input.datas)
    const row = await this.db.tarifario.findFirst({
      where: {
        hotel_id: input.hotel_id,
        categoria_quarto_id: input.categoria_quarto_id,
        ativo: true,
        ...(input.exclude_id ? { id: { not: input.exclude_id } } : {}),
        datas: {
          some: {
            data: {
              in: normalized_datas.map(to_utc_date),
            },
          },
        },
      },
      include: {
        categoria_quarto: true,
        regime_alimentacao: true,
        datas: { orderBy: { data: 'asc' } },
      },
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
        datas: {
          some: {
            data: {
              gte: to_utc_date(input.data_inicio),
              lt: to_utc_date(input.data_fim),
            },
          },
        },
      },
      include: {
        categoria_quarto: true,
        regime_alimentacao: true,
        datas: { orderBy: { data: 'asc' } },
      },
      orderBy: [{ valor_diaria: 'asc' }, { nome: 'asc' }],
    })
    return rows.map(map_row)
  }

  async create(data: CreateTarifarioData) {
    const normalized_datas = normalize_datas(data.datas)
    if (data.ativo) {
      const conflict = await this.find_overlapping_active({
        hotel_id: data.hotel_id,
        categoria_quarto_id: data.categoria_quarto_id,
        datas: normalized_datas,
      })
      if (conflict) {
        throw new TarifarioPeriodConflictError()
      }
    }

    const row = await this.db.tarifario.create({
      data: {
        hotel_id: data.hotel_id,
        categoria_quarto_id: data.categoria_quarto_id,
        regime_alimentacao_id: data.regime_alimentacao_id,
        nome: data.nome.trim(),
        valor_diaria: normalize_valor_diaria(data.valor_diaria),
        ativo: data.ativo,
        datas: {
          create: normalized_datas.map(iso => ({ data: to_utc_date(iso) })),
        },
      },
      include: {
        categoria_quarto: true,
        regime_alimentacao: true,
        datas: { orderBy: { data: 'asc' } },
      },
    })
    return map_row(row)
  }

  async update(data: UpdateTarifarioData) {
    const normalized_datas = normalize_datas(data.datas)
    if (data.ativo) {
      const conflict = await this.find_overlapping_active({
        hotel_id: data.hotel_id,
        categoria_quarto_id: data.categoria_quarto_id,
        datas: normalized_datas,
        exclude_id: data.id,
      })
      if (conflict) {
        throw new TarifarioPeriodConflictError()
      }
    }

    const row = await this.db.tarifario.update({
      where: { id: data.id },
      data: {
        categoria_quarto_id: data.categoria_quarto_id,
        ...(data.regime_alimentacao_id !== undefined
          ? { regime_alimentacao_id: data.regime_alimentacao_id }
          : {}),
        nome: data.nome.trim(),
        valor_diaria: normalize_valor_diaria(data.valor_diaria),
        ativo: data.ativo,
        datas: {
          deleteMany: {},
          create: normalized_datas.map(iso => ({ data: to_utc_date(iso) })),
        },
      },
      include: {
        categoria_quarto: true,
        regime_alimentacao: true,
        datas: { orderBy: { data: 'asc' } },
      },
    })
    return map_row(row)
  }
}
