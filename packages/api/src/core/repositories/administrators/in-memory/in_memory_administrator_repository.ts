import { Administrator } from '@/core/entities/administrator'
import type {
  IAdministratorRepository,
  CreateAdministratorData,
  UpdateAdministratorData,
} from '@/core/repositories/administrators/administrator.repository'
import type { PaginationInput, PaginatedResult } from '@/core/repositories/pagination'

export class InMemoryAdministratorRepository implements IAdministratorRepository {
  private store = new Map<string, Administrator>()

  seed(admin: Administrator): void {
    this.store.set(admin.id, admin)
  }

  async list(params: PaginationInput): Promise<PaginatedResult<Administrator>> {
    const { pagina, limite, busca } = params
    let rows = Array.from(this.store.values())
    if (busca) {
      const q = busca.toLowerCase()
      rows = rows.filter(
        a =>
          a.nome_completo.toLowerCase().includes(q) ||
          a.email.toLowerCase().includes(q),
      )
    }
    const total = rows.length
    const data = rows.slice((pagina - 1) * limite, pagina * limite)
    return {
      data,
      meta: { pagina, limite, total, ultima_pagina: Math.max(1, Math.ceil(total / limite)) },
    }
  }

  async findById(id: string): Promise<Administrator | null> {
    return this.store.get(id) ?? null
  }

  async findByEmail(email: string): Promise<Administrator | null> {
    for (const admin of this.store.values()) {
      if (admin.email === email) return admin
    }
    return null
  }

  async create(data: CreateAdministratorData): Promise<Administrator> {
    const admin = new Administrator({
      id: crypto.randomUUID(),
      nome_completo: data.nome_completo,
      email: data.email,
      senha: data.senha,
      status: data.status ?? 'S',
    })
    this.store.set(admin.id, admin)
    return admin
  }

  async update(id: string, data: UpdateAdministratorData): Promise<Administrator> {
    const existing = this.store.get(id)
    if (!existing) throw new Error('not found')
    const updated = new Administrator({
      ...existing,
      nome_completo: data.nome_completo ?? existing.nome_completo,
      email: data.email ?? existing.email,
      senha: data.senha ?? existing.senha,
      status: data.status ?? existing.status,
    })
    this.store.set(id, updated)
    return updated
  }

  async delete(id: string): Promise<void> {
    this.store.delete(id)
  }
}
