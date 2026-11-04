import type { ParceiroComercial } from '@/core/entities/parceiro_comercial'
import { ParceiroComercialNotFoundError } from '@/core/errors/parceiro_comercial_errors'
import type { IParceiroComercialRepository } from '@/core/repositories/parceiros_comerciais/parceiro_comercial_repository'

export interface BuscarParceiroComercialInput {
  id: string
  hotel_id: string
}

export class BuscarParceiroComercialUseCase {
  constructor(private readonly repo: IParceiroComercialRepository) {}

  async execute(
    input: BuscarParceiroComercialInput
  ): Promise<ParceiroComercial> {
    const parceiro = await this.repo.find_by_id(input.id, input.hotel_id)
    if (!parceiro) {
      throw new ParceiroComercialNotFoundError()
    }
    return parceiro
  }
}
