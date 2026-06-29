import bcrypt from 'bcryptjs'
import { User } from '@/core/entities/user'
import type {
  IUsuarioRepository,
  CreateUsuarioData,
  UpdateUsuarioData,
} from '@/core/repositories/usuario_repository'
import type { PaginationInput, PaginatedResult } from '@/core/repositories/grupo_repository'

export class InMemoryUsuarioRepository implements IUsuarioRepository {
  private usuarios: User[] = []

  seed(user: User) {
    this.usuarios.push(user)
  }

  async list(hotelId: string, pagination: PaginationInput): Promise<PaginatedResult<User>> {
    let filtered = this.usuarios.filter(u => u.hotel_id === hotelId)

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

  async create(data: CreateUsuarioData): Promise<User> {
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
    this.usuarios.push(user)
    return user
  }

  async findById(id: string, hotelId: string): Promise<User | null> {
    return this.usuarios.find(u => u.id === id && u.hotel_id === hotelId) ?? null
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usuarios.find(u => u.email === email) ?? null
  }

  async update(id: string, hotelId: string, data: UpdateUsuarioData): Promise<User> {
    const idx = this.usuarios.findIndex(u => u.id === id && u.hotel_id === hotelId)
    if (idx === -1) throw new Error('not found')
    const old = this.usuarios[idx]
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
    this.usuarios[idx] = updated
    return updated
  }
}
