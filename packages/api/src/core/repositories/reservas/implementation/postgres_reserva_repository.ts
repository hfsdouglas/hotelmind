import type {
  DiariaReserva,
  FichaPreenchidaPor,
  FichaStatus,
  ReservaListParams,
  ReservaStatus,
} from '@hotelmind/contracts'
import type { Prisma } from '@prisma/client'
import { Reserva } from '@/core/entities/reserva'
import { ReservaHospede } from '@/core/entities/reserva_hospede'
import {
  ReservaConflitoError,
  ReservaValidationError,
} from '@/core/errors/reserva_errors'
import type { PaginatedResult } from '@/core/repositories/pagination'
import type { DB } from '@/lib/prisma'
import type {
  CreateReservaData,
  CreateReservaHospedeData,
  IReservaHospedeRepository,
  IReservaRepository,
  UpdateFichaHospedeData,
  UpdateReservaData,
} from '../reserva_repository'

function to_iso_date(d: Date | string | null | undefined): string | null {
  if (!d) return null
  if (d instanceof Date) return d.toISOString().slice(0, 10)
  return d.slice(0, 10)
}

// biome-ignore lint/suspicious/noExplicitAny: Prisma mapping
function map_hospede_row(row: any): ReservaHospede {
  return new ReservaHospede({
    id: row.id,
    reserva_id: row.reserva_id,
    posicao: row.posicao,
    ficha_status: row.ficha_status as FichaStatus,
    preenchido_por: row.preenchido_por as FichaPreenchidaPor | null,
    preenchido_em: row.preenchido_em,
    nome_completo: row.nome_completo,
    nacionalidade: row.nacionalidade,
    data_nascimento: row.data_nascimento,
    sexo: row.sexo,
    profissao: row.profissao,
    tipo_documento: row.tipo_documento,
    numero_documento: row.numero_documento,
    logradouro: row.logradouro,
    numero_endereco: row.numero_endereco,
    complemento: row.complemento,
    bairro: row.bairro,
    cidade: row.cidade,
    estado: row.estado,
    cep: row.cep,
    pais_residencia: row.pais_residencia,
    telefone: row.telefone,
    email: row.email,
    motivo_viagem: row.motivo_viagem,
    meio_transporte: row.meio_transporte,
    procedencia: row.procedencia,
    proximo_destino: row.proximo_destino,
    responsavel_posicao: row.responsavel_posicao,
  })
}

// biome-ignore lint/suspicious/noExplicitAny: Prisma mapping
function map_reserva_row(row: any): Reserva {
  return new Reserva({
    id: row.id,
    hotel_id: row.hotel_id,
    codigo: row.codigo,
    titular_nome: row.titular_nome,
    titular_telefone: row.titular_telefone,
    titular_email: row.titular_email,
    quarto_id: row.quarto_id,
    regime_alimentacao_id: row.regime_alimentacao_id,
    parceiro_comercial_id: row.parceiro_comercial_id,
    check_in: to_iso_date(row.check_in)!,
    check_out: to_iso_date(row.check_out)!,
    quantidade_adultos: row.quantidade_adultos,
    quantidade_criancas: row.quantidade_criancas,
    valor_total: row.valor_total.toString(),
    detalhamento_diarias: row.detalhamento_diarias as DiariaReserva[],
    status: row.status as ReservaStatus,
    token_fnrh: row.token_fnrh,
    token_fnrh_ativo: row.token_fnrh_ativo,
    fnrh_enviada_em: row.fnrh_enviada_em,
    observacoes: row.observacoes,
    quarto: row.quarto
      ? {
          id: row.quarto.id,
          identificacao: row.quarto.identificacao,
          categoria_nome: row.quarto.categoria?.nome ?? '',
        }
      : undefined,
    regime_alimentacao: row.regime_alimentacao
      ? {
          id: row.regime_alimentacao.id,
          titulo: row.regime_alimentacao.titulo,
          cor_pulseira: row.regime_alimentacao.cor_pulseira,
        }
      : undefined,
    parceiro_comercial: row.parceiro_comercial
      ? {
          id: row.parceiro_comercial.id,
          razao_social: row.parceiro_comercial.razao_social,
        }
      : null,
    hospedes: row.hospedes ? row.hospedes.map(map_hospede_row) : undefined,
    created_at: row.created_at,
    updated_at: row.updated_at,
  })
}

