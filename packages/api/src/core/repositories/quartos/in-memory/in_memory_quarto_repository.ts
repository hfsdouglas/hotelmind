import { randomUUID } from 'node:crypto'
import { ConfiguracaoCama } from '@/core/entities/configuracao_cama'
import { Quarto } from '@/core/entities/quarto'
import type { PaginatedResult } from '@/core/repositories/pagination'
import type {
  CreateQuartoData,
  IQuartoRepository,
  QuartoPaginationInput,
  UpdateQuartoData,
} from '../quarto.repository'

export class InMemoryQuartoRepository implements IQuartoRepository {
  public items: Quarto[] = []

  async create(data: CreateQuartoData): Promise<Quarto> {
    const quarto_id = randomUUID()
    const camas = data.camas.map(
      c =>
        new ConfiguracaoCama({
          id: randomUUID(),
          quarto_id,
          tipo: c.tipo,
          quantidade: c.quantidade,
        })
    )

    const quarto = new Quarto({
      id: quarto_id,
      hotel_id: data.hotel_id,
      categoria_id: data.categoria_id,
      identificacao: data.identificacao,
      descricao: data.descricao ?? null,
      limite_hospedes: data.limite_hospedes,
      status: 'S',
      camas,
      categoria: {
        id: data.categoria_id,
        nome: 'Categoria Teste',
        status: 'S',
      },
      created_at: new Date(),
      updated_at: new Date(),
    })

    this.items.push(quarto)
    return quarto
  }

  async find_by_id(id: string, hotel_id: string): Promise<Quarto | null> {
    const item = this.items.find(q => q.id === id && q.hotel_id === hotel_id)
    return item ?? null
  }

  async update(data: UpdateQuartoData): Promise<Quarto> {
    const index = this.items.findIndex(
      q => q.id === data.id && q.hotel_id === data.hotel_id
    )
    if (index === -1) {
      throw new Error('Quarto não encontrado.')
    }

    const current = this.items[index]
    const camas = data.camas.map(
      c =>
        new ConfiguracaoCama({
          id: randomUUID(),
          quarto_id: data.id,
          tipo: c.tipo,
          quantidade: c.quantidade,
        })
    )

    const updated = new Quarto({
      id: current.id,
      hotel_id: current.hotel_id,
      categoria_id: data.categoria_id,
      identificacao: data.identificacao,
      descricao: data.descricao ?? null,
      limite_hospedes: data.limite_hospedes,
      status: data.status,
      camas,
      categoria: current.categoria,
      created_at: current.created_at,
      updated_at: new Date(),
    })

    this.items[index] = updated
    return updated
  }

  async list(
    hotel_id: string,
    input: QuartoPaginationInput
  ): Promise<PaginatedResult<Quarto>> {
    const pagina = input.pagina || 1
    const limite = input.limite || 10

    let filtered = this.items.filter(q => q.hotel_id === hotel_id)

    if (input.status) {
      filtered = filtered.filter(q => q.status === input.status)
    }

    if (input.categoria_id && input.categoria_id.length > 0) {
      filtered = filtered.filter(q =>
        input.categoria_id!.includes(q.categoria_id)
      )
    }

    if (input.busca) {
      const q = input.busca.toLowerCase().trim()
      filtered = filtered.filter(item =>
        item.identificacao.toLowerCase().includes(q)
      )
    }

    const total = filtered.length
    const offset = (pagina - 1) * limite
    const paginated = filtered.slice(offset, offset + limite)

    return {
      data: paginated,
      meta: {
        total,
        pagina,
        limite,
        ultima_pagina: Math.max(1, Math.ceil(total / limite)),
      },
    }
  }
}
