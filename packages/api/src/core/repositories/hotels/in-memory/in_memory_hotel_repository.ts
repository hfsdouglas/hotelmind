import { Hotel } from '@/core/entities/hotel'
import type {
  IHotelRepository,
  HotelPaginationInput,
  CreateHotelData,
  UpdateHotelData,
} from '@/core/repositories/hotels/hotel.repository'
import type { PaginatedResult } from '@/core/repositories/pagination'

export class InMemoryHotelRepository implements IHotelRepository {
  private store = new Map<string, Hotel>()

  seed(hotel: Hotel): void {
    this.store.set(hotel.id, hotel)
  }

  async list(params: HotelPaginationInput): Promise<PaginatedResult<Hotel>> {
    const { pagina, limite, busca, status } = params
    let rows = Array.from(this.store.values())
    if (busca) {
      const q = busca.toLowerCase()
      rows = rows.filter(
        h =>
          h.nome_hotel.toLowerCase().includes(q) ||
          h.nome_fantasia.toLowerCase().includes(q),
      )
    }
    if (status) {
      rows = rows.filter(h => h.status === status)
    }
    const total = rows.length
    const data = rows.slice((pagina - 1) * limite, pagina * limite)
    return { data, meta: { pagina, limite, total, ultima_pagina: Math.max(1, Math.ceil(total / limite)) } }
  }

  async findById(id: string): Promise<Hotel | null> {
    return this.store.get(id) ?? null
  }

  async create(data: CreateHotelData): Promise<Hotel> {
    const hotel = new Hotel({ id: crypto.randomUUID(), ...data, website: data.website ?? null })
    this.store.set(hotel.id, hotel)
    return hotel
  }

  async update(id: string, data: UpdateHotelData): Promise<Hotel> {
    const existing = this.store.get(id)
    if (!existing) throw new Error('not found')
    const updated = new Hotel({ ...existing, ...data })
    this.store.set(id, updated)
    return updated
  }

  async delete(id: string): Promise<void> {
    this.store.delete(id)
  }
}
