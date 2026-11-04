import type { Lead } from '@/core/entities/lead'
import { LeadNotFoundError } from '@/core/errors/lead_errors'
import type { ILeadRepository } from '@/core/repositories/leads/lead_repository'

export interface BuscarLeadInput {
  id: string
  hotel_id: string
}

export class BuscarLeadUseCase {
  constructor(private readonly repository: ILeadRepository) {}

  async execute(input: BuscarLeadInput): Promise<Lead> {
    const lead = await this.repository.find_by_id(input.id, input.hotel_id)
    if (!lead) {
      throw new LeadNotFoundError()
    }
    return lead
  }
}
