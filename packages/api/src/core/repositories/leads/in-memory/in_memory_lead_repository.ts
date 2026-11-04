import { randomUUID } from 'node:crypto'
import { Lead } from '@/core/entities/lead'
import type {
  PaginatedResult,
  PaginationInput,
} from '@/core/repositories/pagination'
import type {
  CreateLeadData,
  ILeadRepository,
  UpdateLeadData,
} from '../lead_repository'

export class InMemoryLeadRepository implements ILeadRepository {
  items: Lead[] = []

  async create(data: CreateLeadData): Promise<Lead> {
    const now = new Date()
    const lead = new Lead({
      id: randomUUID(),
      hotel_id: data.hotel_id,
      nome: data.nome,
      telefone: data.telefone,
      email: data.email,
      created_at: now,
      updated_at: now,
    })

    this.items.push(lead)
    return lead
  }

  async update(data: UpdateLeadData): Promise<Lead> {
    const index = this.items.findIndex(
      item => item.id === data.id && item.hotel_id === data.hotel_id
    )
    if (index === -1) {
      throw new Error('Lead not found')
    }

    const current = this.items[index]
    const updated = new Lead({
      id: current.id,
      hotel_id: current.hotel_id,
      nome: data.nome ?? current.nome,
      telefone: data.telefone ?? current.telefone,
      email: data.email ?? current.email,
      created_at: current.created_at,
      updated_at: new Date(),
    })

    this.items[index] = updated
    return updated
  }

  async find_by_id(id: string, hotel_id: string): Promise<Lead | null> {
    const lead = this.items.find(
      item => item.id === id && item.hotel_id === hotel_id
    )
    return lead ?? null
  }

  async find_by_contact(
    hotel_id: string,
    contact: { email?: string; telefone?: string }
  ): Promise<Lead | null> {
    const email_lower = contact.email?.trim().toLowerCase()
    const telefone_clean = contact.telefone?.trim()

    const lead = this.items.find(item => {
      if (item.hotel_id !== hotel_id) return false
      if (email_lower && item.email.toLowerCase() === email_lower) return true
      if (telefone_clean && item.telefone === telefone_clean) return true
      return false
    })

    return lead ?? null
  }

  async list(
    hotel_id: string,
    input: PaginationInput
  ): Promise<PaginatedResult<Lead>> {
    let filtered = this.items.filter(item => item.hotel_id === hotel_id)

    if (input.busca) {
      const search_lower = input.busca.toLowerCase()
      filtered = filtered.filter(
        item =>
          item.nome.toLowerCase().includes(search_lower) ||
          item.email.toLowerCase().includes(search_lower) ||
          item.telefone.includes(search_lower)
      )
    }

    filtered.sort((a, b) => b.created_at.getTime() - a.created_at.getTime())

    const total = filtered.length
    const start = (input.pagina - 1) * input.limite
    const data = filtered.slice(start, start + input.limite)
    const total_paginas = Math.max(1, Math.ceil(total / input.limite))

    return {
      data,
      meta: {
        total,
        pagina: input.pagina,
        limite: input.limite,
        ultima_pagina: total_paginas,
      },
    }
  }
}
