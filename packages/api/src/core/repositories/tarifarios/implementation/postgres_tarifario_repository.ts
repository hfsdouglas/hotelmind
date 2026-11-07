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
  categoria_quarto_id: string | null
  regime_alimentacao_id: string
  parceiro_id?: string | null
  nome: string
  valor_diaria: { toFixed(digits: number): string } | number | string
  minimo_diarias: number
  ativo: boolean
  datas: Array<{ data: Date }>
  categoria_quarto?: { id: string; nome: string; status: string } | null
  categorias?: Array<{
    categoria_quarto: { id: string; nome: string; status: string }
  }>
  regime_alimentacao: {
    id: string
    titulo: string
    cor_pulseira: string
  }
  parceiro?: {
    id: string
    razao_social: string
    nome_fantasia?: string | null
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
  const linked_cats = (row.categorias ?? []).map(c => ({
    id: c.categoria_quarto.id,
    nome: c.categoria_quarto.nome,
    status: (c.categoria_quarto.status === 'N' ? 'N' : 'S') as 'S' | 'N',
  }))

  const final_cats =
    linked_cats.length > 0
      ? linked_cats
      : row.categoria_quarto
        ? [
            {
              id: row.categoria_quarto.id,
              nome: row.categoria_quarto.nome,
              status: (row.categoria_quarto.status === 'N' ? 'N' : 'S') as
                | 'S'
                | 'N',
            },
          ]
        : []

  const cat_ids = final_cats.map(c => c.id)

  return new Tarifario({
    id: row.id,
    hotel_id: row.hotel_id,
    categoria_quarto_id: row.categoria_quarto_id ?? cat_ids[0],
    categoria_quarto_ids: cat_ids,
    regime_alimentacao_id: row.regime_alimentacao_id,
    parceiro_id: row.parceiro_id ?? null,
    nome: row.nome,
    datas: row.datas.map(d => to_date_only_string(d.data)),
    valor_diaria: format_decimal(row.valor_diaria),
    minimo_diarias: row.minimo_diarias ?? 1,
    ativo: row.ativo,
    categorias: final_cats,
    categoria_quarto: final_cats[0],
    regime_alimentacao: {
      id: row.regime_alimentacao.id,
      titulo: row.regime_alimentacao.titulo,
      cor_pulseira: row.regime_alimentacao.cor_pulseira,
    },
    parceiro: row.parceiro
      ? {
          id: row.parceiro.id,
          razao_social: row.parceiro.razao_social,
          nome_fantasia: row.parceiro.nome_fantasia,
        }
      : null,
    criado_em: row.criado_em.toISOString(),
    atualizado_em: row.atualizado_em.toISOString(),
  })
}

const tarifario_include = {
  categoria_quarto: true,
  categorias: {
    include: {
      categoria_quarto: true,
    },
  },
  regime_alimentacao: true,
  parceiro: true,
  datas: { orderBy: { data: 'asc' as const } },
}

export class PostgresTarifarioRepository implements ITarifarioRepository {
  constructor(private readonly db: DB) {}

