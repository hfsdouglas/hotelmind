import type { Lead } from '@/core/entities/lead'
import type { ILeadRepository } from '@/core/repositories/leads/lead_repository'

export interface CriarLeadInput {
  hotel_id: string
  nome: string
  telefone: string
  email: string
}

export class CriarLeadUseCase {
  constructor(private readonly repository: ILeadRepository) {}

  async execute(input: CriarLeadInput): Promise<Lead> {
    const existing = await this.repository.find_by_contact(input.hotel_id, {
      email: input.email,
      telefone: input.telefone,
    })

    if (existing) {
      return this.repository.update({
        id: existing.id,
        hotel_id: input.hotel_id,
        nome: input.nome,
        telefone: input.telefone,
        email: input.email,
      })
    }

    return this.repository.create({
      hotel_id: input.hotel_id,
      nome: input.nome,
      telefone: input.telefone,
      email: input.email,
    })
  }
}
