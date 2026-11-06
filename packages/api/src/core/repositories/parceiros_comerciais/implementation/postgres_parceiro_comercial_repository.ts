import type {
  ModeloTarifario,
  PoliticaFaturamento,
  StatusParceiro,
  TipoContatoParceiro,
  TipoParceiro,
  TipoPessoa,
} from '@hotelmind/contracts'
import type { Prisma } from '@prisma/client'
import { ParceiroComercial } from '@/core/entities/parceiro_comercial'
import type { PaginatedResult } from '@/core/repositories/pagination'
import type { DB } from '@/lib/prisma'
import type {
  CreateParceiroComercialData,
  IParceiroComercialRepository,
  ParceiroComercialListFilter,
  UpdateParceiroComercialData,
} from '../parceiro_comercial_repository'

const DEFAULT_INCLUDE = {
  contatos: true,
  endereco: true,
}

// biome-ignore lint/suspicious/noExplicitAny: Prisma relations mapping
function map_row(row: any): ParceiroComercial {
  return new ParceiroComercial({
    id: row.id,
    hotel_id: row.hotel_id,
    tipo_parceiro: row.tipo_parceiro as TipoParceiro,
    tipo_pessoa: row.tipo_pessoa as TipoPessoa,
    razao_social: row.razao_social,
    nome_fantasia: row.nome_fantasia,
    documento: row.documento,
    inscricao_estadual: row.inscricao_estadual,
    estrangeiro: row.estrangeiro,
    cadastur: row.cadastur,
    codigo_iata: row.codigo_iata,
    registro_embratur: row.registro_embratur,

    logradouro: row.endereco?.logradouro ?? row.logradouro ?? null,
    numero: row.endereco?.numero ?? row.numero ?? null,
    complemento: row.endereco?.complemento ?? row.complemento ?? null,
    bairro: row.endereco?.bairro ?? row.bairro ?? null,
    cidade: row.endereco?.cidade ?? row.cidade ?? null,
    estado: row.endereco?.estado ?? row.estado ?? null,
    cep: row.endereco?.cep ?? row.cep ?? null,
    pais: row.endereco?.pais ?? row.pais ?? 'Brasil',

    modelo_tarifario: row.modelo_tarifario as ModeloTarifario,
    comissao_padrao: Number(row.comissao_padrao ?? 0),
    politica_faturamento: row.politica_faturamento as PoliticaFaturamento,
    prazo_pagamento_dias: row.prazo_pagamento_dias,
    limite_credito: Number(row.limite_credito ?? 0),
    allotment_quartos: row.allotment_quartos,

    status: row.status as StatusParceiro,
    motivo_bloqueio: row.motivo_bloqueio,
    observacoes: row.observacoes,
    criado_em: row.criado_em,
    atualizado_em: row.atualizado_em,

    contatos:
      row.contatos?.map(
        (c: {
          id: string
          tipo_contato: string
          nome: string
          email: string
          telefone: string
          cargo: string | null
        }) => ({
          id: c.id,
          tipo_contato: c.tipo_contato as TipoContatoParceiro,
          nome: c.nome,
          email: c.email,
          telefone: c.telefone,
          cargo: c.cargo,
        })
      ) || [],
  })
}

