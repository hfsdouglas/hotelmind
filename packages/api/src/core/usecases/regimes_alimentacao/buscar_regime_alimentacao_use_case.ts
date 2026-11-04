import { RegimeAlimentacaoNotFoundError } from '@/core/errors/regime_alimentacao_errors'
import type { IRegimeAlimentacaoRepository } from '@/core/repositories/regimes_alimentacao/regime_alimentacao.repository'

export interface BuscarRegimeAlimentacaoInput {
  id: string
  hotel_id: string
}

export class BuscarRegimeAlimentacaoUseCase {
  constructor(private readonly repository: IRegimeAlimentacaoRepository) {}

  async execute(input: BuscarRegimeAlimentacaoInput) {
    const regime = await this.repository.find_by_id(input.id, input.hotel_id)
    if (!regime) {
      throw new RegimeAlimentacaoNotFoundError()
    }
    return regime
  }
}
