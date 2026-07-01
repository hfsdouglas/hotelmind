import { Rota } from '@/core/entities/rota'
import type {
  IRouteRepository,
  CreateRouteData,
  UpdateRouteData,
} from '@/core/repositories/routes/route.repository'
import type { PaginationInput, PaginatedResult } from '@/core/repositories/pagination'

export class InMemoryRouteRepository implements IRouteRepository {
  private store = new Map<string, Rota>()
  private hotel_routes = new Map<string, string[]>()

  seed(rota: Rota): void {
    this.store.set(rota.id, rota)
  }

  async list(params: PaginationInput): Promise<PaginatedResult<Rota>> {
    const { pagina, limite, busca } = params
    let rows = Array.from(this.store.values())
    if (busca) {
      const q = busca.toLowerCase()
      rows = rows.filter(
        r =>
          r.modulo.toLowerCase().includes(q) ||
          r.recurso.toLowerCase().includes(q) ||
          r.rota.toLowerCase().includes(q),
      )
    }
    const total = rows.length
    const data = rows.slice((pagina - 1) * limite, pagina * limite)
    return {
      data,
      meta: { pagina, limite, total, ultima_pagina: Math.max(1, Math.ceil(total / limite)) },
    }
  }

  async findById(id: string): Promise<Rota | null> {
    return this.store.get(id) ?? null
  }

  async create(data: CreateRouteData): Promise<Rota> {
    const rota = new Rota({
      id: crypto.randomUUID(),
      modulo: data.modulo,
      recurso: data.recurso,
      rota: data.rota,
      icone: data.icone ?? null,
      ordem: data.ordem ?? 0,
      ativo: data.ativo ?? true,
    })
    this.store.set(rota.id, rota)
    return rota
  }

  async update(id: string, data: UpdateRouteData): Promise<Rota> {
    const existing = this.store.get(id)
    if (!existing) throw new Error('not found')
    const updated = new Rota({
      ...existing,
      modulo: data.modulo ?? existing.modulo,
      recurso: data.recurso ?? existing.recurso,
      rota: data.rota ?? existing.rota,
      icone: data.icone !== undefined ? data.icone : existing.icone,
      ordem: data.ordem ?? existing.ordem,
      ativo: data.ativo ?? existing.ativo,
    })
    this.store.set(id, updated)
    return updated
  }

  async delete(id: string): Promise<void> {
    this.store.delete(id)
  }

  async findByHotel(hotelId: string): Promise<Rota[]> {
    const ids = this.hotel_routes.get(hotelId) ?? []
    return ids.map(id => this.store.get(id)).filter((r): r is Rota => r !== undefined)
  }

  async findByUsuario(hotelId: string, _grupoIds: string[]): Promise<Rota[]> {
    return this.findByHotel(hotelId)
  }

  async findHotelRoutes(hotelId: string): Promise<Rota[]> {
    return this.findByHotel(hotelId)
  }

  async setHotelRoutes(hotelId: string, routeIds: string[]): Promise<void> {
    this.hotel_routes.set(hotelId, routeIds)
  }
}
