import { Lead } from '@/core/entities/lead'
import type {
  PaginatedResult,
  PaginationInput,
} from '@/core/repositories/pagination'
import type { DB } from '@/lib/prisma'
import type {
  CreateLeadData,
  ILeadRepository,
  UpdateLeadData,
} from '../lead_repository'

export class PostgresLeadRepository implements ILeadRepository {
  constructor(private readonly db: DB) {}

  async create(data: CreateLeadData): Promise<Lead> {
    const row = await this.db.lead.create({
      data: {
        hotel_id: data.hotel_id,
        nome: data.nome,
        telefone: data.telefone,
        email: data.email,
      },
    })

    return new Lead({
      id: row.id,
      hotel_id: row.hotel_id,
      nome: row.nome,
      telefone: row.telefone,
      email: row.email,
      created_at: row.created_at,
      updated_at: row.updated_at,
    })
  }

  async update(data: UpdateLeadData): Promise<Lead> {
    const row = await this.db.lead.update({
      where: {
        id: data.id,
      },
      data: {
        ...(data.nome !== undefined ? { nome: data.nome } : {}),
        ...(data.telefone !== undefined ? { telefone: data.telefone } : {}),
        ...(data.email !== undefined ? { email: data.email } : {}),
      },
    })

    return new Lead({
      id: row.id,
      hotel_id: row.hotel_id,
      nome: row.nome,
      telefone: row.telefone,
      email: row.email,
      created_at: row.created_at,
      updated_at: row.updated_at,
    })
  }

  async find_by_id(id: string, hotel_id: string): Promise<Lead | null> {
    const row = await this.db.lead.findFirst({
      where: {
        id,
        hotel_id,
      },
    })

    if (!row) return null

    return new Lead({
      id: row.id,
      hotel_id: row.hotel_id,
      nome: row.nome,
      telefone: row.telefone,
      email: row.email,
      created_at: row.created_at,
      updated_at: row.updated_at,
    })
  }

  async find_by_contact(
    hotel_id: string,
    contact: { email?: string; telefone?: string }
  ): Promise<Lead | null> {
    const conditions = []
    if (contact.email?.trim()) {
      conditions.push({
        email: { equals: contact.email.trim(), mode: 'insensitive' as const },
      })
    }
    if (contact.telefone?.trim()) {
      conditions.push({ telefone: contact.telefone.trim() })
    }

    if (conditions.length === 0) return null

    const row = await this.db.lead.findFirst({
      where: {
        hotel_id,
        OR: conditions,
      },
      orderBy: {
        created_at: 'desc',
      },
    })

    if (!row) return null

    return new Lead({
      id: row.id,
      hotel_id: row.hotel_id,
      nome: row.nome,
      telefone: row.telefone,
      email: row.email,
      created_at: row.created_at,
      updated_at: row.updated_at,
    })
  }

  async list(
    hotel_id: string,
    input: PaginationInput
  ): Promise<PaginatedResult<Lead>> {
    const { pagina, limite, busca } = input
    const where = {
      hotel_id,
      ...(busca
        ? {
            OR: [
              { nome: { contains: busca, mode: 'insensitive' as const } },
              { email: { contains: busca, mode: 'insensitive' as const } },
              { telefone: { contains: busca } },
            ],
          }
        : {}),
    }

    const [rows, total] = await Promise.all([
      this.db.lead.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip: (pagina - 1) * limite,
        take: limite,
      }),
      this.db.lead.count({ where }),
    ])

    const total_paginas = Math.max(1, Math.ceil(total / limite))

    return {
      data: rows.map(
        row =>
          new Lead({
            id: row.id,
            hotel_id: row.hotel_id,
            nome: row.nome,
            telefone: row.telefone,
            email: row.email,
            created_at: row.created_at,
            updated_at: row.updated_at,
          })
      ),
      meta: {
        total,
        pagina,
        limite,
        ultima_pagina: total_paginas,
      },
    }
  }
}
