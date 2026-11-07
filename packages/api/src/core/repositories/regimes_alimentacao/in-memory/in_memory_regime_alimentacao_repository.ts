import { randomUUID } from 'node:crypto'
import { RegimeAlimentacao } from '@/core/entities/regime_alimentacao'
import type { PaginatedResult } from '@/core/repositories/pagination'
import type {
  CreateRegimeAlimentacaoData,
  IRegimeAlimentacaoRepository,
  RegimeAlimentacaoListFilter,
  UpdateRegimeAlimentacaoData,
} from '../regime_alimentacao.repository'

export class InMemoryRegimeAlimentacaoRepository
  implements IRegimeAlimentacaoRepository
{
  items: RegimeAlimentacao[] = []

  async list(
    hotel_id: string,
    filter: RegimeAlimentacaoListFilter
  ): Promise<PaginatedResult<RegimeAlimentacao>> {
    let filtered = this.items.filter(item => item.hotel_id === hotel_id)

    if (filter.busca) {
      const search_lower = filter.busca.toLowerCase()
      filtered = filtered.filter(
        item =>
          item.titulo.toLowerCase().includes(search_lower) ||
          Boolean(item.descricao?.toLowerCase().includes(search_lower))
      )
    }

    if (filter.ativo !== undefined) {
      filtered = filtered.filter(item => item.ativo === filter.ativo)
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

  async create(data: CreateRegimeAlimentacaoData): Promise<RegimeAlimentacao> {
    const now = new Date()
    const item = new RegimeAlimentacao({
      id: randomUUID(),
      hotel_id: data.hotel_id,
      titulo: data.titulo,
      descricao: data.descricao ?? null,
      cor_pulseira: data.cor_pulseira,
      ativo: data.ativo,
      criado_em: now,
      atualizado_em: now,
    })
    this.items.push(item)
    return item
  }

  async find_by_id(
    id: string,
    hotel_id: string
  ): Promise<RegimeAlimentacao | null> {
    const found = this.items.find(
      item => item.id === id && item.hotel_id === hotel_id
    )
    return found ?? null
  }

  async find_by_titulo(
    titulo: string,
    hotel_id: string,
    exclude_id?: string
  ): Promise<RegimeAlimentacao | null> {
    const normalized = titulo.trim().toLowerCase()
    const found = this.items.find(
      item =>
        item.hotel_id === hotel_id &&
        item.titulo.trim().toLowerCase() === normalized &&
        item.id !== exclude_id
    )
    return found ?? null
  }

  async update(data: UpdateRegimeAlimentacaoData): Promise<RegimeAlimentacao> {
    const index = this.items.findIndex(
      item => item.id === data.id && item.hotel_id === data.hotel_id
    )
    if (index === -1) {
      throw new Error('Regime de alimentação não encontrado.')
    }

    const updated = new RegimeAlimentacao({
      id: data.id,
      hotel_id: data.hotel_id,
      titulo: data.titulo,
      descricao: data.descricao ?? null,
      cor_pulseira: data.cor_pulseira,
      ativo: data.ativo,
      criado_em: this.items[index].criado_em,
      atualizado_em: new Date(),
    })

    this.items[index] = updated
    return updated
  }
}