const RESERVA_DEFAULT_INCLUDE = {
  quarto: {
    include: {
      categoria: true,
    },
  },
  regime_alimentacao: true,
  parceiro_comercial: true,
  hospedes: {
    orderBy: {
      posicao: 'asc' as const,
    },
  },
}

export class PostgresReservaRepository implements IReservaRepository {
  constructor(private readonly prisma: DB) {}

  private handle_exclusion_error(error: unknown): never {
    const msg = error instanceof Error ? error.message : String(error)
    if (msg.includes('reservas_sem_conflito_quarto') || msg.includes('23P01')) {
      throw new ReservaConflitoError()
    }
    throw error
  }

  async create(data: CreateReservaData): Promise<Reserva> {
    try {
      const created = await this.prisma.reserva.create({
        data: {
          hotel_id: data.hotel_id,
          codigo: data.codigo,
          titular_nome: data.titular_nome,
          titular_telefone: data.titular_telefone,
          titular_email: data.titular_email,
          quarto_id: data.quarto_id,
          regime_alimentacao_id: data.regime_alimentacao_id,
          parceiro_comercial_id: data.parceiro_comercial_id,
          check_in: new Date(`${data.check_in}T00:00:00.000Z`),
          check_out: new Date(`${data.check_out}T00:00:00.000Z`),
          quantidade_adultos: data.quantidade_adultos,
          quantidade_criancas: data.quantidade_criancas ?? 0,
          valor_total: data.valor_total,
          detalhamento_diarias:
            data.detalhamento_diarias as unknown as Prisma.InputJsonValue,
          status: data.status ?? 'a_confirmar',
          token_fnrh: data.token_fnrh,
          token_fnrh_ativo: data.token_fnrh_ativo ?? true,
          observacoes: data.observacoes,
        },
        include: RESERVA_DEFAULT_INCLUDE,
      })

      return map_reserva_row(created)
    } catch (error) {
      this.handle_exclusion_error(error)
    }
  }

  async update(
    id: string,
    hotel_id: string,
    data: UpdateReservaData
  ): Promise<Reserva | null> {
    try {
      const existing = await this.prisma.reserva.findFirst({
        where: { id, hotel_id },
      })
      if (!existing) return null

      const updated = await this.prisma.reserva.update({
        where: { id },
        data: {
          titular_nome: data.titular_nome,
          titular_telefone: data.titular_telefone,
          titular_email: data.titular_email,
          quarto_id: data.quarto_id,
          regime_alimentacao_id: data.regime_alimentacao_id,
          parceiro_comercial_id: data.parceiro_comercial_id,
          check_in: data.check_in
            ? new Date(`${data.check_in}T00:00:00.000Z`)
            : undefined,
          check_out: data.check_out
            ? new Date(`${data.check_out}T00:00:00.000Z`)
            : undefined,
          quantidade_adultos: data.quantidade_adultos,
          quantidade_criancas: data.quantidade_criancas,
          valor_total: data.valor_total,
          detalhamento_diarias: data.detalhamento_diarias
            ? (data.detalhamento_diarias as unknown as Prisma.InputJsonValue)
            : undefined,
          status: data.status,
          token_fnrh: data.token_fnrh,
          token_fnrh_ativo: data.token_fnrh_ativo,
          fnrh_enviada_em: data.fnrh_enviada_em
            ? new Date(data.fnrh_enviada_em)
            : undefined,
          observacoes: data.observacoes,
        },
        include: RESERVA_DEFAULT_INCLUDE,
      })

      return map_reserva_row(updated)
    } catch (error) {
      this.handle_exclusion_error(error)
    }
  }

  async find_by_id(id: string, hotel_id: string): Promise<Reserva | null> {
    const row = await this.prisma.reserva.findFirst({
      where: { id, hotel_id },
      include: RESERVA_DEFAULT_INCLUDE,
    })
    return row ? map_reserva_row(row) : null
  }

