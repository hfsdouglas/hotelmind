import { RegimeAlimentacaoNotFoundError } from '@/core/errors/regime_alimentacao_errors'
import type { IRegimeAlimentacaoRepository } from '@/core/repositories/regimes_alimentacao/regime_alimentacao.repository'

export interface AtivarRegimeAlimentacaoInput {
  id: string
  hotel_id: string
}

export class AtivarRegimeAlimentacaoUseCase {
  constructor(private readonly repository: IRegimeAlimentacaoRepository) {}

  async execute(input: AtivarRegimeAlimentacaoInput) {
    const existing = await this.repository.find_by_id(input.id, input.hotel_id)
    if (!existing) {
      throw new RegimeAlimentacaoNotFoundError()
    }

    return await this.repository.update({
      id: existing.id,
      hotel_id: existing.hotel_id,
      titulo: existing.titulo,
      descricao: existing.descricao,
      cor_pulseira: existing.cor_pulseira,
      ativo: true,
    })
  }
}
