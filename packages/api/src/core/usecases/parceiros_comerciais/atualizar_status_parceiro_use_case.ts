import type { StatusParceiro } from '@hotelmind/contracts'
import type { ParceiroComercial } from '@/core/entities/parceiro_comercial'
import {
  ParceiroComercialNotFoundError,
  ParceiroComercialValidationError,
} from '@/core/errors/parceiro_comercial_errors'
import type { IParceiroComercialRepository } from '@/core/repositories/parceiros_comerciais/parceiro_comercial_repository'

export interface AtualizarStatusParceiroInput {
  id: string
  hotel_id: string
  status: StatusParceiro
  motivo_bloqueio?: string | null
}

export class AtualizarStatusParceiroUseCase {
  constructor(private readonly repo: IParceiroComercialRepository) {}

  async execute(
    input: AtualizarStatusParceiroInput
  ): Promise<ParceiroComercial> {
    const parceiro = await this.repo.find_by_id(input.id, input.hotel_id)
    if (!parceiro) {
      throw new ParceiroComercialNotFoundError()
    }

    if (input.status === 'bloqueado' && !input.motivo_bloqueio?.trim()) {
      throw new ParceiroComercialValidationError(
        'Informe o motivo do bloqueio do parceiro comercial.'
      )
    }

    return this.repo.update({
      id: input.id,
      hotel_id: input.hotel_id,
      status: input.status,
      motivo_bloqueio:
        input.status === 'bloqueado' ? input.motivo_bloqueio?.trim() : null,
    })
  }
}