  async list(hotel_id: string, input: TarifarioListFilter) {
    const {
      pagina,
      limite,
      busca,
      parceiro_id,
      categoria_quarto_id,
      regime_alimentacao_id,
      ativo,
    } = input

    let parceiro_filter: { parceiro_id?: string | null } = {}
    if (parceiro_id !== undefined) {
      if (parceiro_id === null || parceiro_id === 'publico') {
        parceiro_filter = { parceiro_id: null }
      } else {
        parceiro_filter = { parceiro_id }
      }
    }

    const filter_cats = categoria_quarto_id
      ? Array.isArray(categoria_quarto_id)
        ? categoria_quarto_id
        : [categoria_quarto_id]
      : []

    const categoria_filter =
      filter_cats.length > 0
        ? {
            OR: [
              { categoria_quarto_id: { in: filter_cats } },
              {
                categorias: {
                  some: { categoria_quarto_id: { in: filter_cats } },
                },
              },
            ],
          }
        : {}

    const where = {
      hotel_id,
      ...parceiro_filter,
      ...categoria_filter,
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
              {
                categorias: {
                  some: {
                    categoria_quarto: {
                      nome: { contains: busca, mode: 'insensitive' as const },
                    },
                  },
                },
              },
              {
                parceiro: {
                  razao_social: {
                    contains: busca,
                    mode: 'insensitive' as const,
                  },
                },
              },
            ],
          }
        : {}),
    }

    const [rows, total] = await Promise.all([
      this.db.tarifario.findMany({
        where,
        include: tarifario_include,
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
      include: tarifario_include,
    })
    return row ? map_row(row) : null
  }

  async find_periods_by_category(input: FindCalendarioPeriodsInput) {
    let parceiro_filter: { parceiro_id?: string | null } = {}
    if (input.parceiro_id !== undefined) {
      if (input.parceiro_id === null || input.parceiro_id === 'publico') {
        parceiro_filter = { parceiro_id: null }
      } else {
        parceiro_filter = { parceiro_id: input.parceiro_id }
      }
    }

    const where = {
      hotel_id: input.hotel_id,
      OR: [
        { categoria_quarto_id: input.categoria_quarto_id },
        {
          categorias: {
            some: { categoria_quarto_id: input.categoria_quarto_id },
          },
        },
      ],
      ...parceiro_filter,
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
      include: tarifario_include,
      orderBy: [{ nome: 'asc' }, { criado_em: 'asc' }],
    })

    return rows.map(row => ({
      id: row.id,
      categoria_quarto_id: input.categoria_quarto_id,
      categoria_quarto_ids: row.categorias?.length
        ? row.categorias.map(c => c.categoria_quarto_id)
        : row.categoria_quarto_id
          ? [row.categoria_quarto_id]
          : [],
      parceiro_id: row.parceiro_id,
      nome: row.nome,
      datas: row.datas.map(d => to_date_only_string(d.data)),
      valor_diaria: format_decimal(row.valor_diaria),
      minimo_diarias: row.minimo_diarias ?? 1,
      ativo: row.ativo,
    }))
  }

  async find_overlapping_active(input: FindOverlappingActiveInput) {
    const normalized_datas = normalize_datas(input.datas)
    const expected_parceiro = input.parceiro_id ?? null
    const target_cats = input.categoria_quarto_ids?.length
      ? input.categoria_quarto_ids
      : input.categoria_quarto_id
        ? [input.categoria_quarto_id]
        : []

    const cat_condition =
      target_cats.length > 0
        ? {
            OR: [
              { categoria_quarto_id: { in: target_cats } },
              {
                categorias: {
                  some: { categoria_quarto_id: { in: target_cats } },
                },
              },
            ],
          }
        : {}

    const row = await this.db.tarifario.findFirst({
      where: {
        hotel_id: input.hotel_id,
        ...cat_condition,
        ativo: true,
        parceiro_id: expected_parceiro,
        ...(input.regime_alimentacao_id
          ? { regime_alimentacao_id: input.regime_alimentacao_id }
          : {}),
        ...(input.exclude_id ? { id: { not: input.exclude_id } } : {}),
        datas: {
          some: {
            data: {
              in: normalized_datas.map(to_utc_date),
            },
          },
        },
      },
      include: tarifario_include,
    })
    return row ? map_row(row) : null
  }

  async find_active_for_range(input: {
    hotel_id: string
    categoria_quarto_id: string
    data_inicio: string
    data_fim: string
    parceiro_id?: string | null
  }) {
    const expected_parceiro = input.parceiro_id ?? null

    const rows = await this.db.tarifario.findMany({
      where: {
        hotel_id: input.hotel_id,
        OR: [
          { categoria_quarto_id: input.categoria_quarto_id },
          {
            categorias: {
              some: { categoria_quarto_id: input.categoria_quarto_id },
            },
          },
        ],
        ativo: true,
        parceiro_id: expected_parceiro,
        datas: {
          some: {
            data: {
              gte: to_utc_date(input.data_inicio),
              lt: to_utc_date(input.data_fim),
            },
          },
        },
      },
      include: tarifario_include,
      orderBy: [{ valor_diaria: 'asc' }, { nome: 'asc' }],
    })
    return rows.map(map_row)
  }

  async create(data: CreateTarifarioData) {
    const normalized_datas = normalize_datas(data.datas)
    const category_ids = data.categoria_quarto_ids?.length
      ? data.categoria_quarto_ids
      : data.categoria_quarto_id
        ? [data.categoria_quarto_id]
        : []

    if (data.ativo) {
      const conflict = await this.find_overlapping_active({
        hotel_id: data.hotel_id,
        categoria_quarto_ids: category_ids,
        regime_alimentacao_id: data.regime_alimentacao_id,
        parceiro_id: data.parceiro_id,
        datas: normalized_datas,
      })
      if (conflict) {
        throw new TarifarioPeriodConflictError()
      }
    }

    const row = await this.db.tarifario.create({
      data: {
        hotel_id: data.hotel_id,
        categoria_quarto_id: category_ids[0],
        regime_alimentacao_id: data.regime_alimentacao_id,
        parceiro_id: data.parceiro_id ?? null,
        nome: data.nome.trim(),
        valor_diaria: normalize_valor_diaria(data.valor_diaria),
        minimo_diarias: data.minimo_diarias ?? 1,
        ativo: data.ativo,
        datas: {
          create: normalized_datas.map(iso => ({ data: to_utc_date(iso) })),
        },
        categorias: {
          create: category_ids.map(cat_id => ({
            categoria_quarto_id: cat_id,
          })),
        },
      },
      include: tarifario_include,
    })
    return map_row(row)
  }

  async update(data: UpdateTarifarioData) {
    const normalized_datas = normalize_datas(data.datas)
    const category_ids = data.categoria_quarto_ids?.length
      ? data.categoria_quarto_ids
      : data.categoria_quarto_id
        ? [data.categoria_quarto_id]
        : undefined

    if (data.ativo) {
      const conflict = await this.find_overlapping_active({
        hotel_id: data.hotel_id,
        categoria_quarto_ids: category_ids,
        regime_alimentacao_id: data.regime_alimentacao_id,
        parceiro_id: data.parceiro_id,
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
        ...(category_ids
          ? {
              categoria_quarto_id: category_ids[0],
              categorias: {
                deleteMany: {},
                create: category_ids.map(cat_id => ({
                  categoria_quarto_id: cat_id,
                })),
              },
            }
          : {}),
        ...(data.regime_alimentacao_id !== undefined
          ? { regime_alimentacao_id: data.regime_alimentacao_id }
          : {}),
        ...(data.parceiro_id !== undefined
          ? { parceiro_id: data.parceiro_id }
          : {}),
        ...(data.minimo_diarias !== undefined
          ? { minimo_diarias: data.minimo_diarias }
          : {}),
        nome: data.nome.trim(),
        valor_diaria: normalize_valor_diaria(data.valor_diaria),
        ativo: data.ativo,
        datas: {
          deleteMany: {},
          create: normalized_datas.map(iso => ({ data: to_utc_date(iso) })),
        },
      },
      include: tarifario_include,
    })
    return map_row(row)
  }
}
