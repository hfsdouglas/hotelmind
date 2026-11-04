import { randomUUID } from 'node:crypto'
import { Orcamento } from '@/core/entities/orcamento'
import type { PaginatedResult } from '@/core/repositories/pagination'
import type {
  CreateOrcamentoData,
  IOrcamentoRepository,
  OrcamentoListFilter,
  UpdateOrcamentoData,
} from '../orcamento_repository'

export class InMemoryOrcamentoRepository implements IOrcamentoRepository {
  items: Orcamento[] = []

  async create(data: CreateOrcamentoData): Promise<Orcamento> {
    const now = new Date()
    const orcamento = new Orcamento({
      id: randomUUID(),
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
      detalhamento_noites: data.detalhamento_noites,
      token_publico: data.token_publico,
      status: data.status ?? 'pendente',
      observacoes: data.observacoes,
      cupom_desconto: data.cupom_desconto,
      created_at: now,
      updated_at: now,
    })

    this.items.push(orcamento)
    return orcamento
  }

  async update(data: UpdateOrcamentoData): Promise<Orcamento> {
    const index = this.items.findIndex(
      item => item.id === data.id && item.hotel_id === data.hotel_id
    )
    if (index === -1) {
      throw new Error('Orcamento not found')
    }

    const current = this.items[index]
    const updated = new Orcamento({
      id: current.id,
      hotel_id: current.hotel_id,
      lead_id: current.lead_id,
      regime_alimentacao_id:
        data.regime_alimentacao_id ?? current.regime_alimentacao_id,
      categoria_quarto_id:
        data.categoria_quarto_id ?? current.categoria_quarto_id,
      check_in: data.check_in ?? current.check_in,
      check_out: data.check_out ?? current.check_out,
      quantidade_adultos: data.quantidade_adultos ?? current.quantidade_adultos,
      quantidade_criancas:
        data.quantidade_criancas ?? current.quantidade_criancas,
      quantidade_pets: data.quantidade_pets ?? current.quantidade_pets,
      valor_total: data.valor_total ?? current.valor_total,
      detalhamento_noites:
        data.detalhamento_noites ?? current.detalhamento_noites,
      token_publico: current.token_publico,
      status: data.status ?? current.status,
      observacoes:
        data.observacoes !== undefined ? data.observacoes : current.observacoes,
      cupom_desconto:
        data.cupom_desconto !== undefined
          ? data.cupom_desconto
          : current.cupom_desconto,
      lead: current.lead,
      regime_alimentacao: current.regime_alimentacao,
      categoria_quarto: current.categoria_quarto,
      created_at: current.created_at,
      updated_at: new Date(),
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

  async find_by_id(id: string, hotel_id: string): Promise<Orcamento | null> {
    const found = this.items.find(
      item => item.id === id && item.hotel_id === hotel_id
    )
    return found ?? null
  }

  async find_by_token_publico(token: string): Promise<Orcamento | null> {
    const found = this.items.find(item => item.token_publico === token)
    return found ?? null
  }

  async list(
    hotel_id: string,
    filter: OrcamentoListFilter
  ): Promise<PaginatedResult<Orcamento>> {
    let filtered = this.items.filter(item => item.hotel_id === hotel_id)

    if (filter.regime_alimentacao_id) {
      filtered = filtered.filter(
        item => item.regime_alimentacao_id === filter.regime_alimentacao_id
      )
    }

    if (filter.categoria_quarto_id) {
      filtered = filtered.filter(
        item => item.categoria_quarto_id === filter.categoria_quarto_id
      )
    }

    if (filter.status) {
      filtered = filtered.filter(item => item.status === filter.status)
    }

    if (filter.busca) {
      const search_lower = filter.busca.toLowerCase()
      filtered = filtered.filter(
        item =>
          item.lead?.nome.toLowerCase().includes(search_lower) ||
          item.observacoes?.toLowerCase().includes(search_lower)
      )
    }

    filtered.sort((a, b) => b.created_at.getTime() - a.created_at.getTime())

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
