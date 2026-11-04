import type { Orcamento } from '@/core/entities/orcamento'
import { OrcamentoNotFoundError } from '@/core/errors/orcamento_errors'
import type { IOrcamentoRepository } from '@/core/repositories/orcamentos/orcamento_repository'

export interface BuscarOrcamentoInput {
  id: string
  hotel_id: string
}

export class BuscarOrcamentoUseCase {
  constructor(private readonly orcamentos: IOrcamentoRepository) {}

  async execute(input: BuscarOrcamentoInput): Promise<Orcamento> {
    const orcamento = await this.orcamentos.find_by_id(input.id, input.hotel_id)
    if (!orcamento) {
      throw new OrcamentoNotFoundError()
    }
    return orcamento
  }
}
