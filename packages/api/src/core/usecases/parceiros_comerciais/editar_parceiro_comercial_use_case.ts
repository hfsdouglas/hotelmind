import type { UpdateParceiroComercialPayload } from '@hotelmind/contracts'
import type { ParceiroComercial } from '@/core/entities/parceiro_comercial'
import {
  ParceiroComercialConflictError,
  ParceiroComercialNotFoundError,
} from '@/core/errors/parceiro_comercial_errors'
import type { IParceiroComercialRepository } from '@/core/repositories/parceiros_comerciais/parceiro_comercial_repository'

export interface EditarParceiroComercialInput
  extends UpdateParceiroComercialPayload {
  id: string
  hotel_id: string
}

export class EditarParceiroComercialUseCase {
  constructor(private readonly repo: IParceiroComercialRepository) {}

  async execute(
    input: EditarParceiroComercialInput
  ): Promise<ParceiroComercial> {
    const existing = await this.repo.find_by_id(input.id, input.hotel_id)
    if (!existing) {
      throw new ParceiroComercialNotFoundError()
    }

    if (input.documento?.trim()) {
      const withSameDoc = await this.repo.find_by_documento(
        input.documento.trim(),
        input.hotel_id
      )
      if (withSameDoc && withSameDoc.id !== input.id) {
        throw new ParceiroComercialConflictError(
          'Já existe um parceiro comercial cadastrado com este documento.'
        )
      }
    }

    return this.repo.update(input)
  }
}
