import { RegimeAlimentacaoConflictError } from '@/core/errors/regime_alimentacao_errors'
import type { IRegimeAlimentacaoRepository } from '@/core/repositories/regimes_alimentacao/regime_alimentacao.repository'

export interface CriarRegimeAlimentacaoInput {
  hotel_id: string
  titulo: string
  descricao?: string | null
  cor_pulseira: string
  ativo?: boolean
}

export class CriarRegimeAlimentacaoUseCase {
  constructor(private readonly repository: IRegimeAlimentacaoRepository) {}

  async execute(input: CriarRegimeAlimentacaoInput) {
    const existing = await this.repository.find_by_titulo(
      input.titulo,
      input.hotel_id
    )
    if (existing) {
      throw new RegimeAlimentacaoConflictError()
    }

    return await this.repository.create({
      hotel_id: input.hotel_id,
      titulo: input.titulo,
      descricao: input.descricao ?? null,
      cor_pulseira: input.cor_pulseira,
      ativo: input.ativo ?? true,
    })
  }
}
