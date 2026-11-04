import type {
  NoiteCalculadaOrcamento,
  OrcamentoStatus,
} from '@hotelmind/contracts'
import type { Prisma } from '@prisma/client'
import { Orcamento } from '@/core/entities/orcamento'
import type { PaginatedResult } from '@/core/repositories/pagination'
import type { DB } from '@/lib/prisma'
import type {
  CreateOrcamentoData,
  IOrcamentoRepository,
  OrcamentoListFilter,
  UpdateOrcamentoData,
} from '../orcamento_repository'

const DEFAULT_INCLUDE = {
  lead: true,
  regime_alimentacao: true,
  categoria_quarto: true,
}

// biome-ignore lint/suspicious/noExplicitAny: Prisma relations mapping
function map_row(row: any): Orcamento {
  return new Orcamento({
    id: row.id,
    hotel_id: row.hotel_id,
    lead_id: row.lead_id,
    regime_alimentacao_id: row.regime_alimentacao_id,
    categoria_quarto_id: row.categoria_quarto_id,
    check_in: row.check_in,
    check_out: row.check_out,
    quantidade_adultos: row.quantidade_adultos,
    quantidade_criancas: row.quantidade_criancas,
    quantidade_pets: row.quantidade_pets,
    valor_total: row.valor_total,
    detalhamento_noites: row.detalhamento_noites as NoiteCalculadaOrcamento[],
    token_publico: row.token_publico,
    status: row.status as OrcamentoStatus,
    observacoes: row.observacoes,
    cupom_desconto: row.cupom_desconto,
    lead: row.lead
      ? {
          id: row.lead.id,
          nome: row.lead.nome,
          telefone: row.lead.telefone,
          email: row.lead.email,
        }
      : undefined,
    regime_alimentacao: row.regime_alimentacao
      ? {
          id: row.regime_alimentacao.id,
          titulo: row.regime_alimentacao.titulo,
          cor_pulseira: row.regime_alimentacao.cor_pulseira,
        }
      : undefined,
    categoria_quarto: row.categoria_quarto
      ? {
          id: row.categoria_quarto.id,
          nome: row.categoria_quarto.nome,
        }
      : undefined,
    created_at: row.created_at,
    updated_at: row.updated_at,
  })
}

export class PostgresOrcamentoRepository implements IOrcamentoRepository {
  constructor(private readonly db: DB) {}

  async create(data: CreateOrcamentoData): Promise<Orcamento> {
    const row = await this.db.orcamento.create({
      data: {
        hotel_id: data.hotel_id,
        lead_id: data.lead_id,
        regime_alimentacao_id: data.regime_alimentacao_id,
        categoria_quarto_id: data.categoria_quarto_id,
        check_in: data.check_in,
        check_out: data.check_out,
        quantidade_adultos: data.quantidade_adultos,
        quantidade_criancas: data.quantidade_criancas ?? 0,
        quantidade_pets: data.quantidade_pets ?? 0,
        valor_total: data.valor_total,
        detalhamento_noites:
          data.detalhamento_noites as unknown as Prisma.InputJsonValue,
        token_publico: data.token_publico,
        status: data.status ?? 'pendente',
        observacoes: data.observacoes,
        cupom_desconto: data.cupom_desconto,
      },
      include: DEFAULT_INCLUDE,
    })

    return map_row(row)
  }

  async update(data: UpdateOrcamentoData): Promise<Orcamento> {
    const updateData: Prisma.OrcamentoUncheckedUpdateInput = {
      ...(data.regime_alimentacao_id !== undefined
        ? { regime_alimentacao_id: data.regime_alimentacao_id }
        : {}),
      ...(data.categoria_quarto_id !== undefined
        ? { categoria_quarto_id: data.categoria_quarto_id }
        : {}),
      ...(data.check_in !== undefined ? { check_in: data.check_in } : {}),
      ...(data.check_out !== undefined ? { check_out: data.check_out } : {}),
      ...(data.quantidade_adultos !== undefined
        ? { quantidade_adultos: data.quantidade_adultos }
        : {}),
      ...(data.quantidade_criancas !== undefined
        ? { quantidade_criancas: data.quantidade_criancas }
        : {}),
      ...(data.quantidade_pets !== undefined
        ? { quantidade_pets: data.quantidade_pets }
        : {}),
      ...(data.valor_total !== undefined
        ? { valor_total: data.valor_total }
        : {}),
      ...(data.detalhamento_noites !== undefined
        ? {
            detalhamento_noites:
              data.detalhamento_noites as unknown as Prisma.InputJsonValue,
          }
        : {}),
      ...(data.status !== undefined ? { status: data.status } : {}),
      ...(data.observacoes !== undefined
        ? { observacoes: data.observacoes }
        : {}),
      ...(data.cupom_desconto !== undefined
        ? { cupom_desconto: data.cupom_desconto }
        : {}),
    }

    const row = await this.db.orcamento.update({
      where: {
        id: data.id,
      },
      data: updateData,
      include: DEFAULT_INCLUDE,
    })

    return map_row(row)
  }

  async delete(id: string, hotel_id: string): Promise<void> {
    await this.db.orcamento.deleteMany({
      where: {
        id,
        hotel_id,
      },
    })
  }

  async find_by_id(id: string, hotel_id: string): Promise<Orcamento | null> {
    const row = await this.db.orcamento.findFirst({
      where: {
        id,
        hotel_id,
      },
      include: DEFAULT_INCLUDE,
    })

    if (!row) return null
    return map_row(row)
  }

  async find_by_token_publico(token: string): Promise<Orcamento | null> {
    const row = await this.db.orcamento.findUnique({
      where: {
        token_publico: token,
      },
      include: {
        lead: true,
        regime_alimentacao: true,
        categoria_quarto: true,
        hotel: true,
      },
    })

    if (!row) return null
    return map_row(row)
  }

  async list(
    hotel_id: string,
    filter: OrcamentoListFilter
  ): Promise<PaginatedResult<Orcamento>> {
    const {
      pagina,
      limite,
      busca,
      regime_alimentacao_id,
      categoria_quarto_id,
      status,
    } = filter
    const where = {
      hotel_id,
      ...(regime_alimentacao_id ? { regime_alimentacao_id } : {}),
      ...(categoria_quarto_id ? { categoria_quarto_id } : {}),
      ...(status ? { status } : {}),
      ...(busca
        ? {
            OR: [
              {
                lead: {
                  nome: { contains: busca, mode: 'insensitive' as const },
                },
              },
              {
                lead: {
                  email: { contains: busca, mode: 'insensitive' as const },
                },
              },
              { lead: { telefone: { contains: busca } } },
              {
                observacoes: { contains: busca, mode: 'insensitive' as const },
              },
            ],
          }
        : {}),
    }

    const [rows, total] = await Promise.all([
      this.db.orcamento.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip: (pagina - 1) * limite,
        take: limite,
        include: DEFAULT_INCLUDE,
      }),
      this.db.orcamento.count({ where }),
    ])

    const total_paginas = Math.max(1, Math.ceil(total / limite))

    return {
      data: rows.map(map_row),
      meta: {
        total,
        pagina,
        limite,
        ultima_pagina: total_paginas,
      },
    }
  }
}
