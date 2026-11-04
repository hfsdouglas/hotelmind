import { randomUUID } from 'node:crypto'
import { ParceiroComercial } from '@/core/entities/parceiro_comercial'
import type { PaginatedResult } from '@/core/repositories/pagination'
import type {
  CreateParceiroComercialData,
  IParceiroComercialRepository,
  ParceiroComercialListFilter,
  UpdateParceiroComercialData,
} from '../parceiro_comercial_repository'

export class InMemoryParceiroComercialRepository
  implements IParceiroComercialRepository
{
  items: ParceiroComercial[] = []

  async create(data: CreateParceiroComercialData): Promise<ParceiroComercial> {
    const now = new Date()
    const parceiro = new ParceiroComercial({
      id: randomUUID(),
      hotel_id: data.hotel_id,
      tipo_parceiro: data.tipo_parceiro,
      tipo_pessoa: data.tipo_pessoa,
      razao_social: data.razao_social,
      nome_fantasia: data.nome_fantasia ?? null,
      documento: data.documento ?? null,
      inscricao_estadual: data.inscricao_estadual ?? null,
      estrangeiro: data.estrangeiro ?? false,
      cadastur: data.cadastur ?? null,
      codigo_iata: data.codigo_iata ?? null,
      registro_embratur: data.registro_embratur ?? null,

      logradouro: data.logradouro ?? null,
      numero: data.numero ?? null,
      complemento: data.complemento ?? null,
      bairro: data.bairro ?? null,
      cidade: data.cidade ?? null,
      estado: data.estado ?? null,
      cep: data.cep ?? null,
      pais: data.pais ?? 'Brasil',

      modelo_tarifario: data.modelo_tarifario,
      comissao_padrao: data.comissao_padrao ?? 0.0,
      politica_faturamento: data.politica_faturamento,
      prazo_pagamento_dias: data.prazo_pagamento_dias ?? 0,
      limite_credito: data.limite_credito ?? 0.0,
      allotment_quartos: data.allotment_quartos ?? 0,

      status: data.status ?? 'ativo',
      motivo_bloqueio: data.motivo_bloqueio ?? null,
      observacoes: data.observacoes ?? null,
      criado_em: now,
      atualizado_em: now,

      contatos:
        data.contatos?.map(c => ({
          id: randomUUID(),
          tipo_contato: c.tipo_contato,
          nome: c.nome,
          email: c.email,
          telefone: c.telefone,
          cargo: c.cargo ?? null,
        })) || [],
    })

    this.items.push(parceiro)
    return parceiro
  }

  async update(data: UpdateParceiroComercialData): Promise<ParceiroComercial> {
    const index = this.items.findIndex(
      item => item.id === data.id && item.hotel_id === data.hotel_id
    )
    if (index === -1) {
      throw new Error('Parceiro comercial not found')
    }

    const current = this.items[index]
    const updated = new ParceiroComercial({
      id: current.id,
      hotel_id: current.hotel_id,
      tipo_parceiro: data.tipo_parceiro ?? current.tipo_parceiro,
      tipo_pessoa: data.tipo_pessoa ?? current.tipo_pessoa,
      razao_social: data.razao_social ?? current.razao_social,
      nome_fantasia:
        data.nome_fantasia !== undefined
          ? data.nome_fantasia
          : current.nome_fantasia,
      documento:
        data.documento !== undefined ? data.documento : current.documento,
      inscricao_estadual:
        data.inscricao_estadual !== undefined
          ? data.inscricao_estadual
          : current.inscricao_estadual,
      estrangeiro:
        data.estrangeiro !== undefined ? data.estrangeiro : current.estrangeiro,
      cadastur: data.cadastur !== undefined ? data.cadastur : current.cadastur,
      codigo_iata:
        data.codigo_iata !== undefined ? data.codigo_iata : current.codigo_iata,
      registro_embratur:
        data.registro_embratur !== undefined
          ? data.registro_embratur
          : current.registro_embratur,

      logradouro:
        data.logradouro !== undefined ? data.logradouro : current.logradouro,
      numero: data.numero !== undefined ? data.numero : current.numero,
      complemento:
        data.complemento !== undefined ? data.complemento : current.complemento,
      bairro: data.bairro !== undefined ? data.bairro : current.bairro,
      cidade: data.cidade !== undefined ? data.cidade : current.cidade,
      estado: data.estado !== undefined ? data.estado : current.estado,
      cep: data.cep !== undefined ? data.cep : current.cep,
      pais: data.pais !== undefined ? data.pais : current.pais,

      modelo_tarifario: data.modelo_tarifario ?? current.modelo_tarifario,
      comissao_padrao:
        data.comissao_padrao !== undefined
          ? data.comissao_padrao
          : current.comissao_padrao,
      politica_faturamento:
        data.politica_faturamento ?? current.politica_faturamento,
      prazo_pagamento_dias:
        data.prazo_pagamento_dias !== undefined
          ? data.prazo_pagamento_dias
          : current.prazo_pagamento_dias,
      limite_credito:
        data.limite_credito !== undefined
          ? data.limite_credito
          : current.limite_credito,
      allotment_quartos:
        data.allotment_quartos !== undefined
          ? data.allotment_quartos
          : current.allotment_quartos,

      status: data.status ?? current.status,
      motivo_bloqueio:
        data.motivo_bloqueio !== undefined
          ? data.motivo_bloqueio
          : current.motivo_bloqueio,
      observacoes:
        data.observacoes !== undefined ? data.observacoes : current.observacoes,
      criado_em: current.criado_em,
      atualizado_em: new Date(),

      contatos:
        data.contatos !== undefined
          ? data.contatos.map(c => ({
              id: c.id || randomUUID(),
              tipo_contato: c.tipo_contato,
              nome: c.nome,
              email: c.email,
              telefone: c.telefone,
              cargo: c.cargo ?? null,
            }))
          : current.contatos,
    })

    this.items[index] = updated
    return updated
  }

  async delete(id: string, hotel_id: string): Promise<void> {
    const index = this.items.findIndex(
      item => item.id === id && item.hotel_id === hotel_id
    )
    if (index !== -1) {
      this.items.splice(index, 1)
    }
  }

  async find_by_id(
    id: string,
    hotel_id: string
  ): Promise<ParceiroComercial | null> {
    const parceiro = this.items.find(
      item => item.id === id && item.hotel_id === hotel_id
    )
    return parceiro ?? null
  }

  async find_by_documento(
    documento: string,
    hotel_id: string
  ): Promise<ParceiroComercial | null> {
    const limpo = documento.replace(/\D/g, '')
    const parceiro = this.items.find(item => {
      if (item.hotel_id !== hotel_id) return false
      if (!item.documento) return false
      return item.documento.replace(/\D/g, '') === limpo
    })
    return parceiro ?? null
  }

  async list(
    hotel_id: string,
    filter: ParceiroComercialListFilter
  ): Promise<PaginatedResult<ParceiroComercial>> {
    let filtered = this.items.filter(item => item.hotel_id === hotel_id)

    if (filter.tipo_parceiro) {
      filtered = filtered.filter(
        item => item.tipo_parceiro === filter.tipo_parceiro
      )
    }

    if (filter.status) {
      filtered = filtered.filter(item => item.status === filter.status)
    }

    if (filter.cidade) {
      const cidade_lower = filter.cidade.toLowerCase()
      filtered = filtered.filter(item =>
        item.cidade?.toLowerCase().includes(cidade_lower)
      )
    }

    if (filter.estado) {
      const uf_upper = filter.estado.toUpperCase()
      filtered = filtered.filter(item => item.estado === uf_upper)
    }

    if (filter.busca) {
      const busca_lower = filter.busca.toLowerCase()
      const busca_digits = filter.busca.replace(/\D/g, '')
      filtered = filtered.filter(item => {
        const matches_name =
          item.razao_social.toLowerCase().includes(busca_lower) ||
          (item.nome_fantasia?.toLowerCase().includes(busca_lower) ?? false) ||
          (item.cadastur?.toLowerCase().includes(busca_lower) ?? false) ||
          (item.codigo_iata?.toLowerCase().includes(busca_lower) ?? false)
        const matches_doc =
          busca_digits.length > 0 &&
          (item.documento?.replace(/\D/g, '').includes(busca_digits) ?? false)
        return matches_name || matches_doc
      })
    }

    filtered.sort((a, b) => b.criado_em.getTime() - a.criado_em.getTime())

    const total = filtered.length
    const start = (filter.pagina - 1) * filter.limite
    const data = filtered.slice(start, start + filter.limite)
    const total_paginas = Math.max(1, Math.ceil(total / filter.limite))

    return {
      data,
      meta: {
        total,
        pagina: filter.pagina,
        limite: filter.limite,
        ultima_pagina: total_paginas,
      },
    }
  }
}
