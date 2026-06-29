import { Grupo } from '@/core/entities/grupo'
import { Rota } from '@/core/entities/rota'
import type {
  IGrupoRepository,
  PaginatedResult,
  PaginationInput,
  CreateGrupoData,
  UpdateGrupoData,
} from '@/core/repositories/grupo_repository'

export class InMemoryGrupoRepository implements IGrupoRepository {
  private grupos: Grupo[] = []
  private routes: Map<string, Rota[]> = new Map()
  private linkedUsers: Map<string, boolean> = new Map()

  setLinkedUsers(grupoId: string, hasUsers: boolean) {
    this.linkedUsers.set(grupoId, hasUsers)
  }

  async list(hotelId: string, pagination: PaginationInput): Promise<PaginatedResult<Grupo>> {
    let filtered = this.grupos.filter(g => g.hotel_id === hotelId)

    if (pagination.busca) {
      const q = pagination.busca.toLowerCase()
      filtered = filtered.filter(g => g.grupo.toLowerCase().includes(q))
    }

    if (pagination.status) {
      filtered = filtered.filter(g => g.status === pagination.status)
    }

    const total = filtered.length
    const pagina = pagination.pagina
    const limite = pagination.limite
    const start = (pagina - 1) * limite
    const data = filtered.slice(start, start + limite)

    return {
      data,
      meta: { pagina, limite, total, ultima_pagina: Math.max(1, Math.ceil(total / limite)) },
    }
  }

  async create(data: CreateGrupoData): Promise<Grupo> {
    const grupo = new Grupo({
      id: crypto.randomUUID(),
      hotel_id: data.hotel_id,
      grupo: data.grupo,
      descricao: data.descricao ?? null,
      status: data.status ?? 'S',
      created_at: new Date(),
      updated_at: new Date(),
    })
    this.grupos.push(grupo)
    return grupo
  }

  async findById(id: string, hotelId: string): Promise<Grupo | null> {
    return this.grupos.find(g => g.id === id && g.hotel_id === hotelId) ?? null
  }

  async update(id: string, hotelId: string, data: UpdateGrupoData): Promise<Grupo> {
    const idx = this.grupos.findIndex(g => g.id === id && g.hotel_id === hotelId)
    if (idx === -1) throw new Error('not found')
    const old = this.grupos[idx]
    const updated = new Grupo({
      ...old,
      grupo: data.grupo ?? old.grupo,
      descricao: data.descricao !== undefined ? data.descricao : old.descricao,
      status: data.status ?? old.status,
      updated_at: new Date(),
    })
    this.grupos[idx] = updated
    return updated
  }

  async delete(id: string, _hotelId: string): Promise<void> {
    this.grupos = this.grupos.filter(g => g.id !== id)
  }

  async hasLinkedUsers(id: string, _hotelId: string): Promise<boolean> {
    return this.linkedUsers.get(id) ?? false
  }

  async listRoutes(grupoId: string): Promise<Rota[]> {
    return this.routes.get(grupoId) ?? []
  }

  async syncRoutes(grupoId: string, rotaIds: string[]): Promise<void> {
    const rotaObjs = rotaIds.map(
      (rid, i) =>
        new Rota({
          id: rid,
          modulo: 'M',
          recurso: `R${i}`,
          rota: `/r${i}`,
          icone: null,
          ordem: i,
          ativo: true,
        })
    )
    this.routes.set(grupoId, rotaObjs)
  }
}