  async find_by_token_fnrh(token: string): Promise<Reserva | null> {
    const row = await this.prisma.reserva.findUnique({
      where: { token_fnrh: token },
      include: RESERVA_DEFAULT_INCLUDE,
    })
    return row ? map_reserva_row(row) : null
  }

  async find_conflito(
    quarto_id: string,
    check_in: string,
    check_out: string,
    ignorar_reserva_id?: string
  ): Promise<boolean> {
    const count = await this.prisma.reserva.count({
      where: {
        quarto_id,
        status: { in: ['a_confirmar', 'confirmada', 'check_in', 'check_out'] },
        id: ignorar_reserva_id ? { not: ignorar_reserva_id } : undefined,
        check_in: { lt: new Date(`${check_out}T00:00:00.000Z`) },
        check_out: { gt: new Date(`${check_in}T00:00:00.000Z`) },
      },
    })
    return count > 0
  }

  async find_conflitos_por_quartos(
    quartos_ids: string[],
    check_in: string,
    check_out: string,
    ignorar_reserva_id?: string
  ): Promise<string[]> {
    if (quartos_ids.length === 0) return []

    const ocupadas = await this.prisma.reserva.findMany({
      where: {
        quarto_id: { in: quartos_ids },
        status: { in: ['a_confirmar', 'confirmada', 'check_in', 'check_out'] },
        id: ignorar_reserva_id ? { not: ignorar_reserva_id } : undefined,
        check_in: { lt: new Date(`${check_out}T00:00:00.000Z`) },
        check_out: { gt: new Date(`${check_in}T00:00:00.000Z`) },
      },
      select: { quarto_id: true },
    })

    return Array.from(new Set(ocupadas.map(o => o.quarto_id)))
  }

  async list(
    hotel_id: string,
    params: ReservaListParams
  ): Promise<PaginatedResult<Reserva>> {
    const pagina = params.pagina && params.pagina > 0 ? params.pagina : 1
    const limite = params.limite && params.limite > 0 ? params.limite : 10
    const skip = (pagina - 1) * limite

    const where: Prisma.ReservaWhereInput = {
      hotel_id,
    }

    if (params.status) {
      where.status = params.status
    }
    if (params.quarto_id) {
      where.quarto_id = params.quarto_id
    }
    if (params.regime_alimentacao_id) {
      where.regime_alimentacao_id = params.regime_alimentacao_id
    }
    if (params.parceiro_comercial_id) {
      where.parceiro_comercial_id = params.parceiro_comercial_id
    }
    if (params.check_in_de) {
      where.check_in = {
        ...(where.check_in as Prisma.DateTimeFilter),
        gte: new Date(`${params.check_in_de}T00:00:00.000Z`),
      }
    }
    if (params.check_in_ate) {
      where.check_in = {
        ...(where.check_in as Prisma.DateTimeFilter),
        lte: new Date(`${params.check_in_ate}T00:00:00.000Z`),
      }
    }

    if (params.busca) {
      const q = params.busca.trim()
      where.OR = [
        { codigo: { contains: q, mode: 'insensitive' } },
        { titular_nome: { contains: q, mode: 'insensitive' } },
        {
          hospedes: {
            some: {
              nome_completo: { contains: q, mode: 'insensitive' },
            },
          },
        },
      ]
    }

    const [total, rows] = await Promise.all([
      this.prisma.reserva.count({ where }),
      this.prisma.reserva.findMany({
        where,
        include: RESERVA_DEFAULT_INCLUDE,
        orderBy: { created_at: 'desc' },
        skip,
        take: limite,
      }),
    ])

    return {
      data: rows.map(map_reserva_row),
      meta: {
        total,
        pagina,
        limite,
        ultima_pagina: Math.max(1, Math.ceil(total / limite)),
      },
    }
  }

  async gerar_proximo_codigo(hotel_id: string): Promise<string> {
    const total = await this.prisma.reserva.count({
      where: { hotel_id },
    })
    return `RES-${String(total + 1).padStart(6, '0')}`
  }

