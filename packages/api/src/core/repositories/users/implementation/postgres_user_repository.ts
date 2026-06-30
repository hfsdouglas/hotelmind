import bcrypt from 'bcryptjs'
import type { DB } from '@/lib/prisma'
import { User } from '@/core/entities/user'
import type {
  IUserRepository,
  CreateUserData,
  UpdateUserData,
} from '@/core/repositories/users/user.repository'
import type { PaginationInput, PaginatedResult } from '@/core/repositories/pagination'

function toUser(row: {
  id: string
  hotel_id: string
  nome_completo: string
  email: string
  senha: string
  nascimento: Date
  genero: string
  celular: string
  cpf: string
  rg: string | null
  grupos_ids: string | null
  created_at: Date
  updated_at: Date
}): User {
  return new User(row)
}

export class PostgresUserRepository implements IUserRepository {
  constructor(private readonly db: DB) {}

  async list(hotelId: string, pagination: PaginationInput): Promise<PaginatedResult<User>> {
    const { pagina, limite, busca, ordenar_por = 'nome_completo', direcao = 'asc' } = pagination

    const where = {
      hotel_id: hotelId,
      ...(busca
        ? {
            OR: [
              { nome_completo: { contains: busca, mode: 'insensitive' as const } },
              { email: { contains: busca, mode: 'insensitive' as const } },
              { cpf: { contains: busca } },
            ],
          }
        : {}),
    }

    const [rows, total] = await Promise.all([
      this.db.user.findMany({
        where,
        orderBy: { [ordenar_por]: direcao },
        skip: (pagina - 1) * limite,
        take: limite,
      }),
      this.db.user.count({ where }),
    ])

    return {
      data: rows.map(toUser),
      meta: {
        pagina,
        limite,
        total,
        ultima_pagina: Math.max(1, Math.ceil(total / limite)),
      },
    }
  }

  async create(data: CreateUserData): Promise<User> {
    const senha = await bcrypt.hash(data.senha, 10)
    const row = await this.db.user.create({
      data: {
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
      },
    })
    return toUser(row)
  }

  async findById(id: string, hotelId: string): Promise<User | null> {
    const row = await this.db.user.findFirst({ where: { id, hotel_id: hotelId } })
    return row ? toUser(row) : null
  }

  async findByEmail(email: string): Promise<User | null> {
    const row = await this.db.user.findUnique({ where: { email } })
    return row ? toUser(row) : null
  }

  async update(id: string, _hotelId: string, data: UpdateUserData): Promise<User> {
    const updateData: Record<string, unknown> = {}
    if (data.nome_completo !== undefined) updateData.nome_completo = data.nome_completo
    if (data.email !== undefined) updateData.email = data.email
    if (data.senha !== undefined) updateData.senha = await bcrypt.hash(data.senha, 10)
    if (data.nascimento !== undefined) updateData.nascimento = data.nascimento
    if (data.genero !== undefined) updateData.genero = data.genero
    if (data.celular !== undefined) updateData.celular = data.celular
    if (data.cpf !== undefined) updateData.cpf = data.cpf
    if (data.rg !== undefined) updateData.rg = data.rg
    if (data.grupos_ids !== undefined) updateData.grupos_ids = data.grupos_ids

    const row = await this.db.user.update({ where: { id }, data: updateData })
    return toUser(row)
  }
}