export class PostgresParceiroComercialRepository
  implements IParceiroComercialRepository
{
  constructor(private readonly db: DB) {}

  async create(data: CreateParceiroComercialData): Promise<ParceiroComercial> {
    const row = await this.db.parceiro.create({
      data: {
        hotel_id: data.hotel_id,
        tipo_parceiro: data.tipo_parceiro,
        tipo_pessoa: data.tipo_pessoa,
        razao_social: data.razao_social,
        nome_fantasia: data.nome_fantasia,
        documento: data.documento,
        inscricao_estadual: data.inscricao_estadual,
        estrangeiro: data.estrangeiro ?? false,
        cadastur: data.cadastur,
        codigo_iata: data.codigo_iata,
        registro_embratur: data.registro_embratur,

        modelo_tarifario: data.modelo_tarifario,
        comissao_padrao: data.comissao_padrao ?? 0.0,
        politica_faturamento: data.politica_faturamento,
        prazo_pagamento_dias: data.prazo_pagamento_dias ?? 0,
        limite_credito: data.limite_credito ?? 0.0,
        allotment_quartos: data.allotment_quartos ?? 0,

        status: data.status ?? 'ativo',
        motivo_bloqueio: data.motivo_bloqueio,
        observacoes: data.observacoes,

        endereco: {
          create: {
            logradouro: data.logradouro,
            numero: data.numero,
            complemento: data.complemento,
            bairro: data.bairro,
            cidade: data.cidade,
            estado: data.estado,
            cep: data.cep,
            pais: data.pais ?? 'Brasil',
          },
        },

        contatos: data.contatos?.length
          ? {
              create: data.contatos.map(c => ({
                tipo_contato: c.tipo_contato,
                nome: c.nome,
                email: c.email,
                telefone: c.telefone,
                cargo: c.cargo,
              })),
            }
          : undefined,
      },
      include: DEFAULT_INCLUDE,
    })

    return map_row(row)
  }

  async update(data: UpdateParceiroComercialData): Promise<ParceiroComercial> {
    const hasEnderecoUpdates =
      data.logradouro !== undefined ||
      data.numero !== undefined ||
      data.complemento !== undefined ||
      data.bairro !== undefined ||
      data.cidade !== undefined ||
      data.estado !== undefined ||
      data.cep !== undefined ||
      data.pais !== undefined

    const updateData: Prisma.ParceiroUncheckedUpdateInput = {
      ...(data.tipo_parceiro !== undefined
        ? { tipo_parceiro: data.tipo_parceiro }
        : {}),
      ...(data.tipo_pessoa !== undefined
        ? { tipo_pessoa: data.tipo_pessoa }
        : {}),
      ...(data.razao_social !== undefined
        ? { razao_social: data.razao_social }
        : {}),
      ...(data.nome_fantasia !== undefined
        ? { nome_fantasia: data.nome_fantasia }
        : {}),
      ...(data.documento !== undefined ? { documento: data.documento } : {}),
      ...(data.inscricao_estadual !== undefined
        ? { inscricao_estadual: data.inscricao_estadual }
        : {}),
      ...(data.estrangeiro !== undefined
        ? { estrangeiro: data.estrangeiro }
        : {}),
      ...(data.cadastur !== undefined ? { cadastur: data.cadastur } : {}),
      ...(data.codigo_iata !== undefined
        ? { codigo_iata: data.codigo_iata }
        : {}),
      ...(data.registro_embratur !== undefined
        ? { registro_embratur: data.registro_embratur }
        : {}),

      ...(data.modelo_tarifario !== undefined
        ? { modelo_tarifario: data.modelo_tarifario }
        : {}),
      ...(data.comissao_padrao !== undefined
        ? { comissao_padrao: data.comissao_padrao }
        : {}),
      ...(data.politica_faturamento !== undefined
        ? { politica_faturamento: data.politica_faturamento }
        : {}),
      ...(data.prazo_pagamento_dias !== undefined
        ? { prazo_pagamento_dias: data.prazo_pagamento_dias }
        : {}),
      ...(data.limite_credito !== undefined
        ? { limite_credito: data.limite_credito }
        : {}),
      ...(data.allotment_quartos !== undefined
        ? { allotment_quartos: data.allotment_quartos }
        : {}),

      ...(data.status !== undefined ? { status: data.status } : {}),
      ...(data.motivo_bloqueio !== undefined
        ? { motivo_bloqueio: data.motivo_bloqueio }
        : {}),
      ...(data.observacoes !== undefined
        ? { observacoes: data.observacoes }
        : {}),
    }

    if (hasEnderecoUpdates) {
      await this.db.parceiroEndereco.upsert({
        where: { parceiro_id: data.id },
        create: {
          parceiro_id: data.id,
          logradouro: data.logradouro,
          numero: data.numero,
          complemento: data.complemento,
          bairro: data.bairro,
          cidade: data.cidade,
          estado: data.estado,
          cep: data.cep,
          pais: data.pais ?? 'Brasil',
        },
        update: {
          ...(data.logradouro !== undefined
            ? { logradouro: data.logradouro }
            : {}),
          ...(data.numero !== undefined ? { numero: data.numero } : {}),
          ...(data.complemento !== undefined
            ? { complemento: data.complemento }
            : {}),
          ...(data.bairro !== undefined ? { bairro: data.bairro } : {}),
          ...(data.cidade !== undefined ? { cidade: data.cidade } : {}),
          ...(data.estado !== undefined ? { estado: data.estado } : {}),
          ...(data.cep !== undefined ? { cep: data.cep } : {}),
          ...(data.pais !== undefined ? { pais: data.pais } : {}),
        },
      })
    }

    if (data.contatos !== undefined) {
      await this.db.$transaction([
        this.db.parceiroContato.deleteMany({
          where: { parceiro_id: data.id },
        }),
        this.db.parceiro.update({
          where: { id: data.id },
          data: {
            ...updateData,
            contatos: {
              create: data.contatos.map(c => ({
                tipo_contato: c.tipo_contato,
                nome: c.nome,
                email: c.email,
                telefone: c.telefone,
                cargo: c.cargo,
              })),
            },
          },
        }),
      ])
    } else {
      await this.db.parceiro.update({
        where: { id: data.id },
        data: updateData,
      })
    }

    const updated = await this.db.parceiro.findFirstOrThrow({
      where: { id: data.id, hotel_id: data.hotel_id },
      include: DEFAULT_INCLUDE,
    })

    return map_row(updated)
  }

  async delete(id: string, hotel_id: string): Promise<void> {
    await this.db.parceiro.deleteMany({
      where: { id, hotel_id },
    })
  }

  async find_by_id(
    id: string,
    hotel_id: string
  ): Promise<ParceiroComercial | null> {
    const row = await this.db.parceiro.findFirst({
      where: { id, hotel_id },
      include: DEFAULT_INCLUDE,
    })

    return row ? map_row(row) : null
  }

  async find_by_documento(
    documento: string,
    hotel_id: string
  ): Promise<ParceiroComercial | null> {
    const row = await this.db.parceiro.findFirst({
      where: {
        hotel_id,
        documento,
      },
      include: DEFAULT_INCLUDE,
    })

    return row ? map_row(row) : null
  }

  async list(
    hotel_id: string,
    filter: ParceiroComercialListFilter
  ): Promise<PaginatedResult<ParceiroComercial>> {
    const where: Prisma.ParceiroWhereInput = {
      hotel_id,
      ...(filter.tipo_parceiro ? { tipo_parceiro: filter.tipo_parceiro } : {}),
      ...(filter.status ? { status: filter.status } : {}),
      ...(filter.cidade || filter.estado
        ? {
            endereco: {
              is: {
                ...(filter.cidade
                  ? {
                      cidade: {
                        contains: filter.cidade,
                        mode: 'insensitive' as Prisma.QueryMode,
                      },
                    }
                  : {}),
                ...(filter.estado
                  ? { estado: filter.estado.toUpperCase() }
                  : {}),
              },
            },
          }
        : {}),
      ...(filter.busca
        ? {
            OR: [
              {
                razao_social: {
                  contains: filter.busca,
                  mode: 'insensitive' as Prisma.QueryMode,
                },
              },
              {
                nome_fantasia: {
                  contains: filter.busca,
                  mode: 'insensitive' as Prisma.QueryMode,
                },
              },
              {
                documento: {
                  contains: filter.busca,
                  mode: 'insensitive' as Prisma.QueryMode,
                },
              },
              {
                cadastur: {
                  contains: filter.busca,
                  mode: 'insensitive' as Prisma.QueryMode,
                },
              },
              {
                codigo_iata: {
                  contains: filter.busca,
                  mode: 'insensitive' as Prisma.QueryMode,
                },
              },
            ],
          }
        : {}),
    }

    const [total, rows] = await this.db.$transaction([
      this.db.parceiro.count({ where }),
      this.db.parceiro.findMany({
        where,
        include: DEFAULT_INCLUDE,
        orderBy: { criado_em: 'desc' },
        skip: (filter.pagina - 1) * filter.limite,
        take: filter.limite,
      }),
    ])

    const total_paginas = Math.max(1, Math.ceil(total / filter.limite))

    return {
      data: rows.map(map_row),
      meta: {
        total,
        pagina: filter.pagina,
        limite: filter.limite,
        ultima_pagina: total_paginas,
      },
    }
  }
}
