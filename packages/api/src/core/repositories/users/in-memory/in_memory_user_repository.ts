import bcrypt from 'bcryptjs'
import { User } from '@/core/entities/user'
import type {
  IUserRepository,
  CreateUserData,
  UpdateUserData,
} from '@/core/repositories/users/user.repository'
import type { PaginationInput, PaginatedResult } from '@/core/repositories/pagination'

export class InMemoryUserRepository implements IUserRepository {
  private store: User[] = []

  seed(user: User): void {
    this.store.push(user)
  }

  async list(hotelId: string, pagination: PaginationInput): Promise<PaginatedResult<User>> {
    let filtered = this.store.filter(u => u.hotel_id === hotelId)

    if (pagination.busca) {
      const q = pagination.busca.toLowerCase()
      filtered = filtered.filter(
        u =>
          u.nome_completo.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.cpf.includes(q),
      )
    }

    const total = filtered.length
    const { pagina, limite } = pagination
    const data = filtered.slice((pagina - 1) * limite, pagina * limite)

    return {
      data,
      meta: { pagina, limite, total, ultima_pagina: Math.max(1, Math.ceil(total / limite)) },
    }
  }

  async create(data: CreateUserData): Promise<User> {
    const senha = await bcrypt.hash(data.senha, 1)
    const user = new User({
      id: crypto.randomUUID(),
      hotel_id: data.hotel_id,
      nome_completo: data.nome_completo,
      email: data.email,
      senha,
      nascimento: data.nascimento,
      genero: data.genero,
      celular: data.celular,
      cpf: data.cpf,
      rg: data.rg ?? null,
      grupos_ids: data.grupos_ids ?? null,
      created_at: new Date(),
      updated_at: new Date(),
    })
    this.store.push(user)
    return user
  }

  async findById(id: string, hotelId: string): Promise<User | null> {
    return this.store.find(u => u.id === id && u.hotel_id === hotelId) ?? null
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.store.find(u => u.email === email) ?? null
  }

  async update(id: string, hotelId: string, data: UpdateUserData): Promise<User> {
    const idx = this.store.findIndex(u => u.id === id && u.hotel_id === hotelId)
    if (idx === -1) throw new Error('not found')
    const old = this.store[idx]
    const updated = new User({
      ...old,
      nome_completo: data.nome_completo ?? old.nome_completo,
      email: data.email ?? old.email,
      senha: data.senha ?? old.senha,
      nascimento: data.nascimento ?? old.nascimento,
      genero: data.genero ?? old.genero,
      celular: data.celular ?? old.celular,
      cpf: data.cpf ?? old.cpf,
      rg: data.rg !== undefined ? data.rg : old.rg,
      grupos_ids: data.grupos_ids !== undefined ? data.grupos_ids : old.grupos_ids,
      updated_at: new Date(),
    })
    this.store[idx] = updated
    return updated
  }
}