  async create_status_historico(
    reserva_id: string,
    status_anterior: string | null,
    status_novo: string,
    user_id?: string | null
  ): Promise<void> {
    await this.prisma.reservaStatusHistorico.create({
      data: {
        reserva_id,
        status_anterior,
        status_novo,
        user_id: user_id ?? null,
      },
    })
  }
}

export class PostgresReservaHospedeRepository
  implements IReservaHospedeRepository
{
  constructor(private readonly prisma: DB) {}

  async create_many(hospedes: CreateReservaHospedeData[]): Promise<void> {
    if (hospedes.length === 0) return

    await this.prisma.reservaHospede.createMany({
      data: hospedes.map(h => ({
        reserva_id: h.reserva_id,
        posicao: h.posicao,
        ficha_status: h.ficha_status ?? 'pendente',
        nome_completo: h.nome_completo,
      })),
    })
  }

  async find_by_reserva_id(reserva_id: string): Promise<ReservaHospede[]> {
    const rows = await this.prisma.reservaHospede.findMany({
      where: { reserva_id },
      orderBy: { posicao: 'asc' },
    })
    return rows.map(map_hospede_row)
  }

  async find_by_reserva_and_posicao(
    reserva_id: string,
    posicao: number
  ): Promise<ReservaHospede | null> {
    const row = await this.prisma.reservaHospede.findUnique({
      where: {
        reserva_id_posicao: {
          reserva_id,
          posicao,
        },
      },
    })
    return row ? map_hospede_row(row) : null
  }

  async update_ficha(
    reserva_id: string,
    posicao: number,
    data: UpdateFichaHospedeData
  ): Promise<ReservaHospede | null> {
    const existing = await this.find_by_reserva_and_posicao(reserva_id, posicao)
    if (!existing) return null

    const updated = await this.prisma.reservaHospede.update({
      where: {
        reserva_id_posicao: {
          reserva_id,
          posicao,
        },
      },
      data: {
        ficha_status: data.ficha_status,
        preenchido_por: data.preenchido_por,
        preenchido_em: data.preenchido_em
          ? new Date(data.preenchido_em)
          : undefined,
        nome_completo: data.nome_completo,
        nacionalidade: data.nacionalidade,
        data_nascimento: data.data_nascimento
          ? new Date(`${data.data_nascimento}T00:00:00.000Z`)
          : undefined,
        sexo: data.sexo,
        profissao: data.profissao,
        tipo_documento: data.tipo_documento,
        numero_documento: data.numero_documento,
        logradouro: data.logradouro,
        numero_endereco: data.numero_endereco,
        complemento: data.complemento,
        bairro: data.bairro,
        cidade: data.cidade,
        estado: data.estado,
        cep: data.cep,
        pais_residencia: data.pais_residencia,
        telefone: data.telefone,
        email: data.email,
        motivo_viagem: data.motivo_viagem,
        meio_transporte: data.meio_transporte,
        procedencia: data.procedencia,
        proximo_destino: data.proximo_destino,
        responsavel_posicao: data.responsavel_posicao,
      },
    })

    return map_hospede_row(updated)
  }

  async adjust_positions(
    reserva_id: string,
    nova_quantidade: number
  ): Promise<void> {
    const atuais = await this.find_by_reserva_id(reserva_id)
    const atual_count = atuais.length

    if (nova_quantidade === atual_count) return

    if (nova_quantidade > atual_count) {
      const novos: CreateReservaHospedeData[] = []
      for (let p = atual_count + 1; p <= nova_quantidade; p++) {
        novos.push({
          reserva_id,
          posicao: p,
          ficha_status: 'pendente',
        })
      }
      await this.create_many(novos)
    } else {
      const a_remover = atuais.slice(nova_quantidade)
      const preenchidas = a_remover.filter(h => h.ficha_status === 'preenchida')
      if (preenchidas.length > 0) {
        throw new ReservaValidationError(
          `Não é possível reduzir a quantidade de pessoas pois as posições (${preenchidas.map(h => h.posicao).join(', ')}) contêm fichas já preenchidas.`
        )
      }

      await this.prisma.reservaHospede.deleteMany({
        where: {
          reserva_id,
          posicao: { gt: nova_quantidade },
        },
      })
    }
  }
}
