import { RegimeAlimentacao } from '@/core/entities/regime_alimentacao'
import type { PaginatedResult } from '@/core/repositories/pagination'
import type { DB } from '@/lib/prisma'
import type {
  CreateRegimeAlimentacaoData,
  IRegimeAlimentacaoRepository,
  RegimeAlimentacaoListFilter,
  UpdateRegimeAlimentacaoData,
} from '../regime_alimentacao.repository'

export class PostgresRegimeAlimentacaoRepository
  implements IRegimeAlimentacaoRepository
{
  constructor(private readonly db: DB) {}

  async list(
    hotel_id: string,
    filter: RegimeAlimentacaoListFilter
  ): Promise<PaginatedResult<RegimeAlimentacao>> {
    const { pagina, limite, busca, ativo } = filter
    const where = {
      hotel_id,
      ...(busca
        ? {
            OR: [
              { titulo: { contains: busca, mode: 'insensitive' as const } },
              { descricao: { contains: busca, mode: 'insensitive' as const } },
            ],
          }
        : {}),
      ...(ativo !== undefined ? { ativo } : {}),
    }

    const [rows, total] = await Promise.all([
      this.db.regimeAlimentacao.findMany({
        where,
        orderBy: { criado_em: 'desc' },
        skip: (pagina - 1) * limite,
        take: limite,
      }),
      this.db.regimeAlimentacao.count({ where }),
    ])

    return {
      data: rows.map(
        row =>
          new RegimeAlimentacao({
            id: row.id,
            hotel_id: row.hotel_id,
            titulo: row.titulo,
            descricao: row.descricao,
            cor_pulseira: row.cor_pulseira,
            ativo: row.ativo,
            criado_em: row.criado_em,
            atualizado_em: row.atualizado_em,
          })
      ),
      meta: {
        total,
        pagina,
        limite,
        ultima_pagina: Math.max(1, Math.ceil(total / limite)),
      },
    }
  }

  async create(data: CreateRegimeAlimentacaoData): Promise<RegimeAlimentacao> {
    const row = await this.db.regimeAlimentacao.create({
      data: {
        hotel_id: data.hotel_id,
        titulo: data.titulo.trim(),
        descricao: data.descricao?.trim() ? data.descricao.trim() : null,
        cor_pulseira: data.cor_pulseira.trim().toUpperCase(),
        ativo: data.ativo,
      },
    })

    return new RegimeAlimentacao({
      id: row.id,
      hotel_id: row.hotel_id,
      titulo: row.titulo,
      descricao: row.descricao,
      cor_pulseira: row.cor_pulseira,
      ativo: row.ativo,
      criado_em: row.criado_em,
      atualizado_em: row.atualizado_em,
    })
  }

  async find_by_id(
    id: string,
    hotel_id: string
  ): Promise<RegimeAlimentacao | null> {
    const row = await this.db.regimeAlimentacao.findFirst({
      where: { id, hotel_id },
    })

    if (!row) return null

    return new RegimeAlimentacao({
      id: row.id,
      hotel_id: row.hotel_id,
      titulo: row.titulo,
      descricao: row.descricao,
      cor_pulseira: row.cor_pulseira,
      ativo: row.ativo,
      criado_em: row.criado_em,
      atualizado_em: row.atualizado_em,
    })
  }

  async find_by_titulo(
    titulo: string,
    hotel_id: string,
    exclude_id?: string
  ): Promise<RegimeAlimentacao | null> {
    const row = await this.db.regimeAlimentacao.findFirst({
      where: {
        hotel_id,
        titulo: { equals: titulo.trim(), mode: 'insensitive' as const },
        ...(exclude_id ? { id: { not: exclude_id } } : {}),
      },
    })

    if (!row) return null

    return new RegimeAlimentacao({
      id: row.id,
      hotel_id: row.hotel_id,
      titulo: row.titulo,
      descricao: row.descricao,
      cor_pulseira: row.cor_pulseira,
      ativo: row.ativo,
      criado_em: row.criado_em,
      atualizado_em: row.atualizado_em,
    })
  }

  async update(data: UpdateRegimeAlimentacaoData): Promise<RegimeAlimentacao> {
    const row = await this.db.regimeAlimentacao.update({
      where: { id: data.id },
      data: {
        titulo: data.titulo.trim(),
        descricao: data.descricao?.trim() ? data.descricao.trim() : null,
        cor_pulseira: data.cor_pulseira.trim().toUpperCase(),
        ativo: data.ativo,
      },
    })

    return new RegimeAlimentacao({
      id: row.id,
      hotel_id: row.hotel_id,
      titulo: row.titulo,
      descricao: row.descricao,
      cor_pulseira: row.cor_pulseira,
      ativo: row.ativo,
      criado_em: row.criado_em,
      atualizado_em: row.atualizado_em,
    })
  }
}
