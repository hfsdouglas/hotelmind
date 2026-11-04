import { ParceiroComercialNotFoundError } from '@/core/errors/parceiro_comercial_errors'
import type { IParceiroComercialRepository } from '@/core/repositories/parceiros_comerciais/parceiro_comercial_repository'

export interface ExcluirParceiroComercialInput {
  id: string
  hotel_id: string
}

export class ExcluirParceiroComercialUseCase {
  constructor(private readonly repo: IParceiroComercialRepository) {}

  async execute(input: ExcluirParceiroComercialInput): Promise<void> {
    const parceiro = await this.repo.find_by_id(input.id, input.hotel_id)
    if (!parceiro) {
      throw new ParceiroComercialNotFoundError()
    }

    await this.repo.delete(input.id, input.hotel_id)
  }
}
