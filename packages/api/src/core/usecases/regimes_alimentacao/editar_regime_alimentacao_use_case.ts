import {
  RegimeAlimentacaoConflictError,
  RegimeAlimentacaoNotFoundError,
} from '@/core/errors/regime_alimentacao_errors'
import type { IRegimeAlimentacaoRepository } from '@/core/repositories/regimes_alimentacao/regime_alimentacao.repository'

export interface EditarRegimeAlimentacaoInput {
  id: string
  hotel_id: string
  titulo: string
  descricao?: string | null
  cor_pulseira: string
  ativo: boolean
}

export class EditarRegimeAlimentacaoUseCase {
  constructor(private readonly repository: IRegimeAlimentacaoRepository) {}

  async execute(input: EditarRegimeAlimentacaoInput) {
    const existing = await this.repository.find_by_id(input.id, input.hotel_id)
    if (!existing) {
      throw new RegimeAlimentacaoNotFoundError()
    }

    const title_conflict = await this.repository.find_by_titulo(
      input.titulo,
      input.hotel_id,
      input.id
    )
    if (title_conflict) {
      throw new RegimeAlimentacaoConflictError()
    }

    return await this.repository.update({
      id: input.id,
      hotel_id: input.hotel_id,
      titulo: input.titulo,
      descricao: input.descricao ?? null,
      cor_pulseira: input.cor_pulseira,
      ativo: input.ativo,
    })
  }
}
