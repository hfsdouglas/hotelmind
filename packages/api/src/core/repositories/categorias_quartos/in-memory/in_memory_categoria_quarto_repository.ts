import { CategoriaQuarto } from '@/core/entities/categoria_quarto'
import type { PaginatedResult } from '@/core/repositories/pagination'
import type { CategoriaQuartoPaginationInput, CreateCategoriaQuartoData, ICategoriaQuartoRepository, UpdateCategoriaQuartoData } from '@/core/repositories/categorias_quartos/categoria_quarto.repository'

export class InMemoryCategoriaQuartoRepository implements ICategoriaQuartoRepository {
  private categories: CategoriaQuarto[] = []

  async list(hotel_id: string, input: CategoriaQuartoPaginationInput): Promise<PaginatedResult<CategoriaQuarto>> {
    const filtered = this.categories.filter(category => category.hotel_id === hotel_id && (!input.status || category.status === input.status) && (!input.busca || category.nome.toLowerCase().includes(input.busca.toLowerCase())))
    const start = (input.pagina - 1) * input.limite
    return { data: filtered.slice(start, start + input.limite), meta: { pagina: input.pagina, limite: input.limite, total: filtered.length, ultima_pagina: Math.max(1, Math.ceil(filtered.length / input.limite)) } }
  }

  async create(data: CreateCategoriaQuartoData) {
    const category = new CategoriaQuarto({ id: crypto.randomUUID(), hotel_id: data.hotel_id, nome: data.nome, status: data.status ?? 'S', created_at: new Date(), updated_at: new Date() })
    this.categories.push(category)
    return category
  }

  async find_by_id(id: string, hotel_id: string) {
    return this.categories.find(category => category.id === id && category.hotel_id === hotel_id) ?? null
  }

  async update(data: UpdateCategoriaQuartoData) {
    const index = this.categories.findIndex(category => category.id === data.id && category.hotel_id === data.hotel_id)
    if (index < 0) throw new Error('Categoria não encontrada.')
    const current = this.categories[index]
    const updated = new CategoriaQuarto({ ...current, nome: data.nome.trim(), status: data.status, updated_at: new Date() })
    this.categories[index] = updated
    return updated
  }
}
