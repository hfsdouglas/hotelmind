import { OrcamentoNotFoundError } from '@/core/errors/orcamento_errors'
import type { IOrcamentoRepository } from '@/core/repositories/orcamentos/orcamento_repository'

export interface ExcluirOrcamentoInput {
  id: string
  hotel_id: string
}

export class ExcluirOrcamentoUseCase {
  constructor(private readonly orcamentos: IOrcamentoRepository) {}

  async execute(input: ExcluirOrcamentoInput): Promise<void> {
    const existing = await this.orcamentos.find_by_id(input.id, input.hotel_id)
    if (!existing) {
      throw new OrcamentoNotFoundError()
    }
    await this.orcamentos.delete(input.id, input.hotel_id)
  }
}
